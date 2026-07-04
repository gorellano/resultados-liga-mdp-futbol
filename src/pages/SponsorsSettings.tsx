import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Sponsor } from '../lib/types';
import { Trash2, Plus, Edit2, Check, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../App';
import { motion, AnimatePresence } from 'framer-motion';

export function SponsorsSettings() {
  const [showSponsors, setShowSponsors] = useState(true);
  const [sendNotifications, setSendNotifications] = useState(true);
  const [notifTitleNew, setNotifTitleNew] = useState('¡Resultado Cargado!');
  const [notifTitleEdit, setNotifTitleEdit] = useState('¡Resultado Actualizado!');
  const [savingTitles, setSavingTitles] = useState(false);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  // Formularios
  const [isCreating, setIsCreating] = useState(false);
  const [newSponsor, setNewSponsor] = useState({ name: '', image_url: '', link_url: '', display_order: 0, is_active: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Sponsor>>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [{ data: allSettings }, { data: sp }] = await Promise.all([
        supabase.from('app_settings').select('key, value').in('key', ['show_sponsors', 'send_notifications', 'notification_title_new', 'notification_title_edit']),
        supabase.from('sponsors').select('*').order('display_order', { ascending: true })
      ]);

      if (allSettings) {
        allSettings.forEach(row => {
          if (row.key === 'show_sponsors') setShowSponsors(row.value === 'true' || row.value === true);
          if (row.key === 'send_notifications') setSendNotifications(row.value === 'true' || row.value === true);
          if (row.key === 'notification_title_new' && row.value) setNotifTitleNew(row.value);
          if (row.key === 'notification_title_edit' && row.value) setNotifTitleEdit(row.value);
        });
      }
      if (sp) {
        setSponsors(sp);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleShowSponsors(val: boolean) {
    setShowSponsors(val);
    try {
      await supabase.from('app_settings').upsert({ key: 'show_sponsors', value: String(val) });
    } catch (e) {
      console.error(e);
      alert('Error guardando configuración general.');
      setShowSponsors(!val);
    }
  }

  async function toggleSendNotifications(val: boolean) {
    setSendNotifications(val);
    try {
      await supabase.from('app_settings').upsert({ key: 'send_notifications', value: String(val) });
    } catch (e) {
      console.error(e);
      alert('Error guardando configuración de notificaciones.');
      setSendNotifications(!val);
    }
  }

  async function saveNotifTitles() {
    setSavingTitles(true);
    try {
      await supabase.from('app_settings').upsert([
        { key: 'notification_title_new', value: notifTitleNew },
        { key: 'notification_title_edit', value: notifTitleEdit }
      ]);
    } catch (e) {
      console.error(e);
      alert('Error guardando los textos.');
    } finally {
      setSavingTitles(false);
    }
  }

  async function handleFileUpload(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('sponsors')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('sponsors').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (e) {
      console.error('Error uploading image:', e);
      alert('Error al subir imagen.');
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function createSponsor() {
    if (!newSponsor.name || !newSponsor.image_url) {
      alert('Nombre e Imagen son obligatorios.');
      return;
    }
    try {
      const { data, error } = await supabase.from('sponsors').insert([newSponsor]).select().single();
      if (error) throw error;
      setSponsors([...sponsors, data]);
      setIsCreating(false);
      setNewSponsor({ name: '', image_url: '', link_url: '', display_order: 0, is_active: true });
    } catch (e) {
      console.error(e);
      alert('Error creando sponsor.');
    }
  }

  async function updateSponsor(id: string) {
    try {
      const { data, error } = await supabase.from('sponsors').update(editForm).eq('id', id).select().single();
      if (error) throw error;
      setSponsors(sponsors.map(s => (s.id === id ? data : s)));
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert('Error actualizando sponsor.');
    }
  }

  async function deleteSponsor(id: string) {
    if (!confirm('¿Seguro que deseas eliminar este sponsor?')) return;
    try {
      const { error } = await supabase.from('sponsors').delete().eq('id', id);
      if (error) throw error;
      setSponsors(sponsors.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
      alert('Error eliminando sponsor.');
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Cargando configuración...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Configuración Global */}
      <div className="bg-card/60 rounded-3xl border border-border/50 p-6 md:p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-4">Configuración General</h3>
        <label className="flex items-center gap-3 cursor-pointer p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-colors">
          <input
            type="checkbox"
            className="w-5 h-5 rounded text-primary focus:ring-primary"
            checked={showSponsors}
            onChange={(e) => toggleShowSponsors(e.target.checked)}
          />
          <div>
            <div className="font-semibold text-foreground">Mostrar Banners de Sponsors</div>
            <div className="text-sm text-muted-foreground">Activa o desactiva la visibilidad global de todos los sponsors en la plataforma.</div>
          </div>
        </label>
        <label className="flex items-center gap-3 cursor-pointer p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-colors mt-3">
          <input
            type="checkbox"
            className="w-5 h-5 rounded text-primary focus:ring-primary"
            checked={sendNotifications}
            onChange={(e) => toggleSendNotifications(e.target.checked)}
          />
          <div>
            <div className="font-semibold text-foreground">Enviar notificaciones push</div>
            <div className="text-sm text-muted-foreground">Cuando está activo, se envía automáticamente una alerta push a los suscriptores cada vez que se carga o modifica un resultado.</div>
          </div>
        </label>
      </div>

      {/* Textos de notificaciones */}
      <div className="bg-card/60 rounded-3xl border border-border/50 p-6 md:p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-1">Textos de Notificaciones Push</h3>
        <p className="text-sm text-muted-foreground mb-5">Personalizá los títulos que ven los usuarios al recibir una alerta en su dispositivo.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Título — Resultado nuevo</label>
            <input
              type="text"
              value={notifTitleNew}
              onChange={(e) => setNotifTitleNew(e.target.value)}
              placeholder="¡Resultado cargado!"
              className="w-full px-4 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">El cuerpo del mensaje siempre es: Equipo Local goles - goles Equipo Visitante</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Título — Resultado modificado</label>
            <input
              type="text"
              value={notifTitleEdit}
              onChange={(e) => setNotifTitleEdit(e.target.value)}
              placeholder="¡Resultado Actualizado!"
              className="w-full px-4 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveNotifTitles}
              disabled={savingTitles || !notifTitleNew.trim() || !notifTitleEdit.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {savingTitles ? 'Guardando...' : 'Guardar textos'}
            </button>
            <button
              onClick={() => { setNotifTitleNew('¡Resultado Cargado!'); setNotifTitleEdit('¡Resultado Actualizado!'); }}
              className="px-4 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
            >
              Restaurar por defecto
            </button>
          </div>
        </div>
      </div>


      <div className="bg-card/60 rounded-3xl border border-border/50 p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Gestión de Sponsors</h3>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isCreating ? 'Cancelar' : 'Nuevo Sponsor'}
          </button>
        </div>

        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="p-6 border border-border/50 rounded-2xl bg-muted/20 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Nombre *</label>
                    <input
                      type="text"
                      value={newSponsor.name}
                      onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Nombre del sponsor"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Link / URL</label>
                    <input
                      type="url"
                      value={newSponsor.link_url}
                      onChange={(e) => setNewSponsor({ ...newSponsor, link_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase flex justify-between">
                      Imagen * 
                      {uploading && <span className="text-primary animate-pulse">Subiendo...</span>}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file);
                            if (url) setNewSponsor({ ...newSponsor, image_url: url });
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-background border border-border/50 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                      {newSponsor.image_url && (
                        <img src={newSponsor.image_url} alt="Preview" className="h-10 w-auto rounded-lg border border-border" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Orden de visualización</label>
                    <input
                      type="number"
                      value={newSponsor.display_order}
                      onChange={(e) => setNewSponsor({ ...newSponsor, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1 flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSponsor.is_active}
                        onChange={(e) => setNewSponsor({ ...newSponsor, is_active: e.target.checked })}
                        className="w-4 h-4 rounded text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Activo</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={createSponsor}
                    disabled={uploading || !newSponsor.name || !newSponsor.image_url}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    Guardar Sponsor
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de Sponsors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map((sponsor) => (
            <div key={sponsor.id} className="bg-background border border-border/50 rounded-2xl overflow-hidden shadow-sm flex flex-col group">
              <div className="relative h-32 bg-muted/30 flex items-center justify-center p-4">
                <img src={sponsor.image_url} alt={sponsor.name} className="max-h-full object-contain" />
                {!sponsor.is_active && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="px-3 py-1 bg-muted/80 text-muted-foreground text-xs font-bold rounded-full border border-border">INACTIVO</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1 border-t border-border/30">
                {editingId === sponsor.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm rounded bg-muted/50 border border-border"
                      placeholder="Nombre"
                    />
                    <input
                      type="url"
                      value={editForm.link_url || ''}
                      onChange={(e) => setEditForm({ ...editForm, link_url: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm rounded bg-muted/50 border border-border"
                      placeholder="URL"
                    />
                    <div className="flex gap-2">
                       <input
                        type="number"
                        value={editForm.display_order ?? 0}
                        onChange={(e) => setEditForm({ ...editForm, display_order: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1.5 text-sm rounded bg-muted/50 border border-border"
                        title="Orden"
                      />
                      <label className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          checked={editForm.is_active}
                          onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                          className="w-3.5 h-3.5 rounded"
                        />
                        Activo
                      </label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => updateSponsor(sponsor.id)} className="flex-1 py-1.5 bg-green-500/10 text-green-600 rounded-lg text-xs font-bold">
                        Guardar
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex-1 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-bold">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="font-bold">{sponsor.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{sponsor.link_url || 'Sin enlace'}</p>
                      <p className="text-xs text-muted-foreground mt-1">Orden: {sponsor.display_order}</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-auto pt-2 border-t border-border/30">
                      <button
                        onClick={() => { setEditingId(sponsor.id); setEditForm(sponsor); }}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSponsor(sponsor.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {sponsors.length === 0 && !isCreating && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hay sponsors cargados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
