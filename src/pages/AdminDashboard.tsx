import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Shield, Trophy, Calendar, Settings,
  Image as ImageIcon, Trash2, Plus, AlertTriangle,
  Users, BarChart3, ClipboardList, UserPlus, Key, UserCheck, UserX, Eye, EyeOff, MessageSquare,
  Upload, Play, Check, FileText, Sparkles, BellRing, LayoutDashboard, Swords, Crown, Newspaper, Pin,
  Edit2, Bold, Italic, Underline, List, Highlighter, X
} from 'lucide-react';
import { cn } from '../App';
import { loadAuth, clearAuth, validatePassword } from '../lib/auth';
import {
  fetchNewsPosts,
  saveNewsPosts,
  NEWS_CATEGORY_META,
  type NewsPost,
  type NewsCategory
} from '../lib/news';
import { FormattedNewsText } from '../components/FormattedNewsText';
import { 
  fetchTournaments, 
  fetchDivisions, 
  fetchZones, 
  fetchTeams, 
  saveMatchResult,
  savePlayoffMatchResult,
  createTeam,
  createTournament,
  fetchUsers,
  createUser,
  updateUserPassword,
  toggleUserActive,
  createMatch,
  deleteMatch,
  createMatches,
  deleteMatchesByFilter,
  fetchTournamentDivisionMatches,
  fetchAllTournamentMatches,
  isSupabaseActive,
  fetchContactMessages,
  markContactMessageAsRead,
  deleteContactMessage,
  logoutUser,
  isExcludedDivision
} from '../lib/db';
import type { Team, Match, Tournament, Division, Zone, User, ContactMessage } from '../lib/types';
import { supabase } from '../lib/supabase';
import {
  ALL_MOCK_TEAMS,
  ADARO_ZONES,
  ADARO_PUNTUABLE_DIVISION_IDS,
  resolveAdaroZoneIds,
  resolveAdaroPuntuableDivisionIds
} from '../lib/mockAdaroData';
import {
  getDivisionOrder,
  calculateAdaroZoneStandings,
  CUP_BADGES,
  type AdaroCupTier
} from '../lib/adaroStandings';

const SponsorsSettings = lazy(() =>
  import('./SponsorsSettings').then(m => ({ default: m.SponsorsSettings }))
);
const SocialMediaGenerator = lazy(() =>
  import('../components/SocialMediaGenerator').then(m => ({ default: m.SocialMediaGenerator }))
);
const PdfImporterModal = lazy(() =>
  import('../components/PdfImporterModal').then(m => ({ default: m.PdfImporterModal }))
);

const DEFAULT_KICKOFF_TIMES: Record<string, string> = {
  'Séptima División': '15:30',
  'Octava División': '14:00',
  'Novena División': '12:40',
  'Décima División': '11:20',
  'Undécima División': '10:10',
  'Duodécima División': '09:00',
  'Decimotercera División': '10:30',
  'Decimocuarta División': '11:45',
  'Decimoquinta División': '13:00',
  'Decimosexta División': '14:00'
};

const formatMatchTime = (dateStr: string | null) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '';
  }
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0 },
};

