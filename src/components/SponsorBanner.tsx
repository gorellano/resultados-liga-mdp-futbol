import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Sponsor } from '../lib/types';
import { ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function SponsorBanner() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchSponsors() {
      try {
        // First, check if global setting allows showing sponsors
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

        // Fetch active sponsors
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
    
    // Rotate every 5 seconds if multiple sponsors
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sponsors]);

  if (!isVisible || sponsors.length === 0) return null;

  const currentSponsor = sponsors[currentIndex];

  const content = (
    <div className="relative w-full h-32 md:h-40 bg-muted/30 rounded-xl overflow-hidden border border-border/50 group flex items-center justify-center">
      <img 
        src={currentSponsor.image_url} 
        alt={currentSponsor.name} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {currentSponsor.link_url && (
         <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur text-xs px-2 py-1 rounded-md flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           Visitar sitio <ExternalLink className="w-3 h-3" />
         </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
       <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-semibold">Sponsor Oficial</div>
       <AnimatePresence mode="wait">
          <motion.div
            key={currentSponsor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {currentSponsor.link_url ? (
              <a href={currentSponsor.link_url} target="_blank" rel="noopener noreferrer" className="block">
                {content}
              </a>
            ) : (
              content
            )}
          </motion.div>
       </AnimatePresence>
    </div>
  );
}
