import { useState, useEffect, useCallback } from 'react';
import type { Team } from '../lib/types';
import { fetchTeams } from '../lib/db';

const FAVORITE_KEY = 'costaygol_favorite_team_id';

export function useFavoriteTeam() {
  const [favoriteTeamId, setFavoriteTeamId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(FAVORITE_KEY);
    } catch {
      return null;
    }
  });

  const [favoriteTeam, setFavoriteTeam] = useState<Team | null>(null);

  // Cargar el objeto completo del equipo cuando cambia el ID
  useEffect(() => {
    if (!favoriteTeamId) {
      setFavoriteTeam(null);
      return;
    }

    let isMounted = true;
    fetchTeams().then(teams => {
      if (isMounted) {
        const found = teams.find(t => t.id === favoriteTeamId) || null;
        setFavoriteTeam(found);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [favoriteTeamId]);

  const toggleFavorite = useCallback((teamId: string) => {
    setFavoriteTeamId(prev => {
      const next = prev === teamId ? null : teamId;
      try {
        if (next) {
          localStorage.setItem(FAVORITE_KEY, next);
        } else {
          localStorage.removeItem(FAVORITE_KEY);
        }
      } catch (err) {
        console.error('Error guardando favorito:', err);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((teamId: string) => {
    return favoriteTeamId === teamId;
  }, [favoriteTeamId]);

  return {
    favoriteTeamId,
    favoriteTeam,
    toggleFavorite,
    isFavorite
  };
}
