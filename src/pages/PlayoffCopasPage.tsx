import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { fetchTeams, fetchZones, fetchDivisions, fetchAllTournamentMatches } from '../lib/db';
import { AdaroPlayoffBracket } from '../components/AdaroPlayoffBracket';
import type { Team, Match, Zone, Division } from '../lib/types';

export const PlayoffCopasPage: React.FC = () => {
  const { selectedTournament, selectedTournamentId, openSelector } = useTournament();
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedTournamentId]);

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

        <button
          onClick={openSelector}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all active:scale-95 shadow-sm"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>{selectedTournament?.name || 'Torneo Actual'}</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-background to-cyan-500/10 border border-border/70 p-6 sm:p-8 backdrop-blur-xl shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>Fase Final · 4 Copas en Juego</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
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
