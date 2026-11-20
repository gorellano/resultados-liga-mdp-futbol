import React from 'react';

interface FormattedNewsTextProps {
  text: string;
  className?: string;
}

/**
 * Renderiza texto enriquecido ligero de forma 100% segura (sin dangerouslySetInnerHTML):
 * - ### Línea -> Tamaño grande (Subtítulo principal)
 * - #### Línea -> Tamaño mediano (Encabezado de sección)
 * - - Línea o • Línea -> Ítem de lista con viñeta
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
          <strong key={key} className="font-extrabold text-foreground">
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

  const lines = text.split('\n');

  return (
    <div className={`space-y-1.5 text-sm text-muted-foreground leading-relaxed ${className}`}>
      {lines.map((rawLine, lineIdx) => {
        const trimmed = rawLine.trim();

        if (!trimmed) {
          return <div key={lineIdx} className="h-2" />;
        }

        // Tamaño Grande (### )
        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={lineIdx}
              className="text-base sm:text-lg font-display font-black text-foreground tracking-tight pt-1"
            >
              {parseInline(trimmed.slice(4), `l-${lineIdx}`)}
            </h3>
          );
        }

        // Tamaño Mediano (#### )
        if (trimmed.startsWith('#### ')) {
          return (
            <h4
              key={lineIdx}
              className="text-sm sm:text-base font-extrabold text-foreground tracking-tight pt-0.5"
            >
              {parseInline(trimmed.slice(5), `l-${lineIdx}`)}
            </h4>
          );
        }

        // Ítem de lista (- o •)
        if (/^[-•]\s+/.test(trimmed)) {
          const itemContent = trimmed.replace(/^[-•]\s+/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span className="flex-1">{parseInline(itemContent, `l-${lineIdx}`)}</span>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="leading-relaxed">
            {parseInline(rawLine, `l-${lineIdx}`)}
          </p>
        );
      })}
    </div>
  );
};
