import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Team } from '../lib/types';
import { fetchTeams } from '../lib/db';

export interface FavoriteSelection {
  teamId: string;
  divisionId?: string;
}

export interface EnrichedFavorite {
  teamId: string;
  divisionId?: string;
  team: Team | null;
}

const FAVORITES_LIST_KEY = 'costaygol_favorite_selections_v2';
const OLD_FAVORITE_KEY = 'costaygol_favorite_team_id';
const OLD_DIVISION_KEY = 'costaygol_favorite_division_id';

export function useFavoriteTeam() {
  const [favoritesList, setFavoritesList] = useState<FavoriteSelection[]>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_LIST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.slice(0, 2);
      }
      // Migration from old single favorite
      const oldTeamId = localStorage.getItem(OLD_FAVORITE_KEY);
      const oldDivId = localStorage.getItem(OLD_DIVISION_KEY) || undefined;
      if (oldTeamId) {
        const initial = [{ teamId: oldTeamId, divisionId: oldDivId }];
        localStorage.setItem(FAVORITES_LIST_KEY, JSON.stringify(initial));
        return initial;
      }
    } catch (err) {
      console.error('Error loading favorites list:', err);
    }
    return [];
  });

  const [teamsMap, setTeamsMap] = useState<Record<string, Team>>({});

  useEffect(() => {
    let isMounted = true;
    fetchTeams().then(teams => {
      if (isMounted) {
        const map: Record<string, Team> = {};
        teams.forEach(t => { map[t.id] = t; });
        setTeamsMap(map);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const saveFavorites = useCallback((nextList: FavoriteSelection[]) => {
    setFavoritesList(nextList);
    try {
      localStorage.setItem(FAVORITES_LIST_KEY, JSON.stringify(nextList));
      if (nextList.length > 0) {
        localStorage.setItem(OLD_FAVORITE_KEY, nextList[0].teamId);
        if (nextList[0].divisionId) {
          localStorage.setItem(OLD_DIVISION_KEY, nextList[0].divisionId);
        } else {
          localStorage.removeItem(OLD_DIVISION_KEY);
        }
      } else {
        localStorage.removeItem(OLD_FAVORITE_KEY);
        localStorage.removeItem(OLD_DIVISION_KEY);
      }
    } catch (err) {
      console.error('Error saving favorites:', err);
    }
  }, []);

  const toggleFavorite = useCallback((teamId: string, divisionId?: string) => {
    setFavoritesList(prev => {
      const existsIndex = prev.findIndex(f => f.teamId === teamId);
      let next: FavoriteSelection[];
      if (existsIndex >= 0) {
        // If team already exists in favorites, remove it
        next = prev.filter((_, idx) => idx !== existsIndex);
      } else {
        // If not in favorites, add it (max 2 items)
        if (prev.length >= 2) {
          // If already 2 items, replace the oldest (first item) and append new
          next = [prev[1], { teamId, divisionId }];
        } else {
          next = [...prev, { teamId, divisionId }];
        }
      }
      saveFavorites(next);
      return next;
    });
  }, [saveFavorites]);

  const setFavoriteDivisionId = useCallback((teamId: string, divisionId: string | null) => {
    setFavoritesList(prev => {
      const next = prev.map(f => {
        if (f.teamId === teamId) {
          return { ...f, divisionId: divisionId || undefined };
        }
        return f;
      });
      saveFavorites(next);
      return next;
    });
  }, [saveFavorites]);

  const isFavorite = useCallback((teamId: string) => {
    return favoritesList.some(f => f.teamId === teamId);
  }, [favoritesList]);

  // Enriched favorite items
  const enrichedFavorites = useMemo(() => {
    return favoritesList.map(f => ({
      teamId: f.teamId,
      divisionId: f.divisionId,
      team: teamsMap[f.teamId] || null
    }));
  }, [favoritesList, teamsMap]);

  return {
    favorites: enrichedFavorites,
    favoritesList,
    favoriteTeamId: favoritesList[0]?.teamId || null,
    favoriteTeam: teamsMap[favoritesList[0]?.teamId] || null,
    favoriteDivisionId: favoritesList[0]?.divisionId || null,
    setFavoriteDivisionId,
    toggleFavorite,
    isFavorite,
    canAddMore: favoritesList.length < 2
  };
}
