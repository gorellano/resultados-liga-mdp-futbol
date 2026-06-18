import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LogOut, Shield, Trophy, Calendar, Settings,
  Image as ImageIcon, Trash2, Edit2, Plus, AlertTriangle,
  Users, BarChart3, ClipboardList,
} from 'lucide-react';
import { cn } from '../App';
import { loadAuth, clearAuth } from '../lib/auth';
import { 
  fetchTournaments, 
  fetchDivisions, 
  fetchZones, 
  fetchTeams, 
  fetchMatches, 
  saveMatchResult 
} from '../lib/db';
import type { Team, Match, Tournament, Division, Zone } from '../lib/types';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0 },
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'tournaments' | 'fixture'>('teams');

  // Estados de Base de Datos
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros seleccionados
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<number>(1);

  // Resultados editados temporalmente
  const [editingResults, setEditingResults] = useState<Record<string, { homeGoals: string; awayGoals: string }>>({});
  const [savingStatus, setSavingStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});

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
        if (divs.length > 0) setSelectedDivisionId(divs[0].id);
        if (zns.length > 0) setSelectedZoneId(zns[0].id);
      } catch (err) {
        console.error('Error loading admin dashboard base data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBaseData();
  }, []);

  // Cargar partidos según filtros activos
  useEffect(() => {
    if (!selectedTournamentId || !selectedDivisionId || !selectedZoneId) return;

    async function loadMatchesData() {
      setLoading(true);
      try {
        const data = await fetchMatches(selectedDivisionId, selectedZoneId, selectedTournamentId);
        setMatches(data);

        // Inicializar los inputs de edición con los valores de goles actuales
        const initialEdits: Record<string, { homeGoals: string; awayGoals: string }> = {};
        data.forEach(m => {
          initialEdits[m.id] = {
            homeGoals: m.home_goals !== null ? m.home_goals.toString() : '',
            awayGoals: m.away_goals !== null ? m.away_goals.toString() : '',
          };
        });
        setEditingResults(initialEdits);
      } catch (err) {
        console.error('Error loading matches for admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatchesData();
  }, [selectedTournamentId, selectedDivisionId, selectedZoneId]);

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
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, home_goals: homeGoals, away_goals: awayGoals, status } : m));
    } else {
      setSavingStatus(prev => ({ ...prev, [matchId]: 'error' }));
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';

  if (!user) return null;

  const pendingMatches = matches.filter(m => m.status === 'scheduled').length;

  // User avatar initial
  const avatarInitial = user.email.charAt(0).toUpperCase();
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
    { id: 'fixture'     as const, label: 'Fixture y Resultados',  icon: Calendar },
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
              <h1 className="font-bold text-lg leading-tight">Admin Panel</h1>
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
                <p className="text-sm font-semibold leading-none">{user.email.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
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
                      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md shadow-primary/20">
                        <Plus className="w-4 h-4" /> Nuevo Equipo
                      </button>
                    )}
                  </div>

                  {!isSuperAdmin && (
                    <div className="bg-yellow-500/10 border border-yellow-500/40 p-4 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                        No tenés permisos para crear o eliminar equipos. Contactá al Super Admin.
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
                          {isSuperAdmin && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500/60 hover:text-red-500">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
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
                      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 shadow-md shadow-primary/20">
                        <Plus className="w-4 h-4" /> Nuevo Torneo
                      </button>
                    )}
                  </div>
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
                          {isSuperAdmin && (
                            <button className="p-2 bg-muted/50 hover:bg-muted rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── FIXTURE ── */}
              {activeTab === 'fixture' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">Carga de Resultados</h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        Actualizá los resultados y aplicá goles reales a los partidos.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-6">
                    {/* Torneo */}
                    <select
                      value={selectedTournamentId}
                      onChange={(e) => setSelectedTournamentId(e.target.value)}
                      className="bg-background border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                    >
                      {tournaments.map(t => (
                        <option key={t.id} value={t.id}>{t.name} {t.year}</option>
                      ))}
                    </select>

                    {/* División */}
                    <select
                      value={selectedDivisionId}
                      onChange={(e) => setSelectedDivisionId(e.target.value)}
                      className="bg-background border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                    >
                      {divisions.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>

                    {/* Zona */}
                    <select
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="bg-background border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                    >
                      {zones.map(z => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                      ))}
                    </select>

                    {/* Fecha */}
                    <select
                      value={selectedRound}
                      onChange={(e) => setSelectedRound(Number(e.target.value))}
                      className="bg-background border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                    >
                      {Array.from(new Set(matches.map(m => m.round_number))).sort((a, b) => a - b).map(r => (
                        <option key={r} value={r}>Fecha {r}</option>
                      ))}
                    </select>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full"
                      />
                    </div>
                  ) : matches.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-muted/10">
                      <p className="text-muted-foreground text-sm font-medium">No se encontraron partidos para la combinación seleccionada.</p>
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
                            <div className="flex-1 flex justify-end items-center gap-3 w-full sm:w-[40%]">
                              <span className="font-semibold text-sm text-right">{home.display_name ?? home.name}</span>
                              <div className="w-9 h-9 bg-muted rounded-full border border-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                                {home.logo_url 
                                  ? <img src={home.logo_url} className="w-6 h-6 object-contain" alt={home.name} />
                                  : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <input
                                type="number"
                                min="0"
                                max="99"
                                step="1"
                                placeholder="–"
                                value={edit.homeGoals}
                                onChange={(e) => handleGoalChange(match.id, 'home', e.target.value)}
                                className="w-12 h-11 text-center bg-muted/30 border border-border/60 rounded-xl text-xl font-bold focus:ring-2 focus:ring-primary/40 outline-none"
                              />
                              <span className="text-muted-foreground font-bold text-lg">–</span>
                              <input
                                type="number"
                                min="0"
                                max="99"
                                step="1"
                                placeholder="–"
                                value={edit.awayGoals}
                                onChange={(e) => handleGoalChange(match.id, 'away', e.target.value)}
                                className="w-12 h-11 text-center bg-muted/30 border border-border/60 rounded-xl text-xl font-bold focus:ring-2 focus:ring-primary/40 outline-none"
                              />
                            </div>

                            <div className="flex-1 flex justify-start items-center gap-3 w-full sm:w-[40%]">
                              <div className="w-9 h-9 bg-muted rounded-full border border-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                                {away.logo_url 
                                  ? <img src={away.logo_url} className="w-6 h-6 object-contain" alt={away.name} />
                                  : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                              </div>
                              <span className="font-semibold text-sm">{away.display_name ?? away.name}</span>
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
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
