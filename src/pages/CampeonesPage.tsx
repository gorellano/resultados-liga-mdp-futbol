import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Division, Team } from '../lib/types';
import { Trophy, Star, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Champion {
  id: string;
  year: number;
  tournament: string;
  division_id: string;
  zone_name: 'campeonato' | 'promocion';
  team_id: string;
}

export function CampeonesPage() {
  const currentYear = new Date().getFullYear();
  const startYear = 2026;
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedTournament, setSelectedTournament] = useState<string>('Apertura');
  
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic years list from 2026 up to currentYear
  const availableYears = Array.from(
    { length: Math.max(1, currentYear - startYear + 1) },
    (_, i) => currentYear - i
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [divsRes, teamsRes, champsRes] = await Promise.all([
          supabase.from('divisions').select('*').order('sort_order', { ascending: true }),
          supabase.from('teams').select('*'),
          supabase.from('champions')
            .select('*')
            .eq('year', selectedYear)
            .eq('tournament', selectedTournament)
        ]);

        if (divsRes.data) setDivisions(divsRes.data);
        if (teamsRes.data) setTeams(teamsRes.data);
        if (champsRes.data) setChampions(champsRes.data);
      } catch (err) {
        console.error('Error cargando campeones:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedYear, selectedTournament]);

  // Encuentra al campeón de una zona y división específica
  const getChampion = (divisionId: string, zone: 'campeonato' | 'promocion') => {
    const champ = champions.find(c => c.division_id === divisionId && c.zone_name === zone);
    if (!champ) return null;
    return teams.find(t => t.id === champ.team_id) || null;
  };

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a Inicio
          </Link>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Trophy className="w-8 h-8 text-amber-500 fill-amber-500/10" /> Salón de la Fama
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Historial de campeones de la Liga Marplatense de Fútbol por división y zona.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-background border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold shadow-sm"
          >
            {availableYears.map(yr => (
              <option key={yr} value={yr}>Año {yr}</option>
            ))}
          </select>
          <select
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
            className="bg-background border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold shadow-sm"
          >
            <option value="Apertura">Apertura</option>
            <option value="Clausura">Clausura</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground animate-pulse font-semibold">
          Cargando campeones del torneo...
        </div>
      ) : champions.length === 0 ? (
        <div className="text-center py-16 px-6 border border-amber-500/20 rounded-3xl bg-gradient-to-b from-amber-500/5 via-card/40 to-card/20 backdrop-blur-md relative overflow-hidden max-w-xl mx-auto shadow-md">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 shadow-inner">
            <Trophy className="w-10 h-10 fill-amber-500/20 animate-soft-pulse" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-extrabold border border-amber-500/25 mb-3 uppercase tracking-wider">
            Torneo {selectedTournament} {selectedYear} en curso ⚽
          </span>
          <h3 className="font-extrabold text-xl text-foreground tracking-tight">¡La copa está en disputa!</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2 leading-relaxed font-medium">
            Los equipos están dando todo en la cancha. Al finalizar el campeonato, aquí se consagrarán los campeones de cada división.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {divisions.map(division => {
            const campChamp = getChampion(division.id, 'campeonato');
            const promChamp = getChampion(division.id, 'promocion');

            if (!campChamp && !promChamp) return null;

            return (
              <div key={division.id} className="bg-card/70 backdrop-blur-md border border-border/60 rounded-3xl shadow-lg p-5 flex flex-col justify-between hover:border-amber-500/40 hover:shadow-amber-500/5 transition-all duration-300 relative overflow-hidden group">
                {/* Top gold accent line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />

                <h3 className="font-black text-lg border-b border-border/50 pb-3 mb-4 text-foreground tracking-tight flex items-center justify-between">
                  <span>{division.name}</span>
                  <Trophy className="w-5 h-5 text-amber-500/80" />
                </h3>
                
                <div className="space-y-4">
                  {/* Zona Campeonato */}
                  {campChamp && (
                    <div className="flex items-center gap-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 rounded-2xl p-3.5 relative overflow-hidden shadow-2xs group/champ hover:border-amber-500/50 transition-colors">
                      <div className="absolute top-2 right-2 text-amber-500/15 pointer-events-none">
                        <Star className="w-12 h-12 fill-amber-500/10" />
                      </div>
                      <div className="w-12 h-12 bg-background rounded-full border-2 border-amber-500/30 overflow-hidden flex items-center justify-center shrink-0 shadow-xs group-hover/champ:scale-105 transition-transform">
                        {campChamp.logo_url ? (
                          <img src={campChamp.logo_url} className="w-8 h-8 object-contain" alt={campChamp.name} />
                        ) : (
                          <Trophy className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                      <div className="min-w-0 z-10">
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block">CAMPEÓN ZONA CAMPEONATO 🥇</span>
                        <span className="font-extrabold text-sm text-foreground truncate block mt-0.5" title={campChamp.name}>
                          {campChamp.display_name ?? campChamp.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Zona Promoción */}
                  {promChamp && (
                    <div className="flex items-center gap-4 bg-gradient-to-r from-slate-500/10 via-slate-500/5 to-transparent border border-slate-500/25 rounded-2xl p-3.5 relative overflow-hidden shadow-2xs group/prom hover:border-slate-500/50 transition-colors">
                      <div className="w-12 h-12 bg-background rounded-full border-2 border-slate-400/30 overflow-hidden flex items-center justify-center shrink-0 shadow-xs group-hover/prom:scale-105 transition-transform">
                        {promChamp.logo_url ? (
                          <img src={promChamp.logo_url} className="w-8 h-8 object-contain" alt={promChamp.name} />
                        ) : (
                          <Trophy className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 z-10">
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest block">GANADOR ZONA PROMOCIÓN 🥈</span>
                        <span className="font-extrabold text-sm text-foreground truncate block mt-0.5" title={promChamp.name}>
                          {promChamp.display_name ?? promChamp.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
