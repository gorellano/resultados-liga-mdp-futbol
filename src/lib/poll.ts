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
  if (isSupabaseActive()) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'active_poll')
        .maybeSingle();

      if (!error && data?.value) {
        const raw = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        const merged: Poll = { ...DEFAULT_POLL, ...raw };
        try {
          localStorage.setItem(LOCAL_POLL_KEY, JSON.stringify(merged));
        } catch {}
        return merged;
      }
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

  return { ...DEFAULT_POLL };
}

/**
 * Registra un voto para la encuesta activa
 */
export async function submitPollVote(pollId: string, choice: PollVoteOption): Promise<Poll> {
  // Guardar localmente para evitar votos dobles
  recordUserVote(pollId, choice);

  let currentPoll = await fetchActivePoll();
  if (currentPoll.id !== pollId) {
    currentPoll = { ...currentPoll, id: pollId };
  }

  const updatedPoll: Poll = {
    ...currentPoll,
    yes_votes: choice === 'yes' ? (currentPoll.yes_votes || 0) + 1 : (currentPoll.yes_votes || 0),
    no_votes: choice === 'no' ? (currentPoll.no_votes || 0) + 1 : (currentPoll.no_votes || 0),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseActive()) {
    try {
      await supabase
        .from('app_settings')
        .upsert({
          key: 'active_poll',
          value: updatedPoll,
        });
    } catch (err) {
      console.error('Error guardando voto en Supabase:', err);
    }
  }

  try {
    localStorage.setItem(LOCAL_POLL_KEY, JSON.stringify(updatedPoll));
  } catch {}

  return updatedPoll;
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
