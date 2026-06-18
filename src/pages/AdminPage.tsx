import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Save, CheckCircle2 } from 'lucide-react';
import { cn } from '../App';
import { authenticateUser, fetchTournaments, fetchDivisions, fetchZones, fetchTeams, fetchMatches, saveMatchResult } from '../lib/db';
import { loadAuth, clearAuth } from '../lib/auth';
import type { AuthUser } from '../lib/auth';
import type { Team, Match, Tournament, Division, Zone } from '../lib/types';

export function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<AuthUser | null>(null);

  // Datos base
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  // Filtros de estado
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [saved, setSaved] = useState(false);

  // Estado local para los goles que se están editando antes de guardar
  const [matchEdits, setMatchEdits] = useState<Record<string, { home: string; away: string }>>({});

  // Cargar sesión guardada
  useEffect(() => {
    const auth = loadAuth();
    if (auth) {
      setSession(auth);
    }
  }, []);

  // Cargar datos base una vez autenticado
  useEffect(() => {
    if (!session) return;
    async function loadBase() {
      const [tourns, divs, zns, tms] = await Promise.all([
        fetchTournaments(),
        fetchDivisions(),
        fetchZones(),
        fetchTeams()
      ]);
      setTournaments(tourns);
      setDivisions(divs);
      setZones(zns);
      setTeams(tms);

      if (tourns.length > 0) setSelectedTournament(tourns[0].id);
      if (divs.length > 0) setSelectedDivision(divs[0].id);
      if (zns.length > 0) setSelectedZone(zns[0].id);
    }
    loadBase();
  }, [session]);

  // Cargar partidos al cambiar los filtros
  useEffect(() => {
    if (!selectedTournament || !selectedDivision || !selectedZone) return;
    async function loadMatches() {
      setLoading(true);
      const data = await fetchMatches(selectedDivision, selectedZone, selectedTournament);
      setMatches(data);
      setMatchEdits({}); // Resetear ediciones locales
      
      const roundsList = Array.from(new Set(data.map(m => m.round_number))).sort((a, b) => a - b);
      if (roundsList.length > 0 && !roundsList.includes(selectedRound)) {
         setSelectedRound(roundsList[0]);
      } else if (roundsList.length === 0) {
         setSelectedRound(1);
      }
      setLoading(false);
    }
    loadMatches();
  }, [selectedTournament, selectedDivision, selectedZone]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const user = await authenticateUser(username, password);
    if (user) {
      setSession(user);
    } else {
      alert("Credenciales incorrectas o usuario inactivo.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    clearAuth();
    setSession(null);
  };

  const handleGoalChange = (matchId: string, teamType: 'home' | 'away', value: string) => {
    setMatchEdits(prev => {
      const current = prev[matchId] || {
        home: matches.find(m => m.id === matchId)?.home_goals?.toString() ?? '',
        away: matches.find(m => m.id === matchId)?.away_goals?.toString() ?? ''
      };
      return {
        ...prev,
        [matchId]: { ...current, [teamType]: value }
      };
    });
  };

  const handleSaveResults = async () => {
    setLoading(true);
    let allSuccess = true;
    for (const [matchId, goals] of Object.entries(matchEdits)) {
      const hG = goals.home === '' ? null : parseInt(goals.home, 10);
      const aG = goals.away === '' ? null : parseInt(goals.away, 10);
      const status = (hG !== null && aG !== null) ? 'finished' : 'scheduled';
      
      const success = await saveMatchResult(matchId, hG, aG, status);
      if (!success) allSuccess = false;
    }
    
    if (allSuccess) {
       setSaved(true);
       setTimeout(() => setSaved(false), 3000);
       // Recargar partidos
       const data = await fetchMatches(selectedDivision, selectedZone, selectedTournament);
       setMatches(data);
       setMatchEdits({});
    } else {
       alert("Hubo un error al guardar algunos resultados.");
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="max-w-md mx-auto pt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card p-8 rounded-2xl border border-border shadow-sm"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Panel de Control</h1>
            <p className="text-muted-foreground text-sm">Ingresa con tus credenciales de administrador para cargar resultados.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const roundsList = Array.from(new Set(matches.map(m => m.round_number))).sort((a, b) => a - b);
  const matchesByRound = matches.filter(m => m.round_number === selectedRound);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold">Carga de Resultados</h1>
          <p className="text-sm text-muted-foreground">Bienvenido, {session.username} ({session.role})</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Filtros */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card p-4 rounded-xl border border-border">
            <h2 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Filtros</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Torneo</label>
                <select 
                  value={selectedTournament}
                  onChange={(e) => setSelectedTournament(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                >
                  {tournaments.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.year})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">División</label>
                <select 
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                >
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Zona</label>
                <select 
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fecha</label>
                <select 
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                >
                  {roundsList.length > 0 ? (
                    roundsList.map(n => (
                      <option key={n} value={n}>Fecha {n}</option>
                    ))
                  ) : (
                    <option value={1}>Fecha 1</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Editor de Partidos */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <h3 className="font-medium">
                Partidos - Fecha {selectedRound}
              </h3>
              <button 
                onClick={handleSaveResults}
                disabled={loading || Object.keys(matchEdits).length === 0}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  saved 
                    ? "bg-green-500/10 text-green-600 border border-green-500/20" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                  (loading || Object.keys(matchEdits).length === 0) && !saved ? "opacity-50 cursor-not-allowed" : ""
                )}
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Guardado' : 'Guardar Cambios'}
              </button>
            </div>

            <div className="p-4 space-y-4">
              {matchesByRound.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay partidos cargados para esta fecha.
                </div>
              )}
              {matchesByRound.map(match => {
                const home = teams.find(t => t.id === match.home_team_id);
                const away = teams.find(t => t.id === match.away_team_id);
                if (!home || !away) return null;

                const currentEdits = matchEdits[match.id];
                const homeVal = currentEdits ? currentEdits.home : (match.home_goals ?? '');
                const awayVal = currentEdits ? currentEdits.away : (match.away_goals ?? '');

                return (
                  <div key={match.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-background border border-border rounded-xl">
                    <div className="flex items-center gap-3 w-full sm:w-[40%] justify-end">
                      <span className="font-medium text-sm text-right">{home.display_name ?? home.name}</span>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {home.logo_url ? <img src={home.logo_url} className="w-full h-full object-contain p-1" /> : <Shield className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input 
                        type="number" 
                        min="0"
                        value={homeVal}
                        onChange={(e) => handleGoalChange(match.id, 'home', e.target.value)}
                        className="w-12 h-10 text-center font-bold bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <span className="text-muted-foreground font-medium">-</span>
                      <input 
                        type="number" 
                        min="0"
                        value={awayVal}
                        onChange={(e) => handleGoalChange(match.id, 'away', e.target.value)}
                        className="w-12 h-10 text-center font-bold bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-[40%] justify-start">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {away.logo_url ? <img src={away.logo_url} className="w-full h-full object-contain p-1" /> : <Shield className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <span className="font-medium text-sm text-left">{away.display_name ?? away.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

