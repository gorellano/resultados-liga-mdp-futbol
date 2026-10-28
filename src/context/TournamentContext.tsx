import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Tournament } from '../lib/types';
import { fetchTournaments } from '../lib/db';
import { ADARO_TOURNAMENT, ADARO_TOURNAMENT_ID } from '../lib/mockAdaroData';

interface TournamentContextValue {
  tournaments: Tournament[];
  selectedTournament: Tournament | null;
  selectedTournamentId: string;
  isAdaro: boolean;
  setTournament: (tournament: Tournament) => void;
  setTournamentById: (id: string) => void;
  isSelectorOpen: boolean;
  openSelector: () => void;
  closeSelector: () => void;
  isLoading: boolean;
}

const TournamentContext = createContext<TournamentContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'selected_tournament_id';

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([ADARO_TOURNAMENT]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(ADARO_TOURNAMENT);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTournaments() {
      try {
        const tourns = await fetchTournaments();
        if (!isMounted) return;

        // Excluir torneos no correspondientes a inferiores (ej: Joaquín "Cacho" Méndez)
        const validTourns = tourns.filter(t => {
          const name = t.name.toLowerCase();
          return (
            !name.includes('cacho') &&
            !name.includes('mendez') &&
            !name.includes('méndez') &&
            !name.includes('joaquin') &&
            !name.includes('joaquín') &&
            !name.includes('reyes')
          );
        });

        setTournaments(validTourns);

        const savedId = localStorage.getItem(LOCAL_STORAGE_KEY);
        let initialTourn: Tournament | undefined;

        if (savedId) {
          initialTourn = validTourns.find(t => t.id === savedId);
        }

        if (!initialTourn) {
          // Por defecto seleccionar el torneo oficial vigente (Adaro 2026)
          initialTourn = validTourns.find(t => t.id === ADARO_TOURNAMENT_ID || (t.is_current && t.name.toLowerCase().includes('adaro'))) ||
                         validTourns.find(t => t.is_current) ||
                         validTourns[0];
          if (initialTourn) {
            localStorage.setItem(LOCAL_STORAGE_KEY, initialTourn.id);
          }
        }

        if (initialTourn) {
          setSelectedTournament(initialTourn);
        }
      } catch (err) {
        console.error('Error fetching tournaments in TournamentContext:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadTournaments();
    return () => { isMounted = false; };
  }, []);

  const setTournament = useCallback((tournament: Tournament) => {
    setSelectedTournament(tournament);
    localStorage.setItem(LOCAL_STORAGE_KEY, tournament.id);
  }, []);

  const setTournamentById = useCallback((id: string) => {
    const found = tournaments.find(t => t.id === id);
    if (found) {
      setTournament(found);
    }
  }, [tournaments, setTournament]);

  const openSelector = useCallback(() => setIsSelectorOpen(true), []);
  const closeSelector = useCallback(() => setIsSelectorOpen(false), []);

  const isAdaro = useMemo(() => {
    if (!selectedTournament) return false;
    if (selectedTournament.format === 'copas_multinivel') return true;
    const name = selectedTournament.name.toLowerCase();
    return selectedTournament.id === ADARO_TOURNAMENT_ID || name.includes('adaro') || name.includes('chamaco');
  }, [selectedTournament]);

  const value = useMemo(() => ({
    tournaments,
    selectedTournament,
    selectedTournamentId: selectedTournament?.id || ADARO_TOURNAMENT_ID,
    isAdaro,
    setTournament,
    setTournamentById,
    isSelectorOpen,
    openSelector,
    closeSelector,
    isLoading
  }), [
    tournaments,
    selectedTournament,
    isAdaro,
    setTournament,
    setTournamentById,
    isSelectorOpen,
    openSelector,
    closeSelector,
    isLoading
  ]);

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

export function useTournament(): TournamentContextValue {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
}
