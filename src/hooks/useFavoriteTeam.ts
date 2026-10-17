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
const FAVORITES_EVENT = 'costaygol_favorites_changed';

let globalTeamsMap: Record<string, Team> | null = null;
let globalTeamsPromise: Promise<Record<string, Team>> | null = null;

function getGlobalTeamsMap(): Promise<Record<string, Team>> {
  if (globalTeamsMap) return Promise.resolve(globalTeamsMap);
  if (globalTeamsPromise) return globalTeamsPromise;
  globalTeamsPromise = fetchTeams().then(teams => {
    const map: Record<string, Team> = {};
    teams.forEach(t => { map[t.id] = t; });
    globalTeamsMap = map;
    return map;
  });
  return globalTeamsPromise;
}

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

  const [teamsMap, setTeamsMap] = useState<Record<string, Team>>(() => globalTeamsMap || {});

  useEffect(() => {
    let isMounted = true;
    getGlobalTeamsMap().then(map => {
      if (isMounted) {
        setTeamsMap(map);
      }
    });

    const handler = (e: Event) => {
      const custom = e as CustomEvent<FavoriteSelection[]>;
      if (custom.detail) {
        setFavoritesList(custom.detail);
      }
    };
    window.addEventListener(FAVORITES_EVENT, handler);

    return () => { 
      isMounted = false; 
      window.removeEventListener(FAVORITES_EVENT, handler);
    };
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: nextList }));
      }
    } catch (err) {
      console.error('Error saving favorites:', err);
    }
  }, []);

  const toggleFavorite = useCallback((teamId: string, divisionId?: string) => {
    setFavoritesList(prev => {
      // Find if an exact match or team match exists
      const existsIndex = prev.findIndex(f => {
        if (divisionId && f.divisionId) {
          return f.teamId === teamId && f.divisionId === divisionId;
        }
        return f.teamId === teamId;
      });

      let next: FavoriteSelection[];
      if (existsIndex >= 0) {
        // Remove existing favorite
        next = prev.filter((_, idx) => idx !== existsIndex);
      } else {
        // Add new favorite (max 2 items)
        const newFav: FavoriteSelection = { teamId, divisionId };
        if (prev.length >= 2) {
          // Replace second or oldest item
          next = [prev[0], newFav];
        } else {
          next = [...prev, newFav];
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

  const isFavorite = useCallback((teamId: string, divisionId?: string) => {
    return favoritesList.some(f => {
      if (divisionId && f.divisionId) {
        return f.teamId === teamId && f.divisionId === divisionId;
      }
      return f.teamId === teamId;
    });
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
