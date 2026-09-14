import { useState, useEffect } from 'react';
import { 
  Check, 
  Clock, 
  HelpCircle, 
  RefreshCw, 
  RotateCcw, 
  Save, 
  Sparkles, 
  Users
} from 'lucide-react';
import type { Poll } from '../lib/types';
import { 
  fetchActivePoll, 
  savePollConfig, 
  resetPollVotes, 
  calculatePollPercentages, 
  isPollExpired 
} from '../lib/poll';

export function AdminPollSettings() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Form State
  const [isActive, setIsActive] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [optionYesLabel, setOptionYesLabel] = useState('SÍ');
  const [optionNoLabel, setOptionNoLabel] = useState('NO');
  const [expiresAtLocal, setExpiresAtLocal] = useState('');

  const loadPollData = async () => {
    setLoading(true);
    try {
      const data = await fetchActivePoll();
      setPoll(data);
      setIsActive(data.is_active ?? true);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setOptionYesLabel(data.option_yes_label || 'SÍ');
      setOptionNoLabel(data.option_no_label || 'NO');

      // Convert ISO string to datetime-local format YYYY-MM-DDTHH:mm
      if (data.expires_at) {
        const d = new Date(data.expires_at);
        if (!isNaN(d.getTime())) {
          const tzOffset = d.getTimezoneOffset() * 60000;
          const localISO = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
          setExpiresAtLocal(localISO);
        }
      }
    } catch (err) {
      console.error('Error cargando configuración de encuesta:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPollData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!poll) return;

    setSaving(true);
    try {
      let isoExpiresAt = poll.expires_at;
      if (expiresAtLocal) {
        isoExpiresAt = new Date(expiresAtLocal).toISOString();
      }

      const updatedPoll: Poll = {
        ...poll,
        is_active: isActive,
        title,
        description,
        option_yes_label: optionYesLabel,
        option_no_label: optionNoLabel,
        expires_at: isoExpiresAt,
      };

      const success = await savePollConfig(updatedPoll);
      if (success) {
        setPoll(updatedPoll);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert('Hubo un error al guardar la configuración de la encuesta.');
      }
    } catch (err) {
      console.error('Error guardando encuesta:', err);
      alert('Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetVotes = async () => {
    if (!poll) return;
    setResetting(true);
    try {
      const reset = await resetPollVotes(poll);
      setPoll(reset);
      setConfirmReset(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error reiniciando votos:', err);
    } finally {
      setResetting(false);
    }
  };

  const handleSet5DaysExpiry = () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISO = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    setExpiresAtLocal(localISO);
  };

  const handleSetSundayExpiry = () => {
    // 20 de septiembre de 2026 a las 23:59hs
    const d = new Date('2026-09-20T23:59:59');
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISO = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    setExpiresAtLocal(localISO);
  };

  if (loading || !poll) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span>Cargando configuración de la encuesta...</span>
      </div>
    );
  }

  const { total, yesPercent, noPercent } = calculatePollPercentages(
    poll.yes_votes || 0,
    poll.no_votes || 0
  );
  const expired = isPollExpired(poll);

  return (
    <div className="space-y-6">
      {/* Header & Stats Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground tracking-tight">
                Gestión de Encuesta Comunitaria
              </h3>
              <p className="text-xs text-muted-foreground">
                Controlá la encuesta que se visualiza en la página principal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer bg-muted/50 px-3.5 py-1.5 rounded-2xl border border-border">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <span className="text-xs font-bold text-foreground">
                {isActive ? '🟢 Encuesta Habilitada' : '⚪ Encuesta Deshabilitada'}
              </span>
            </label>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Total Votos</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-foreground">{total}</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <span>Votos "SÍ"</span>
              <span>{yesPercent}%</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {poll.yes_votes || 0}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
            <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-bold">
              <span>Votos "NO"</span>
              <span>{noPercent}%</span>
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {poll.no_votes || 0}
            </div>
          </div>
        </div>

        {/* Status indicator bar */}
        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-semibold text-muted-foreground">Estado actual:</span>
            <span className={`font-black px-2 py-0.5 rounded-md ${expired ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'}`}>
              {expired ? 'Votación Vencida / Cerrada (Solo Resultados)' : 'Votación Abierta y Recibiendo Votos'}
            </span>
          </div>

          {/* Reset Votes Button */}
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-500/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Votos</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-500 font-bold">¿Seguro?</span>
              <button
                type="button"
                onClick={handleResetVotes}
                disabled={resetting}
                className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-500"
              >
                {resetting ? 'Reiniciando...' : 'Sí, borrar votos'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 text-xs text-muted-foreground hover:bg-muted rounded-lg"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form Card */}
      <form onSubmit={handleSave} className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <h4 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          <span>Configuración de Textos y Plazos</span>
        </h4>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground ml-1">Pregunta Principal *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ej: ¿Están interesados en tener un referente por equipo...?"
            className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm font-semibold"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground ml-1">Descripción / Detalle</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="ej: La idea es subir las alineaciones, tener los goleadores, etc."
            className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground ml-1">Texto Opción Positiva</label>
            <input
              type="text"
              value={optionYesLabel}
              onChange={(e) => setOptionYesLabel(e.target.value)}
              className="w-full px-4 py-2 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground ml-1">Texto Opción Negativa</label>
            <input
              type="text"
              value={optionNoLabel}
              onChange={(e) => setOptionNoLabel(e.target.value)}
              className="w-full px-4 py-2 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm"
              required
            />
          </div>
        </div>

        {/* Expiration DateTime */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center justify-between">
            <span>Fecha y Hora de Cierre de la Encuesta</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSetSundayExpiry}
                className="text-[11px] text-primary hover:underline font-bold"
              >
                Fijar al Domingo 20/09
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleSet5DaysExpiry}
                className="text-[11px] text-primary hover:underline font-bold"
              >
                +5 Días corridos
              </button>
            </div>
          </label>
          <input
            type="datetime-local"
            value={expiresAtLocal}
            onChange={(e) => setExpiresAtLocal(e.target.value)}
            className="w-full px-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-sm font-semibold"
          />
          <p className="text-[11px] text-muted-foreground">
            A partir de este momento, se desactivará automáticamente la posibilidad de votar y se mostrarán únicamente los porcentajes y resultados totales.
          </p>
        </div>

        {/* Submit & Feedback */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div>
            {savedSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 animate-in fade-in">
                <Check className="w-4 h-4" /> ¡Configuración guardada con éxito!
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Encuesta'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
