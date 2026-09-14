import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown,
  Users
} from 'lucide-react';
import type { Poll, PollVoteOption } from '../lib/types';
import { 
  fetchActivePoll, 
  submitPollVote, 
  getUserVote, 
  calculatePollPercentages, 
  isPollExpired,
  subscribeToPollChanges
} from '../lib/poll';

interface CommunityPollProps {
  className?: string;
}

export function CommunityPoll({ className = '' }: CommunityPollProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [userVote, setUserVote] = useState<PollVoteOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [justVoted, setJustVoted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const activePoll = await fetchActivePoll();
        if (isMounted) {
          setPoll(activePoll);
          if (activePoll) {
            setUserVote(getUserVote(activePoll.id));
          }
        }
      } catch (err) {
        console.error('Error cargando la encuesta:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();

    // Suscripción a cambios en tiempo real
    const unsubscribe = subscribeToPollChanges((updated) => {
      if (isMounted) {
        setPoll(updated);
      }
    });

    return () => { 
      isMounted = false; 
      unsubscribe();
    };
  }, []);

  if (loading || !poll || !poll.is_active) {
    return null;
  }

  const expired = isPollExpired(poll);
  const hasVoted = Boolean(userVote);
  const showResults = hasVoted || expired;

  const { total, yesPercent, noPercent } = calculatePollPercentages(
    poll.yes_votes || 0,
    poll.no_votes || 0
  );

  const handleVote = async (choice: PollVoteOption) => {
    if (voting || showResults) return;
    setVoting(true);
    try {
      const updated = await submitPollVote(poll.id, choice);
      setPoll(updated);
      setUserVote(choice);
      setJustVoted(true);
    } catch (err) {
      console.error('Error al registrar el voto:', err);
    } finally {
      setVoting(false);
    }
  };

  // Formato amigable de fecha de cierre
  const formatExpiryDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'domingo 20 de septiembre';
      return date.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'domingo 20 de septiembre';
    }
  };

  return (
    <section className={`max-w-4xl mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/95 to-primary/5 border border-primary/20 p-5 sm:p-7 shadow-lg backdrop-blur-md"
      >
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Encuesta de la Comunidad
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/50">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            {expired ? (
              <span className="text-amber-600 dark:text-amber-400 font-extrabold">Votación Finalizada</span>
            ) : (
              <span>Cierre: <strong className="text-foreground capitalize">{formatExpiryDate(poll.expires_at)}</strong></span>
            )}
          </div>
        </div>

        {/* Question & Description */}
        <div className="space-y-1.5 mb-6 text-left">
          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-foreground leading-snug flex items-start gap-2">
            <HelpCircle className="w-6 h-6 text-primary shrink-0 mt-0.5 hidden sm:inline" />
            <span>{poll.title}</span>
          </h2>
          {poll.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-0 sm:pl-8">
              {poll.description}
            </p>
          )}
        </div>

        {/* Interactive Voting or Results View */}
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="voting-options"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
            >
              {/* Option YES */}
              <button
                type="button"
                onClick={() => handleVote('yes')}
                disabled={voting}
                className="group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/30 hover:border-emerald-500 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99] text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <ThumbsUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-base sm:text-lg font-black text-foreground tracking-tight">
                      {poll.option_yes_label || 'SÍ'}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      Totalmente a favor
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  Votar SÍ
                </span>
              </button>

              {/* Option NO */}
              <button
                type="button"
                onClick={() => handleVote('no')}
                disabled={voting}
                className="group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-muted/40 hover:bg-rose-500/10 border-2 border-border/80 hover:border-rose-500/60 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-rose-500/10 hover:scale-[1.01] active:scale-[0.99] text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-muted-foreground/20 text-foreground flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all">
                    <ThumbsDown className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-base sm:text-lg font-black text-foreground tracking-tight">
                      {poll.option_no_label || 'NO'}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      Prefiero como está
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-muted-foreground bg-muted/60 px-3 py-1 rounded-xl group-hover:bg-rose-500/20 group-hover:text-rose-500 transition-colors">
                  Votar NO
                </span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="results-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {justVoted && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>¡Muchas gracias! Tu voto ha sido registrado correctamente.</span>
                </div>
              )}

              {/* Bar 1: YES */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                      👍
                    </span>
                    <span className="text-foreground font-extrabold">{poll.option_yes_label || 'SÍ'}</span>
                    {userVote === 'yes' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Tu elección
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-semibold text-xs">
                      {poll.yes_votes || 0} {poll.yes_votes === 1 ? 'voto' : 'votos'}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm sm:text-base min-w-[3rem] text-right">
                      {yesPercent}%
                    </span>
                  </div>
                </div>
                <div className="h-4 w-full bg-muted/60 rounded-full overflow-hidden p-0.5 border border-border/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${yesPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-xs"
                  />
                </div>
              </div>

              {/* Bar 2: NO */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black">
                      👎
                    </span>
                    <span className="text-foreground font-extrabold">{poll.option_no_label || 'NO'}</span>
                    {userVote === 'no' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Tu elección
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-semibold text-xs">
                      {poll.no_votes || 0} {poll.no_votes === 1 ? 'voto' : 'votos'}
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 font-black text-sm sm:text-base min-w-[3rem] text-right">
                      {noPercent}%
                    </span>
                  </div>
                </div>
                <div className="h-4 w-full bg-muted/60 rounded-full overflow-hidden p-0.5 border border-border/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${noPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full shadow-xs"
                  />
                </div>
              </div>

              {/* Footer Stats & Meta */}
              <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Total de votantes: <strong>{total}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span>
                    {expired
                      ? 'Encuesta cerrada. ¡Gracias por participar!'
                      : 'Resultados actualizados en vivo'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