// Nombres de equipos asignados a cada zona en modo mock
const TEAMS_CAMPEONATO_NAMES = [
  "Talleres de Mar del Plata", "Deportivo Norte", "Kimberley", "Once Unidos",
  "Aldosivi", "Banfield", "Atlético Mar del Plata", "Argentinos del Sud",
  "Independiente", "River Plate", "Cadetes", "Nacion", "Alvarado", "Quilmes"
];
const TEAMS_PROMOCION_NAMES = [
  "Boca Juniors", "Libertad", "Circulo Deportivo", "San Lorenzo",
  "General Urquiza", "El cañon", "Almagro Florida", "Al Ver Veras",
  "Colegiales/Siciliano", "Club Banco Provincia de Mar del Plata",
  "Club Social y Deportivo Chapadmalal", "San José", "Racing", "San Isidro"
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'tournaments' | 'fixture_config' | 'fixture' | 'users' | 'messages' | 'settings' | 'champions' | 'social_generator' | 'news'>('teams');

  // Estados de Noticias / Avisos
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [savingNews, setSavingNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<NewsCategory>('playoffs');
  const [newPostBody, setNewPostBody] = useState('');
  const [newPostPinned, setNewPostPinned] = useState(false);
  const [newsFormError, setNewsFormError] = useState('');
  const [newsFormSuccess, setNewsFormSuccess] = useState('');
  const newsBodyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Estados de Base de Datos
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados de Campeones en Admin
  const [adminChampions, setAdminChampions] = useState<Record<string, Record<'campeonato' | 'promocion', string>>>({});
  const [savingChampions, setSavingChampions] = useState(false);
  const [selectedChampYear, setSelectedChampYear] = useState<number>(new Date().getFullYear());
  const [selectedChampTournament, setSelectedChampTournament] = useState<string>('Clausura');

  // Filtros seleccionados
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<number>(1);

  // Estados para Carga de Resultados de Playoffs (4 Copas por División)
  const [resultsPhaseMode, setResultsPhaseMode] = useState<'zones' | 'playoffs'>('zones');
  const [selectedPlayoffCup, setSelectedPlayoffCup] = useState<AdaroCupTier>('platino');
  const [selectedPlayoffStage, setSelectedPlayoffStage] = useState<'cuartos' | 'semifinal' | 'final'>('cuartos');
  const [fullTournamentMatches, setFullTournamentMatches] = useState<Match[]>([]);
  const [editingPenalties, setEditingPenalties] = useState<Record<string, { homePenalties: string; awayPenalties: string }>>({});
  const [playoffSlotErrors, setPlayoffSlotErrors] = useState<Record<string, string>>({});

  const isAdaroTournamentSelected = useMemo(() => {
    const selectedTourn = tournaments.find(t => t.id === selectedTournamentId);
    return Boolean(
      selectedTourn?.format === 'copas_multinivel' ||
      selectedTournamentId === 'adaro-2026' ||
      selectedTourn?.name?.toLowerCase().includes('adaro') ||
      selectedTourn?.name?.toLowerCase().includes('chamaco')
    );
  }, [tournaments, selectedTournamentId]);

  useEffect(() => {
    if (!isAdaroTournamentSelected && resultsPhaseMode === 'playoffs') {
      setResultsPhaseMode('zones');
    }
  }, [isAdaroTournamentSelected, resultsPhaseMode]);

  const availableZonesForDivision = useMemo(() => {
    const selectedTourn = tournaments.find(t => t.id === selectedTournamentId);
    if (
      selectedTourn?.format === 'copas_multinivel' || 
      selectedTournamentId === 'adaro-2026' || 
      selectedTourn?.name?.toLowerCase().includes('adaro')
    ) {
      return zones.filter((z: Zone) => z.id.startsWith('adaro-zone-') || (z.name.startsWith('Zona ') && !z.name.includes('-')));
    }

    const selectedDiv = divisions.find(d => d.id === selectedDivisionId);
    if (!selectedDiv) return zones;

    const divName = selectedDiv.name;
    if (divName === 'Primera División' || divName === 'Quinta División' || divName === 'Sexta División') {
      const categoryKeyword = divName.split(' ')[0]; // 'Primera', 'Quinta', 'Sexta'
      return zones.filter((z: Zone) => z.name.includes(categoryKeyword));
    } else {
      return zones.filter((z: Zone) => z.name === 'Campeonato' || z.name === 'Promoción');
    }
  }, [zones, divisions, selectedDivisionId, selectedTournamentId, tournaments]);

  useEffect(() => {
    if (availableZonesForDivision.length > 0 && !availableZonesForDivision.some((z: Zone) => z.id === selectedZoneId)) {
      setSelectedZoneId(availableZonesForDivision[0].id);
    }
  }, [availableZonesForDivision, selectedZoneId]);

  // Resultados editados temporalmente
  const [editingResults, setEditingResults] = useState<Record<string, { homeGoals: string; awayGoals: string }>>({});
  const [editingTimes, setEditingTimes] = useState<Record<string, string>>({});
  const [savingStatus, setSavingStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});

  // Modales state
  const [isPdfImporterOpen, setIsPdfImporterOpen] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDisplayName, setNewTeamDisplayName] = useState('');
  const [newTeamLogoUrl, setNewTeamLogoUrl] = useState('');
  const [teamError, setTeamError] = useState('');
  const [teamLoading, setTeamLoading] = useState(false);

  const [isCreateTournamentOpen, setIsCreateTournamentOpen] = useState(false);
  const [newTournName, setNewTournName] = useState('');
  const [newTournYear, setNewTournYear] = useState(new Date().getFullYear());
  const [tournError, setTournError] = useState('');
  const [tournLoading, setTournLoading] = useState(false);

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showNewUserPwd, setShowNewUserPwd] = useState(false);
  const [newUserRole, setNewUserRole] = useState<'super_admin' | 'editor'>('editor');
  const [userError, setUserError] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  const [isChangePwdOpen, setIsChangePwdOpen] = useState(false);
  const [changePasswordUserId, setChangePasswordUserId] = useState('');
  const [changePasswordUsername, setChangePasswordUsername] = useState('');
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [changePwdError, setChangePwdError] = useState('');
  const [changePwdLoading, setChangePwdLoading] = useState(false);

  // Users list state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Fixture configurator form state
  const [fixtureRound, setFixtureRound] = useState<number>(1);
  const [fixtureHomeTeamId, setFixtureHomeTeamId] = useState<string>('');
  const [fixtureAwayTeamId, setFixtureAwayTeamId] = useState<string>('');
  const [fixtureTime, setFixtureTime] = useState<string>('');
  const [fixtureError, setFixtureError] = useState('');
  const [fixtureLoading, setFixtureLoading] = useState(false);

  // Estados de Carga Masiva y Generador de Fixture
  const [fixtureMode, setFixtureMode] = useState<'manual' | 'bulk_text' | 'round_robin'>('manual');
  const [bulkText, setBulkText] = useState('');
  interface ParsedMatch {
    round: number;
    homeName: string;
    awayName: string;
    homeTeamId?: string;
    awayTeamId?: string;
    time?: string;
  }
  const [parsedMatches, setParsedMatches] = useState<ParsedMatch[]>([]);
  const [roundRobinTeams, setRoundRobinTeams] = useState<string[]>([]);
  const [roundRobinMatches, setRoundRobinMatches] = useState<{ round: number; homeTeamId: string; awayTeamId: string; time?: string }[]>([]);
  const [bulkError, setBulkError] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  // Feature flags y textos de notificaciones
  const [sendNotificationsFlag, setSendNotificationsFlag] = useState(true);
  const [notifTitleNew, setNotifTitleNew] = useState('¡Resultado Cargado!');
  const [notifTitleEdit, setNotifTitleEdit] = useState('¡Resultado Actualizado!');

  useEffect(() => {
    const auth = loadAuth();
    if (!auth) {
      navigate('/admin');
    } else {
      setUser(auth);
    }
  }, [navigate]);

  // Timeout de sesión (10 minutos de inactividad)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
      }, 10 * 60 * 1000); // 10 minutos
    };

    // Eventos que reinician el timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Iniciar el timer la primera vez
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, []);

  // Cargar datos base al montar
  useEffect(() => {
    async function loadBaseData() {
      setLoading(true);
      try {
        const [tourns, divs, zns, tms, msgs] = await Promise.all([
          fetchTournaments(),
          fetchDivisions(),
          fetchZones(),
          fetchTeams(),
          fetchContactMessages().catch(err => {
            console.error('Error loading messages on mount:', err);
            return [];
          })
        ]);
        setTournaments(tourns);
        const validDivs = divs
          .filter(d => !isExcludedDivision(d.name))
          .sort((a, b) => getDivisionOrder(a.name) - getDivisionOrder(b.name));
        setDivisions(validDivs);
        setZones(zns);
        setTeams(tms);
        setMessages(msgs);

        if (tourns.length > 0) setSelectedTournamentId(tourns[0].id);
        if (validDivs.length > 0) {
          const septima = validDivs.find(d => getDivisionOrder(d.name) === 7) || validDivs[0];
          setSelectedDivisionId(septima.id);
        }
        if (zns.length > 0) setSelectedZoneId(zns[0].id);
      } catch (err) {
        console.error('Error loading admin dashboard base data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBaseData();

    // Cargar feature flags y textos de notificaciones
    (async () => {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('key, value')
          .in('key', ['send_notifications', 'notification_title_new', 'notification_title_edit']);
        if (data) {
          data.forEach(row => {
            if (row.key === 'send_notifications') {
              setSendNotificationsFlag(row.value === 'true' || row.value === true);
            } else if (row.key === 'notification_title_new' && row.value) {
              setNotifTitleNew(row.value);
            } else if (row.key === 'notification_title_edit' && row.value) {
              setNotifTitleEdit(row.value);
            }
          });
        }
      } catch (_) {
        // Si no existe la tabla aun, ignorar silenciosamente
      }
    })();
  }, []);


  // Cargar campeones en la pestaña del admin
  useEffect(() => {
    if (activeTab !== 'champions') return;
    
    async function loadChampionsAdmin() {
      try {
        const { data, error } = await supabase
          .from('champions')
          .select('*')
          .eq('year', selectedChampYear)
          .eq('tournament', selectedChampTournament);
        
        if (error) throw error;
        
        const mapped: Record<string, Record<'campeonato' | 'promocion', string>> = {};
        data?.forEach(row => {
          if (!mapped[row.division_id]) {
            mapped[row.division_id] = { campeonato: '', promocion: '' };
          }
          mapped[row.division_id][row.zone_name as 'campeonato' | 'promocion'] = row.team_id;
        });
        setAdminChampions(mapped);
      } catch (err) {
        console.error('Error cargando campeones en admin:', err);
      }
    }
    loadChampionsAdmin();
  }, [activeTab, selectedChampYear, selectedChampTournament]);

  const handleSaveChampions = async () => {
    setSavingChampions(true);
    try {
      const recordsToUpsert: any[] = [];
      
      for (const divisionId of Object.keys(adminChampions)) {
        const zonesObj = adminChampions[divisionId];
        
        if (zonesObj.campeonato) {
          recordsToUpsert.push({
            year: selectedChampYear,
            tournament: selectedChampTournament,
            division_id: divisionId,
            zone_name: 'campeonato',
            team_id: zonesObj.campeonato
          });
        }
        if (zonesObj.promocion) {
          recordsToUpsert.push({
            year: selectedChampYear,
            tournament: selectedChampTournament,
            division_id: divisionId,
            zone_name: 'promocion',
            team_id: zonesObj.promocion
          });
        }
      }
      
      // Borramos primero para evitar duplicidad o conflictos
      await supabase
        .from('champions')
        .delete()
        .eq('year', selectedChampYear)
        .eq('tournament', selectedChampTournament);

      if (recordsToUpsert.length > 0) {
        const { error } = await supabase.from('champions').insert(recordsToUpsert);
        if (error) throw error;
      }
      
      alert('Historial de Campeones guardado con éxito.');
    } catch (err) {
      console.error('Error guardando campeones:', err);
      alert('Hubo un error al guardar los campeones.');
    } finally {
      setSavingChampions(false);
    }
  };


  // Cargar partidos de la división y torneo seleccionados
  useEffect(() => {
    if (!selectedTournamentId || !selectedDivisionId) return;

    async function loadAllMatches() {
      setLoading(true);
      try {
        const data = await fetchTournamentDivisionMatches(selectedTournamentId, selectedDivisionId);
        setAllMatches(data);
        setLastAutoSelectedZone(''); // Forzar re-evaluación al cambiar de división o cargar nuevos datos
      } catch (err) {
        console.error('Error loading tournament matches:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllMatches();
  }, [selectedTournamentId, selectedDivisionId]);

  // Cargar todos los partidos del torneo (todas las zonas y divisiones puntuables) para calcular los sembrados de las 4 Copas en tiempo real
  useEffect(() => {
    if (!selectedTournamentId || !isAdaroTournamentSelected) return;
    let isMounted = true;
    async function loadFullTournMatches() {
      try {
        const allM = await fetchAllTournamentMatches(selectedTournamentId);
        if (isMounted) {
          setFullTournamentMatches(allM);
        }
      } catch (err) {
        console.error('Error loading full tournament matches for playoffs:', err);
      }
    }
    loadFullTournMatches();
    return () => { isMounted = false; };
  }, [selectedTournamentId, isAdaroTournamentSelected]);

  // Establecer horario por defecto cuando cambia la división
  useEffect(() => {
    if (selectedDivisionId && divisions.length > 0) {
      const divName = divisions.find(d => d.id === selectedDivisionId)?.name || '';
      const defaultTime = DEFAULT_KICKOFF_TIMES[divName] || '15:00';
      setFixtureTime(defaultTime);
    }
  }, [selectedDivisionId, divisions]);

  // Auto-selección de fecha/ronda actual (al cambiar de zona/división)
  const [lastAutoSelectedZone, setLastAutoSelectedZone] = useState<string>('');

  useEffect(() => {
    const key = `${selectedDivisionId}-${selectedZoneId}`;
    const isMatchInZone = (mZoneId: string, targetZoneId: string) => {
      if (mZoneId === targetZoneId) return true;
      const mZ = zones.find(z => z.id === mZoneId);
      const tZ = zones.find(z => z.id === targetZoneId);
      const mName = (mZ?.name || mZoneId).toLowerCase().trim();
      const tName = (tZ?.name || targetZoneId).toLowerCase().trim();
      return mName !== '' && mName === tName;
    };

    const zoneMatches = allMatches.filter(m => isMatchInZone(m.zone_id, selectedZoneId));
    if (zoneMatches.length === 0) return;

    const roundsList = Array.from(new Set(zoneMatches.map(m => m.round_number))).sort((a, b) => a - b);
    if (roundsList.length > 0) {
      let activeRound = roundsList[roundsList.length - 1]; // por defecto la última
      for (const round of roundsList) {
        const roundMatches = zoneMatches.filter(m => m.round_number === round);
        const finishedCount = roundMatches.filter(m => m.status === 'finished').length;
        const completionRate = roundMatches.length > 0 ? (finishedCount / roundMatches.length) : 0;
        
        // Si la fecha tiene menos del 85% cargado, nos quedamos en esta fecha
        if (completionRate < 0.85) {
          activeRound = round;
          break;
        }
      }
      setSelectedRound(activeRound);
      setLastAutoSelectedZone(key);
    } else {
      setSelectedRound(1);
      setLastAutoSelectedZone(key);
    }
  }, [allMatches, selectedZoneId, selectedDivisionId, lastAutoSelectedZone, zones]);
  // Filtrar partidos locales del tab activo con coincidencia flexible por zona (solo fase regular)
  const matches = allMatches.filter(m => {
    if (m.stage && m.stage !== 'regular') return false;
    if (m.zone_id === selectedZoneId) return true;
    const mZ = zones.find(z => z.id === m.zone_id);
    const tZ = zones.find(z => z.id === selectedZoneId);
    const mName = (mZ?.name || m.zone_id || '').toLowerCase().trim();
    const tName = (tZ?.name || selectedZoneId || '').toLowerCase().trim();
    return mName !== '' && mName === tName;
  });

  // Ranking dinámico en tiempo real de las 4 Copas (Platino, Oro, Plata, Bronce) según los resultados de Fase 1
  const playoffZoneRankings = useMemo(() => {
    const results: Record<AdaroCupTier, Array<{ team: Team; zoneName: string; pts: number; avg: number; dg: number; gf: number }>> = {
      platino: [],
      oro: [],
      plata: [],
      bronce: []
    };
    if (!isAdaroTournamentSelected || fullTournamentMatches.length === 0 || teams.length === 0) {
      return results;
    }

    const zoneIdMap = resolveAdaroZoneIds(zones);
    const puntuableIds = resolveAdaroPuntuableDivisionIds(divisions);
    const allPuntuableIds = Array.from(new Set([...puntuableIds, ...ADARO_PUNTUABLE_DIVISION_IDS]));

    ADARO_ZONES.forEach(zone => {
      const zoneUuid = zoneIdMap[zone.id] || zone.id;
      const zoneMatches = fullTournamentMatches.filter(m =>
        (!m.stage || m.stage === 'regular') &&
        (m.zone_id === zone.id ||
          m.zone_id === zoneUuid ||
          (zones.length > 0 && zones.find(z => z.id === m.zone_id)?.name.toLowerCase().trim() === zone.name.toLowerCase().trim()))
      );
      const teamIdSet = new Set<string>();
      zoneMatches.forEach(m => {
        teamIdSet.add(m.home_team_id);
        teamIdSet.add(m.away_team_id);
      });
      const zTeams = teams.filter(t => teamIdSet.has(t.id));

      const standings = calculateAdaroZoneStandings(
        zoneMatches,
        zTeams,
        allPuntuableIds,
        divisions
      );

      standings.forEach(s => {
        results[s.cupTier].push({
          team: s.team,
          zoneName: zone.name,
          pts: s.points,
          avg: s.average,
          dg: s.goalDifference,
          gf: s.goalsFor,
        });
      });
    });

    Object.keys(results).forEach(tier => {
      results[tier as AdaroCupTier].sort((a, b) => {
        if (b.avg !== a.avg) return b.avg - a.avg;
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        return b.gf - a.gf;
      });
    });

    return results;
  }, [isAdaroTournamentSelected, fullTournamentMatches, teams, zones, divisions]);

  interface AdminPlayoffSlot {
    slotKey: string;
    cruceLabel: string;
    stage: 'cuartos' | 'semifinal' | 'final';
    homeTeam: Team | null;
    awayTeam: Team | null;
    homeSeed?: number;
    awaySeed?: number;
    homePlaceholder?: string;
    awayPlaceholder?: string;
    realMatch?: Match;
    winnerTeam: Team | null;
  }

  // Cruces de Playoffs de la Copa y División seleccionadas (cada división avanza sus propios ganadores)
  const playoffBracketForDivision = useMemo(() => {
    const seeds = playoffZoneRankings[selectedPlayoffCup] || [];
    const seed1 = seeds[0]?.team || null;
    const seed2 = seeds[1]?.team || null;
    const seed3 = seeds[2]?.team || null;
    const seed4 = seeds[3]?.team || null;
    const seed5 = seeds[4]?.team || null;
    const seed6 = seeds[5]?.team || null;
    const seed7 = seeds[6]?.team || null;

    const selectedDivObj = divisions.find(d => d.id === selectedDivisionId);
    const targetDivOrder = selectedDivObj ? getDivisionOrder(selectedDivObj.name) : getDivisionOrder(selectedDivisionId);

    const combinedPool = [...allMatches, ...fullTournamentMatches];
    const divPlayoffMatches = combinedPool.filter(m => {
      if (!m.stage || m.stage === 'regular') return false;
      if (m.division_id === selectedDivisionId) return true;
      if (targetDivOrder !== 99 && getDivisionOrder(m.division_id) === targetDivOrder) return true;
      const foundDiv = divisions.find(d => d.id === m.division_id);
      return Boolean(foundDiv && getDivisionOrder(foundDiv.name) === targetDivOrder);
    });

    const findRealPlayoffMatch = (stage: 'cuartos' | 'semifinal' | 'final', home: Team | null, away: Team | null): Match | undefined => {
      if (!home || !away) return undefined;
      return divPlayoffMatches.find(
        m =>
          m.stage === stage &&
          ((m.home_team_id === home.id && m.away_team_id === away.id) ||
           (m.home_team_id === away.id && m.away_team_id === home.id))
      );
    };

    const resolveSlot = (
      cruceCode: string,
      cruceLabel: string,
      stage: 'cuartos' | 'semifinal' | 'final',
      home: Team | null,
      away: Team | null,
      homeSeed?: number,
      awaySeed?: number,
      homePlaceholder?: string,
      awayPlaceholder?: string
    ): AdminPlayoffSlot => {
      const real = findRealPlayoffMatch(stage, home, away);
      let winnerTeam: Team | null = null;

      if (real && real.status === 'finished' && home && away && real.home_goals !== null && real.away_goals !== null) {
        const isDirect = real.home_team_id === home.id;
        const hg = isDirect ? real.home_goals : real.away_goals;
        const ag = isDirect ? real.away_goals : real.home_goals;
        const hp = isDirect ? (real.home_penalties ?? null) : (real.away_penalties ?? null);
        const ap = isDirect ? (real.away_penalties ?? null) : (real.home_penalties ?? null);

        if (hg > ag) winnerTeam = home;
        else if (ag > hg) winnerTeam = away;
        else if (hp !== null && ap !== null && hp !== ap) {
          winnerTeam = hp > ap ? home : away;
        }
      }

      return {
        slotKey: `${selectedPlayoffCup}_${selectedDivisionId}_${stage}_${cruceCode}`,
        cruceLabel,
        stage,
        homeTeam: home,
        awayTeam: away,
        homeSeed,
        awaySeed,
        homePlaceholder,
        awayPlaceholder,
        realMatch: real,
        winnerTeam
      };
    };

    const qfD = resolveSlot('qf-d', 'Cruce D · Cuartos de Final (#4 vs #5)', 'cuartos', seed4, seed5, 4, 5);
    const qfB = resolveSlot('qf-b', 'Cruce B · Cuartos de Final (#2 vs #7)', 'cuartos', seed2, seed7, 2, 7);
    const qfC = resolveSlot('qf-c', 'Cruce C · Cuartos de Final (#3 vs #6)', 'cuartos', seed3, seed6, 3, 6);

    const sf1 = resolveSlot(
      'sf-1',
      'Semifinal 1 · Cruce A (#1 Libre) vs Ganador Cruce D',
      'semifinal',
      seed1,
      qfD.winnerTeam,
      1,
      qfD.winnerTeam ? (qfD.winnerTeam.id === seed4?.id ? 4 : 5) : undefined,
      'Sembrado #1',
      'Pendiente: Ganador Cruce D (#4 vs #5) en esta división'
    );

    const sf2 = resolveSlot(
      'sf-2',
      'Semifinal 2 · Ganador Cruce B vs Ganador Cruce C',
      'semifinal',
      qfB.winnerTeam,
      qfC.winnerTeam,
      qfB.winnerTeam ? (qfB.winnerTeam.id === seed2?.id ? 2 : 7) : undefined,
      qfC.winnerTeam ? (qfC.winnerTeam.id === seed3?.id ? 3 : 6) : undefined,
      'Pendiente: Ganador Cruce B (#2 vs #7) en esta división',
      'Pendiente: Ganador Cruce C (#3 vs #6) en esta división'
    );

    const finalSlot = resolveSlot(
      'final-1',
      `Gran Final · ${CUP_BADGES[selectedPlayoffCup].label}`,
      'final',
      sf1.winnerTeam,
      sf2.winnerTeam,
      sf1.winnerTeam ? sf1.homeSeed || sf1.awaySeed : undefined,
      sf2.winnerTeam ? sf2.homeSeed || sf2.awaySeed : undefined,
      'Pendiente: Ganador Semifinal 1 (A vs D) en esta división',
      'Pendiente: Ganador Semifinal 2 (B vs C) en esta división'
    );

    return {
      seeds,
      seed1,
      cuartos: [qfD, qfB, qfC],
      semifinal: [sf1, sf2],
      final: [finalSlot]
    };
  }, [playoffZoneRankings, selectedPlayoffCup, selectedDivisionId, divisions, allMatches, fullTournamentMatches]);

  const resolveTeam = (teamId: string): Team | undefined => {
    if (!teamId) return undefined;
    const direct = teams.find(t => t.id === teamId);
    if (direct) return direct;
    const mock = ALL_MOCK_TEAMS.find(t => t.id === teamId);
    if (mock) {
      const matchInTeams = teams.find(t => 
        t.name.toLowerCase().trim() === mock.name.toLowerCase().trim() ||
        (t.display_name && t.display_name.toLowerCase().trim() === (mock.display_name || mock.name).toLowerCase().trim())
      );
      if (matchInTeams) return matchInTeams;
      return mock;
    }
    const clean = teamId.toLowerCase().trim();
    return teams.find(t => 
      t.name.toLowerCase().trim() === clean || 
      (t.display_name && t.display_name.toLowerCase().trim() === clean)
    );
  };

  // Sincronizar inputs de goles editados cuando cambian los partidos cargados
  useEffect(() => {
    const initialEdits: Record<string, { homeGoals: string; awayGoals: string }> = {};
    const initialTimes: Record<string, string> = {};
    const initialPens: Record<string, { homePenalties: string; awayPenalties: string }> = {};

    matches.forEach(m => {
      initialEdits[m.id] = {
        homeGoals: m.home_goals !== null ? m.home_goals.toString() : '',
        awayGoals: m.away_goals !== null ? m.away_goals.toString() : '',
      };
      if (m.match_date) {
        try {
          const d = new Date(m.match_date);
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          initialTimes[m.id] = `${hh}:${mm}`;
        } catch {
          initialTimes[m.id] = '';
        }
      } else {
        initialTimes[m.id] = '';
      }
    });

    // Sincronizar también los slots de Playoffs para la copa y división seleccionadas
    const allPlayoffSlots = [
      ...playoffBracketForDivision.cuartos,
      ...playoffBracketForDivision.semifinal,
      ...playoffBracketForDivision.final
    ];

    allPlayoffSlots.forEach(slot => {
      const real = slot.realMatch;
      if (real && slot.homeTeam && slot.awayTeam) {
        const isDirect = real.home_team_id === slot.homeTeam.id;
        const hg = isDirect ? real.home_goals : real.away_goals;
        const ag = isDirect ? real.away_goals : real.home_goals;
        const hp = isDirect ? (real.home_penalties ?? null) : (real.away_penalties ?? null);
        const ap = isDirect ? (real.away_penalties ?? null) : (real.home_penalties ?? null);

        initialEdits[slot.slotKey] = {
          homeGoals: hg !== null && hg !== undefined ? hg.toString() : '',
          awayGoals: ag !== null && ag !== undefined ? ag.toString() : ''
        };
        initialPens[slot.slotKey] = {
          homePenalties: hp !== null && hp !== undefined ? hp.toString() : '',
          awayPenalties: ap !== null && ap !== undefined ? ap.toString() : ''
        };
        if (real.match_date) {
          try {
            const d = new Date(real.match_date);
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            initialTimes[slot.slotKey] = `${hh}:${mm}`;
          } catch {
            initialTimes[slot.slotKey] = '';
          }
        } else {
          initialTimes[slot.slotKey] = '';
        }
      } else {
        initialEdits[slot.slotKey] = { homeGoals: '', awayGoals: '' };
        initialPens[slot.slotKey] = { homePenalties: '', awayPenalties: '' };
        initialTimes[slot.slotKey] = '';
      }
    });

    setEditingResults(initialEdits);
    setEditingTimes(initialTimes);
    setEditingPenalties(initialPens);
  }, [allMatches, selectedDivisionId, selectedZoneId, playoffBracketForDivision]);

  // Cargar usuarios cuando se entra a la pestaña usuarios
  const loadUsersData = async () => {
    setUsersLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsersData();
    }
    if (activeTab === 'messages') {
      loadMessages();
    }
    if (activeTab === 'news') {
      loadNewsData();
    }
  }, [activeTab]);

  const loadNewsData = async () => {
    setLoadingNews(true);
    try {
      const posts = await fetchNewsPosts();
      setNewsPosts(posts);
    } catch (err) {
      console.error('Error cargando noticias en admin:', err);
    } finally {
      setLoadingNews(false);
    }
  };

  const handleCreateNewsPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostBody.trim()) {
      setNewsFormError('Completá el título y el contenido de la nota.');
      return;
    }
    setSavingNews(true);
    setNewsFormError('');
    setNewsFormSuccess('');
    try {
      let updated: NewsPost[];
      if (editingNewsId) {
        updated = newsPosts.map(p =>
          p.id === editingNewsId
            ? {
                ...p,
                title: newPostTitle.trim(),
                category: newPostCategory,
                body: newPostBody.trim(),
                is_pinned: newPostPinned
              }
            : p
        );
      } else {
        const newPost: NewsPost = {
          id: `news-${Date.now()}`,
          title: newPostTitle.trim(),
          category: newPostCategory,
          body: newPostBody.trim(),
          is_pinned: newPostPinned,
          created_at: new Date().toISOString()
        };
        updated = [newPost, ...newsPosts];
      }

      const ok = await saveNewsPosts(updated);
      if (ok) {
        setNewsPosts(updated);
        setEditingNewsId(null);
        setNewPostTitle('');
        setNewPostBody('');
        setNewPostPinned(false);
        setNewsFormSuccess(editingNewsId ? '¡Cambios guardados en la base de datos!' : '¡Noticia publicada y guardada en la base de datos!');
        setTimeout(() => setNewsFormSuccess(''), 3500);
      } else {
        setNewsFormError('No se pudo sincronizar con Supabase. Verificá tu conexión.');
      }
    } catch (err) {
      console.error('Error guardando noticia:', err);
      setNewsFormError('Error al guardar la noticia.');
    } finally {
      setSavingNews(false);
    }
  };

  const handleStartEditNewsPost = (post: NewsPost) => {
    setEditingNewsId(post.id);
    setNewPostTitle(post.title);
    setNewPostCategory(post.category);
    setNewPostBody(post.body);
    setNewPostPinned(Boolean(post.is_pinned));
    setNewsFormError('');
    setNewsFormSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditNewsPost = () => {
    setEditingNewsId(null);
    setNewPostTitle('');
    setNewPostCategory('playoffs');
    setNewPostBody('');
    setNewPostPinned(false);
    setNewsFormError('');
  };

  const applyNewsFormat = (
    type: 'bold' | 'italic' | 'underline' | 'highlight' | 'size_lg' | 'size_md' | 'size_sm' | 'list'
  ) => {
    const textarea = newsBodyTextareaRef.current;
    const current = newPostBody;
    const start = textarea ? textarea.selectionStart : current.length;
    const end = textarea ? textarea.selectionEnd : current.length;
    const selected = current.slice(start, end);

    let replacement = '';
    let cursorOffset = 0;

    if (type === 'bold') {
      const text = selected || 'texto en negrita';
      replacement = `**${text}**`;
      cursorOffset = selected ? replacement.length : 2 + text.length;
    } else if (type === 'italic') {
      const text = selected || 'texto en cursiva';
      replacement = `*${text}*`;
      cursorOffset = selected ? replacement.length : 1 + text.length;
    } else if (type === 'underline') {
      const text = selected || 'texto subrayado';
      replacement = `__${text}__`;
      cursorOffset = selected ? replacement.length : 2 + text.length;
    } else if (type === 'highlight') {
      const text = selected || 'texto resaltado';
      replacement = `==${text}==`;
      cursorOffset = selected ? replacement.length : 2 + text.length;
    } else if (type === 'size_sm') {
      const text = selected || 'texto chico';
      replacement = `[chico]${text}[/chico]`;
      cursorOffset = replacement.length;
    } else if (type === 'size_lg') {
      const text = selected || 'Título grande';
      const prefix = start > 0 && current[start - 1] !== '\n' ? '\n### ' : '### ';
      replacement = `${prefix}${text}`;
      cursorOffset = replacement.length;
    } else if (type === 'size_md') {
      const text = selected || 'Subtítulo mediano';
      const prefix = start > 0 && current[start - 1] !== '\n' ? '\n#### ' : '#### ';
      replacement = `${prefix}${text}`;
      cursorOffset = replacement.length;
    } else if (type === 'list') {
      if (selected) {
        replacement = selected
          .split('\n')
          .map(line => (line.trim().startsWith('- ') ? line : `- ${line}`))
          .join('\n');
      } else {
        const prefix = start > 0 && current[start - 1] !== '\n' ? '\n- ' : '- ';
        replacement = `${prefix}Elemento de lista`;
      }
      cursorOffset = replacement.length;
    }

    const updatedText = current.slice(0, start) + replacement + current.slice(end);
    setNewPostBody(updatedText);

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const pos = start + cursorOffset;
        textarea.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  const handleTogglePinNewsPost = async (postId: string) => {
    const updated = newsPosts.map(p => (p.id === postId ? { ...p, is_pinned: !p.is_pinned } : p));
    setNewsPosts(updated);
    await saveNewsPosts(updated);
  };

  const handleDeleteNewsPost = async (postId: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta noticia?')) return;
    const updated = newsPosts.filter(p => p.id !== postId);
    setNewsPosts(updated);
    await saveNewsPosts(updated);
  };

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const data = await fetchContactMessages();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleMarkAsRead = async (msgId: string) => {
    try {
      await markContactMessageAsRead(msgId);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_read: true } : m));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteContactMessage(msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    clearAuth();
    navigate('/admin');
  };

  const handleGoalChange = (matchId: string, side: 'home' | 'away', val: string) => {
    // Validar solo números enteros o vacíos
    if (val !== '' && (!/^\d+$/.test(val) || parseInt(val) < 0 || parseInt(val) > 99)) return;
    
    setEditingResults(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [`${side}Goals`]: val,
      }
    }));
    setSavingStatus(prev => ({ ...prev, [matchId]: 'idle' }));
  };

  const handleTimeChange = (matchId: string, val: string) => {
    setEditingTimes(prev => ({
      ...prev,
      [matchId]: val
    }));
    setSavingStatus(prev => ({ ...prev, [matchId]: 'idle' }));
  };

  const handleSaveSingleMatch = async (matchId: string) => {
    const edit = editingResults[matchId];
    if (!edit) return;

    setSavingStatus(prev => ({ ...prev, [matchId]: 'saving' }));
    
    const homeVal = edit.homeGoals.trim();
    const awayVal = edit.awayGoals.trim();
    
    const homeGoals = homeVal === '' ? null : parseInt(homeVal);
    const awayGoals = awayVal === '' ? null : parseInt(awayVal);
    const status = (homeGoals !== null && awayGoals !== null) ? 'finished' : 'scheduled';

    const matchTime = editingTimes[matchId] || '15:00';
    const matchDate = `2026-01-01T${matchTime}:00-03:00`;

    const success = await saveMatchResult(matchId, homeGoals, awayGoals, status, matchDate);
    if (success) {
      setSavingStatus(prev => ({ ...prev, [matchId]: 'saved' }));
      
      const match = allMatches.find(m => m.id === matchId);
      
      // Auto-send push notification if finished and feature flag is ON
      if (status === 'finished' && match && homeGoals !== null && awayGoals !== null && sendNotificationsFlag) {
        const isEdit = match.status === 'finished';
        const homeTeam = resolveTeam(match.home_team_id);
        const awayTeam = resolveTeam(match.away_team_id);
        supabase.functions.invoke('notify-subscribers', {
          body: {
            match_id: matchId,
            home_team_id: match.home_team_id,
            away_team_id: match.away_team_id,
            home_name: homeTeam?.display_name || homeTeam?.name || 'Local',
            away_name: awayTeam?.display_name || awayTeam?.name || 'Visitante',
            result: `${homeGoals} - ${awayGoals}`,
            is_edit: isEdit,
            title: isEdit ? notifTitleEdit : notifTitleNew,
            division_id: match.division_id
          }
        }).then(undefined, err => console.error('Error auto-sending push:', err));
      }

      // Actualizar la lista local de partidos para reflejar el estado y recalcular copas/sembrados en tiempo real
      setAllMatches(prev => prev.map(m => m.id === matchId ? { 
        ...m, 
        home_goals: homeGoals, 
        away_goals: awayGoals, 
        status,
        match_date: matchDate
      } : m));
      setFullTournamentMatches(prev => prev.map(m => m.id === matchId ? {
        ...m,
        home_goals: homeGoals,
        away_goals: awayGoals,
        status,
        match_date: matchDate
      } : m));
    } else {
      setSavingStatus(prev => ({ ...prev, [matchId]: 'error' }));
    }
  };

  const handlePenaltyChange = (slotKey: string, side: 'home' | 'away', val: string) => {
    if (val !== '' && (!/^\d+$/.test(val) || parseInt(val) < 0 || parseInt(val) > 99)) return;
    setEditingPenalties(prev => ({
      ...prev,
      [slotKey]: {
        homePenalties: prev[slotKey]?.homePenalties ?? '',
        awayPenalties: prev[slotKey]?.awayPenalties ?? '',
        [`${side}Penalties`]: val
      }
    }));
    setPlayoffSlotErrors(prev => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
    setSavingStatus(prev => ({ ...prev, [slotKey]: 'idle' }));
  };

  const handleSavePlayoffSlot = async (slot: AdminPlayoffSlot) => {
    if (!slot.homeTeam || !slot.awayTeam) return;
    const { slotKey } = slot;
    const edit = editingResults[slotKey] || { homeGoals: '', awayGoals: '' };
    const penEdit = editingPenalties[slotKey] || { homePenalties: '', awayPenalties: '' };

    const homeVal = edit.homeGoals.trim();
    const awayVal = edit.awayGoals.trim();
    const homeGoals = homeVal === '' ? null : parseInt(homeVal);
    const awayGoals = awayVal === '' ? null : parseInt(awayVal);

    if ((homeGoals !== null && awayGoals === null) || (homeGoals === null && awayGoals !== null)) {
      setPlayoffSlotErrors(prev => ({
        ...prev,
        [slotKey]: 'Completá los goles de ambos equipos (o dejá ambos vacíos para programado).'
      }));
      return;
    }

    let homePenalties: number | null = null;
    let awayPenalties: number | null = null;

    if (homeGoals !== null && awayGoals !== null && homeGoals === awayGoals) {
      const hpVal = penEdit.homePenalties.trim();
      const apVal = penEdit.awayPenalties.trim();
      if (hpVal === '' || apVal === '') {
        setPlayoffSlotErrors(prev => ({
          ...prev,
          [slotKey]: 'Al haber empate en tiempo reglamentario, debés cargar el resultado de los penales para definir qué equipo avanza en esta categoría.'
        }));
        return;
      }
      homePenalties = parseInt(hpVal);
      awayPenalties = parseInt(apVal);
      if (homePenalties === awayPenalties) {
        setPlayoffSlotErrors(prev => ({
          ...prev,
          [slotKey]: 'La definición por penales no puede terminar empatada. Ingresá el ganador de la tanda.'
        }));
        return;
      }
    }

    setPlayoffSlotErrors(prev => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
    setSavingStatus(prev => ({ ...prev, [slotKey]: 'saving' }));

    const status: 'scheduled' | 'finished' = (homeGoals !== null && awayGoals !== null) ? 'finished' : 'scheduled';
    const matchTime = editingTimes[slotKey] || '15:00';
    const matchDate = `2026-01-01T${matchTime}:00-03:00`;

    const saved = await savePlayoffMatchResult({
      existingMatchId: slot.realMatch?.id,
      tournamentId: selectedTournamentId,
      divisionId: selectedDivisionId,
      stage: slot.stage,
      homeTeamId: slot.homeTeam.id,
      awayTeamId: slot.awayTeam.id,
      homeGoals,
      awayGoals,
      homePenalties,
      awayPenalties,
      status,
      matchDate
    });

    if (saved) {
      setSavingStatus(prev => ({ ...prev, [slotKey]: 'saved' }));

      if (status === 'finished' && homeGoals !== null && awayGoals !== null && sendNotificationsFlag) {
        const isEdit = slot.realMatch?.status === 'finished';
        const penSuffix = (homePenalties !== null && awayPenalties !== null) ? ` (${homePenalties}-${awayPenalties} pen.)` : '';
        supabase.functions.invoke('notify-subscribers', {
          body: {
            match_id: saved.id,
            home_team_id: slot.homeTeam.id,
            away_team_id: slot.awayTeam.id,
            home_name: slot.homeTeam.display_name || slot.homeTeam.name,
            away_name: slot.awayTeam.display_name || slot.awayTeam.name,
            result: `${homeGoals} - ${awayGoals}${penSuffix}`,
            is_edit: isEdit,
            title: isEdit ? notifTitleEdit : notifTitleNew,
            division_id: selectedDivisionId
          }
        }).then(undefined, err => console.error('Error auto-sending playoff push:', err));
      }

      const upsertList = (list: Match[]) => {
        const idx = list.findIndex(
          m =>
            m.id === saved.id ||
            (m.stage === saved.stage &&
              m.division_id === saved.division_id &&
              ((m.home_team_id === saved.home_team_id && m.away_team_id === saved.away_team_id) ||
               (m.home_team_id === saved.away_team_id && m.away_team_id === saved.home_team_id)))
        );
        if (idx !== -1) {
          return list.map((m, i) => (i === idx ? saved : m));
        }
        return [...list, saved];
      };

      setAllMatches(upsertList);
      setFullTournamentMatches(upsertList);
    } else {
      setSavingStatus(prev => ({ ...prev, [slotKey]: 'error' }));
    }
  };

  const handleSendPushNotification = async (matchId: string) => {
    const match = allMatches.find(m => m.id === matchId);
    if (!match || match.status !== 'finished') {
       alert("Solo se pueden notificar partidos finalizados.");
       return;
    }
    
    try {
      setSavingStatus(prev => ({ ...prev, [matchId]: 'saving' })); // Reusing status for UI feedback
      const homeTeam = resolveTeam(match.home_team_id);
      const awayTeam = resolveTeam(match.away_team_id);
      const { error } = await supabase.functions.invoke('notify-subscribers', {
        body: {
          match_id: match.id,
          home_team_id: match.home_team_id,
          away_team_id: match.away_team_id,
          home_name: homeTeam?.display_name || homeTeam?.name || 'Local',
          away_name: awayTeam?.display_name || awayTeam?.name || 'Visitante',
          result: `${match.home_goals} - ${match.away_goals}`,
          is_edit: true,
          title: notifTitleEdit,
          division_id: match.division_id
        }
      });
      if (error) throw error;
      setSavingStatus(prev => ({ ...prev, [matchId]: 'saved' }));
      setTimeout(() => {
        setSavingStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[matchId];
          return newStatus;
        });
      }, 2000);
    } catch (e) {
      console.error(e);
      setSavingStatus(prev => ({ ...prev, [matchId]: 'error' }));
      alert("Error enviando notificación.");
    }
  };

  // Handlers para creación de Equipo, Torneo y Usuario
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      setTeamError('El nombre del equipo es requerido.');
      return;
    }
    setTeamLoading(true);
    setTeamError('');
    try {
      const res = await createTeam(
        newTeamName,
        newTeamDisplayName.trim() || null,
        newTeamLogoUrl.trim() || null
      );
      if (res) {
        setTeams(prev => [...prev, res].sort((a, b) => (a.display_name ?? a.name).localeCompare(b.display_name ?? b.name)));
        setIsCreateTeamOpen(false);
        setNewTeamName('');
        setNewTeamDisplayName('');
        setNewTeamLogoUrl('');
      } else {
        setTeamError('Error al crear el equipo.');
      }
    } catch (err: any) {
      setTeamError(err?.message || 'Error al crear el equipo.');
    } finally {
      setTeamLoading(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTournName.trim()) {
      setTournError('El nombre del torneo es requerido.');
      return;
    }
    if (!newTournYear || isNaN(newTournYear)) {
      setTournError('El año es requerido.');
      return;
    }
    setTournLoading(true);
    setTournError('');
    try {
      const res = await createTournament(newTournName, newTournYear);
      if (res) {
        setTournaments(prev => [...prev, res].sort((a, b) => b.year - a.year));
        setIsCreateTournamentOpen(false);
        setNewTournName('');
        setNewTournYear(new Date().getFullYear());
      } else {
        setTournError('Error al crear el torneo.');
      }
    } catch (err: any) {
      setTournError(err?.message || 'Error al crear el torneo.');
    } finally {
      setTournLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setUserError('El nombre de usuario es requerido.');
      return;
    }
    // Validar unicidad del usuario en la lista local antes de mandar al backend
    if (users.some(u => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      setUserError(`El nombre de usuario "${newUsername.trim()}" ya existe.`);
      return;
    }
    const pwdErr = validatePassword(newUserPassword);
    if (pwdErr) {
      setUserError(pwdErr);
      return;
    }
    setUserLoading(true);
    setUserError('');
    try {
      const res = await createUser(newUsername.trim(), newUserPassword, newUserRole);
      if (res) {
        setUsers(prev => [...prev, res]);
        setIsCreateUserOpen(false);
        setNewUsername('');
        setNewUserPassword('');
        setNewUserRole('editor');
        setShowNewUserPwd(false);
      } else {
        setUserError('Error al crear el usuario.');
      }
    } catch (err: any) {
      setUserError(err?.message || 'Error al crear el usuario.');
    } finally {
      setUserLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwdErr = validatePassword(newPasswordVal);
    if (pwdErr) {
      setChangePwdError(pwdErr);
      return;
    }
    setChangePwdLoading(true);
    setChangePwdError('');
    try {
      const success = await updateUserPassword(changePasswordUserId, newPasswordVal);
      if (success) {
        setIsChangePwdOpen(false);
        setNewPasswordVal('');
        setChangePasswordUserId('');
        setChangePasswordUsername('');
        setShowChangePwd(false);
      } else {
        setChangePwdError('Error al cambiar la contraseña.');
      }
    } catch (err: any) {
      setChangePwdError(err?.message || 'Error al cambiar la contraseña.');
    } finally {
      setChangePwdLoading(false);
    }
  };

  const handleToggleUserActive = async (userId: string, currentActive: boolean) => {
    try {
      const success = await toggleUserActive(userId, !currentActive);
      if (success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u));
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournamentId || !selectedDivisionId || !selectedZoneId) {
      setFixtureError('Seleccioná un torneo, división y zona.');
      return;
    }
    if (!fixtureHomeTeamId || !fixtureAwayTeamId) {
      setFixtureError('Seleccioná el equipo local y el equipo visitante.');
      return;
    }
    if (fixtureHomeTeamId === fixtureAwayTeamId) {
      setFixtureError('El equipo local y el visitante no pueden ser el mismo.');
      return;
    }
    if (fixtureRound < 1) {
      setFixtureError('El número de fecha debe ser al menos 1.');
      return;
    }

    // Validar que ninguno de los dos equipos esté ya jugando en la misma fecha para esta división
    const roundMatches = allMatches.filter(m => 
      m.division_id === selectedDivisionId && 
      m.round_number === fixtureRound
    );
    const homePlaying = roundMatches.some(m => m.home_team_id === fixtureHomeTeamId || m.away_team_id === fixtureHomeTeamId);
    const awayPlaying = roundMatches.some(m => m.home_team_id === fixtureAwayTeamId || m.away_team_id === fixtureAwayTeamId);
    
    if (homePlaying) {
      const teamName = teams.find(t => t.id === fixtureHomeTeamId)?.display_name || teams.find(t => t.id === fixtureHomeTeamId)?.name;
      setFixtureError(`El equipo local (${teamName}) ya tiene un partido programado en la Fecha ${fixtureRound}.`);
      return;
    }
    if (awayPlaying) {
      const teamName = teams.find(t => t.id === fixtureAwayTeamId)?.display_name || teams.find(t => t.id === fixtureAwayTeamId)?.name;
      setFixtureError(`El equipo visitante (${teamName}) ya tiene un partido programado en la Fecha ${fixtureRound}.`);
      return;
    }

    setFixtureLoading(true);
    setFixtureError('');
    try {
      const matchTime = fixtureTime || '15:00';
      const matchDate = `2026-01-01T${matchTime}:00-03:00`;

      const res = await createMatch({
        tournament_id: selectedTournamentId,
        division_id: selectedDivisionId,
        zone_id: selectedZoneId,
        round_number: fixtureRound,
        home_team_id: fixtureHomeTeamId,
        away_team_id: fixtureAwayTeamId,
        home_goals: null,
        away_goals: null,
        status: 'scheduled',
        match_date: matchDate
      });
      if (res) {
        setAllMatches(prev => [...prev, res]);
        setFixtureHomeTeamId('');
        setFixtureAwayTeamId('');
      } else {
        setFixtureError('Error al crear el partido.');
      }
    } catch (err: any) {
      setFixtureError(err?.message || 'Error al crear el partido.');
    } finally {
      setFixtureLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este partido del fixture?')) return;
    try {
      const success = await deleteMatch(matchId);
      if (success) {
        setAllMatches(prev => prev.filter(m => m.id !== matchId));
      }
    } catch (err) {
      console.error('Error deleting match:', err);
    }
  };

  // Filtrado de equipos por zona para prevenir solapamiento
  const otherZoneMatches = allMatches.filter(m => 
    m.division_id === selectedDivisionId && 
    m.zone_id !== selectedZoneId
  );
  const otherZoneTeamIds = new Set<string>();
  otherZoneMatches.forEach(m => {
    otherZoneTeamIds.add(m.home_team_id);
    otherZoneTeamIds.add(m.away_team_id);
  });

  const supabaseActive = isSupabaseActive();
  const eligibleTeams = teams.filter(t => {
    // Si ya está programado en otra zona para esta división, se descarta
    if (otherZoneTeamIds.has(t.id)) return false;

    // En modo de desarrollo mock offline, limitamos a las listas fijadas
    if (!supabaseActive) {
      const isCampeonato = selectedZoneId === '22222222-0001-0001-0001-000000000001';
      const allowedNames = isCampeonato ? TEAMS_CAMPEONATO_NAMES : TEAMS_PROMOCION_NAMES;
      return allowedNames.includes(t.name);
    }
    return true;
  });

  // Sincronizar equipos seleccionados para Round-Robin al cambiar de filtros o cargarse los equipos
  useEffect(() => {
    setRoundRobinTeams(eligibleTeams.map(t => t.id));
    setParsedMatches([]);
    setRoundRobinMatches([]);
    setBulkText('');
    setBulkError('');
  }, [selectedDivisionId, selectedZoneId, selectedTournamentId, eligibleTeams.length]);

  // Función de coincidencia inteligente de equipos por nombre
  const findClosestTeam = (name: string): Team | undefined => {
    const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const searchNorm = norm(name);
    
    // 1. Coincidencia exacta
    let matched = eligibleTeams.find(t => norm(t.name) === searchNorm || (t.display_name && norm(t.display_name) === searchNorm));
    if (matched) return matched;
    
    // 2. Coincidencia parcial (uno contiene al otro)
    matched = eligibleTeams.find(t => {
      const tNameNorm = norm(t.name);
      const tDispNorm = t.display_name ? norm(t.display_name) : '';
      return tNameNorm.includes(searchNorm) || searchNorm.includes(tNameNorm) ||
             (tDispNorm && (tDispNorm.includes(searchNorm) || searchNorm.includes(tDispNorm)));
    });
    if (matched) return matched;
    
    // 3. Reemplazo de abreviaturas comunes y re-intento
    const replacements: Record<string, string> = {
      'dvo': 'deportivo',
      'dep': 'deportivo',
      'arg': 'argentinos',
      'atl': 'atletico',
      'mdp': 'mar del plata',
      'unidos': 'unidos',
      'norte': 'norte',
      'sud': 'sud',
      'de': '',
      'del': ''
    };
    let searchReplaced = searchNorm;
    Object.entries(replacements).forEach(([abbr, full]) => {
      searchReplaced = searchReplaced.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
    });
    searchReplaced = searchReplaced.replace(/\s+/g, ' ').trim();
    
    matched = eligibleTeams.find(t => {
      const tNameNorm = norm(t.name).replace(/\s+/g, ' ');
      const tDispNorm = t.display_name ? norm(t.display_name).replace(/\s+/g, ' ') : '';
      return tNameNorm.includes(searchReplaced) || searchReplaced.includes(tNameNorm) ||
             (tDispNorm && (tDispNorm.includes(searchReplaced) || searchReplaced.includes(tDispNorm)));
    });
    
    return matched;
  };

  const handleParseBulkText = () => {
    setBulkError('');
    if (!bulkText.trim()) {
      setBulkError('Pegá algún texto primero.');
      return;
    }

    const lines = bulkText.split('\n');
    let currentRound = 1;
    const tempParsed: ParsedMatch[] = [];
    
    const vsRegex = /\s*(?:vs\.?|contra|-)\s*/i;
    const spanishNumbers: Record<string, number> = {
      primera: 1, segunda: 2, tercera: 3, cuarta: 4, quinta: 5, sexta: 6, septima: 7, séptima: 7,
      octava: 8, novena: 9, decima: 10, décima: 10, undecima: 11, undécima: 11, duodecima: 12, duodécima: 12,
      decimotercera: 13, decimocuarta: 14, decimoquinta: 15, decimosexta: 16, decimoseptima: 17,
      decimoctava: 18, decimonovena: 19, vigesima: 20, vigésima: 20
    };

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      const lowerLine = line.toLowerCase();
      let roundMatch = false;
      
      if (lowerLine.includes('fecha') || lowerLine.includes('ronda')) {
        const words = lowerLine.split(/\s+/);
        for (const word of words) {
          const cleanWord = word.replace(/[^a-z0-9]/g, '');
          if (/^\d+$/.test(cleanWord)) {
            currentRound = parseInt(cleanWord);
            roundMatch = true;
            break;
          } else if (spanishNumbers[cleanWord] !== undefined) {
            currentRound = spanishNumbers[cleanWord];
            roundMatch = true;
            break;
          }
        }
        if (roundMatch) continue;
      }
      
      const words = lowerLine.split(/\s+/);
      if (words.length === 2 && spanishNumbers[words[0]] !== undefined) {
        currentRound = spanishNumbers[words[0]];
        continue;
      }
      
      const cleanMatchLine = line.replace(/^[\s*\-•·]+/, '').trim();
      const parts = cleanMatchLine.split(vsRegex);
      if (parts.length === 2) {
        const homeName = parts[0].trim();
        const awayName = parts[1].trim();
        if (homeName && awayName) {
          const homeTeam = findClosestTeam(homeName);
          const awayTeam = findClosestTeam(awayName);
          const divName = divisions.find(d => d.id === selectedDivisionId)?.name || '';
          const defaultTime = DEFAULT_KICKOFF_TIMES[divName] || '15:00';
          
          tempParsed.push({
            round: currentRound,
            homeName,
            awayName,
            homeTeamId: homeTeam?.id,
            awayTeamId: awayTeam?.id,
            time: defaultTime
          });
        }
      }
    }
    
    if (tempParsed.length === 0) {
      setBulkError('No se pudieron detectar partidos en el texto. Asegurate de usar el formato "Equipo A vs. Equipo B" y separadores de "Fecha X".');
    }
    setParsedMatches(tempParsed);
  };

  const handleSaveBulkMatches = async () => {
    if (parsedMatches.length === 0) return;
    
    const unmapped = parsedMatches.filter(m => !m.homeTeamId || !m.awayTeamId);
    if (unmapped.length > 0) {
      setBulkError(`Hay ${unmapped.length} partidos sin asociar. Por favor seleccioná los equipos correctos usando el menú desplegable antes de guardar.`);
      return;
    }

    if (!confirm('¿Estás seguro de que querés guardar este fixture? Esto ELIMINARÁ todos los partidos existentes para esta división, zona y torneo.')) {
      return;
    }

    setBulkLoading(true);
    setBulkError('');
    try {
      await deleteMatchesByFilter(selectedTournamentId, selectedDivisionId, selectedZoneId);
      
      const matchesToInsert = parsedMatches.map(m => {
        const matchTime = m.time || '15:00';
        const matchDate = `2026-01-01T${matchTime}:00-03:00`;
        return {
          tournament_id: selectedTournamentId,
          division_id: selectedDivisionId,
          zone_id: selectedZoneId,
          round_number: m.round,
          home_team_id: m.homeTeamId!,
          away_team_id: m.awayTeamId!,
          home_goals: null,
          away_goals: null,
          status: 'scheduled' as const,
          match_date: matchDate
        };
      });

      await createMatches(matchesToInsert);
      
      const updatedMatches = await fetchTournamentDivisionMatches(selectedTournamentId, selectedDivisionId);
      setAllMatches(updatedMatches);
      
      setParsedMatches([]);
      setBulkText('');
      setFixtureMode('manual');
      alert('¡Fixture cargado exitosamente!');
    } catch (err: any) {
      setBulkError(err?.message || 'Error al guardar el fixture masivo.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleGenerateRoundRobin = () => {
    setBulkError('');
    if (roundRobinTeams.length < 2) {
      setBulkError('Seleccioná al menos 2 equipos para generar el fixture.');
      return;
    }

    let list = [...roundRobinTeams];
    const isOdd = list.length % 2 !== 0;
    if (isOdd) {
      list.push('BYE');
    }

    const numTeams = list.length;
    const numRounds = numTeams - 1;
    const matchesList: { round: number; homeTeamId: string; awayTeamId: string; time?: string }[] = [];
    const divName = divisions.find(d => d.id === selectedDivisionId)?.name || '';
    const defaultTime = DEFAULT_KICKOFF_TIMES[divName] || '15:00';

    for (let round = 1; round <= numRounds; round++) {
      for (let i = 0; i < numTeams / 2; i++) {
        const homeId = list[i];
        const awayId = list[numTeams - 1 - i];

        const isHome = (round + i) % 2 === 0;

        if (homeId !== 'BYE' && awayId !== 'BYE') {
          matchesList.push({
            round,
            homeTeamId: isHome ? homeId : awayId,
            awayTeamId: isHome ? awayId : homeId,
            time: defaultTime
          });
        }
      }
      list = [list[0], list[numTeams - 1], ...list.slice(1, numTeams - 1)];
    }

    setRoundRobinMatches(matchesList);
  };

  const handleSaveRoundRobinMatches = async () => {
    if (roundRobinMatches.length === 0) return;

    if (!confirm('¿Estás seguro de que querés guardar este fixture generado? Esto ELIMINARÁ todos los partidos existentes para esta división, zona y torneo.')) {
      return;
    }

    setBulkLoading(true);
    setBulkError('');
    try {
      await deleteMatchesByFilter(selectedTournamentId, selectedDivisionId, selectedZoneId);
      
      const matchesToInsert = roundRobinMatches.map(m => {
        const matchTime = m.time || '15:00';
        const matchDate = `2026-01-01T${matchTime}:00-03:00`;
        return {
          tournament_id: selectedTournamentId,
          division_id: selectedDivisionId,
          zone_id: selectedZoneId,
          round_number: m.round,
          home_team_id: m.homeTeamId,
          away_team_id: m.awayTeamId,
          home_goals: null,
          away_goals: null,
          status: 'scheduled' as const,
          match_date: matchDate
        };
      });

      await createMatches(matchesToInsert);
      
      const updatedMatches = await fetchTournamentDivisionMatches(selectedTournamentId, selectedDivisionId);
      setAllMatches(updatedMatches);
      
      setRoundRobinMatches([]);
      setFixtureMode('manual');
      alert('¡Fixture Round Robin generado y guardado exitosamente!');
    } catch (err: any) {
      setBulkError(err?.message || 'Error al guardar el fixture generado.');
    } finally {
      setBulkLoading(false);
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';

  if (!user) return null;

  const pendingMatches = matches.filter(m => m.status === 'scheduled').length;

  // User avatar initial
  const avatarInitial = user.username.charAt(0).toUpperCase();
  const roleLabel = isSuperAdmin ? 'Super Admin' : 'Editor';

  // Stats
  const stats = [
    { label: 'Equipos',  value: teams.length,         icon: Users,         color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
    { label: 'Torneos',  value: tournaments.length,   icon: Trophy,     color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Pendientes', value: pendingMatches,     icon: ClipboardList, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Zonas',    value: zones.length,         icon: BarChart3,     color: 'text-green-500',  bg: 'bg-green-500/10'  },
  ];

  const unreadCount = messages.filter(m => !m.is_read && !m.is_deleted).length;

  const navItems = [
    { id: 'teams'       as const, label: 'Gestión de Equipos',   icon: Shield   },
    { id: 'tournaments' as const, label: 'Torneos y Años',        icon: Trophy   },
    ...(isSuperAdmin ? [{ id: 'fixture_config' as const, label: 'Configurar Fixture', icon: Settings }] : []),
    { id: 'fixture'     as const, label: 'Fixture y Resultados',  icon: Calendar },
    { id: 'news'        as const, label: 'Noticias y Avisos',     icon: Newspaper },
    { id: 'champions'   as const, label: 'Historial Campeones',   icon: Trophy   },
    { id: 'social_generator' as const, label: 'Generador de Placas', icon: ImageIcon },
    { id: 'users'       as const, label: 'Gestión de Usuarios',   icon: Users },
    { id: 'messages'    as const, label: 'Mensajes',              icon: MessageSquare },
    { id: 'settings'    as const, label: 'Sponsors y Ajustes',    icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <div className="bg-card/80 border-b border-border/50 sticky top-0 z-10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Panel de Administración</h1>
              <p className="text-xs text-primary/80 font-semibold tracking-wider uppercase">{roleLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPdfImporterOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              title="Importar resultados desde boletín PDF"
            >
              <FileText className="w-4 h-4" />
              <span>Cargar Boletín (PDF)</span>
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md">
                {avatarInitial}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold leading-none">{user.username}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{roleLabel}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map(stat => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="bg-card/60 border border-border/50 rounded-2xl p-5 backdrop-blur-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className={cn('p-2 rounded-lg', stat.bg)}>
                  <stat.icon className={cn('w-4 h-4', stat.color)} />
                </div>
              </div>
              <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 space-y-1.5 shrink-0">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.id === 'messages' && unreadCount > 0 && (
                  <span className={cn(
                    "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold transition-all duration-300",
                    activeTab === 'messages'
                      ? "bg-primary-foreground text-primary animate-pulse"
                      : "bg-red-500 text-white animate-pulse"
                  )}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-xl"
            >
              {/* ── TEAMS ── */}
              {activeTab === 'teams' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Equipos</h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        Administrá los equipos de la liga. ({teams.length} en total)
                      </p>
                    </div>
                    {isSuperAdmin && (
                      <button 
                        onClick={() => {
                          setTeamError('');
                          setIsCreateTeamOpen(true);
                        }}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
                      >
                        <Plus className="w-4 h-4" /> Nuevo Equipo
                      </button>
                    )}
                  </div>

                  {!isSuperAdmin && (
                    <div className="bg-yellow-500/10 border border-yellow-500/40 p-4 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                        No tenés permisos para crear equipos. Contactá al Super Admin.
                      </p>
                    </div>
                  )}

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full"
                      />
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                    >
                      {teams.map(team => (
                        <motion.div
                          key={team.id}
                          variants={itemVariants}
                          className="bg-background border border-border/50 rounded-2xl p-4 flex items-center gap-3 group hover:border-primary/40 hover:shadow-md transition-all duration-200"
                        >
                          <div className="w-11 h-11 bg-muted/30 rounded-full flex items-center justify-center shrink-0 border border-border/50 overflow-hidden group-hover:scale-105 transition-transform duration-200">
                            {team.logo_url
                              ? <img src={team.logo_url} className="w-8 h-8 object-contain" alt={team.name} />
                              : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate text-sm">{team.display_name ?? team.name}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── TOURNAMENTS ── */}
              {activeTab === 'tournaments' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Torneos y Temporadas</h2>
                      <p className="text-muted-foreground text-sm mt-1">Configurá los campeonatos por año.</p>
                    </div>
                    {isSuperAdmin && (
                      <button 
                        onClick={() => {
                          setTournError('');
                          setIsCreateTournamentOpen(true);
                        }}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 shadow-md shadow-primary/20"
                      >
                        <Plus className="w-4 h-4" /> Nuevo Torneo
                      </button>
                    )}
                  </div>

                  {!isSuperAdmin && (
                    <div className="bg-yellow-500/10 border border-yellow-500/40 p-4 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                        No tenés permisos para crear torneos. Contactá al Super Admin.
                      </p>
                    </div>
                  )}

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full"
                      />
                    </div>
                  ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
                      {tournaments.map(t => (
                        <motion.div
                          key={t.id}
                          variants={itemVariants}
                          className="bg-background border border-border/50 rounded-2xl p-5 flex items-center justify-between group hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                              <Trophy className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold">{t.name}</h3>
                              <p className="text-muted-foreground text-sm">Temporada {t.year}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── FIXTURE CONFIG (Super Admin Only) ── */}
              {activeTab === 'fixture_config' && isSuperAdmin && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Configuración de Fixture</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Armá el fixture de partidos manualmente para cada combinación de torneo, división y zona.
                    </p>
                  </div>

                  {/* Filtros */}
                  <div className="flex flex-wrap gap-3 mb-6 bg-muted/20 p-4 rounded-2xl border border-border/50">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Torneo</label>
                      <select
                        value={selectedTournamentId}
                        onChange={(e) => setSelectedTournamentId(e.target.value)}
                        className="bg-background border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                      >
                        {tournaments.map(t => (
                          <option key={t.id} value={t.id}>{t.name} {t.year}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">División</label>
                      <select
                        value={selectedDivisionId}
                        onChange={(e) => setSelectedDivisionId(e.target.value)}
                        className="bg-background border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                      >
                        {divisions.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Zona</label>
                      <select
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="bg-background border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                      >
                        {availableZonesForDivision.map(z => (
                          <option key={z.id} value={z.id}>{z.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selector de Modo */}
                  <div className="flex bg-muted/50 p-1.5 rounded-xl border border-border/50 max-w-lg mb-6">
                    <button
                      onClick={() => setFixtureMode('manual')}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer",
                        fixtureMode === 'manual' ? "bg-background shadow text-primary font-black scale-[1.02]" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar Uno
                    </button>
                    <button
                      onClick={() => setFixtureMode('bulk_text')}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer",
                        fixtureMode === 'bulk_text' ? "bg-background shadow text-primary font-black scale-[1.02]" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <FileText className="w-3.5 h-3.5" /> Pegar Texto
                    </button>
                    <button
                      onClick={() => setFixtureMode('round_robin')}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer",
                        fixtureMode === 'round_robin' ? "bg-background shadow text-primary font-black scale-[1.02]" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Autogenerar
                    </button>
                  </div>

                  {bulkError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-2.5 mb-4">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <div>{bulkError}</div>
                    </div>
                  )}

                  {/* MODO MANUAL (EXISTENTE) */}
                  {fixtureMode === 'manual' && (
                    <form onSubmit={handleCreateMatch} className="bg-background border border-border/50 rounded-3xl p-6 space-y-4 shadow-sm">
                      <h3 className="font-bold text-base flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary" /> Agregar Nuevo Partido Manualmente
                      </h3>
                      
                      {fixtureError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium">
                          {fixtureError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Fecha */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold ml-1">Fecha (Ronda)</label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={fixtureRound}
                            onChange={(e) => setFixtureRound(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none font-medium text-sm"
                            required
                          />
                        </div>

                        {/* Local */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold ml-1">Equipo Local</label>
                          <select
                            value={fixtureHomeTeamId}
                            onChange={(e) => setFixtureHomeTeamId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                            required
                          >
                            <option value="">Seleccionar local...</option>
                            {eligibleTeams.map(t => (
                              <option key={t.id} value={t.id}>{t.display_name ?? t.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Visitante */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold ml-1">Equipo Visitante</label>
                          <select
                            value={fixtureAwayTeamId}
                            onChange={(e) => setFixtureAwayTeamId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                            required
                          >
                            <option value="">Seleccionar visitante...</option>
                            {eligibleTeams.map(t => (
                              <option key={t.id} value={t.id}>{t.display_name ?? t.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Horario */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold ml-1">Horario</label>
                          <input
                            type="time"
                            value={fixtureTime}
                            onChange={(e) => setFixtureTime(e.target.value)}
                            className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none font-medium text-sm"
                            required
                          />
                        </div>

                        {/* Submit */}
                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={fixtureLoading}
                            className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer"
                          >
                            {fixtureLoading ? 'Agregando...' : 'Agregar Partido'}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* MODO CARGA MASIVA POR TEXTO */}
                  {fixtureMode === 'bulk_text' && (
                    <div className="bg-background border border-border/50 rounded-3xl p-6 space-y-6 shadow-sm">
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-base flex items-center gap-2">
                          <Upload className="w-4 h-4 text-primary" /> Cargar Fixture Copiado (Texto)
                        </h3>
                        <p className="text-muted-foreground text-xs">
                          Pegá las fechas y partidos. El sistema asociará los equipos automáticamente. Ejemplo:<br />
                          <code className="bg-muted/80 px-1.5 py-0.5 rounded text-[10px] text-primary font-bold">FECHA 1</code><br />
                          <code className="bg-muted/80 px-1.5 py-0.5 rounded text-[10px] text-muted-foreground ml-2">* Talleres vs. Dvo Norte</code>
                        </p>
                      </div>

                      <textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder="ZONA CAMPEONATO&#10;&#10;PRIMERA FECHA&#10;&#10;* Talleres vs. Deportivo Norte&#10;* Kimberley vs. Once Unidos&#10;* Aldosivi vs. Banfield"
                        rows={10}
                        className="w-full px-4 py-3 bg-muted/20 border border-border/60 rounded-2xl focus:ring-2 focus:ring-primary/40 outline-none font-mono text-xs resize-y"
                      />

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={handleParseBulkText}
                          className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Procesar Fixture
                        </button>
                      </div>

                      {parsedMatches.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-border/50">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-sm">Partidos Previsualizados ({parsedMatches.length})</h4>
                            <span className="text-xs text-muted-foreground">Mapeá los equipos que posean alertas ⚠️</span>
                          </div>

                          <div className="border border-border/50 rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-muted/50 font-bold text-muted-foreground uppercase border-b border-border/50">
                                <tr>
                                  <th className="px-4 py-3 text-center w-16">Fecha</th>
                                  <th className="px-4 py-3">Equipo Local (Detectado)</th>
                                  <th className="px-4 py-3">Equipo Visitante (Detectado)</th>
                                  <th className="px-4 py-3 text-center w-28">Horario</th>
                                  <th className="px-4 py-3 text-center w-24">Estado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/50">
                                {parsedMatches.map((m, idx) => {
                                  const isHomeMapped = !!m.homeTeamId;
                                  const isAwayMapped = !!m.awayTeamId;
                                  return (
                                    <tr key={idx} className="hover:bg-muted/20">
                                      <td className="px-4 py-3 text-center font-bold">Fecha {m.round}</td>
                                      <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                          <span className="font-semibold text-muted-foreground text-[10px]">{m.homeName}</span>
                                          <select
                                            value={m.homeTeamId || ''}
                                            onChange={(e) => {
                                              const newId = e.target.value;
                                              setParsedMatches(prev => prev.map((pm, pmIdx) => pmIdx === idx ? { ...pm, homeTeamId: newId } : pm));
                                            }}
                                            className={cn(
                                              "px-2 py-1 text-xs border rounded-lg focus:ring-2 focus:ring-primary/40 bg-background outline-none max-w-xs",
                                              isHomeMapped ? "border-border" : "border-amber-400 bg-amber-500/5"
                                            )}
                                          >
                                            <option value="">Seleccionar equipo local...</option>
                                            {eligibleTeams.map(t => (
                                              <option key={t.id} value={t.id}>{t.display_name ?? t.name}</option>
                                            ))}
                                          </select>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                          <span className="font-semibold text-muted-foreground text-[10px]">{m.awayName}</span>
                                          <select
                                            value={m.awayTeamId || ''}
                                            onChange={(e) => {
                                              const newId = e.target.value;
                                              setParsedMatches(prev => prev.map((pm, pmIdx) => pmIdx === idx ? { ...pm, awayTeamId: newId } : pm));
                                            }}
                                            className={cn(
                                              "px-2 py-1 text-xs border rounded-lg focus:ring-2 focus:ring-primary/40 bg-background outline-none max-w-xs",
                                              isAwayMapped ? "border-border" : "border-amber-400 bg-amber-500/5"
                                            )}
                                          >
                                            <option value="">Seleccionar equipo visitante...</option>
                                            {eligibleTeams.map(t => (
                                              <option key={t.id} value={t.id}>{t.display_name ?? t.name}</option>
                                            ))}
                                          </select>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <input
                                          type="time"
                                          value={m.time || ''}
                                          onChange={(e) => {
                                            const newTime = e.target.value;
                                            setParsedMatches(prev => prev.map((pm, pmIdx) => pmIdx === idx ? { ...pm, time: newTime } : pm));
                                          }}
                                          className="px-2 py-1 text-xs border border-border/60 rounded-lg bg-background focus:ring-2 focus:ring-primary/40 outline-none text-center font-bold"
                                        />
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {isHomeMapped && isAwayMapped ? (
                                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600">
                                            <Check className="w-3 h-3" /> Mapeado
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 animate-pulse">
                                            <AlertTriangle className="w-3 h-3" /> Falta
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex justify-end gap-3 pt-3">
                            <button
                              onClick={() => setParsedMatches([])}
                              className="px-4 py-2 border border-border text-muted-foreground font-bold rounded-xl text-xs hover:bg-muted cursor-pointer"
                            >
                              Limpiar
                            </button>
                            <button
                              onClick={handleSaveBulkMatches}
                              disabled={bulkLoading || parsedMatches.some(m => !m.homeTeamId || !m.awayTeamId)}
                              className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-md shadow-green-500/10"
                            >
                              <Check className="w-3.5 h-3.5" />
                              {bulkLoading ? 'Guardando...' : 'Confirmar y Guardar Fixture'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODO ROUND ROBIN */}
                  {fixtureMode === 'round_robin' && (
                    <div className="bg-background border border-border/50 rounded-3xl p-6 space-y-6 shadow-sm">
                      <div className="space-y-1">
                        <h3 className="font-bold text-base flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" /> Generar Fixture Todos contra Todos
                        </h3>
                        <p className="text-muted-foreground text-xs">
                          Seleccioná los equipos que formarán parte del torneo. El sistema calculará el fixture automáticamente (algoritmo Round Robin).
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Equipos Disponibles ({eligibleTeams.length})</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setRoundRobinTeams(eligibleTeams.map(t => t.id))}
                              className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                            >
                              Seleccionar Todos
                            </button>
                            <span className="text-[10px] text-muted-foreground">|</span>
                            <button
                              onClick={() => setRoundRobinTeams([])}
                              className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                            >
                              Desmarcar Todos
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-muted/10 p-4 border border-border/40 rounded-2xl max-h-[250px] overflow-y-auto">
                          {eligibleTeams.map(t => {
                            const isChecked = roundRobinTeams.includes(t.id);
                            return (
                              <label key={t.id} className="flex items-center gap-2 p-2 hover:bg-muted/40 rounded-xl cursor-pointer text-xs select-none">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setRoundRobinTeams(prev => prev.filter(id => id !== t.id));
                                    } else {
                                      setRoundRobinTeams(prev => [...prev, t.id]);
                                    }
                                  }}
                                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary/40 focus:ring-2 outline-none"
                                />
                                <span className="font-semibold truncate">{t.display_name ?? t.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleGenerateRoundRobin}
                          className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-1.5 hover:opacity-90 cursor-pointer shadow-md shadow-primary/10"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Generar Fixture
                        </button>
                      </div>

                      {roundRobinMatches.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-border/50">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-sm">Fixture Generado ({roundRobinMatches.length} partidos)</h4>
                            <span className="text-xs text-primary font-bold bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">
                              {Array.from(new Set(roundRobinMatches.map(m => m.round))).length} Fechas Totales
                            </span>
                          </div>

                          <div className="border border-border/50 rounded-2xl overflow-hidden max-h-[350px] overflow-y-auto">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-muted/50 font-bold text-muted-foreground uppercase border-b border-border/50">
                                <tr>
                                  <th className="px-4 py-3 text-center w-16">Fecha</th>
                                  <th className="px-4 py-3">Local</th>
                                  <th className="px-4 py-3">Visitante</th>
                                  <th className="px-4 py-3 text-center w-32">Horario</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/50">
                                {roundRobinMatches.map((m, idx) => {
                                  const home = eligibleTeams.find(t => t.id === m.homeTeamId);
                                  const away = eligibleTeams.find(t => t.id === m.awayTeamId);
                                  return (
                                    <tr key={idx} className="hover:bg-muted/20">
                                      <td className="px-4 py-3 text-center font-bold">Fecha {m.round}</td>
                                      <td className="px-4 py-3 font-semibold">{home?.display_name ?? home?.name ?? m.homeTeamId}</td>
                                      <td className="px-4 py-3 font-semibold">{away?.display_name ?? away?.name ?? m.awayTeamId}</td>
                                      <td className="px-4 py-3 text-center">
                                        <input
                                          type="time"
                                          value={m.time || ''}
                                          onChange={(e) => {
                                            const newTime = e.target.value;
                                            setRoundRobinMatches(prev => prev.map((pm, pmIdx) => pmIdx === idx ? { ...pm, time: newTime } : pm));
                                          }}
                                          className="px-2 py-1 text-xs border border-border/60 rounded-lg bg-background focus:ring-2 focus:ring-primary/40 outline-none text-center font-bold"
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex justify-end gap-3 pt-3">
                            <button
                              onClick={() => setRoundRobinMatches([])}
                              className="px-4 py-2 border border-border text-muted-foreground font-bold rounded-xl text-xs hover:bg-muted cursor-pointer"
                            >
                              Descartar
                            </button>
                            <button
                              onClick={handleSaveRoundRobinMatches}
                              disabled={bulkLoading}
                              className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-md shadow-green-500/10"
                            >
                              <Check className="w-3.5 h-3.5" />
                              {bulkLoading ? 'Guardando...' : 'Confirmar y Guardar Fixture'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Listado de partidos agrupados por fecha */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Partidos Programados</h3>
                    
                    {matches.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-border rounded-3xl bg-muted/5">
                        <p className="text-muted-foreground text-sm">No hay partidos cargados para este fixture.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Array.from(new Set(matches.map(m => m.round_number)))
                          .sort((a, b) => a - b)
                          .map(roundNum => {
                            const roundMatches = matches.filter(m => m.round_number === roundNum);
                            return (
                              <div key={roundNum} className="space-y-2.5">
                                <h4 className="font-extrabold text-sm text-primary uppercase tracking-wider ml-1">Fecha {roundNum}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {roundMatches.map(m => {
                                    const home = resolveTeam(m.home_team_id);
                                    const away = resolveTeam(m.away_team_id);
                                    if (!home || !away) return null;
                                    return (
                                      <div key={m.id} className="bg-background border border-border/50 rounded-2xl p-4 flex items-center justify-between hover:border-primary/20 transition-all duration-200 shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <span className="font-semibold text-sm truncate">{home.display_name ?? home.name} vs {away.display_name ?? away.name}</span>
                                          {m.match_date && (
                                            <span className="text-xs text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded-md shrink-0">
                                              {formatMatchTime(m.match_date)} hs
                                            </span>
                                          )}
                                        </div>
                                        <button
                                          onClick={() => handleDeleteMatch(m.id)}
                                          className="p-2 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 rounded-xl transition-colors shrink-0"
                                          title="Eliminar partido"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── FIXTURE Y RESULTADOS ── */}
              {activeTab === 'fixture' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">Carga de Resultados</h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        {resultsPhaseMode === 'playoffs' && isAdaroTournamentSelected
                          ? 'Cargá los resultados de Cuartos, Semifinales y Final de las 4 Copas por cada división individual.'
                          : 'Actualizá los resultados de los partidos. Podés editar partidos finalizados si hubo pifies.'}
                      </p>
                    </div>

                    {/* Interruptor Fase de Zonas vs Playoffs 4 Copas */}
                    {isAdaroTournamentSelected && (
                      <div className="inline-flex bg-muted/50 p-1.5 rounded-2xl border border-border/60 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setResultsPhaseMode('zones')}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                            resultsPhaseMode === 'zones'
                              ? "bg-background text-primary shadow-xs font-black"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Fase de Zonas (Fechas 1-6)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setResultsPhaseMode('playoffs')}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                            resultsPhaseMode === 'playoffs'
                              ? "bg-primary text-primary-foreground shadow-xs font-black"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          <span>Playoffs · 4 Copas</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {resultsPhaseMode === 'playoffs' && isAdaroTournamentSelected ? (
                    <div className="space-y-6">
                      {/* Filtros principales (Misma estructura que Zonas: Torneo -> División -> Copa -> Instancia) */}
                      <div className="bg-muted/20 p-4 rounded-2xl border border-border/50 space-y-4">
                        <div className="flex flex-wrap gap-3">
                          {/* Torneo */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">Torneo</label>
                            <select
                              value={selectedTournamentId}
                              onChange={(e) => setSelectedTournamentId(e.target.value)}
                              className="bg-background border border-border/50 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold"
                            >
                              {tournaments.map(t => (
                                <option key={t.id} value={t.id}>{t.name} {t.year}</option>
                              ))}
                            </select>
                          </div>

                          {/* División */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">División / Categoría</label>
                            <select
                              value={selectedDivisionId}
                              onChange={(e) => setSelectedDivisionId(e.target.value)}
                              className="bg-background border border-border/50 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold"
                            >
                              {divisions.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Copa (en lugar de Zona) */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">Copa</label>
                            <select
                              value={selectedPlayoffCup}
                              onChange={(e) => setSelectedPlayoffCup(e.target.value as AdaroCupTier)}
                              className="bg-background border border-border/50 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold"
                            >
                              {(['platino', 'oro', 'plata', 'bronce'] as AdaroCupTier[]).map(tier => (
                                <option key={tier} value={tier}>
                                  {CUP_BADGES[tier].emoji} {CUP_BADGES[tier].label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Instancia (en lugar de Fecha) */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">Instancia / Ronda</label>
                            <select
                              value={selectedPlayoffStage}
                              onChange={(e) => setSelectedPlayoffStage(e.target.value as 'cuartos' | 'semifinal' | 'final')}
                              className="bg-background border border-border/50 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold"
                            >
                              <option value="cuartos">Cuartos de Final</option>
                              <option value="semifinal">Semifinales</option>
                              <option value="final">Gran Final</option>
                            </select>
                          </div>
                        </div>

                        {/* Atajos rápidos de Copa, Instancia y División */}
                        <div className="pt-3 border-t border-border/40 flex flex-col gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            {/* Botones de las 4 Copas */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {(['platino', 'oro', 'plata', 'bronce'] as AdaroCupTier[]).map(tier => {
                                const b = CUP_BADGES[tier];
                                const isSel = selectedPlayoffCup === tier;
                                return (
                                  <button
                                    key={tier}
                                    type="button"
                                    onClick={() => setSelectedPlayoffCup(tier)}
                                    className={cn(
                                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer",
                                      isSel
                                        ? `${b.bgClass} ${b.textClass} ${b.borderClass} ring-2 ring-primary/20 shadow-xs`
                                        : "bg-background hover:bg-muted text-muted-foreground border-border/60"
                                    )}
                                  >
                                    <span>{b.emoji}</span>
                                    <span>{b.name}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Botones de Instancia */}
                            <div className="inline-flex bg-background p-1 rounded-xl border border-border/60">
                              {([
                                { id: 'cuartos', label: 'Cuartos de Final' },
                                { id: 'semifinal', label: 'Semifinales' },
                                { id: 'final', label: 'Gran Final' }
                              ] as const).map(st => (
                                <button
                                  key={st.id}
                                  type="button"
                                  onClick={() => setSelectedPlayoffStage(st.id)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                                    selectedPlayoffStage === st.id
                                      ? "bg-primary text-primary-foreground shadow-xs font-black"
                                      : "text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  {st.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Barra rápida de Divisiones (7ª a 17ª) */}
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                            {divisions.map(div => {
                              const isSel = selectedDivisionId === div.id;
                              const order = getDivisionOrder(div.name);
                              const shortLabel = order >= 7 && order <= 17 ? `${order}ª Div` : div.name;
                              return (
                                <button
                                  key={div.id}
                                  type="button"
                                  onClick={() => setSelectedDivisionId(div.id)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer",
                                    isSel
                                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                      : "bg-background hover:bg-muted text-muted-foreground border-border/60"
                                  )}
                                >
                                  {shortLabel}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Resumen de Sembrados Dinámicos de la Copa */}
                      <div className="bg-background border border-border/60 rounded-2xl p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-amber-500" />
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                              Sembrados en {CUP_BADGES[selectedPlayoffCup].label} · Se actualizan automáticamente al cargar Fase de Zonas
                            </h3>
                          </div>
                          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                            Categoría activa: {divisions.find(d => d.id === selectedDivisionId)?.name || '7ª División'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                          {playoffBracketForDivision.seeds.map((item, idx) => {
                            const seedNum = idx + 1;
                            const isBye = seedNum === 1;
                            return (
                              <div
                                key={item.team.id}
                                className={cn(
                                  "p-2.5 rounded-xl border text-xs",
                                  isBye
                                    ? "bg-cyan-500/10 border-cyan-500/30"
                                    : "bg-muted/20 border-border/50"
                                )}
                              >
                                <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded-md font-black",
                                    isBye ? "bg-cyan-500 text-white" : "bg-muted text-muted-foreground"
                                  )}>
                                    #{seedNum}
                                  </span>
                                  <span className="text-muted-foreground">{item.zoneName}</span>
                                </div>
                                <p className="font-bold truncate text-foreground" title={item.team.name}>
                                  {item.team.display_name || item.team.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {item.pts} pts ({item.avg.toFixed(2).replace('.', ',')})
                                </p>
                                {isBye && (
                                  <span className="inline-block mt-1 text-[9px] font-black uppercase text-cyan-600 dark:text-cyan-400">
                                    Libre a Semis (A)
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Aviso de Sembrado #1 Libre en Cuartos */}
                      {selectedPlayoffStage === 'cuartos' && playoffBracketForDivision.seed1 && (
                        <div className="p-3.5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2 py-0.5 rounded-lg bg-cyan-500 text-white font-black text-[10px] uppercase">
                              Cruce A · Libre
                            </span>
                            <span className="font-bold text-foreground">
                              #1 {playoffBracketForDivision.seed1.display_name || playoffBracketForDivision.seed1.name}
                            </span>
                            <span className="text-muted-foreground">
                              avanza directo a Semifinales en todas las categorías (espera al ganador del Cruce D #4 vs #5).
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Lista de Partidos de la Instancia, Copa y División seleccionadas */}
                      <div className="space-y-4">
                        {playoffBracketForDivision[selectedPlayoffStage].map(slot => {
                          const { slotKey, homeTeam, awayTeam, realMatch, winnerTeam } = slot;
                          const edit = editingResults[slotKey] || { homeGoals: '', awayGoals: '' };
                          const penEdit = editingPenalties[slotKey] || { homePenalties: '', awayPenalties: '' };
                          const statusState = savingStatus[slotKey] || 'idle';
                          const slotError = playoffSlotErrors[slotKey];

                          const isTiedInRegulation =
                            edit.homeGoals.trim() !== '' &&
                            edit.awayGoals.trim() !== '' &&
                            parseInt(edit.homeGoals.trim()) === parseInt(edit.awayGoals.trim());

                          const isFinished = realMatch?.status === 'finished';

                          return (
                            <div
                              key={slotKey}
                              className={cn(
                                "bg-background border rounded-2xl p-4 sm:p-5 space-y-4 transition-all",
                                slot.stage === 'final'
                                  ? "border-amber-500/40 shadow-md"
                                  : "border-border/60 hover:border-primary/30"
                              )}
                            >
                              {/* Encabezado del Cruce */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/40">
                                <div className="flex items-center gap-2">
                                  <Swords className="w-4 h-4 text-primary" />
                                  <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                                    {slot.cruceLabel}
                                  </span>
                                  <span className="text-[11px] font-semibold text-muted-foreground">
                                    · {divisions.find(d => d.id === selectedDivisionId)?.name}
                                  </span>
                                </div>

                                {winnerTeam ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 text-xs font-black">
                                    <Check className="w-3.5 h-3.5" />
                                    {slot.stage === 'final'
                                      ? `👑 Campeón en esta división: ${winnerTeam.display_name || winnerTeam.name}`
                                      : `Avanza en esta división: ${winnerTeam.display_name || winnerTeam.name}`}
                                  </span>
                                ) : (
                                  <span className={cn(
                                    "px-2.5 py-0.5 rounded-full text-xs font-bold",
                                    isFinished
                                      ? "bg-green-500/10 text-green-600 border border-green-500/20"
                                      : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                                  )}>
                                    {isFinished ? 'Finalizado' : 'Pendiente de definición'}
                                  </span>
                                )}
                              </div>

                              {/* Si aún no están definidos ambos equipos en Semifinal o Final para esta división */}
                              {(!homeTeam || !awayTeam) ? (
                                <div className="p-4 rounded-xl bg-muted/30 border border-dashed border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                  <div className="space-y-1">
                                    <p className="font-bold text-foreground">
                                      Cruce pendiente de resultados previos en {divisions.find(d => d.id === selectedDivisionId)?.name}
                                    </p>
                                    <p className="text-muted-foreground">
                                      Local: <strong className="text-foreground">{homeTeam ? (homeTeam.display_name || homeTeam.name) : slot.homePlaceholder}</strong>
                                      {'  ·  '}
                                      Visitante: <strong className="text-foreground">{awayTeam ? (awayTeam.display_name || awayTeam.name) : slot.awayPlaceholder}</strong>
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPlayoffStage(slot.stage === 'final' ? 'semifinal' : 'cuartos')}
                                    className="px-3.5 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs shrink-0 cursor-pointer"
                                  >
                                    Ir a {slot.stage === 'final' ? 'Semifinales' : 'Cuartos de Final'}
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {/* Fila principal de carga de goles y penales (siempre visibles en Playoffs) */}
                                  <div className="flex flex-col lg:flex-row items-center gap-3.5">
                                    {/* Equipo Local */}
                                    <div className="flex-1 flex justify-end items-center gap-2.5 w-full lg:w-[23%] min-w-0">
                                      {slot.homeSeed && (
                                        <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-black text-[10px] shrink-0">
                                          #{slot.homeSeed}
                                        </span>
                                      )}
                                      <span className="font-bold text-sm text-right truncate" title={homeTeam.display_name ?? homeTeam.name}>
                                        {homeTeam.display_name ?? homeTeam.name}
                                      </span>
                                      <div className="w-9 h-9 bg-muted rounded-full border border-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                                        {homeTeam.logo_url
                                          ? <img src={homeTeam.logo_url} className="w-6 h-6 object-contain" alt={homeTeam.name} />
                                          : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                                      </div>
                                    </div>

                                    {/* Goles Tiempo Reglamentario */}
                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Goles</span>
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          placeholder="–"
                                          aria-label={`Goles de ${homeTeam.display_name ?? homeTeam.name}`}
                                          value={edit.homeGoals}
                                          onChange={(e) => handleGoalChange(slotKey, 'home', e.target.value)}
                                          className="w-11 h-10 text-center bg-muted/30 border border-border/60 rounded-xl text-lg font-bold focus:ring-2 focus:ring-primary/40 outline-none"
                                        />
                                        <span className="text-muted-foreground font-bold">–</span>
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          placeholder="–"
                                          aria-label={`Goles de ${awayTeam.display_name ?? awayTeam.name}`}
                                          value={edit.awayGoals}
                                          onChange={(e) => handleGoalChange(slotKey, 'away', e.target.value)}
                                          className="w-11 h-10 text-center bg-muted/30 border border-border/60 rounded-xl text-lg font-bold focus:ring-2 focus:ring-primary/40 outline-none"
                                        />
                                      </div>
                                    </div>

                                    {/* Penales (Siempre visibles en la tarjeta de Playoffs) */}
                                    <div className={cn(
                                      "flex flex-col items-center gap-1 shrink-0 px-2.5 py-1.5 rounded-xl border transition-all",
                                      isTiedInRegulation
                                        ? "bg-amber-500/10 border-amber-500/40"
                                        : "bg-muted/15 border-border/40"
                                    )}>
                                      <span className={cn(
                                        "text-[9px] font-extrabold uppercase tracking-wider",
                                        isTiedInRegulation ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                                      )}>
                                        ⚽ Penales (si empatan)
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          placeholder="Pen"
                                          aria-label={`Penales de ${homeTeam.display_name ?? homeTeam.name}`}
                                          value={penEdit.homePenalties}
                                          onChange={(e) => handlePenaltyChange(slotKey, 'home', e.target.value)}
                                          className={cn(
                                            "w-11 h-9 text-center rounded-lg text-sm font-black outline-none transition-all",
                                            isTiedInRegulation
                                              ? "bg-background border border-amber-500/50 text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500/40"
                                              : "bg-background/80 border border-border/60 text-foreground focus:ring-2 focus:ring-primary/30"
                                          )}
                                        />
                                        <span className="text-muted-foreground font-bold text-xs">–</span>
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          placeholder="Pen"
                                          aria-label={`Penales de ${awayTeam.display_name ?? awayTeam.name}`}
                                          value={penEdit.awayPenalties}
                                          onChange={(e) => handlePenaltyChange(slotKey, 'away', e.target.value)}
                                          className={cn(
                                            "w-11 h-9 text-center rounded-lg text-sm font-black outline-none transition-all",
                                            isTiedInRegulation
                                              ? "bg-background border border-amber-500/50 text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500/40"
                                              : "bg-background/80 border border-border/60 text-foreground focus:ring-2 focus:ring-primary/30"
                                          )}
                                        />
                                      </div>
                                    </div>

                                    {/* Horario */}
                                    <div className="flex flex-col items-center gap-1 shrink-0 px-1 w-[84px]">
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Horario</span>
                                      <input
                                        type="time"
                                        value={editingTimes[slotKey] || ''}
                                        onChange={(e) => handleTimeChange(slotKey, e.target.value)}
                                        className="px-2 py-2 text-xs border border-border/60 rounded-xl bg-muted/20 focus:ring-2 focus:ring-primary/40 outline-none text-center font-bold w-full"
                                      />
                                    </div>

                                    {/* Equipo Visitante */}
                                    <div className="flex-1 flex justify-start items-center gap-2.5 w-full lg:w-[23%] min-w-0">
                                      <div className="w-9 h-9 bg-muted rounded-full border border-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                                        {awayTeam.logo_url
                                          ? <img src={awayTeam.logo_url} className="w-6 h-6 object-contain" alt={awayTeam.name} />
                                          : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                                      </div>
                                      <span className="font-bold text-sm truncate" title={awayTeam.display_name ?? awayTeam.name}>
                                        {awayTeam.display_name ?? awayTeam.name}
                                      </span>
                                      {slot.awaySeed && (
                                        <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-black text-[10px] shrink-0">
                                          #{slot.awaySeed}
                                        </span>
                                      )}
                                    </div>

                                    {/* Botones de Acción */}
                                    <div className="flex gap-2 w-full lg:w-auto shrink-0 justify-end">
                                      {realMatch && (
                                        <button
                                          type="button"
                                          onClick={() => handleSendPushNotification(realMatch.id)}
                                          disabled={statusState === 'saving' || realMatch.status !== 'finished'}
                                          className={cn(
                                            "p-2.5 rounded-xl text-sm font-semibold transition-all border flex items-center justify-center shrink-0",
                                            realMatch.status === 'finished'
                                              ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20"
                                              : "bg-muted text-muted-foreground border-border/50 cursor-not-allowed"
                                          )}
                                          title={realMatch.status === 'finished' ? "Notificar a los suscriptores" : "Sólo finalizados"}
                                        >
                                          <BellRing className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleSavePlayoffSlot(slot)}
                                        disabled={statusState === 'saving'}
                                        className={cn(
                                          "px-4 py-2 rounded-xl text-sm font-semibold transition-all border flex-1 lg:flex-none flex items-center justify-center gap-1.5 min-w-[95px] cursor-pointer",
                                          statusState === 'saved'
                                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                                            : statusState === 'error'
                                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                                            : "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                                        )}
                                      >
                                        {statusState === 'saving' && (
                                          <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                            className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full inline-block shrink-0"
                                          />
                                        )}
                                        <span className="truncate">
                                          {statusState === 'saved' ? 'Guardado' : statusState === 'saving' ? 'Guardando' : 'Guardar'}
                                        </span>
                                      </button>
                                    </div>
                                  </div>

                                  {slotError && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4 shrink-0" />
                                      <span>{slotError}</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-3 mb-6 bg-muted/20 p-4 rounded-2xl border border-border/50">
                        {/* Torneo */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">Torneo</label>
                          <select
                            value={selectedTournamentId}
                            onChange={(e) => setSelectedTournamentId(e.target.value)}
                            className="bg-background border border-border/50 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                          >
                            {tournaments.map(t => (
                              <option key={t.id} value={t.id}>{t.name} {t.year}</option>
                            ))}
                          </select>
                        </div>

                        {/* División */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">División</label>
                          <select
                            value={selectedDivisionId}
                            onChange={(e) => setSelectedDivisionId(e.target.value)}
                            className="bg-background border border-border/50 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                          >
                            {divisions.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Zona */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">Zona</label>
                          <select
                            value={selectedZoneId}
                            onChange={(e) => setSelectedZoneId(e.target.value)}
                            className="bg-background border border-border/50 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                          >
                            {availableZonesForDivision.map(z => (
                              <option key={z.id} value={z.id}>{z.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Fecha */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">Fecha</label>
                          <select
                            value={selectedRound}
                            onChange={(e) => setSelectedRound(Number(e.target.value))}
                            className="bg-background border border-border/50 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                          >
                            {Array.from(new Set(matches.map(m => m.round_number))).sort((a, b) => a - b).map(r => (
                              <option key={r} value={r}>Fecha {r}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {loading ? (
                        <div className="space-y-3 animate-pulse">
                          {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="bg-background border border-border/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                              <div className="flex-1 flex justify-end items-center gap-3 w-full sm:w-[35%]">
                                <div className="h-4 bg-muted rounded w-28"></div>
                                <div className="w-9 h-9 bg-muted rounded-full shrink-0"></div>
                              </div>
                              <div className="flex items-center gap-2 justify-center w-full sm:w-[30%]">
                                <div className="w-12 h-10 bg-muted rounded-xl"></div>
                                <div className="w-4 h-4 bg-muted rounded"></div>
                                <div className="w-12 h-10 bg-muted rounded-xl"></div>
                              </div>
                              <div className="flex-1 flex justify-start items-center gap-3 w-full sm:w-[35%]">
                                <div className="w-9 h-9 bg-muted rounded-full shrink-0"></div>
                                <div className="h-4 bg-muted rounded w-28"></div>
                              </div>
                              <div className="w-24 h-10 bg-muted rounded-xl shrink-0"></div>
                            </div>
                          ))}
                        </div>
                      ) : matches.filter(m => m.round_number === selectedRound).length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-muted/10">
                          <p className="text-muted-foreground text-sm font-medium">No se encontraron partidos para la combinación y fecha seleccionadas.</p>
                        </div>
                      ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
                          {matches.filter(m => m.round_number === selectedRound).map(match => {
                            const home = resolveTeam(match.home_team_id);
                            const away = resolveTeam(match.away_team_id);
                            if (!home || !away) return null;

                            const edit = editingResults[match.id] || { homeGoals: '', awayGoals: '' };
                            const statusState = savingStatus[match.id] || 'idle';

                            return (
                              <motion.div
                                key={match.id}
                                variants={itemVariants}
                                className="bg-background border border-border/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-primary/20 transition-colors"
                              >
                                {/* Local Team */}
                                <div className="flex-1 flex justify-end items-center gap-3 w-full sm:w-[28%] min-w-0">
                                  <span className="font-semibold text-sm text-right truncate max-w-[120px] sm:max-w-none" title={home.display_name ?? home.name}>
                                    {home.display_name ?? home.name}
                                  </span>
                                  <div className="w-9 h-9 bg-muted rounded-full border border-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                                    {home.logo_url 
                                      ? <img src={home.logo_url} className="w-6 h-6 object-contain" alt={home.name} />
                                      : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                                  </div>
                                </div>

                                {/* Goals Inputs */}
                                <div className="flex items-center gap-2 shrink-0">
                                  <input
                                    type="text"
                                    placeholder="–"
                                    value={edit.homeGoals}
                                    onChange={(e) => handleGoalChange(match.id, 'home', e.target.value)}
                                    className="w-12 h-11 text-center bg-muted/30 border border-border/60 rounded-xl text-xl font-bold focus:ring-2 focus:ring-primary/40 outline-none"
                                  />
                                  <span className="text-muted-foreground font-bold text-lg">–</span>
                                  <input
                                    type="text"
                                    placeholder="–"
                                    value={edit.awayGoals}
                                    onChange={(e) => handleGoalChange(match.id, 'away', e.target.value)}
                                    className="w-12 h-11 text-center bg-muted/30 border border-border/60 rounded-xl text-xl font-bold focus:ring-2 focus:ring-primary/40 outline-none"
                                  />
                                </div>

                                {/* Horario de Partido */}
                                <div className="flex flex-col items-center gap-1 shrink-0 px-2 w-[80px]">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Horario</span>
                                  <input
                                    type="time"
                                    value={editingTimes[match.id] || ''}
                                    onChange={(e) => handleTimeChange(match.id, e.target.value)}
                                    className="px-2 py-1.5 text-xs border border-border/60 rounded-xl bg-muted/20 focus:ring-2 focus:ring-primary/40 outline-none text-center font-bold w-full"
                                  />
                                </div>

                                {/* Visitor Team */}
                                <div className="flex-1 flex justify-start items-center gap-3 w-full sm:w-[28%] min-w-0">
                                  <div className="w-9 h-9 bg-muted rounded-full border border-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                                    {away.logo_url 
                                      ? <img src={away.logo_url} className="w-6 h-6 object-contain" alt={away.name} />
                                      : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                                  </div>
                                  <span className="font-semibold text-sm truncate max-w-[120px] sm:max-w-none" title={away.display_name ?? away.name}>
                                    {away.display_name ?? away.name}
                                  </span>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center w-full sm:w-[12%] justify-center sm:justify-start shrink-0">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-full text-xs font-bold w-full text-center sm:text-left",
                                    match.status === 'finished' 
                                      ? "bg-green-500/10 text-green-600 border border-green-500/20"
                                      : "bg-slate-500/10 text-slate-600 border border-slate-500/20"
                                  )}>
                                    {match.status === 'finished' ? 'Finalizado' : 'Programado'}
                                  </span>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-2 w-full sm:w-[15%] shrink-0 mt-2 sm:mt-0 justify-end">
                                  <button
                                    onClick={() => handleSendPushNotification(match.id)}
                                    disabled={statusState === 'saving' || match.status !== 'finished'}
                                    className={cn(
                                      "p-2.5 rounded-xl text-sm font-semibold transition-all border flex items-center justify-center shrink-0",
                                      match.status === 'finished' 
                                        ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20"
                                        : "bg-muted text-muted-foreground border-border/50 cursor-not-allowed"
                                    )}
                                    title={match.status === 'finished' ? "Notificar a los suscriptores" : "Sólo finalizados"}
                                  >
                                    <BellRing className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleSaveSingleMatch(match.id)}
                                    disabled={statusState === 'saving'}
                                    className={cn(
                                      "px-4 py-2 rounded-xl text-sm font-semibold transition-all border flex-1 sm:flex-none flex items-center justify-center gap-1.5 min-w-[85px]",
                                      statusState === 'saved' 
                                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                                        : statusState === 'error'
                                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                                        : "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                                    )}
                                  >
                                    {statusState === 'saving' && (
                                      <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                        className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full inline-block shrink-0"
                                      />
                                    )}
                                    <span className="truncate">
                                      {statusState === 'saved' ? 'Guardado' : statusState === 'saving' ? 'Guardando' : 'Guardar'}
                                    </span>
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── USERS TAB ── */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        {isSuperAdmin 
                          ? 'Administrá los accesos de administradores y editores a la plataforma.'
                          : 'Lista de usuarios con acceso a la plataforma.'}
                      </p>
                    </div>
                    {isSuperAdmin && (
                      <button 
                        onClick={() => {
                          setIsCreateUserOpen(true);
                          setUserError('');
                        }}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
                      >
                        <UserPlus className="w-4 h-4" /> Nuevo Usuario
                      </button>
                    )}
                  </div>

                  {usersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="border border-border/50 rounded-3xl overflow-hidden bg-background">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              <th className="p-4">Usuario</th>
                              <th className="p-4">Rol</th>
                              <th className="p-4">Estado</th>
                              {isSuperAdmin && <th className="p-4 text-right">Acciones</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40 text-sm font-medium">
                            {users.map(u => (
                              <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase border border-primary/20">
                                      {u.username.slice(0, 2)}
                                    </div>
                                    <span>{u.username}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-full text-xs font-bold",
                                    u.role === 'super_admin' 
                                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" 
                                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                  )}>
                                    {u.role === 'super_admin' ? 'Super Admin' : 'Editor'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit",
                                    u.is_active 
                                      ? "bg-green-500/10 text-green-600 border border-green-500/20" 
                                      : "bg-red-500/10 text-red-600 border border-red-500/20"
                                  )}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full", u.is_active ? "bg-green-500" : "bg-red-500")} />
                                    {u.is_active ? 'Activo' : 'Inactivo'}
                                  </span>
                                </td>
                                {isSuperAdmin && (
                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => {
                                          setChangePasswordUserId(u.id);
                                          setChangePasswordUsername(u.username);
                                          setNewPasswordVal('');
                                          setChangePwdError('');
                                          setIsChangePwdOpen(true);
                                        }}
                                        className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all"
                                        title="Cambiar contraseña"
                                      >
                                        <Key className="w-4 h-4" />
                                      </button>
                                      
                                      {/* Prevent self-deactivation */}
                                      {u.username !== user.username && (
                                        <button
                                          onClick={() => handleToggleUserActive(u.id, u.is_active)}
                                          className={cn(
                                            "p-2 rounded-xl transition-all",
                                            u.is_active 
                                              ? "hover:bg-red-500/10 text-red-500/60 hover:text-red-500" 
                                              : "hover:bg-green-500/10 text-green-500/60 hover:text-green-500"
                                          )}
                                          title={u.is_active ? "Desactivar usuario" : "Activar usuario"}
                                        >
                                          {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'messages' && (
                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        Mensajes Recibidos
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">Acá podés leer los mensajes que mandan a través del formulario de contacto.</p>
                    </div>
                  </div>

                  <div className="p-6">
                    {loadingMessages ? (
                      <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                        <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="font-semibold text-lg">No hay mensajes por el momento.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {messages.map(msg => (
                          <div 
                            key={msg.id} 
                            className={cn(
                              "border rounded-xl p-5 transition-all",
                              msg.is_read ? "bg-muted/10 border-border/40" : "bg-card border-primary/30 shadow-sm"
                            )}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                              <div>
                                <h3 className={cn("text-lg", msg.is_read ? "font-medium" : "font-bold")}>
                                  {msg.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-0.5">De: <span className="font-medium text-foreground">{msg.email}</span></p>
                              </div>
                              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md font-medium">
                                  {new Date(msg.created_at).toLocaleString('es-AR')}
                                </span>
                                <div className="flex items-center gap-2">
                                  {!msg.is_read && (
                                    <button
                                      onClick={() => handleMarkAsRead(msg.id)}
                                      className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity active:scale-95"
                                    >
                                      Marcar como leído
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    title="Eliminar mensaje"
                                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 border border-red-500/20 transition-all active:scale-95"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap text-sm text-foreground/90 border border-border/50">
                              {msg.body}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── CHAMPIONS TAB ── */}
              {activeTab === 'champions' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
                    <div>
                      <h2 className="text-2xl font-bold">Historial de Campeones</h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        Asigna de forma explícita el campeón de cada división por torneo y zona.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <select
                        value={selectedChampYear}
                        onChange={(e) => setSelectedChampYear(Number(e.target.value))}
                        className="bg-background border border-border/60 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold"
                      >
                        {Array.from(
                          { length: Math.max(1, new Date().getFullYear() - 2026 + 1) },
                          (_, i) => new Date().getFullYear() - i
                        ).map(yr => (
                          <option key={yr} value={yr}>Año {yr}</option>
                        ))}
                      </select>
                      <select
                        value={selectedChampTournament}
                        onChange={(e) => setSelectedChampTournament(e.target.value)}
                        className="bg-background border border-border/60 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold"
                      >
                        {selectedChampYear === 2026 ? (
                          <>
                            <option value="Clausura">Clausura</option>
                            <option value="Chamaco Adaro">Chamaco Adaro</option>
                          </>
                        ) : (
                          <>
                            <option value="Apertura">Apertura</option>
                            <option value="Clausura">Clausura</option>
                          </>
                        )}
                      </select>
                      
                      <button
                        onClick={handleSaveChampions}
                        disabled={savingChampions}
                        className="px-5 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl text-sm transition-colors shadow-md disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                      >
                        {savingChampions ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-muted/40 border-b border-border/50 text-xs font-black uppercase text-muted-foreground tracking-wider">
                            <th className="p-4 pl-6">División</th>
                            <th className="p-4">🏆 Campeón Zona Campeonato</th>
                            <th className="p-4 pr-6">🥈 Ganador Zona Promoción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {divisions.map((div) => {
                            const currentCamp = adminChampions[div.id]?.campeonato || '';
                            const currentProm = adminChampions[div.id]?.promocion || '';

                            return (
                              <tr key={div.id} className="hover:bg-muted/10 transition-colors">
                                <td className="p-4 pl-6 font-bold text-sm text-foreground">
                                  {div.name}
                                </td>
                                
                                {/* Zona Campeonato */}
                                <td className="p-4">
                                  <select
                                    value={currentCamp}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setAdminChampions(prev => ({
                                        ...prev,
                                        [div.id]: {
                                          ...(prev[div.id] || { campeonato: '', promocion: '' }),
                                          campeonato: val
                                        }
                                      }));
                                    }}
                                    className="bg-background border border-border/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 text-sm w-full max-w-xs font-semibold"
                                  >
                                    <option value="">-- Sin definir --</option>
                                    {[...teams].sort((a, b) => a.name.localeCompare(b.name)).map(team => (
                                      <option key={team.id} value={team.id}>
                                        {team.display_name ?? team.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>

                                {/* Zona Promoción */}
                                <td className="p-4 pr-6">
                                  <select
                                    value={currentProm}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setAdminChampions(prev => ({
                                        ...prev,
                                        [div.id]: {
                                          ...(prev[div.id] || { campeonato: '', promocion: '' }),
                                          promocion: val
                                        }
                                      }));
                                    }}
                                    className="bg-background border border-border/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 text-sm w-full max-w-xs font-semibold"
                                  >
                                    <option value="">-- Sin definir --</option>
                                    {[...teams].sort((a, b) => a.name.localeCompare(b.name)).map(team => (
                                      <option key={team.id} value={team.id}>
                                        {team.display_name ?? team.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SOCIAL PLATES GENERATOR TAB ── */}
              {activeTab === 'social_generator' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Suspense fallback={
                    <div className="flex items-center justify-center p-12">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  }>
                    <SocialMediaGenerator />
                  </Suspense>
                </div>
              )}

              {/* ── NEWS / AVISOS TAB ── */}
              {activeTab === 'news' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Newspaper className="w-6 h-6 text-primary" />
                      Noticias y Avisos Oficiales
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Publicá notas breves para informar a los visitantes. Cada nueva publicación activa el contador rojo sin leer estilo iPhone en el menú de cada usuario hasta que ingrese a Noticias.
                    </p>
                  </div>

                  {/* Formulario para publicar o editar noticia */}
                  <form onSubmit={handleCreateNewsPost} className="bg-background border border-border/60 rounded-3xl p-6 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-base flex items-center gap-2">
                        {editingNewsId ? (
                          <>
                            <Edit2 className="w-4 h-4 text-primary" /> Editando Nota / Comunicado
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 text-primary" /> Publicar Nueva Nota / Comunicado
                          </>
                        )}
                      </h3>

                      {editingNewsId && (
                        <button
                          type="button"
                          onClick={handleCancelEditNewsPost}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground text-xs font-bold cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancelar edición
                        </button>
                      )}
                    </div>

                    {newsFormError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold">
                        {newsFormError}
                      </div>
                    )}

                    {newsFormSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>{newsFormSuccess}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold ml-1">Título de la Nota *</label>
                        <input
                          type="text"
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                          placeholder="Ej: ¡Cuadros de Playoffs Confirmados!"
                          maxLength={140}
                          className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm font-semibold"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold ml-1">Categoría / Etiqueta</label>
                        <select
                          value={newPostCategory}
                          onChange={(e) => setNewPostCategory(e.target.value as NewsCategory)}
                          className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm font-semibold"
                        >
                          {(Object.keys(NEWS_CATEGORY_META) as NewsCategory[]).map(cat => (
                            <option key={cat} value={cat}>
                              {NEWS_CATEGORY_META[cat].emoji} {NEWS_CATEGORY_META[cat].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-xs font-semibold ml-1">Contenido de la Nota *</label>
                        <span className="text-[11px] text-muted-foreground">
                          Seleccioná texto y usá la barra para aplicar negrita, cursiva, tamaño o listas
                        </span>
                      </div>

                      {/* Barra de Herramientas de Formato (Negrita, Cursiva, Subrayado, Tamaños de letra, Lista, Resaltado) */}
                      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-muted/40 border border-border/60">
                        <button
                          type="button"
                          onClick={() => applyNewsFormat('bold')}
                          className="px-2.5 py-1.5 rounded-lg bg-background hover:bg-muted border border-border/60 text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
                          title="Negrita"
                        >
                          <Bold className="w-3.5 h-3.5" />
                          <span>Negrita</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => applyNewsFormat('italic')}
                          className="px-2.5 py-1.5 rounded-lg bg-background hover:bg-muted border border-border/60 text-xs italic font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Cursiva"
                        >
                          <Italic className="w-3.5 h-3.5" />
                          <span>Cursiva</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => applyNewsFormat('underline')}
                          className="px-2.5 py-1.5 rounded-lg bg-background hover:bg-muted border border-border/60 text-xs underline font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Subrayado"
                        >
                          <Underline className="w-3.5 h-3.5" />
                          <span>Subrayado</span>
                        </button>

                        <div className="h-5 w-px bg-border/70 mx-1" />

                        <button
                          type="button"
                          onClick={() => applyNewsFormat('size_lg')}
                          className="px-2.5 py-1.5 rounded-lg bg-background hover:bg-muted border border-border/60 text-xs font-black text-primary flex items-center gap-1 cursor-pointer transition-colors"
                          title="Letra Grande (Título de sección)"
                        >
                          <span>A+ Grande</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => applyNewsFormat('size_md')}
                          className="px-2.5 py-1.5 rounded-lg bg-background hover:bg-muted border border-border/60 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Letra Mediana (Subtítulo)"
                        >
                          <span>A Mediana</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => applyNewsFormat('size_sm')}
                          className="px-2.5 py-1.5 rounded-lg bg-background hover:bg-muted border border-border/60 text-[11px] font-medium text-muted-foreground flex items-center gap-1 cursor-pointer transition-colors"
                          title="Letra Chica (Nota al pie)"
                        >
                          <span>A- Chica</span>
                        </button>

                        <div className="h-5 w-px bg-border/70 mx-1" />

                        <button
                          type="button"
                          onClick={() => applyNewsFormat('list')}
                          className="px-2.5 py-1.5 rounded-lg bg-background hover:bg-muted border border-border/60 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Lista con viñetas"
                        >
                          <List className="w-3.5 h-3.5" />
                          <span>Lista</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => applyNewsFormat('highlight')}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Resaltar con color"
                        >
                          <Highlighter className="w-3.5 h-3.5" />
                          <span>Resaltar</span>
                        </button>
                      </div>

                      <textarea
                        ref={newsBodyTextareaRef}
                        value={newPostBody}
                        onChange={(e) => setNewPostBody(e.target.value)}
                        placeholder="Escribí aquí el comunicado para los usuarios de la página..."
                        rows={6}
                        maxLength={3000}
                        className="w-full px-4 py-3 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm resize-y"
                        required
                      />

                      {/* Vista previa en vivo del formato */}
                      {newPostBody.trim() && (
                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                            Vista Previa de la Nota
                          </span>
                          {newPostTitle.trim() && (
                            <h4 className="font-display font-black text-base text-foreground">
                              {newPostTitle}
                            </h4>
                          )}
                          <FormattedNewsText text={newPostBody} />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                        <input
                          type="checkbox"
                          checked={newPostPinned}
                          onChange={(e) => setNewPostPinned(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary"
                        />
                        <Pin className="w-3.5 h-3.5 text-primary" />
                        <span>Fijar arriba como nota destacada</span>
                      </label>

                      <div className="flex items-center gap-2">
                        {editingNewsId && (
                          <button
                            type="button"
                            onClick={handleCancelEditNewsPost}
                            className="px-4 py-2.5 bg-muted text-muted-foreground hover:text-foreground font-bold rounded-xl text-xs cursor-pointer"
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={savingNews}
                          className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                          {savingNews
                            ? 'Guardando...'
                            : editingNewsId
                            ? 'Guardar Cambios'
                            : 'Publicar Noticia'}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Lista de noticias publicadas */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-base">Notas Publicadas ({newsPosts.length})</h3>

                    {loadingNews ? (
                      <div className="p-8 text-center text-muted-foreground text-sm animate-pulse">
                        Cargando noticias...
                      </div>
                    ) : newsPosts.length === 0 ? (
                      <div className="p-10 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-sm">
                        No hay noticias publicadas actualmente.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {newsPosts.map(post => {
                          const cat = NEWS_CATEGORY_META[post.category] || NEWS_CATEGORY_META.general;
                          return (
                            <div
                              key={post.id}
                              className={cn(
                                "p-5 rounded-2xl border bg-background flex flex-col sm:flex-row sm:items-start justify-between gap-4",
                                post.is_pinned ? "border-primary/40" : "border-border/60"
                              )}
                            >
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold border", cat.badgeClass)}>
                                    {cat.emoji} {cat.label}
                                  </span>
                                  {post.is_pinned && (
                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center gap-1">
                                      <Pin className="w-3 h-3" /> Destacada
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(post.created_at).toLocaleDateString('es-AR')}
                                  </span>
                                </div>
                                <h4 className="font-bold text-base text-foreground">{post.title}</h4>
                                <FormattedNewsText text={post.body} />
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditNewsPost(post)}
                                  className="p-2 rounded-xl border border-border/60 bg-muted/40 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
                                  title="Editar noticia"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleTogglePinNewsPost(post.id)}
                                  className={cn(
                                    "p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer",
                                    post.is_pinned
                                      ? "bg-primary/15 text-primary border-primary/30"
                                      : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/50"
                                  )}
                                  title={post.is_pinned ? "Quitar destacado" : "Destacar arriba"}
                                >
                                  <Pin className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteNewsPost(post.id)}
                                  className="p-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
                                  title="Eliminar noticia"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── SETTINGS TAB ── */}
              {activeTab === 'settings' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Suspense fallback={
                    <div className="flex items-center justify-center p-12">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  }>
                    <SponsorsSettings />
                  </Suspense>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {/* Modal: Nuevo Equipo */}
        {isCreateTeamOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateTeamOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-card border border-border rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4"
            >
              <h3 className="text-xl font-bold tracking-tight">Nuevo Equipo</h3>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                {teamError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium">
                    {teamError}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold ml-1">Nombre Completo *</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="ej: Club Atlético Aldosivi"
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold ml-1">Nombre Corto (Opcional)</label>
                  <input
                    type="text"
                    value={newTeamDisplayName}
                    onChange={(e) => setNewTeamDisplayName(e.target.value)}
                    placeholder="ej: Aldosivi"
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold ml-1">URL del Logo (Opcional)</label>
                  <input
                    type="text"
                    value={newTeamLogoUrl}
                    onChange={(e) => setNewTeamLogoUrl(e.target.value)}
                    placeholder="ej: https://.../logo.png"
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateTeamOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-muted transition-colors border border-border"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={teamLoading}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    {teamLoading ? 'Creando...' : 'Crear Equipo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal: Nuevo Torneo */}
        {isCreateTournamentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateTournamentOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-card border border-border rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4"
            >
              <h3 className="text-xl font-bold tracking-tight">Nuevo Torneo</h3>
              <form onSubmit={handleCreateTournament} className="space-y-4">
                {tournError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium">
                    {tournError}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold ml-1">Nombre del Torneo *</label>
                  <input
                    type="text"
                    value={newTournName}
                    onChange={(e) => setNewTournName(e.target.value)}
                    placeholder="ej: Torneo Apertura"
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold ml-1">Año *</label>
                  <input
                    type="number"
                    value={newTournYear}
                    onChange={(e) => setNewTournYear(parseInt(e.target.value) || new Date().getFullYear())}
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm font-semibold"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateTournamentOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-muted transition-colors border border-border"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={tournLoading}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    {tournLoading ? 'Creando...' : 'Crear Torneo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal: Nuevo Usuario */}
        {isCreateUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateUserOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-card border border-border rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4"
            >
              <h3 className="text-xl font-bold tracking-tight">Nuevo Usuario</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                {userError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium">
                    {userError}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold ml-1">Nombre de Usuario *</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="ej: juan.perez"
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold ml-1 flex items-center justify-between">
                    <span>Contraseña *</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Mín. 6 chars (A, a, 1, spec)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewUserPwd ? 'text' : 'password'}
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-11 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewUserPwd(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showNewUserPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold ml-1">Rol *</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                    required
                  >
                    <option value="editor">Editor</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateUserOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-muted transition-colors border border-border"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={userLoading}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    {userLoading ? 'Creando...' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal: Cambiar Contraseña */}
        {isChangePwdOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChangePwdOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-card border border-border rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4"
            >
              <h3 className="text-xl font-bold tracking-tight">Cambiar Contraseña</h3>
              <p className="text-sm text-muted-foreground mt-1">Usuario: <span className="text-foreground font-bold">{changePasswordUsername}</span></p>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                {changePwdError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium">
                    {changePwdError}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold ml-1 flex items-center justify-between">
                    <span>Nueva Contraseña *</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Mín. 6 chars (A, a, 1, spec)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showChangePwd ? 'text' : 'password'}
                      value={newPasswordVal}
                      onChange={(e) => setNewPasswordVal(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-11 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowChangePwd(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showChangePwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsChangePwdOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-muted transition-colors border border-border"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={changePwdLoading}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    {changePwdLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Importación de Resultados desde PDF */}
      {isPdfImporterOpen && (
        <Suspense fallback={null}>
          <PdfImporterModal
            isOpen={isPdfImporterOpen}
            onClose={() => setIsPdfImporterOpen(false)}
            tournaments={tournaments}
            selectedTournamentId={selectedTournamentId || (tournaments[0]?.id ?? '')}
            onSuccess={() => {
              // Recargar partidos al guardar
              if (selectedTournamentId && selectedDivisionId) {
                fetchTournamentDivisionMatches(selectedTournamentId, selectedDivisionId).then(setAllMatches);
              }
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

