// src/components/LanguageBadge.tsx
import React from 'react';
import type { LanguageFamily } from '../types/etymology';
import { LANGUAGE_DEFS } from '../lib/languages';

interface Props {
  language: LanguageFamily;
  className?: string;
}

export default function LanguageBadge({ language, className = '' }: Props) {
  const def = LANGUAGE_DEFS[language] ?? LANGUAGE_DEFS['unknown'];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono font-medium border leading-none tracking-wide ${className}`}
      style={{
        color: def.stroke,
        borderColor: `${def.stroke}33`,
        backgroundColor: def.fill,
      }}
    >
      {def.name}
    </span>
  );
}
