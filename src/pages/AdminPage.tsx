import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Shield, Save, CheckCircle2 } from 'lucide-react';
import { cn } from '../App';
import { MOCK_TEAMS_CAMPEONATO, MOCK_MATCHES_CAMPEONATO } from '../lib/mockData';

export function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Estados para el panel de carga
  const [selectedDivision, setSelectedDivision] = useState('septima');
  const [selectedZone, setSelectedZone] = useState('campeonato');
  const [selectedRound, setSelectedRound] = useState(1);
  const [saved, setSaved] = useState(false);

  // Obtener la sesión actual al cargar (simulado para este ejemplo, pero usando supabase)
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // BYPASS TEMPORAL PARA PROBAR EL DISEÑO:
    if (email === 'admin@admin.com' && password === 'admin') {
      setTimeout(() => {
        setSession({ user: { email: 'admin@admin.com' } });
        setLoading(false);
      }, 500);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    // Si es la sesion falsa, simplemente la borramos
    if (session?.user?.email === 'admin@admin.com') {
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const handleSaveResults = () => {
    setLoading(true);
    // TODO: Aca iria el update a supabase
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
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
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

  // Filtrar partidos de la fecha seleccionada
  // TODO: Obtener dinamicamente de supabase en base a la division y zona
  const matchesByRound = MOCK_MATCHES_CAMPEONATO.filter(m => m.round_number === selectedRound);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold">Carga de Resultados</h1>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card p-4 rounded-xl border border-border">
            <h2 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Filtros</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">División</label>
                <select 
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                >
                  <option value="septima">Séptima División</option>
                  <option value="octava">Octava División</option>
                  <option value="novena">Novena División</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Zona</label>
                <select 
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                >
                  <option value="campeonato">Campeonato</option>
                  <option value="promocion">Promoción</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fecha</label>
                <select 
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>Fecha {n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Matches Editor */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <h3 className="font-medium">
                Partidos - Fecha {selectedRound}
              </h3>
              <button 
                onClick={handleSaveResults}
                disabled={loading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  saved 
                    ? "bg-green-500/10 text-green-600 border border-green-500/20" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Guardado' : 'Guardar Cambios'}
              </button>
            </div>

            <div className="p-4 space-y-4">
              {matchesByRound.map(match => {
                const home = MOCK_TEAMS_CAMPEONATO.find(t => t.id === match.home_team_id);
                const away = MOCK_TEAMS_CAMPEONATO.find(t => t.id === match.away_team_id);
                if (!home || !away) return null;

                return (
                  <div key={match.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-background border border-border rounded-xl">
                    <div className="flex items-center gap-3 w-full sm:w-[40%] justify-end">
                      <span className="font-medium text-sm text-right">{home.name}</span>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {home.logo_url ? <img src={home.logo_url} className="w-full h-full object-contain p-1" /> : <Shield className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input 
                        type="number" 
                        min="0"
                        defaultValue={match.home_goals ?? ''}
                        className="w-12 h-10 text-center font-bold bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <span className="text-muted-foreground font-medium">-</span>
                      <input 
                        type="number" 
                        min="0"
                        defaultValue={match.away_goals ?? ''}
                        className="w-12 h-10 text-center font-bold bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-[40%] justify-start">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {away.logo_url ? <img src={away.logo_url} className="w-full h-full object-contain p-1" /> : <Shield className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <span className="font-medium text-sm text-left">{away.name}</span>
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
