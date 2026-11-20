import { supabase } from './supabase';
import { isSupabaseActive } from './db';

export type NewsCategory = 'playoffs' | 'comunicado' | 'pendientes' | 'general';

export interface NewsPost {
  id: string;
  title: string;
  category: NewsCategory;
  body: string;
  is_pinned?: boolean;
  created_at: string;
}

const NEWS_SETTINGS_KEY = 'news_posts';
const LOCAL_NEWS_CACHE_KEY = 'costaygol_news_cache_v1';
const LOCAL_READ_NEWS_KEY = 'costaygol_read_news_ids_v1';

export const NEWS_CATEGORY_META: Record<NewsCategory, {
  label: string;
  emoji: string;
  badgeClass: string;
}> = {
  playoffs: {
    label: 'Playoffs · 4 Copas',
    emoji: '🏆',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  comunicado: {
    label: 'Comunicado Oficial',
    emoji: '📌',
    badgeClass: 'bg-primary/15 text-primary border-primary/30',
  },
  pendientes: {
    label: 'Partidos y Tablas',
    emoji: '⚠️',
    badgeClass: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
  },
  general: {
    label: 'Novedades',
    emoji: '📰',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
};

export const DEFAULT_NEWS_POSTS: NewsPost[] = [
  {
    id: 'news-playoffs-tablas-finales-2026',
    title: '¡Tablas Finales de Primera Fase y Cruces de Playoffs Confirmados!',
    category: 'playoffs',
    body: 'Ya se encuentran actualizadas las tablas finales de las 7 zonas con la totalidad de partidos jugados (PJ), puntos y promedios oficiales tras completarse las 6 fechas (incluyendo los encuentros pendientes que habían sido suspendidos). Con estos promedios oficiales ya están armados los cruces de Cuartos de Final de las 4 Copas (Platino, Oro, Plata y Bronce) para todas las categorías (7ª a 17ª División). Nota: los puntos obtenidos en los partidos suspendidos ya están sumados en el puntaje y promedio final de cada club, aunque el marcador individual de algunos de esos encuentros no figure desglosado en su fecha.',
    is_pinned: true,
    created_at: '2026-11-19T21:30:00.000Z',
  },
];

export function notifyNewsStateChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('costaygol-news-updated'));
  }
}

export async function fetchNewsPosts(): Promise<NewsPost[]> {
  if (isSupabaseActive()) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', NEWS_SETTINGS_KEY)
        .maybeSingle();

      if (!error && data && data.value) {
        const parsed: NewsPost[] = typeof data.value === 'string'
          ? JSON.parse(data.value)
          : (Array.isArray(data.value) ? data.value : []);

        if (Array.isArray(parsed)) {
          try {
            localStorage.setItem(LOCAL_NEWS_CACHE_KEY, JSON.stringify(parsed));
          } catch {
            // ignore storage errors
          }
          return sortNewsPosts(parsed);
        }
      }
    } catch (err) {
      console.warn('Error fetching news_posts from Supabase, falling back to local cache:', err);
    }
  }

  try {
    const cached = localStorage.getItem(LOCAL_NEWS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sortNewsPosts(parsed);
      }
    }
  } catch {
    // ignore storage errors
  }

  return sortNewsPosts(DEFAULT_NEWS_POSTS);
}

export function sortNewsPosts(posts: NewsPost[]): NewsPost[] {
  return [...posts].sort((a, b) => {
    if (Boolean(a.is_pinned) !== Boolean(b.is_pinned)) {
      return a.is_pinned ? -1 : 1;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function saveNewsPosts(posts: NewsPost[]): Promise<boolean> {
  const sorted = sortNewsPosts(posts);
  try {
    localStorage.setItem(LOCAL_NEWS_CACHE_KEY, JSON.stringify(sorted));
  } catch {
    // ignore storage errors
  }

  if (isSupabaseActive()) {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: NEWS_SETTINGS_KEY,
          value: sorted,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
    } catch (err) {
      console.error('Error saving news_posts to Supabase:', err);
      notifyNewsStateChanged();
      return false;
    }
  }

  notifyNewsStateChanged();
  return true;
}

export function getReadNewsIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LOCAL_READ_NEWS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return new Set(arr.filter(id => typeof id === 'string'));
    }
  } catch {
    // ignore
  }
  return new Set();
}

export function getUnreadNewsCount(posts: NewsPost[]): number {
  const readIds = getReadNewsIds();
  return posts.reduce((acc, post) => acc + (readIds.has(post.id) ? 0 : 1), 0);
}

export function markAllNewsAsRead(posts: NewsPost[]): void {
  try {
    const readIds = getReadNewsIds();
    let changed = false;
    posts.forEach(p => {
      if (!readIds.has(p.id)) {
        readIds.add(p.id);
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(LOCAL_READ_NEWS_KEY, JSON.stringify(Array.from(readIds)));
      notifyNewsStateChanged();
    }
  } catch {
    // ignore
  }
}
