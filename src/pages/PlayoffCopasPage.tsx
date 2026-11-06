import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { fetchTeams, fetchZones, fetchDivisions, fetchAllTournamentMatches } from '../lib/db';
import { AdaroPlayoffBracket } from '../components/AdaroPlayoffBracket';
import type { Team, Match, Zone, Division } from '../lib/types';

export const PlayoffCopasPage: React.FC = () => {
  const { selectedTournamentId } = useTournament();
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [tms, mtchs, zns, divs] = await Promise.all([
        fetchTeams(),
        fetchAllTournamentMatches(selectedTournamentId),
        fetchZones(),
        fetchDivisions()
      ]);
      setTeams(tms);
      setMatches(mtchs);
      setZones(zns);
      setDivisions(divs);
    } catch (err) {
      console.error('Error loading Playoff Copas data:', err);
      setError('No se pudieron cargar los datos del cuadro de playoffs. Verificá tu conexión.');
    } finally {
      setLoading(false);
    }
  }, [selectedTournamentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-card to-cyan-500/10 border border-border/70 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>Fase Final · 4 Copas en Juego</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-foreground">
            Cuadro de Playoffs y Copas
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Los 28 clubes clasificados de las 7 zonas se distribuyen en 4 copas según su posición: Copa de Platino (1º), Oro (2º), Plata (3º) y Bronce (4º).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center animate-pulse space-y-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Calculando posiciones y cuadro oficial...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 space-y-3">
          <ShieldAlert className="w-8 h-8 mx-auto" />
          <p className="text-sm font-bold">{error}</p>
          <button
            type="button"
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-xs font-extrabold transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <AdaroPlayoffBracket 
          matches={matches} 
          teams={teams} 
          zones={zones} 
          divisions={divisions} 
        />
      )}
    </div>
  );
};
