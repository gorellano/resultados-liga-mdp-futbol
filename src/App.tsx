import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { HomePage } from './pages/HomePage';
import { DivisionPage } from './pages/DivisionPage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminPage } from './pages/AdminPage';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Layout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 text-foreground transition-colors duration-500">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl flex h-16 items-center justify-between px-4 sm:px-8 mx-auto">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block tracking-tight">Resultados LMF</span>
          </Link>
          <div className="flex items-center space-x-6">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-muted/50 hover:bg-muted transition-all duration-300 hover:scale-105"
              aria-label="Toggle theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <Link to="/admin" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 md:py-10">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 sm:px-8 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Resultados LMF. Todos los derechos reservados.
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
          <Route path="/division/:name" element={<DivisionPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
