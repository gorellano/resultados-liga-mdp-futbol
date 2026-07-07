import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Lock, Mail, CheckCircle2, Shirt, Trophy } from 'lucide-react';
import { useState } from 'react';
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
import { ContactModal } from './components/ContactModal';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Layout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleContactSuccess = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 text-foreground transition-colors duration-500">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl flex h-16 items-center justify-between px-4 sm:px-8 mx-auto">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-all duration-300 overflow-hidden border border-border/50 shadow-inner group-hover:scale-105">
              <img src="/logo_costa_y_gol.png" alt="Costa y Gol" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">Costa y Gol</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/campeones"
              className="p-2.5 rounded-full bg-muted/50 hover:bg-muted transition-all duration-300 hover:scale-105 text-muted-foreground hover:text-primary flex items-center justify-center"
              aria-label="Salón de la Fama"
              title="Campeones"
            >
              <Trophy className="w-5 h-5" />
            </Link>
            <Link
              to="/equipos"
              className="p-2.5 rounded-full bg-muted/50 hover:bg-muted transition-all duration-300 hover:scale-105 text-muted-foreground hover:text-primary flex items-center justify-center"
              aria-label="Directorio de Equipos"
              title="Equipos"
            >
              <Shirt className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="p-2.5 rounded-full bg-muted/50 hover:bg-muted transition-all duration-300 hover:scale-105 text-muted-foreground hover:text-primary"
              aria-label="Contact us"
              title="Contacto"
            >
              <Mail className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-muted/50 hover:bg-muted transition-all duration-300 hover:scale-105"
              aria-label="Toggle theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <Link
              to="/admin"
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/10"
              title="Panel de Administración"
            >
              <Lock className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>
      
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

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 md:py-10">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>
      <footer className="border-t border-border py-8 bg-muted/10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} Costa y Gol. Todos los derechos reservados.
          </p>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://www.facebook.com/share/185R7osMKw/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook Costa y Gol"
              className="p-2 rounded-full bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.react.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a 
              href="https://www.instagram.com/costaygol/"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram Costa y Gol"
              className="p-2 rounded-full bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.react.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a 
              href="https://www.youtube.com/@CostayGol"
              target="_blank"
              rel="noopener noreferrer"
              title="YouTube Costa y Gol"
              className="p-2 rounded-full bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.react.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
            </a>
          </div>
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
          <Route path="/division/:name" element={<DivisionPage />} />
          <Route path="/equipos" element={<TeamsPage />} />
          <Route path="/campeones" element={<CampeonesPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
