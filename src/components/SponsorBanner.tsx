import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Sponsor } from '../lib/types';
import { ExternalLink, Mail, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function SponsorBanner() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isDecember = new Date().getMonth() === 11;
  const logoSrc = isDecember ? '/logo_costa_y_gol_navidad.png' : '/logo_costa_y_gol.png';

  useEffect(() => {
    async function fetchSponsors() {
      try {
        // Verificar si la configuración global permite mostrar sponsors
        const { data: settings } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'show_sponsors')
          .single();

        const showSponsors = settings?.value === 'true' || settings?.value === true;
        if (!showSponsors) {
          setIsVisible(false);
          return;
        }

        // Obtener sponsors activos
        const { data: activeSponsors, error } = await supabase
          .from('sponsors')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!error && activeSponsors && activeSponsors.length > 0) {
          setSponsors(activeSponsors);
          setIsVisible(true);
        }
      } catch (e) {
        console.error('Error fetching sponsors', e);
      }
    }

    fetchSponsors();
  }, []);

  useEffect(() => {
    if (sponsors.length <= 1) return;

    // Rotar cada 5 segundos si hay múltiples sponsors
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sponsors]);

  if (!isVisible || sponsors.length === 0) return null;

  const currentSponsor = sponsors[currentIndex];

  // Detectar si el sponsor actual es la publicidad propia de Costa y Gol para optimizarlo en mobile
  const isCostaYGolPromo =
    currentSponsor.name.toLowerCase().includes('costa y gol') ||
    currentSponsor.name.toLowerCase().includes('publicita') ||
    currentSponsor.link_url?.includes('costaygolmdq@gmail.com') ||
    currentSponsor.image_url?.includes('sponsor_costa_y_gol');

  const bannerContent = (
    <>
      {/* 1. VERSIÓN MOBILE (< sm): Card responsiva de alta legibilidad */}
      <div className="block sm:hidden w-full">
        {isCostaYGolPromo ? (
          <div className="relative w-full bg-gradient-to-br from-[#07172c] via-[#0b2242] to-[#07172c] rounded-2xl p-3 border border-amber-500/35 shadow-md overflow-hidden group">
            {/* Efectos de luz de fondo */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/15 blur-xl pointer-events-none" />
            <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-amber-500/15 blur-xl pointer-events-none" />

            <div className="relative flex items-center gap-3">
              {/* Escudo Costa y Gol */}
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-center shrink-0 p-1 shadow-inner">
                <img
                  src={logoSrc}
                  alt="Costa y Gol"
                  className="w-full h-full object-contain drop-shadow"
                />
              </div>

              {/* Textos Informativos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[9px] font-black uppercase tracking-wider text-amber-300">
                    <Sparkles className="w-2.5 h-2.5" />
                    Espacio Publicitario
                  </span>
                </div>
                <h4 className="text-xs font-black text-white leading-tight">
                  ¿Querés publicitar en la página?
                </h4>
                <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                  Llegá a toda la comunidad del fútbol marplatense
                </p>
              </div>
            </div>

            {/* Botón de Contacto / CTA */}
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold text-slate-300 flex items-center gap-1">
                Escribinos por tu anuncio
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-black shadow-xs active:scale-95 transition-transform">
                <Mail className="w-3 h-3" />
                <span>costaygolmdq@gmail.com</span>
              </span>
            </div>
          </div>
        ) : (
          /* Sponsor externo en mobile: tarjeta con altura apropiada y contención */
          <div className="relative w-full h-[84px] bg-[#091d38] rounded-2xl overflow-hidden border border-border/70 shadow-xs flex items-center justify-center p-2">
            <img
              src={currentSponsor.image_url}
              alt={currentSponsor.name}
              className="w-full h-full object-contain"
            />
            <span className="absolute top-1.5 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white uppercase tracking-wider">
              Publicidad
            </span>
            {currentSponsor.link_url && (
              <span className="absolute bottom-1.5 right-2 px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-bold flex items-center gap-1 shadow-xs">
                Visitar <ExternalLink className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2. VERSIÓN DESKTOP (>= sm): Banner horizontal amplio de 118px */}
      <div className="hidden sm:flex relative w-full sm:h-[118px] bg-[#091d38] rounded-3xl overflow-hidden border border-border/60 shadow-xs group items-center justify-center">
        <img
          src={currentSponsor.image_url}
          alt={currentSponsor.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {currentSponsor.link_url && (
          <div className="absolute bottom-2.5 right-3 bg-background/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xs">
            Contactar / Visitar <ExternalLink className="w-3 h-3" />
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="w-full max-w-4xl mx-auto my-1 sm:my-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSponsor.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
        >
          {currentSponsor.link_url ? (
            <a
              href={currentSponsor.link_url}
              target={currentSponsor.link_url.startsWith('mailto:') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="block cursor-pointer active:scale-[0.99] transition-transform"
            >
              {bannerContent}
            </a>
          ) : (
            bannerContent
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}