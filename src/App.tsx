import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { HomePage } from './pages/HomePage';
import { DivisionPage } from './pages/DivisionPage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminPage } from './pages/AdminPage';
import { TeamsPage } from './pages/TeamsPage';
import { CampeonesPage } from './pages/CampeonesPage';
import { H2HPage } from './pages/H2HPage';
import { TablaAnualPage } from './pages/TablaAnualPage';
import { ContactModal } from './components/ContactModal';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Layout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Sincronizar clase CSS al montar y cuando cambie el tema
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const handleContactSuccess = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 text-foreground transition-colors duration-500">
      <Navbar
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onOpenContact={() => setIsContactModalOpen(true)}
      />
      
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        onSuccess={handleContactSuccess} 
      />

      {/* Push notification (Toast) */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 backdrop-blur-md rounded-full shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold text-sm">Mensaje enviado exitosamente</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 md:py-10 pb-24 md:pb-10">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>
      <footer className="border-t border-border/60 py-8 pb-28 sm:pb-8 bg-muted/10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 dark:bg-muted/30 backdrop-blur-md rounded-full border border-border/50 shadow-sm order-1 sm:order-2">
            <a 
              href="https://www.facebook.com/share/185R7osMKw/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook Costa y Gol"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all active:scale-90"
            >
              <svg xmlns="http://www.react.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a 
              href="https://www.instagram.com/costaygol/"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram Costa y Gol"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all active:scale-90"
            >
              <svg xmlns="http://www.react.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a 
              href="https://www.youtube.com/@CostayGol"
              target="_blank"
              rel="noopener noreferrer"
              title="YouTube Costa y Gol"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all active:scale-90"
            >
              <svg xmlns="http://www.react.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
            </a>
          </div>

          <p className="text-xs text-muted-foreground/75 text-center sm:text-left order-2 sm:order-1">
            &copy; {new Date().getFullYear()} Costa y Gol · Liga Marplatense de Fútbol. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tabla-anual" element={<TablaAnualPage />} />
          <Route path="/tabla-general" element={<TablaAnualPage />} />
          <Route path="/division/:name" element={<DivisionPage />} />
          <Route path="/equipos" element={<TeamsPage />} />
          <Route path="/campeones" element={<CampeonesPage />} />
          <Route path="/h2h" element={<H2HPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
