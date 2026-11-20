import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ArrowLeft, Pin, Calendar, Trophy, ChevronRight, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  fetchNewsPosts,
  getReadNewsIds,
  markAllNewsAsRead,
  NEWS_CATEGORY_META,
  type NewsPost
} from '../lib/news';
import { FormattedNewsText } from '../components/FormattedNewsText';

export function NoticiasPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnArrival, setUnreadOnArrival] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const previouslyRead = getReadNewsIds();
      const data = await fetchNewsPosts();

      // Identificar qué notas eran nuevas al entrar para destacarlas visualmente en esta visita
      const freshIds = new Set<string>();
      data.forEach(p => {
        if (!previouslyRead.has(p.id)) {
          freshIds.add(p.id);
        }
      });
      setUnreadOnArrival(freshIds);
      setPosts(data);

      // Marcar todas como leídas automáticamente para este usuario (limpia el badge rojo estilo iPhone)
      markAllNewsAsRead(data);
    } catch (err) {
      console.error('Error cargando noticias:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    // Chequear Service Worker y recargar datos frescos
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.update().catch(() => {});
      });
    }
    loadData();
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      className="max-w-4xl mx-auto space-y-5 sm:space-y-6 pb-6"
    >
      {/* Header */}
      <div className="bg-card border border-border/70 p-5 sm:p-8 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Inicio
          </Link>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer active:scale-95"
            title="Actualizar notas"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            <span>{refreshing ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Newspaper className="w-7 h-7 text-primary shrink-0" />
            Noticias y Comunicados
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Avisos oficiales sobre el estado de las fechas, tablas de promedios y cuadros de Playoffs de la Liga Marplatense.
          </p>
        </div>
      </div>

      {/* Lista de Noticias */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-card border border-border/60 rounded-3xl p-5 sm:p-7 animate-pulse space-y-3">
              <div className="h-4 w-36 bg-muted rounded-lg" />
              <div className="h-6 w-3/4 bg-muted rounded-lg" />
              <div className="h-16 w-full bg-muted rounded-xl" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-card border border-dashed border-border/70 rounded-3xl p-10 sm:p-12 text-center space-y-2">
          <Newspaper className="w-8 h-8 text-muted-foreground mx-auto opacity-60" />
          <p className="text-sm font-bold text-foreground">No hay noticias publicadas por el momento.</p>
          <p className="text-xs text-muted-foreground">Cuando haya novedades del torneo aparecerán en esta sección.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const cat = NEWS_CATEGORY_META[post.category] || NEWS_CATEGORY_META.general;
            const isFresh = unreadOnArrival.has(post.id);

            return (
              <article
                key={post.id}
                className={`bg-card border rounded-3xl p-5 sm:p-7 shadow-xs transition-all space-y-4 ${
                  post.is_pinned
                    ? 'border-primary/40 ring-1 ring-primary/15'
                    : 'border-border/70'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${cat.badgeClass}`}>
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </span>

                    {post.is_pinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-bold">
                        <Pin className="w-3 h-3 text-primary" />
                        Destacado
                      </span>
                    )}

                    {isFresh && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                        Nuevo
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(post.created_at)}
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-lg sm:text-xl font-display font-black tracking-tight text-foreground">
                    {post.title}
                  </h2>
                  <FormattedNewsText text={post.body} />
                </div>

                {post.category === 'playoffs' && (
                  <div className="pt-2">
                    <Link
                      to="/copas"
                      className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-extrabold transition-colors text-center"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Ver Cuadro de Playoffs y 4 Copas</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
