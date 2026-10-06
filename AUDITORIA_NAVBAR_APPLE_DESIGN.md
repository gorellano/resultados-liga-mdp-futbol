# Auditoría & Rediseño de Navbar — Costa y Gol (Liga MdP Fútbol)
> **Basado en la skill `apple-design` (Emil Kowalski / WWDC Design Guidelines)**  
> **Proyecto:** `resultados-liga-mdp-futbol` (Costa y Gol · Liga Marplatense de Fútbol)  
> **Ubicación actual del Header:** `src/App.tsx` (Líneas 58-123)  
> **Propuesta modular:** `src/components/Navbar.tsx`  
> **Fecha:** Octubre 2026

---

## 1. Diagnóstico: "Smells" de Plantilla Genérica en Costa y Gol

El encabezado actual de navegación de la aplicación de fútbol marplatense presenta claros síntomas de "código de plantilla / boilerplate estándar" que desentonan con una experiencia digital premium y deportiva:

| Elemento Actual | Patrón de Plantilla Genérica | Problema Físico / Óptico (Apple Design) |
| :--- | :--- | :--- |
| **"Sopa de Iconos" Circulares** (`Award`, `Swords`, `Trophy`, `Shirt`, `Mail`) | 6 botones circulares idénticos (`p-2.5 rounded-full bg-muted/50 hover:bg-muted`) apretados uno al lado del otro. | **Falta de jerarquía y contexto:** Parece un set de iconos de prueba. En escritorio no tienen etiquetas ni peso visual. En móvil se amontonan horizontalmente en la parte superior, violando la zona ergonómica del pulgar (*thumb zone*). |
| **Ausencia de Wayfinding** (Ubicación activa) | Los enlaces son estáticos; no existe ninguna indicación visual de en qué sección se encuentra el usuario. | **Viola el principio de Wayfinding (§16):** El usuario no sabe si está en la Tabla Anual, Modo H2H, Campeones o Equipos. Falta un **Segmented Pill** con física de resorte que siga el cambio de ruta. |
| **Toggle de Tema con Emojis Crudos** (`{darkMode ? '☀️' : '🌙'}`) | Inserción directa de emojis dentro de un botón circular con CSS `transition-all duration-300`. | **Plantilla de tutorial básico:** Los emojis nativos tienen colores chillones y no encajan con la paleta tipográfica. Falta un control físico con micro-animación vectorial y rotación elástica en `pointer-down`. |
| **Material y Translucidez Plana** (`bg-background/60 backdrop-blur-xl border-b border-border/50`) | Desenfocado estándar sin compensación de color ni captura de luz. | **Falta de Vibrancy (§12):** En partidos y fotos de cancha, el fondo se ve lavado o grisáceo. Falta `saturate(180%)` y el bisel de luz superior (*specular highlight rim*). El borde inferior de 1px plano corta visualmente el scroll de forma tosca. |
| **Comportamiento Táctil Lento** (`transition-all duration-300 hover:scale-105`) | Transiciones lineales y lentas que reaccionan al hover de escritorio. | **Falta de respuesta inmediata (§1):** Cero reacción en `pointer-down`. No hay compresión física (`active:scale-[0.96]`) ni resortes continuos (`damping: 1.0`). |
| **Acceso Admin Rígido** | Botón plano tipo enlace con hover sutil en esquina derecha (`Lock className="h-4 w-4"`). | Poca distinción de rol. No aprovecha el concepto de cápsula funcional discreta y elegante. |

---

## 2. Principios de Apple Design Aplicados al Rediseño

### A. Materiales Líquidos & Vibrancy (§12)
* **Frosted Glass Vibrante:** Se aplica `backdrop-filter: blur(24px) saturate(190%)` con un fondo translúcido que permite ver sutilmente los colores del césped, camisetas y tablas cuando el usuario se desplaza.
* **Borde Especular (Luz Cenital):** Borde superior interno reflectivo `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.2)` en modo claro y `rgba(255, 255, 255, 0.12)` en modo oscuro, simulando un cristal biselado.
* **Scroll-Adaptive Depth:** La barra superior se aligera cuando está al inicio de la página y adquiere mayor densidad y sombra de oclusión al hacer scroll.

### B. Segmented Control & Wayfinding con Resortes (§3, §4, §16)
* En escritorio, las secciones clave (**Tabla**, **Versus**, **Campeones**, **Equipos**) se agrupan en una cápsula unificada (*Segmented Navigation Island*).
* El indicador de sección activa utiliza `layoutId` de **Framer Motion** con amortiguación crítica (`damping: 30, stiffness: 350`), moviéndose suavemente sin saltos ni cortes de animación (*interruptible physics*).

### C. Ergonomía Móvil: Tab Bar Flotante Inferior (§5, §10)
* En dispositivos móviles (iPhone / Android), los hinchas y jugadores consultan la app de pie en la cancha con una sola mano.
* Se implementa un **Floating Island Tab Bar** inferior con soporte para `env(safe-area-inset-bottom)`, permitiendo navegar entre secciones con el pulgar instantáneamente, mientras el encabezado superior queda limpio con el logo, contacto, modo oscuro y acceso admin.

### D. Eliminación de Latencia y Feedback Físico (§1)
* Todos los botones responden inmediatamente en el evento de presión con micro-compresión física (`active:scale-[0.94]`).
* El interruptor de tema pasa a utilizar iconos vectoriales pulidos (`Sun` / `Moon` de Lucide) con transición geométrica suave.

---

## 3. Especificación del Componente Modular `src/components/Navbar.tsx`

A continuación se detalla la implementación lista para añadir al proyecto:

```tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Award, 
  Swords, 
  Trophy, 
  Shirt, 
  Mail, 
  Sun, 
  Moon, 
  Lock, 
  Home
} from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenContact: () => void;
}

// Configuración de resortes Apple (Amortiguación Crítica sin oscilación innecesaria)
const appleSpring = {
  type: 'spring' as const,
  damping: 30,
  stiffness: 360,
  mass: 0.8,
};

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleTheme,
  onOpenContact,
}) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Definición de destinos principales con sus iconos
  const navItems = [
    { to: '/', label: 'Inicio', icon: Home, exact: true },
    { to: '/tabla-general', label: 'Tabla', icon: Award },
    { to: '/h2h', label: 'Versus', icon: Swords },
    { to: '/campeones', label: 'Campeones', icon: Trophy },
    { to: '/equipos', label: 'Equipos', icon: Shirt },
  ];

  const isCurrentActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* 1. Header Superior (Desktop & Mobile Chrome) */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-background/75 backdrop-blur-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.4)]'
            : 'bg-background/60 backdrop-blur-xl'
        } border-b border-border/40`}
        style={{
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
          backdropFilter: 'blur(24px) saturate(190%)',
          boxShadow: darkMode
            ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
            : 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
        }}
      >
        <div className="max-w-6xl flex h-16 items-center justify-between px-4 sm:px-8 mx-auto">
          
          {/* Brand Logo con Escala Óptica */}
          <Link
            to="/"
            className="flex items-center space-x-3 group focus:outline-none transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-border/50 bg-primary/5 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200">
              <img
                src="/logo_costa_y_gol.png"
                alt="Costa y Gol"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 leading-none">
                Costa y Gol
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-muted-foreground mt-0.5">
                Liga Marplatense
              </span>
            </div>
          </Link>

          {/* 2. Desktop Segmented Navigation Control */}
          <nav className="hidden md:flex items-center p-1 bg-muted/60 dark:bg-muted/40 rounded-full border border-border/60 shadow-inner">
            {navItems.map((item) => {
              const active = isCurrentActive(item.to, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-colors duration-150 flex items-center space-x-1.5 active:scale-95 ${
                    active
                      ? 'text-primary dark:text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      transition={appleSpring}
                      className="absolute inset-0 bg-background rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-border/50"
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. Action Tools: Contacto, Tema, Admin */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Botón Contacto */}
            <button
              onClick={onOpenContact}
              className="p-2.5 rounded-full bg-muted/50 hover:bg-muted border border-border/50 text-muted-foreground hover:text-primary transition-all active:scale-90"
              aria-label="Contacto"
              title="Contacto"
            >
              <Mail className="w-4 h-4" />
            </button>

            {/* Toggle Tema con feedback físico */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-full bg-muted/50 hover:bg-muted border border-border/50 text-foreground transition-all active:scale-90"
              aria-label="Alternar tema claro/oscuro"
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Acceso Admin */}
            <Link
              to="/admin"
              className="p-2.5 rounded-full bg-muted/50 hover:bg-muted border border-border/50 text-muted-foreground hover:text-primary transition-all active:scale-90 flex items-center justify-center"
              title="Panel de Administración"
              aria-label="Panel de Administración"
            >
              <Lock className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 4. Tab Bar Flotante Inferior para Móvil (iOS Style Glass Island) */}
      <nav
        aria-label="Navegación móvil"
        className="md:hidden fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-border/60 bg-background/80 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-1.5"
        style={{
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
          backdropFilter: 'blur(24px) saturate(190%)',
          boxShadow: darkMode
            ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 8px 30px rgba(0, 0, 0, 0.6)'
            : 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6), 0 8px 24px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const active = isCurrentActive(item.to, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-semibold tracking-tight transition-all active:scale-90 ${
                  active
                    ? 'text-primary dark:text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="mobileActivePill"
                    transition={appleSpring}
                    className="absolute inset-0 bg-primary/10 dark:bg-white/10 rounded-xl"
                    style={{ zIndex: -1 }}
                  />
                )}
                <Icon className={`w-4 h-4 mb-0.5 ${active ? 'scale-110' : 'opacity-70'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
```

---

## 4. Instrucciones para Reemplazar en `src/App.tsx`

1. **Crear el componente:** Guardar el código anterior en `src/components/Navbar.tsx`.
2. **Importar en `src/App.tsx`:**
   ```tsx
   import { Navbar } from './components/Navbar';
   ```
3. **Reemplazar el `<header>` actual (líneas 58-123) por:**
   ```tsx
   <Navbar 
     darkMode={darkMode}
     onToggleTheme={toggleTheme}
     onOpenContact={() => setIsContactModalOpen(true)}
   />
   ```
4. **Padding inferior para móvil:** En `main` de `src/App.tsx`, agregar `pb-24 md:pb-10` para dejar espacio libre sobre el Tab Bar flotante inferior en pantallas móviles.

---

## 5. Checklist de Verificación de Calidad

- [ ] **Wayfinding Óptico:** Al cambiar de página (`/tabla-general`, `/h2h`, etc.), la pastilla activa se desliza fluidamente sin parpadeos ni reinicios bruscos.
- [ ] **Respuesta Háptica en Pantalla Táctil:** Al pulsar sobre cualquier control o icono, se produce la micro-compresión física inmediata (`scale: 0.90 - 0.95`).
- [ ] **Material Translúcido:** Los gradientes y contenido detrás del navbar se difuminan con saturación viva (`saturate(190%)`).
- [ ] **Bisel de Luz:** Verificación de luz cenital en el borde superior sin líneas duras en el límite inferior.
