import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Shield, Trophy, Calendar, Settings,
  Image as ImageIcon, Trash2, Plus, AlertTriangle,
  Users, BarChart3, ClipboardList, UserPlus, Key, UserCheck, UserX, Eye, EyeOff
} from 'lucide-react';
import { cn } from '../App';
import { loadAuth, clearAuth, validatePassword } from '../lib/auth';
import { 
  fetchTournaments, 
  fetchDivisions, 
  fetchZones, 
  fetchTeams, 
  saveMatchResult,
  createTeam,
  createTournament,
  fetchUsers,
  createUser,
  updateUserPassword,
  toggleUserActive,
  createMatch,
  deleteMatch,
  fetchTournamentDivisionMatches,
  isSupabaseActive
} from '../lib/db';
import type { Team, Match, Tournament, Division, Zone, User } from '../lib/types';

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
  const [activeTab, setActiveTab] = useState<'teams' | 'tournaments' | 'fixture_config' | 'fixture' | 'users'>('teams');

  // Estados de Base de Datos
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros seleccionados
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<number>(1);

  // Resultados editados temporalmente
  const [editingResults, setEditingResults] = useState<Record<string, { homeGoals: string; awayGoals: string }>>({});
  const [savingStatus, setSavingStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});

  // Modales state
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
  const [fixtureError, setFixtureError] = useState('');
  const [fixtureLoading, setFixtureLoading] = useState(false);

  useEffect(() => {
    const auth = loadAuth();
    if (!auth) {
      navigate('/admin');
    } else {
      setUser(auth);
    }
  }, [navigate]);

  // Cargar datos base al montar
  useEffect(() => {
    async function loadBaseData() {
      setLoading(true);
      try {
        const [tourns, divs, zns, tms] = await Promise.all([
          fetchTournaments(),
          fetchDivisions(),
          fetchZones(),
          fetchTeams(),
        ]);
        setTournaments(tourns);
        setDivisions(divs);
        setZones(zns);
        setTeams(tms);

        if (tourns.length > 0) setSelectedTournamentId(tourns[0].id);
        const validDivs = divs.filter(d => !['Primera División', 'Quinta División', 'Sexta División'].includes(d.name));
        if (validDivs.length > 0) setSelectedDivisionId(validDivs[0].id);
        if (zns.length > 0) setSelectedZoneId(zns[0].id);
      } catch (err) {
        console.error('Error loading admin dashboard base data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBaseData();
  }, []);

  // Cargar partidos de la división y torneo seleccionados
  useEffect(() => {
    if (!selectedTournamentId || !selectedDivisionId) return;

    async function loadAllMatches() {
      setLoading(true);
      try {
        const data = await fetchTournamentDivisionMatches(selectedTournamentId, selectedDivisionId);
        setAllMatches(data);
      } catch (err) {
        console.error('Error loading tournament matches:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllMatches();
  }, [selectedTournamentId, selectedDivisionId]);

  // Filtrar partidos locales del tab activo
  const matches = allMatches.filter(m => m.zone_id === selectedZoneId);

  // Sincronizar inputs de goles editados cuando cambian los partidos cargados
  useEffect(() => {
    const initialEdits: Record<string, { homeGoals: string; awayGoals: string }> = {};
    matches.forEach(m => {
      initialEdits[m.id] = {
        homeGoals: m.home_goals !== null ? m.home_goals.toString() : '',
        awayGoals: m.away_goals !== null ? m.away_goals.toString() : '',
      };
    });
    setEditingResults(initialEdits);
  }, [allMatches, selectedDivisionId, selectedZoneId]);

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
  }, [activeTab]);

  const handleLogout = () => {
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

  const handleSaveSingleMatch = async (matchId: string) => {
    const edit = editingResults[matchId];
    if (!edit) return;

    setSavingStatus(prev => ({ ...prev, [matchId]: 'saving' }));
    
    const homeVal = edit.homeGoals.trim();
    const awayVal = edit.awayGoals.trim();
    
    const homeGoals = homeVal === '' ? null : parseInt(homeVal);
    const awayGoals = awayVal === '' ? null : parseInt(awayVal);
    const status = (homeGoals !== null && awayGoals !== null) ? 'finished' : 'scheduled';

    const success = await saveMatchResult(matchId, homeGoals, awayGoals, status);
    if (success) {
      setSavingStatus(prev => ({ ...prev, [matchId]: 'saved' }));
      // Actualizar la lista local de partidos para reflejar el estado
      setAllMatches(prev => prev.map(m => m.id === matchId ? { ...m, home_goals: homeGoals, away_goals: awayGoals, status } : m));
    } else {
      setSavingStatus(prev => ({ ...prev, [matchId]: 'error' }));
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
        match_date: null
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

  const navItems = [
    { id: 'teams'       as const, label: 'Gestión de Equipos',   icon: Shield   },
    { id: 'tournaments' as const, label: 'Torneos y Años',        icon: Trophy   },
    ...(isSuperAdmin ? [{ id: 'fixture_config' as const, label: 'Configurar Fixture', icon: Settings }] : []),
    { id: 'fixture'     as const, label: 'Fixture y Resultados',  icon: Calendar },
    { id: 'users'       as const, label: 'Gestión de Usuarios',   icon: Users },
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
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
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
                        {zones.map(z => (
                          <option key={z.id} value={z.id}>{z.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Formulario Agregar Partido */}
                  <form onSubmit={handleCreateMatch} className="bg-background border border-border/50 rounded-3xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" /> Agregar Nuevo Partido
                    </h3>
                    
                    {fixtureError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium">
                        {fixtureError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Fecha */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold ml-1">Número de Fecha</label>
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

                      {/* Submit */}
                      <div className="flex items-end">
                        <button
                          type="submit"
                          disabled={fixtureLoading}
                          className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center gap-1.5 shadow-md shadow-primary/10"
                        >
                          {fixtureLoading ? 'Agregando...' : 'Agregar Partido'}
                        </button>
                      </div>
                    </div>
                  </form>

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
                                    const home = teams.find(t => t.id === m.home_team_id);
                                    const away = teams.find(t => t.id === m.away_team_id);
                                    if (!home || !away) return null;
                                    return (
                                      <div key={m.id} className="bg-background border border-border/50 rounded-2xl p-4 flex items-center justify-between hover:border-primary/20 transition-all duration-200 shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <span className="font-semibold text-sm truncate">{home.display_name ?? home.name} vs {away.display_name ?? away.name}</span>
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
                        Actualizá los resultados de los partidos. Podés editar partidos finalizados si hubo pifies.
                      </p>
                    </div>
                  </div>

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
                        {zones.map(z => (
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
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full"
                      />
                    </div>
                  ) : matches.filter(m => m.round_number === selectedRound).length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-muted/10">
                      <p className="text-muted-foreground text-sm font-medium">No se encontraron partidos para la combinación y fecha seleccionadas.</p>
                    </div>
                  ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
                      {matches.filter(m => m.round_number === selectedRound).map(match => {
                        const home = teams.find(t => t.id === match.home_team_id);
                        const away = teams.find(t => t.id === match.away_team_id);
                        if (!home || !away) return null;

                        const edit = editingResults[match.id] || { homeGoals: '', awayGoals: '' };
                        const statusState = savingStatus[match.id] || 'idle';

                        return (
                          <motion.div
                            key={match.id}
                            variants={itemVariants}
                            className="bg-background border border-border/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-primary/20 transition-colors"
                          >
                            <div className="flex-1 flex justify-end items-center gap-3 w-full sm:w-[35%]">
                              <span className="font-semibold text-sm text-right">{home.display_name ?? home.name}</span>
                              <div className="w-9 h-9 bg-muted rounded-full border border-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                                {home.logo_url 
                                  ? <img src={home.logo_url} className="w-6 h-6 object-contain" alt={home.name} />
                                  : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                              </div>
                            </div>

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

                            <div className="flex-1 flex justify-start items-center gap-3 w-full sm:w-[35%]">
                              <div className="w-9 h-9 bg-muted rounded-full border border-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                                {away.logo_url 
                                  ? <img src={away.logo_url} className="w-6 h-6 object-contain" alt={away.name} />
                                  : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                              </div>
                              <span className="font-semibold text-sm">{away.display_name ?? away.name}</span>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-[15%] justify-center sm:justify-start shrink-0">
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-bold",
                                match.status === 'finished' 
                                  ? "bg-green-500/10 text-green-600 border border-green-500/20"
                                  : "bg-slate-500/10 text-slate-600 border border-slate-500/20"
                              )}>
                                {match.status === 'finished' ? 'Finalizado' : 'Programado'}
                              </span>
                            </div>

                            <button
                              onClick={() => handleSaveSingleMatch(match.id)}
                              disabled={statusState === 'saving'}
                              className={cn(
                                "px-4 py-2 rounded-xl text-sm font-semibold transition-all border shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5",
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
                                  className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full inline-block"
                                />
                              )}
                              {statusState === 'saved' ? 'Guardado' : statusState === 'saving' ? 'Guardando' : 'Guardar'}
                            </button>
                          </motion.div>
                        );
                      })}
                    </motion.div>
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
    </div>
  );
}
