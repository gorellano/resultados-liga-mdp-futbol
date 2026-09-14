import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Save, 
  Search, 
  Info,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { readPdfFileInBrowser } from '../lib/pdfResultsParser';
import type { ParsedMatchResult, ParsePdfSummary } from '../lib/pdfResultsParser';
import { saveBatchParsedMatchResults } from '../lib/db';
import type { Tournament } from '../lib/types';

interface PdfImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournaments: Tournament[];
  selectedTournamentId: string;
  onSuccess: () => void;
}

export const PdfImporterModal: React.FC<PdfImporterModalProps> = ({
  isOpen,
  onClose,
  tournaments,
  selectedTournamentId,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseSummary, setParseSummary] = useState<ParsePdfSummary | null>(null);
  
  // Lista de resultados editable
  const [editableResults, setEditableResults] = useState<ParsedMatchResult[]>([]);
  const [roundNumber, setRoundNumber] = useState<number>(9);
  const [tournamentId, setTournamentId] = useState<string>(selectedTournamentId);

  // Filtros de búsqueda en la previsualización
  const [filterDivision, setFilterDivision] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Estados de proceso
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessReport, setSaveSuccessReport] = useState<{ updatedCount: number; errors: string[] } | null>(null);
  const [simulationReport, setSimulationReport] = useState<{ updatedCount: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  // Manejar carga de archivo PDF
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Por favor selecciona un archivo PDF válido');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsLoading(true);
    setSaveSuccessReport(null);
    setSimulationReport(null);

    try {
      const summary = await readPdfFileInBrowser(selectedFile);
      setParseSummary(summary);
      setEditableResults(summary.results);

      if (summary.roundNumber) {
        setRoundNumber(summary.roundNumber);
      }
    } catch (err: any) {
      console.error('Error al procesar el archivo PDF:', err);
      setError('Error al procesar el archivo PDF: ' + (err.message || 'Formato no soportado'));
    } finally {
      setIsLoading(false);
    }
  };

  // Edición in-line de goles de un partido leíod
  const handleGoalChange = (id: string, field: 'homeGoals' | 'awayGoals', value: string) => {
    const num = value === '' ? null : parseInt(value, 10);
    setEditableResults(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: isNaN(num as number) ? null : num };
        // Si ambos goles tienen un número, se marca como terminado
        if (updated.homeGoals !== null && updated.awayGoals !== null) {
          updated.status = 'finished';
          updated.isPostponed = false;
        }
        return updated;
      }
      return item;
    }));
  };

  // Alternar estado de pospuesto (post)
  const handleTogglePostponed = (id: string) => {
    setEditableResults(prev => prev.map(item => {
      if (item.id === id) {
        const newPostponed = !item.isPostponed;
        return {
          ...item,
          isPostponed: newPostponed,
          status: newPostponed ? 'postponed' : 'finished',
          homeGoals: newPostponed ? null : (item.homeGoals ?? 0),
          awayGoals: newPostponed ? null : (item.awayGoals ?? 0),
        };
      }
      return item;
    }));
  };

  // Ejecutar Simulación (Dry Run)
  const handleSimulate = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await saveBatchParsedMatchResults(tournamentId, roundNumber, editableResults);
      setSimulationReport(result);
    } catch (err: any) {
      setError('Error durante la simulación: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Guardar definitivamente a la base de datos
  const handleConfirmSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await saveBatchParsedMatchResults(tournamentId, roundNumber, editableResults);
      setSaveSuccessReport(result);
      if (result.updatedCount > 0) {
        onSuccess();
      }
    } catch (err: any) {
      setError('Error al guardar en la base de datos: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrado de la tabla de resultados
  const filteredResults = editableResults.filter(item => {
    if (filterDivision !== 'all' && item.divisionNumber.toString() !== filterDivision) return false;
    if (filterZone !== 'all' && item.zone !== filterZone) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        item.homeTeamCanonical.toLowerCase().includes(q) ||
        item.awayTeamCanonical.toLowerCase().includes(q) ||
        item.division.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] text-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Cargar Resultados desde PDF</h2>
              <p className="text-xs text-slate-400">Lectura oficial de boletines de la Liga Marplatense de Fútbol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Subida de Archivo y Configuración Inicial */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Arrastrar / Seleccionar PDF */}
            <div className="md:col-span-2 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-6 transition-all bg-slate-950/30 flex flex-col items-center justify-center text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload-input"
              />
              <label
                htmlFor="pdf-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center w-full"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-emerald-400" />
                </div>
                {file ? (
                  <div>
                    <p className="font-semibold text-emerald-400">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB • Haz clic para cambiar archivo</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-slate-200">Arrastra tu boletín PDF aquí o <span className="text-emerald-400 underline">examina tus archivos</span></p>
                    <p className="text-xs text-slate-400 mt-1">Soporta boletines semanales oficiales (páginas 2 y 3)</p>
                  </div>
                )}
              </label>
            </div>

            {/* Configuración de Torneo y Fecha */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-center">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Torneo Destino</label>
                <select
                  value={tournamentId}
                  onChange={(e) => setTournamentId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {tournaments.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.year})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Número de Fecha (Round)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={roundNumber}
                    onChange={(e) => setRoundNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {parseSummary?.roundNumber && (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1.5 rounded-lg whitespace-nowrap">
                      Detectada: Fecha {parseSummary.roundNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Loader de Procesamiento */}
          {isLoading && (
            <div className="flex items-center justify-center p-8 space-x-3 text-emerald-400">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="font-medium text-slate-200">Leyendo y extrayendo resultados de las páginas del PDF...</span>
            </div>
          )}

          {/* Mensajes de Error */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Reporte de Simulación o Guardado Exitoso */}
          {saveSuccessReport && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-base">
                <CheckCircle2 className="w-5 h-5" />
                ¡Resultados Importados Correctamente!
              </div>
              <p>Se actualizaron **{saveSuccessReport.updatedCount} partidos** en el fixture de la Fecha {roundNumber}.</p>
              {saveSuccessReport.errors.length > 0 && (
                <div className="mt-2 text-xs text-amber-300 bg-slate-900/60 p-3 rounded-lg max-h-32 overflow-y-auto space-y-1">
                  <p className="font-semibold text-amber-400">Advertencias / Observaciones ({saveSuccessReport.errors.length}):</p>
                  {saveSuccessReport.errors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {simulationReport && !saveSuccessReport && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400 text-base">
                <Info className="w-5 h-5" />
                Resultado de la Simulación (Ningún dato fue guardado aún)
              </div>
              <p>Se identificaron **{simulationReport.updatedCount} partidos coincidentes** listos para actualizar en la Fecha {roundNumber}.</p>
              {simulationReport.errors.length > 0 && (
                <div className="mt-2 text-xs text-amber-300 bg-slate-900/60 p-3 rounded-lg max-h-32 overflow-y-auto space-y-1">
                  <p className="font-semibold text-amber-400">Partidos no encontrados o ignorados ({simulationReport.errors.length}):</p>
                  {simulationReport.errors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Previsualización y Edición de Resultados Leídos */}
          {editableResults.length > 0 && (
            <div className="space-y-4">
              
              {/* Tarjetas de Resumen Breve */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="block text-xs text-slate-400 uppercase font-semibold">Total Leídos</span>
                  <span className="text-xl font-bold text-white">{editableResults.length}</span>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="block text-xs text-emerald-400 uppercase font-semibold">Jugados</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {editableResults.filter(r => !r.isPostponed && !r.isNoShow).length}
                  </span>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="block text-xs text-amber-400 uppercase font-semibold">Pospuestos (post)</span>
                  <span className="text-xl font-bold text-amber-400">
                    {editableResults.filter(r => r.isPostponed).length}
                  </span>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="block text-xs text-rose-400 uppercase font-semibold">No Presentó (NP)</span>
                  <span className="text-xl font-bold text-rose-400">
                    {editableResults.filter(r => r.isNoShow).length}
                  </span>
                </div>
              </div>

              {/* Filtros de la Tabla */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400">División:</span>
                    <select
                      value={filterDivision}
                      onChange={(e) => setFilterDivision(e.target.value)}
                      className="bg-transparent text-white font-medium focus:outline-none"
                    >
                      <option value="all" className="bg-slate-900">Todas (7ª a 16ª)</option>
                      {[7,8,9,10,11,12,13,14,15,16].map(d => (
                        <option key={d} value={d.toString()} className="bg-slate-900">{d}ª División</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
                    <span className="text-slate-400">Zona:</span>
                    <select
                      value={filterZone}
                      onChange={(e) => setFilterZone(e.target.value)}
                      className="bg-transparent text-white font-medium focus:outline-none"
                    >
                      <option value="all" className="bg-slate-900">Todas las Zonas</option>
                      <option value="CAMPEONATO" className="bg-slate-900">Campeonato</option>
                      <option value="PROMOCION" className="bg-slate-900">Promoción</option>
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar equipo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
                  />
                </div>
              </div>

              {/* Tabla Editable de Resultados */}
              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold sticky top-0 border-b border-slate-800 z-10">
                    <tr>
                      <th className="py-2.5 px-3">División / Zona</th>
                      <th className="py-2.5 px-3 text-right">Equipo Local</th>
                      <th className="py-2.5 px-3 text-center w-36">Resultado Leído (Editable)</th>
                      <th className="py-2.5 px-3">Equipo Visitante</th>
                      <th className="py-2.5 px-3 text-center">Estado PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {filteredResults.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        
                        {/* Division y Zona */}
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="font-bold text-slate-200">{item.divisionNumber}ª Div</span>
                          <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.zone === 'CAMPEONATO' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {item.zone}
                          </span>
                        </td>

                        {/* Local */}
                        <td className="py-2 px-3 text-right font-medium text-white whitespace-nowrap">
                          {item.homeTeamCanonical}
                        </td>

                        {/* Goles (Campos Editables) */}
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          {item.isPostponed ? (
                            <button
                              onClick={() => handleTogglePostponed(item.id)}
                              className="text-[11px] text-amber-400 hover:underline bg-amber-500/10 px-2 py-1 rounded"
                            >
                              POST (Pospuesto) - Haz clic para activar
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min={0}
                                max={30}
                                value={item.homeGoals ?? ''}
                                onChange={(e) => handleGoalChange(item.id, 'homeGoals', e.target.value)}
                                className="w-10 text-center bg-slate-950 border border-slate-700 rounded px-1 py-1 font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                              />
                              <span className="text-slate-500 font-bold">-</span>
                              <input
                                type="number"
                                min={0}
                                max={30}
                                value={item.awayGoals ?? ''}
                                onChange={(e) => handleGoalChange(item.id, 'awayGoals', e.target.value)}
                                className="w-10 text-center bg-slate-950 border border-slate-700 rounded px-1 py-1 font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                          )}
                        </td>

                        {/* Visitante */}
                        <td className="py-2 px-3 font-medium text-white whitespace-nowrap">
                          {item.awayTeamCanonical}
                        </td>

                        {/* Badge de Estado */}
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          {item.isPostponed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                              Pospuesto (post)
                            </span>
                          ) : item.isNoShow ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">
                              No Presentación (NP $\rightarrow$ 0)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                              Normal
                            </span>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
          >
            Cancelar
          </button>

          {editableResults.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSimulate}
                disabled={isSaving}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4 text-amber-400" />
                Simular Carga
              </button>

              <button
                onClick={handleConfirmSave}
                disabled={isSaving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardando en BD...' : `Confirmar e Importar ${editableResults.length} Resultados`}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
