import { supabase } from './supabase';
import { isSupabaseActive } from './db';
import type { Poll, PollVoteOption } from './types';

export const DEFAULT_POLL: Poll = {
  id: 'poll-referente-equipo-2026',
  title: '¿Están interesados en tener un referente por equipo para subir los resultados al finalizar cada encuentro?',
  description: 'La idea es subir las alineaciones, tener los goleadores, etc.',
  option_yes_label: 'SÍ',
  option_no_label: 'NO',
  yes_votes: 0,
  no_votes: 0,
  expires_at: '2026-09-20T23:59:59.000Z',
  is_active: true,
};

const LOCAL_POLL_KEY = 'app_active_poll_state';

/**
 * Obtiene el voto guardado localmente en el dispositivo
 */
export function getUserVote(pollId: string): PollVoteOption | null {
  try {
    const val = localStorage.getItem(`poll_voted_${pollId}`);
    if (val === 'yes' || val === 'no') return val;
    return null;
  } catch {
    return null;
  }
}

/**
 * Guarda el voto del usuario en localStorage
 */
export function recordUserVote(pollId: string, choice: PollVoteOption): void {
  try {
    localStorage.setItem(`poll_voted_${pollId}`, choice);
  } catch (err) {
    console.warn('No se pudo guardar el voto en localStorage:', err);
  }
}

/**
 * Elimina el registro del voto local (útil para testing o reset)
 */
export function clearUserVote(pollId: string): void {
  try {
    localStorage.removeItem(`poll_voted_${pollId}`);
  } catch (err) {
    console.warn('Error al limpiar voto local:', err);
  }
}

/**
 * Calcula porcentajes y totales de una encuesta
 */
export function calculatePollPercentages(yesVotes: number, noVotes: number) {
  const safeYes = Math.max(0, Number(yesVotes) || 0);
  const safeNo = Math.max(0, Number(noVotes) || 0);
  const total = safeYes + safeNo;

  if (total === 0) {
    return {
      total: 0,
      yesPercent: 0,
      noPercent: 0,
    };
  }

  const yesPercent = Math.round((safeYes / total) * 100);
  const noPercent = 100 - yesPercent;

  return {
    total,
    yesPercent,
    noPercent,
  };
}

/**
 * Comprueba si la encuesta ya venció según su fecha de expiración
 */
export function isPollExpired(poll: Poll, referenceDate: Date = new Date()): boolean {
  if (!poll.expires_at) return false;
  const expiry = new Date(poll.expires_at);
  if (isNaN(expiry.getTime())) return false;
  return referenceDate.getTime() >= expiry.getTime();
}

/**
 * Obtiene la configuración y estado actual de la encuesta
 */
export async function fetchActivePoll(): Promise<Poll> {
  let basePoll = { ...DEFAULT_POLL };

  if (isSupabaseActive()) {
    try {
      // 1. Obtener la configuración de app_settings
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'active_poll')
        .maybeSingle();

      if (data?.value) {
        const raw = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        basePoll = { ...DEFAULT_POLL, ...raw };
      }

      // 2. Contar votos reales directamente de la tabla poll_votes
      const [yesRes, noRes] = await Promise.all([
        supabase.from('poll_votes').select('*', { count: 'exact', head: true }).eq('poll_id', basePoll.id).eq('choice', 'yes'),
        supabase.from('poll_votes').select('*', { count: 'exact', head: true }).eq('poll_id', basePoll.id).eq('choice', 'no')
      ]);

      const dbYes = typeof yesRes.count === 'number' ? yesRes.count : (basePoll.yes_votes || 0);
      const dbNo = typeof noRes.count === 'number' ? noRes.count : (basePoll.no_votes || 0);

      // Usar el mayor entre app_settings y poll_votes para asegurar que nunca baje
      basePoll.yes_votes = Math.max(dbYes, basePoll.yes_votes || 0);
      basePoll.no_votes = Math.max(dbNo, basePoll.no_votes || 0);

      try {
        localStorage.setItem(LOCAL_POLL_KEY, JSON.stringify(basePoll));
      } catch {}
      return basePoll;
    } catch (err) {
      console.warn('Supabase fetchActivePoll failed, falling back to local:', err);
    }
  }

  // Fallback a localStorage
  try {
    const local = localStorage.getItem(LOCAL_POLL_KEY);
    if (local) {
      return { ...DEFAULT_POLL, ...JSON.parse(local) };
    }
  } catch {}

  return basePoll;
}

/**
 * Registra un voto para la encuesta activa
 */
export async function submitPollVote(pollId: string, choice: PollVoteOption): Promise<Poll> {
  // Guardar localmente para evitar votos dobles en este navegador
  recordUserVote(pollId, choice);

  if (isSupabaseActive()) {
    try {
      // 1. Insert directo en la tabla poll_votes (con RLS pública)
      await supabase.from('poll_votes').insert({
        poll_id: pollId,
        choice: choice
      });
    } catch (insertErr) {
      console.warn('Error insertando en poll_votes:', insertErr);
    }

    try {
      // 2. Intentar llamar a función RPC si existe
      await supabase.rpc('vote_in_poll', { poll_choice: choice });
    } catch {}
  }

  // 3. Obtener el estado actualizado con los conteos reales de la BD
  return await fetchActivePoll();
}

/**
 * Actualiza la configuración de la encuesta desde el Panel de Administración
 */
export async function savePollConfig(poll: Poll): Promise<boolean> {
  const updatedPoll: Poll = {
    ...poll,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseActive()) {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: 'active_poll',
          value: updatedPoll,
        });
      if (error) throw error;
    } catch (err) {
      console.error('Error guardando configuración de encuesta en Supabase:', err);
      return false;
    }
  }

  try {
    localStorage.setItem(LOCAL_POLL_KEY, JSON.stringify(updatedPoll));
  } catch {}

  return true;
}

/**
 * Reinicia los votos de la encuesta a cero
 */
export async function resetPollVotes(poll: Poll): Promise<Poll> {
  const resetPoll: Poll = {
    ...poll,
    yes_votes: 0,
    no_votes: 0,
    updated_at: new Date().toISOString(),
  };

  await savePollConfig(resetPoll);
  return resetPoll;
}

/**
 * Se suscribe a cambios en tiempo real en la encuesta vía Supabase Realtime
 */
export function subscribeToPollChanges(callback: (poll: Poll) => void): () => void {
  if (!isSupabaseActive()) {
    return () => {};
  }

  try {
    const channel = supabase
      .channel('realtime_active_poll_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_settings',
          filter: 'key=eq.active_poll',
        },
        (payload) => {
          if (payload.new && (payload.new as any).value) {
            const raw = typeof (payload.new as any).value === 'string'
              ? JSON.parse((payload.new as any).value)
              : (payload.new as any).value;
            const merged: Poll = { ...DEFAULT_POLL, ...raw };
            try {
              localStorage.setItem(LOCAL_POLL_KEY, JSON.stringify(merged));
            } catch {}
            callback(merged);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Error al suscribir a Supabase Realtime para la encuesta:', err);
    return () => {};
  }
}

