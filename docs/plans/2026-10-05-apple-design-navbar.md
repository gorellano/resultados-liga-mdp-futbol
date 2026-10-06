# Implementación de Navbar & Footer Apple Design — Costa y Gol

> **Goal:** Modularizar y modernizar la navegación de Costa y Gol convirtiéndola en un componente `Navbar.tsx` con estética Apple Design (vidrio líquido, vibrancy, control segmentado elástico y barra móvil ergonómica) y rediseñar la disposición del Footer para redes sociales.
>
> **Architecture:**
> 1. Extracción del `<header>` de `App.tsx` al componente modular `src/components/Navbar.tsx` con soporte para Segmented Pill en desktop y Floating Tab Bar en móvil.
> 2. Rediseño del `<footer>` en `App.tsx` integrando una cápsula estilizada para redes sociales con jerarquía móvil optimizada (redes arriba, copyright sutil abajo) y márgenes seguros anti-solapamiento.
>
> **Tech Stack:** React 19, React Router v7, Framer Motion, Tailwind CSS v4, Lucide React (todas ya instaladas en el proyecto). Cero dependencias adicionales.

---

### Verificación de Seguridad y Compatibilidad

- **¿Impacto en Base de Datos o Datos?** **0% (Ninguno)**. Este cambio es 100% de la capa de presentación visual frontend. No interactúa con Supabase, tablas SQL, esquemas, APIs ni endpoints de red.
- **¿Retrocompatibilidad?** **100% Retrocompatible**:
  - Mantiene exactamente las mismas rutas de navegación (`/`, `/tabla-general`, `/h2h`, `/campeones`, `/equipos`, `/admin`).
  - Mantiene la persistencia de tema `darkMode` en `localStorage`.
  - Mantiene los enlaces originales de Facebook, Instagram y YouTube.
  - Respeta las zonas seguras móviles (`env(safe-area-inset-bottom)`) para Capacitor (iOS y Android).
  - Incluye compatibilidad con `prefers-reduced-motion`.

---

## Tareas de Implementación

### Task 1: Crear `src/components/Navbar.tsx`

**Archivos:**
- Crear: `src/components/Navbar.tsx`

**Detalles de implementación:**
- Encabezado con Frosted Glass y saturación vibrante (`backdrop-filter: blur(24px) saturate(190%)`).
- Bisel superior especular reflectivo (`box-shadow: inset 0 1px 0 rgba(255,255,255,...))`).
- Segmented Control flotante en escritorio con indicador físico gobernado por resortes amortiguados críticamente (`damping: 30, stiffness: 360` con Framer Motion).
- Floating Island Tab Bar inferior para dispositivos móviles (`md:hidden`) en la zona ergonómica del pulgar.
- Botones con micro-compresión táctil inmediata en `pointer-down` (`active:scale-95`).
- Sustitución de emojis de tema por vectores limpios de Lucide (`Sun` / `Moon`).

---

### Task 2: Rediseñar el Footer de Redes Sociales en `src/App.tsx`

**Archivos:**
- Modificar: `src/App.tsx` (sección `<footer>`)

**Detalles de implementación:**
- **Jerarquía en móvil:**
  - 1º: Cápsula estilizada de redes sociales centrada (Facebook, Instagram, YouTube) con fondo suave (`bg-muted/40 backdrop-blur-md rounded-full border border-border/50 p-1.5`) y micro-relieve táctil (`active:scale-90`).
  - 2º: Texto de copyright más discreto y sutil (`text-xs text-muted-foreground/70`).
- **Jerarquía en escritorio:** Se mantiene en una sola fila equilibrada (copyright a la izquierda, cápsula de redes a la derecha).
- **Margen inferior anti-solapamiento:** Aplicar `pb-28 sm:pb-8` para asegurar que el Floating Tab Bar móvil nunca tape los botones de redes ni el copyright al llegar al fondo del scroll.

---

### Task 3: Integrar `Navbar` en `src/App.tsx`

**Archivos:**
- Modificar: `src/App.tsx`

**Cambios exactos:**
1. Importar `Navbar` desde `./components/Navbar`:
   ```tsx
   import { Navbar } from './components/Navbar';
   ```
2. Reemplazar el bloque actual del `<header>` (líneas 58-123) por:
   ```tsx
   <Navbar
     darkMode={darkMode}
     onToggleTheme={toggleTheme}
     onOpenContact={() => setIsContactModalOpen(true)}
   />
   ```
3. Añadir `pb-24 md:pb-10` a la etiqueta `<main>` para garantizar margen de lectura cómodo sobre la barra flotante móvil.

---

### Task 4: Verificación de Tipos y Build

**Comandos:**
```bash
npm run build
```

**Criterios de Aceptación:**
- Compilación de TypeScript (`tsc -b`) y Vite sin errores ni advertencias de tipos.
- Comprobación en navegador de transición fluida entre rutas sin recarga ni parpadeo.
- Comprobación del modo oscuro y claro con persistencia en `localStorage`.
- Verificación de apertura del modal de contacto y enlaces de redes sociales.
- Comprobación en viewport móvil: la barra flotante inferior no tapa ni el contenido ni los iconos del footer.
