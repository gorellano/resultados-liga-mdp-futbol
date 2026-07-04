import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, MapPin, Shield, Bell, BellRing } from 'lucide-react';
import { fetchTeams } from '../lib/db';
import { villasDeportivas } from '../lib/villasDeportivas';
import { subscribeToTeamAndDivisions, unsubscribeFromTeam, getSubscribedTeamsAndDivisions } from '../lib/push';
import type { Team } from '../lib/types';
import { SubscribeModal } from '../components/SubscribeModal';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TeamCardSkeleton() {
  return (
    <div className="bg-card/50 border border-border/40 rounded-3xl p-6 flex flex-col justify-between space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-1.5 py-1">
        <div className="h-3 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-9 bg-muted rounded-xl flex-1" />
        <div className="h-9 bg-muted rounded-xl flex-1" />
        <div className="h-9 bg-muted rounded-xl flex-1" />
      </div>
    </div>
  );
}

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [subscribedTeams, setSubscribedTeams] = useState<Map<string, string[] | null>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    async function loadTeams() {
      try {
        const [data, subs] = await Promise.all([
          fetchTeams(),
          getSubscribedTeamsAndDivisions()
        ]);
        setTeams(data);
        setSubscribedTeams(subs);
      } catch (err) {
        console.error('Failed to load teams:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTeams();
  }, []);

  const handleToggleSubscribe = async (team: Team) => {
    const teamId = team.id;
    try {
      const isSubscribed = subscribedTeams.has(teamId);
      if (isSubscribed) {
        setIsSubscribing(true);
        const success = await unsubscribeFromTeam(teamId);
        if (success) {
          setSubscribedTeams(prev => {
             const newMap = new Map(prev);
             newMap.delete(teamId);
             return newMap;
          });
        } else {
          alert('Error al desuscribirse. Revisa los permisos de notificaciones.');
        }
        setIsSubscribing(false);
      } else {
        // Request notification permission if not already granted
        if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') {
            alert('Debes permitir las notificaciones para poder suscribirte.');
            return;
          }
        } else if (Notification.permission === 'denied') {
          alert('Las notificaciones están bloqueadas en tu navegador.');
          return;
        }

        // Open modal
        setSelectedTeam(team);
        setSubscribeModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      setIsSubscribing(false);
    }
  };

  const handleSaveSubscriptions = async (divisionIds: string[] | null) => {
    if (!selectedTeam) return;
    
    setIsSubscribing(true);
    try {
      const success = await subscribeToTeamAndDivisions(selectedTeam.id, divisionIds);
      if (success) {
        setSubscribedTeams(prev => {
           const newMap = new Map(prev);
           newMap.set(selectedTeam.id, divisionIds);
           return newMap;
        });
        setSubscribeModalOpen(false);
      } else {
         alert('Error al suscribirse. (Puede que falten configurar las VAPID keys en el servidor).');
      }
    } catch (e) {
      console.error(e);
      alert('Error inesperado.');
    } finally {
      setIsSubscribing(false);
    }
  };

  // Sort teams alphabetically by display name (or name if display name is missing)
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      const nameA = a.display_name ?? a.name;
      const nameB = b.display_name ?? b.name;
      return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    });
  }, [teams]);

  // Filter based on search query
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return sortedTeams;
    const lowerQuery = searchQuery.toLowerCase();
    return sortedTeams.filter(t => 
      (t.display_name ?? t.name).toLowerCase().includes(lowerQuery) ||
      t.name.toLowerCase().includes(lowerQuery)
    );
  }, [sortedTeams, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-8 max-w-5xl mx-auto"
    >
      {/* Title section */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
          Directorio de Equipos
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Conocé todos los clubes participantes de la LMF. Podés ingresar a sus sitios web, redes sociales oficiales e iniciar el recorrido en mapa hacia su villa deportiva.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground/60">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Buscar club..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-card border border-border/80 rounded-2xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-sm"
        />
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, idx) => (
            <TeamCardSkeleton key={idx} />
          ))}
        </div>
      ) : filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredTeams.map((team) => {
            const villa = villasDeportivas[team.name];
            
            return (
              <motion.div
                key={team.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-border/50 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
              >
                <div>
                  {/* Card Header: logo and name */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-background border border-border/50 shadow-inner flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                      {team.logo_url ? (
                        <img src={team.logo_url} alt={team.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <Shield className="w-8 h-8 text-muted-foreground/50" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
                        {team.display_name ?? team.name}
                      </h3>
                      {team.display_name && (
                        <span className="text-xs text-muted-foreground/80 font-medium">
                          {team.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body: Stadium Details */}
                  <div className="min-h-[50px] border-t border-border/30 pt-3.5 pb-2 text-xs text-muted-foreground space-y-1">
                    {villa ? (
                      <>
                        <p className="font-bold text-foreground/80">{villa.stadiumName}</p>
                        <p className="line-clamp-2 leading-relaxed">{villa.address}</p>
                      </>
                    ) : (
                      <p className="italic text-muted-foreground/50">Detalle de villa deportiva no disponible</p>
                    )}
                  </div>
                </div>

                {/* Card Footer: Three Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-border/30 mt-2">
                  {/* Website Button */}
                  {team.website_url ? (
                    <a
                      href={team.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 flex-1"
                      title="Sitio Web Oficial"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center p-2 rounded-xl bg-muted text-muted-foreground/30 cursor-not-allowed flex-1"
                      title="Sitio web no disponible"
                    >
                      <Globe className="w-4 h-4" />
                    </button>
                  )}

                  {/* Instagram Button */}
                  {team.instagram_url ? (
                    <a
                      href={team.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all duration-300 flex-1"
                      title="Instagram Oficial"
                    >
                      <InstagramIcon className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center p-2 rounded-xl bg-muted text-muted-foreground/30 cursor-not-allowed flex-1"
                      title="Instagram no disponible"
                    >
                      <InstagramIcon className="w-4 h-4" />
                    </button>
                  )}

                  {/* Sports Village Map Button */}
                  {villa?.googleMapsUrl ? (
                    <a
                      href={villa.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all duration-300 flex-1"
                      title={`Ubicación: ${villa.stadiumName}`}
                    >
                      <MapPin className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center p-2 rounded-xl bg-muted text-muted-foreground/30 cursor-not-allowed flex-1"
                      title="Ubicación no disponible"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  )}

                  {/* Notification Subscribe Button */}
                  <button
                    onClick={() => handleToggleSubscribe(team)}
                    disabled={isSubscribing}
                    className={`flex items-center justify-center p-2 rounded-xl transition-all duration-300 flex-1 ${
                      subscribedTeams.has(team.id)
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                        : 'bg-muted text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600'
                    }`}
                    title={subscribedTeams.has(team.id) ? 'Configurar notificaciones' : 'Recibir notificaciones'}
                  >
                    {isSubscribing ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : subscribedTeams.has(team.id) ? (
                      <BellRing className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-card/35 rounded-3xl border border-border/40">
          <p className="text-muted-foreground font-semibold">
            No se encontraron equipos que coincidan con tu búsqueda.
          </p>
        </div>
      )}

      <SubscribeModal 
        isOpen={subscribeModalOpen}
        onClose={() => setSubscribeModalOpen(false)}
        team={selectedTeam}
        initialDivisions={selectedTeam ? (subscribedTeams.get(selectedTeam.id) ?? []) : []}
        onSave={handleSaveSubscriptions}
        isSaving={isSubscribing}
      />
    </motion.div>
  );
}
