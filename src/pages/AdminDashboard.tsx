import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Shield, Trophy, Calendar, Settings, Image as ImageIcon, Trash2, Edit2, Plus, AlertTriangle } from 'lucide-react';
import { cn } from '../App';
import { MOCK_TEAMS_CAMPEONATO, MOCK_TEAMS_PROMOCION, MOCK_TOURNAMENTS } from '../lib/mockData';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string, role: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'tournaments' | 'fixture'>('teams');

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (!auth) {
      navigate('/admin');
    } else {
      setUser(JSON.parse(auth));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/admin');
  };

  const isSuperAdmin = user?.role === 'super_admin';

  if (!user) return null;

  const allTeams = [...MOCK_TEAMS_CAMPEONATO, ...MOCK_TEAMS_PROMOCION];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <div className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Admin Panel</h1>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          <button
            onClick={() => setActiveTab('teams')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
              activeTab === 'teams' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Shield className="w-5 h-5" />
            Gestión de Equipos
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
              activeTab === 'tournaments' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Trophy className="w-5 h-5" />
            Torneos y Años
          </button>
          <button
            onClick={() => setActiveTab('fixture')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
              activeTab === 'fixture' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Calendar className="w-5 h-5" />
            Fixture y Resultados
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-xl"
          >
            {activeTab === 'teams' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Equipos</h2>
                    <p className="text-muted-foreground">Administra los equipos de la liga. ({allTeams.length} total)</p>
                  </div>
                  {isSuperAdmin && (
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:opacity-90">
                      <Plus className="w-4 h-4" /> Nuevo Equipo
                    </button>
                  )}
                </div>

                {!isSuperAdmin && (
                  <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-600/90 font-medium">No tienes permisos para crear o eliminar equipos. Contacta al Super Admin.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allTeams.map(team => (
                    <div key={team.id} className="bg-background border border-border/50 rounded-2xl p-4 flex items-center gap-4 group hover:border-primary/50 transition-colors">
                      <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center shrink-0 border border-border/50 overflow-hidden">
                        {team.logo_url ? <img src={team.logo_url} className="w-8 h-8 object-contain" /> : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-bold truncate text-sm">{team.name}</p>
                      </div>
                      {isSuperAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></button>
                          <button className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/70 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tournaments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Torneos y Temporadas</h2>
                    <p className="text-muted-foreground">Configura los campeonatos por año.</p>
                  </div>
                  {isSuperAdmin && (
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:opacity-90">
                      <Plus className="w-4 h-4" /> Nuevo Torneo
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {MOCK_TOURNAMENTS.map(t => (
                    <div key={t.id} className="bg-background border border-border/50 rounded-2xl p-6 flex items-center justify-between group">
                      <div>
                        <h3 className="text-xl font-bold">{t.name}</h3>
                        <p className="text-muted-foreground">Temporada {t.year}</p>
                      </div>
                      {isSuperAdmin && (
                        <div className="flex items-center gap-2">
                          <button className="p-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'fixture' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Carga de Resultados</h2>
                  <p className="text-muted-foreground">Actualiza los resultados de los partidos y quita puntos si es necesario.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                   <select className="bg-background border border-border/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                     <option>Apertura 2026</option>
                     <option>Clausura 2026</option>
                   </select>
                   <select className="bg-background border border-border/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                     <option>Fecha 1</option>
                     <option>Fecha 2</option>
                     <option>Fecha 3</option>
                   </select>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex items-start gap-3 mb-6">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-600/90 font-medium">Esta es una vista previa de la funcionalidad. En producción, aquí los editores cargarán los goles y el tribunal de disciplina aplicará descuentos de puntos.</p>
                </div>

                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-background border border-border/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-6">
                      <div className="flex-1 flex justify-end items-center gap-3">
                        <span className="font-semibold text-sm">Equipo Local {i}</span>
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="-" className="w-12 h-12 text-center bg-muted/30 border border-border/50 rounded-xl text-xl font-bold focus:ring-2 focus:ring-primary/50 outline-none" />
                        <span className="text-muted-foreground font-bold">-</span>
                        <input type="number" placeholder="-" className="w-12 h-12 text-center bg-muted/30 border border-border/50 rounded-xl text-xl font-bold focus:ring-2 focus:ring-primary/50 outline-none" />
                      </div>
                      <div className="flex-1 flex justify-start items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                        <span className="font-semibold text-sm">Equipo Visitante {i}</span>
                      </div>
                      <div className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-semibold transition-colors">
                          Guardar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
