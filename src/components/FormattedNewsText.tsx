import React from 'react';

interface FormattedNewsTextProps {
  text: string;
  className?: string;
}

/**
 * Renderiza texto enriquecido ligero de forma 100% segura (sin dangerouslySetInnerHTML):
 * - #, ##, ### Línea -> Títulos y subtítulos principales
 * - #### Línea -> Encabezados de categoría / sección (badge elegante con indicador)
 * - - Línea, * Línea, • Línea -> Ítems de lista con viñeta
 * - **texto** -> Negrita
 * - *texto* -> Cursiva
 * - __texto__ -> Subrayado
 * - ==texto== -> Resaltado con color
 * - [chico]texto[/chico] -> Tamaño de letra chico
 */
export const FormattedNewsText: React.FC<FormattedNewsTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  const parseInline = (line: string, keyPrefix: string): React.ReactNode[] => {
    const tokenRegex = /(\*\*[^*]+\*\*|__[^_]+__|==[^=]+==|\[chico\][\s\S]*?\[\/chico\]|\*[^*\n]+\*)/g;
    const parts = line.split(tokenRegex);

    return parts.map((part, idx) => {
      if (!part) return null;
      const key = `${keyPrefix}-${idx}`;

      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={key} className="font-black text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('__') && part.endsWith('__') && part.length > 4) {
        return (
          <span key={key} className="underline decoration-primary/70 underline-offset-2">
            {part.slice(2, -2)}
          </span>
        );
      }
      if (part.startsWith('==') && part.endsWith('==') && part.length > 4) {
        return (
          <mark
            key={key}
            className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold"
          >
            {part.slice(2, -2)}
          </mark>
        );
      }
      if (part.startsWith('[chico]') && part.endsWith('[/chico]') && part.length > 15) {
        return (
          <span key={key} className="text-xs text-muted-foreground/90">
            {part.slice(7, -8)}
          </span>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={key} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      return <React.Fragment key={key}>{part}</React.Fragment>;
    });
  };

  // Normalizar saltos de línea Windows / Unix
  const lines = text.replace(/\r\n/g, '\n').split('\n');

  return (
    <div className={`space-y-2 text-sm text-muted-foreground leading-relaxed ${className}`}>
      {lines.map((rawLine, lineIdx) => {
        const trimmed = rawLine.trim();

        if (!trimmed) {
          // Espaciador para líneas vacías (evita acumular demasiados saltos)
          const prevTrimmed = lineIdx > 0 ? lines[lineIdx - 1]?.trim() : 'dummy';
          if (!prevTrimmed) return null;
          return <div key={lineIdx} className="h-2" />;
        }

        // Títulos Markdown: soporta #, ##, ###, #### con o sin espacio posterior (ej: "#### Categoria", "####**Categoria**")
        const headingMatch = trimmed.match(/^(#{1,4})\s*(.*)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          let content = headingMatch[2].trim();

          // Si todo el contenido estaba envuelto en **...**, quitamos las marcas externas redundantes para el encabezado
          if (content.startsWith('**') && content.endsWith('**') && content.length > 4) {
            content = content.slice(2, -2).trim();
          }

          if (level <= 2) {
            return (
              <h2
                key={lineIdx}
                className="text-base sm:text-lg font-display font-black text-foreground tracking-tight pt-3 first:pt-0"
              >
                {parseInline(content, `l-${lineIdx}`)}
              </h2>
            );
          }

          if (level === 3) {
            return (
              <h3
                key={lineIdx}
                className="text-sm sm:text-base font-display font-black text-foreground tracking-tight pt-3 first:pt-0 flex items-center gap-2"
              >
                <span className="w-1.5 h-4 rounded-full bg-primary shrink-0" />
                <span>{parseInline(content, `l-${lineIdx}`)}</span>
              </h3>
            );
          }

          // level === 4: Badge de Categoría / Sección estilizado
          return (
            <div key={lineIdx} className="pt-2.5 first:pt-0">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-foreground font-black text-xs sm:text-sm tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span>{parseInline(content, `l-${lineIdx}`)}</span>
              </div>
            </div>
          );
        }

        // Ítem de lista (- o • o *)
        const listMatch = trimmed.match(/^([-•*])\s+(.*)$/);
        if (listMatch) {
          const itemContent = listMatch[2];
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span className="flex-1 text-foreground/90 leading-relaxed">
                {parseInline(itemContent, `l-${lineIdx}`)}
              </span>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="text-foreground/85 leading-relaxed">
            {parseInline(rawLine, `l-${lineIdx}`)}
          </p>
        );
      })}
    </div>
  );
};