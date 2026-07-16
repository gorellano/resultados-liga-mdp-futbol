import { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { 
  fetchTournaments, 
  fetchDivisions, 
  fetchZones, 
  fetchTeams, 
  fetchMatches 
} from '../lib/db';
import { calculateStandings } from '../lib/standings';
import type { Team, Match, Tournament, Division, Zone, Standing } from '../lib/types';
import { Download, RefreshCw, Sparkles } from 'lucide-react';

export function SocialMediaGenerator() {
  // Data lists
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  // Selection states
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<number>(1);

  // Computed / calculated data
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // Load initial master data
  useEffect(() => {
    async function loadMasterData() {
      setLoading(true);
      try {
        const [tournsData, divsData, zonesData, teamsData] = await Promise.all([
          fetchTournaments(),
          fetchDivisions(),
          fetchZones(),
          fetchTeams()
        ]);

        setTournaments(tournsData);
        setDivisions(divsData);
        setZones(zonesData);
        setTeams(teamsData);

        if (tournsData.length > 0) setSelectedTournamentId(tournsData[0].id);
        if (divsData.length > 0) setSelectedDivisionId(divsData[0].id);
        if (zonesData.length > 0) setSelectedZoneId(zonesData[0].id);
      } catch (err) {
        console.error('Error cargando datos para generador:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMasterData();
  }, []);

  // Fetch matches when selections change
  useEffect(() => {
    if (!selectedTournamentId || !selectedDivisionId || !selectedZoneId) return;

    async function loadMatchesData() {
      setLoading(true);
      try {
        const matchesData = await fetchMatches(selectedDivisionId, selectedZoneId, selectedTournamentId);
        setMatches(matchesData);

        // Auto-select the maximum round number by default
        if (matchesData.length > 0) {
          const rounds = Array.from(new Set(matchesData.map(m => m.round_number)));
          const maxRound = Math.max(...rounds, 1);
          setSelectedRound(maxRound);
        } else {
          setSelectedRound(1);
        }
      } catch (err) {
        console.error('Error cargando partidos para generador:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatchesData();
  }, [selectedTournamentId, selectedDivisionId, selectedZoneId]);

  // Calculate standings up to the current date / all matches
  useEffect(() => {
    if (teams.length === 0) return;
    const computed = calculateStandings(matches, teams);
    setStandings(computed);
  }, [matches, teams]);

  // Unique rounds available in matches
  const availableRounds = Array.from(new Set(matches.map(m => m.round_number))).sort((a, b) => a - b);

  // Filter matches for the selected round
  const roundMatches = matches.filter(m => m.round_number === selectedRound);

  // Get display names
  const divisionName = divisions.find(d => d.id === selectedDivisionId)?.name || '';
  const zoneName = zones.find(z => z.id === selectedZoneId)?.name || '';

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      // Force images load check
      const images = previewRef.current.getElementsByTagName('img');
      const loadPromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(loadPromises);

      // Wait a short delay to ensure rendering completes
      await new Promise(resolve => setTimeout(resolve, 300));

      const dataUrl = await toPng(previewRef.current, {
        quality: 0.95,
        pixelRatio: 2, // High resolution scale for premium text quality
        cacheBust: true,
      });

      const link = document.createElement('a');
      const cleanDiv = divisionName.toLowerCase().replace(/\s+/g, '-');
      const cleanZone = zoneName.toLowerCase().replace(/\s+/g, '-');
      link.download = `costaygol-placa-${cleanDiv}-${cleanZone}-fecha-${selectedRound}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exportando placa:', err);
      alert('Hubo un error al generar la placa de imagen.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Selectors */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center border-b border-border/50 pb-5">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-blue-500 w-6 h-6 animate-pulse" />
            Generador de Placas para Redes
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Elegí la fecha, división y zona para generar un post combinado (Resultados + Top 5) listo para Instagram.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={loading || matches.length === 0 || downloading}
          className="w-full xl:w-auto px-6 py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          {downloading ? 'Generando...' : 'Descargar'}
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-card border border-border/50 p-5 rounded-3xl shadow-sm">
        {/* Torneo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Torneo</label>
          <select
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="bg-background border border-border/60 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold"
          >
            {tournaments.map(t => (
              <option key={t.id} value={t.id}>{t.name} {t.year}</option>
            ))}
          </select>
        </div>

        {/* División */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">División</label>
          <select
            value={selectedDivisionId}
            onChange={(e) => setSelectedDivisionId(e.target.value)}
            className="bg-background border border-border/60 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold"
          >
            {divisions.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Zona */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Zona</label>
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            className="bg-background border border-border/60 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold"
          >
            {zones.map(z => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Fecha</label>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(Number(e.target.value))}
            disabled={availableRounds.length === 0}
            className="bg-background border border-border/60 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold disabled:opacity-60"
          >
            {availableRounds.length > 0 ? (
              availableRounds.map(r => (
                <option key={r} value={r}>Fecha {r}</option>
              ))
            ) : (
              <option value="1">Sin fechas cargadas</option>
            )}
          </select>
        </div>
      </div>

      {/* Main Preview Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border/50 rounded-3xl shadow-sm text-muted-foreground">
          <RefreshCw className="w-10 h-10 animate-spin text-primary mb-3" />
          <span className="text-sm font-semibold">Cargando partidos y posiciones...</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border/50 rounded-3xl shadow-sm text-center p-6 text-muted-foreground">
          <RefreshCw className="w-12 h-12 text-slate-350 mb-4" />
          <h3 className="font-bold text-lg text-foreground">No hay datos para esta combinación</h3>
          <p className="text-sm max-w-md mt-1">
            Asegurate de haber configurado partidos en la sección de Fixture para esta división, zona y torneo.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden min-h-[550px]">
          <span className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">
            Vista Previa de la Placa
          </span>

          {/* Scale wrapper to fit standard screen sizes */}
          <div className="w-full flex justify-center items-center overflow-auto p-4 bg-muted/30 border border-border/40 rounded-2xl">
            <div className="origin-center scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-90 xl:scale-100 py-10 shrink-0">
              
              {/* Placa node targeted by html-to-image. Dynamic height for 7+ matches */}
              <div 
                ref={previewRef}
                id="placa-instagram" 
                className="w-[800px] bg-gradient-to-br from-slate-50 via-white to-blue-50/40 text-slate-900 flex flex-col p-8 font-sans relative shadow-lg border border-slate-200 overflow-hidden"
                style={{ minHeight: '800px' }}
              >
                {/* Background Watermark Logo — centered over the full card */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                  <img src="/logo_costa_y_gol.png" alt="" className="w-[520px] h-[520px] object-contain opacity-[0.07]" />
                </div>

                {/* ── HEADER ── */}
                <div className="flex items-center space-x-5 border-b-4 border-blue-600 pb-5 relative z-10">
                  <div className="w-20 h-20 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-center p-1 shadow-sm shrink-0">
                    <img 
                      src="/logo_costa_y_gol.png" 
                      alt="Costa y Gol" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-black text-blue-600 uppercase tracking-tight leading-tight">
                      FECHA {selectedRound} — {divisionName}
                    </h1>
                    <p className="text-lg font-bold text-slate-500 uppercase tracking-wide mt-0.5">
                      ({zoneName})
                    </p>
                  </div>
                </div>

                {/* ── CONTENT BODY ── */}
                <div className="flex flex-1 mt-6 gap-6 relative z-10">
                  
                  {/* LEFT COLUMN: Results */}
                  <div className="w-[50%] flex flex-col border-r border-slate-200 pr-5">
                    <div className="bg-blue-600 text-white font-black text-center py-2.5 rounded-lg text-sm uppercase tracking-wider mb-4 shrink-0 shadow-sm">
                      Resultados de la Fecha
                    </div>

                    {/* Dynamic spacing: tighter when 7+ matches to ensure all fit */}
                    <div className={`flex-1 pr-1 ${ roundMatches.length >= 7 ? 'space-y-2' : 'space-y-3.5' }`}>
                      {roundMatches.map(match => {
                        const home = teams.find(t => t.id === match.home_team_id);
                        const away = teams.find(t => t.id === match.away_team_id);
                        if (!home || !away) return null;
                        // Smaller shields when 7+ matches so everything fits
                        const isCompact = roundMatches.length >= 7;
                        const shieldSize = isCompact ? 'w-[40px] h-[40px]' : 'w-[50px] h-[50px]';
                        const cardPad = isCompact ? 'p-2' : 'p-3';
                        const scoreSize = isCompact ? 'text-xl' : 'text-2xl';

                        return (
                          <div 
                            key={match.id} 
                            className={`bg-slate-50 border border-slate-100 rounded-xl ${cardPad} flex items-center justify-between shadow-sm`}
                          >
                            {/* Home team circular shield */}
                            <div className="w-[30%] flex justify-center">
                              <div className={`${shieldSize} bg-white border border-slate-200/80 rounded-full flex items-center justify-center p-1.5 shadow-sm`}>
                                <img 
                                  src={home.logo_url || '/placeholder_shield.png'} 
                                  alt={home.name} 
                                  className="max-w-full max-h-full object-contain"
                                  crossOrigin="anonymous"
                                />
                              </div>
                            </div>

                            {/* Score */}
                            <div className="w-[40%] text-center">
                              {match.status === 'finished' ? (
                                <span className={`${scoreSize} font-black text-blue-600 tracking-wider`}>
                                  {match.home_goals} - {match.away_goals}
                                </span>
                              ) : (
                                <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
                                  vs
                                </span>
                              )}
                            </div>

                            {/* Away team circular shield */}
                            <div className="w-[30%] flex justify-center">
                              <div className={`${shieldSize} bg-white border border-slate-200/80 rounded-full flex items-center justify-center p-1.5 shadow-sm`}>
                                <img 
                                  src={away.logo_url || '/placeholder_shield.png'} 
                                  alt={away.name} 
                                  className="max-w-full max-h-full object-contain"
                                  crossOrigin="anonymous"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Top 5 Standings */}
                  <div className="w-[50%] flex flex-col pl-1">
                    <div className="bg-blue-600 text-white font-black text-center py-2.5 rounded-lg text-sm uppercase tracking-wider mb-4 shrink-0 shadow-sm">
                      Tabla de Posiciones
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      {/* Standings list */}
                      <div className="space-y-2">
                        {/* Table Header */}
                        <div className="flex items-center justify-between text-xs font-black uppercase text-slate-450 tracking-wider px-3 pb-1 border-b border-slate-100">
                          <div className="flex items-center space-x-3">
                            <span className="w-6 text-center">Pos</span>
                            <span>Equipo</span>
                          </div>
                          <span>Pts</span>
                        </div>

                        {/* Top 5 rows */}
                        {standings.slice(0, 5).map((row, idx) => (
                          <div 
                            key={row.team.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                              idx === 0 
                                ? 'bg-amber-500/5 border border-amber-500/10' 
                                : 'bg-slate-50/50 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {/* Position */}
                              <span className={`w-6 text-center font-black text-sm ${
                                idx === 0 ? 'text-amber-500 text-base' : 'text-slate-400'
                              }`}>
                                #{idx + 1}
                              </span>
                              
                              {/* Shield */}
                              <div className="w-[34px] h-[34px] bg-white border border-slate-200 rounded-full flex items-center justify-center p-1 shadow-sm shrink-0">
                                <img 
                                  src={row.team.logo_url || '/placeholder_shield.png'} 
                                  alt={row.team.name} 
                                  className="max-w-full max-h-full object-contain"
                                  crossOrigin="anonymous"
                                />
                              </div>

                              {/* Short name */}
                              <span className={`font-bold text-sm tracking-tight ${
                                idx === 0 ? 'text-slate-900 font-extrabold' : 'text-slate-700'
                              }`}>
                                {row.team.display_name || row.team.name}
                              </span>
                            </div>

                            {/* Points */}
                            <span className={`font-black text-base px-2 ${
                              idx === 0 ? 'text-amber-600' : 'text-blue-600'
                            }`}>
                              {row.points}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer signatures */}
                      <div className="border-t border-slate-200/80 pt-4 flex items-center justify-between text-[11px] font-black text-slate-450 uppercase tracking-wider shrink-0 mt-4">
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          <span>#CostaYGol</span>
                          <span>#LMF</span>
                          <span>#MdP</span>
                          <span>#{divisionName.replace(/\s+/g, '')}</span>
                          <span>#{zoneName.replace(/\s+/g, '')}</span>
                        </div>
                        <span className="shrink-0">@costaygol</span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
