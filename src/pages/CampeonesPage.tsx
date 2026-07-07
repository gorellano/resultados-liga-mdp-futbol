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
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedTournament, setSelectedTournament] = useState<string>('Apertura');
  
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);

  const availableYears = Array.from({ length: 6 }, (_, i) => currentYear - i); // [2026, 2025, 2024...]

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
        <div className="text-center py-20 text-muted-foreground animate-pulse font-medium">
          Cargando campeones del torneo...
        </div>
      ) : champions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/60 rounded-3xl bg-muted/5">
          <Trophy className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-foreground">Torneo {selectedYear} en curso</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
            Los resultados se están jugando. ¡Pronto conoceremos a los dueños de la gloria!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {divisions.map(division => {
            const campChamp = getChampion(division.id, 'campeonato');
            const promChamp = getChampion(division.id, 'promocion');

            // Si para esta división no hay campeones cargados, no mostramos la card o mostramos estado vacío
            if (!campChamp && !promChamp) return null;

            return (
              <div key={division.id} className="bg-card border border-border/50 rounded-3xl shadow-md p-5 flex flex-col justify-between hover:border-primary/20 transition-all duration-300">
                <h3 className="font-black text-lg border-b border-border/50 pb-3 mb-4 text-foreground tracking-tight">
                  {division.name}
                </h3>
                
                <div className="space-y-4">
                  {/* Zona Campeonato */}
                  {campChamp && (
                    <div className="flex items-center gap-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 rounded-2xl p-3.5 relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-amber-500/20">
                        <Star className="w-12 h-12 fill-amber-500/10" />
                      </div>
                      <div className="w-12 h-12 bg-background rounded-full border border-amber-500/20 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                        {campChamp.logo_url ? (
                          <img src={campChamp.logo_url} className="w-8 h-8 object-contain" alt={campChamp.name} />
                        ) : (
                          <Trophy className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">CAMPEÓN ZONA CAMPEONATO</span>
                        <span className="font-extrabold text-sm text-foreground truncate block mt-0.5" title={campChamp.name}>
                          {campChamp.display_name ?? campChamp.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Zona Promoción */}
                  {promChamp && (
                    <div className="flex items-center gap-4 bg-slate-500/5 dark:bg-slate-500/10 border border-slate-500/15 rounded-2xl p-3.5 relative overflow-hidden">
                      <div className="w-12 h-12 bg-background rounded-full border border-slate-500/20 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                        {promChamp.logo_url ? (
                          <img src={promChamp.logo_url} className="w-8 h-8 object-contain" alt={promChamp.name} />
                        ) : (
                          <Trophy className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">GANADOR ZONA PROMOCIÓN</span>
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
