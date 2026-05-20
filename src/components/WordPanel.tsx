// src/components/WordPanel.tsx
import React from 'react';
import type { WordData } from '../types/etymology';
import { LANGUAGE_DEFS } from '../lib/languages';

interface Props {
  data: WordData;
}

export default function WordPanel({ data }: Props) {
  const handleCognateClick = (cognate: string) => {
    window.location.href = `/explore/${encodeURIComponent(cognate.toLowerCase().trim())}`;
  };

  return (
    <aside className="w-80 h-full bg-[#1A1810] border-r border-[#2E2B22] p-6 flex flex-col overflow-y-auto parchment-glow select-none">
      {/* Title & Phonetics */}
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-medium text-[#EDE0C4] tracking-wide mb-1.5 capitalize">
          {data.word}
        </h1>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#C4973A]">{data.ipa}</span>
          <span className="text-[#4A4030]">•</span>
          <span className="text-[#8A7D5E] italic bg-[#131210] px-2 py-0.5 rounded border border-[#2E2B22]">
            {data.partOfSpeech}
          </span>
        </div>
      </div>

      {/* Dictionary Definition */}
      <div className="mb-6 pb-6 border-b border-[#2E2B22]">
        <h4 className="text-[10px] font-mono text-[#4A4030] uppercase tracking-wider mb-2">Definition</h4>
        <p className="text-sm font-serif italic text-[#8A7D5E] leading-relaxed">
          &ldquo;{data.definition}&rdquo;
        </p>
      </div>

      {/* Language Path Migration */}
      <div className="mb-6 pb-6 border-b border-[#2E2B22]">
        <h4 className="text-[10px] font-mono text-[#4A4030] uppercase tracking-wider mb-3">Ancestral Path</h4>
        <div className="flex flex-col gap-2">
          {data.languagePath.map((lang, index) => {
            const def = LANGUAGE_DEFS[lang] ?? LANGUAGE_DEFS['unknown'];
            const isLast = index === data.languagePath.length - 1;
            return (
              <div key={lang} className="flex items-center gap-2.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full border border-current flex-shrink-0"
                  style={{ color: def.stroke, backgroundColor: def.fill }}
                />
                <span className={`text-xs font-mono ${isLast ? 'text-[#EDE0C4] font-medium' : 'text-[#8A7D5E]'}`}>
                  {def.name}
                </span>
                {!isLast && (
                  <span className="text-[10px] text-[#4A4030] ml-auto">↓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Metadata Indicators */}
      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-[#2E2B22] text-center">
        <div className="bg-[#131210] p-2.5 border border-[#2E2B22] rounded">
          <div className="text-[10px] font-mono text-[#4A4030] uppercase">Attested</div>
          <div className="text-xs font-mono text-[#EDE0C4] mt-1 font-semibold">
            {data.firstAttestedCentury}
          </div>
        </div>
        <div className="bg-[#131210] p-2.5 border border-[#2E2B22] rounded">
          <div className="text-[10px] font-mono text-[#4A4030] uppercase">Generations</div>
          <div className="text-xs font-mono text-[#C4973A] mt-1 font-semibold">
            {data.rootDepth} Levels
          </div>
        </div>
      </div>

      {/* Cognates list */}
      <div>
        <h4 className="text-[10px] font-mono text-[#4A4030] uppercase tracking-wider mb-2.5">Related Cognates</h4>
        {data.cognates.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.cognates.map((cog) => (
              <button
                key={cog}
                onClick={() => handleCognateClick(cog)}
                className="text-xs font-mono text-[#8A7D5E] hover:text-[#EDE0C4] bg-[#0E0D0A] hover:bg-[#131210] border border-[#2E2B22] hover:border-[#C4973A] rounded px-2.5 py-1.5 cursor-pointer transition-aesthetic"
              >
                {cog}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs font-mono text-[#4A4030] italic">No direct cognates indexed.</span>
        )}
      </div>

      {/* Contributors footer */}
      {data.contributors && data.contributors.length > 0 && (
        <div className="mt-auto pt-6 text-[9px] font-mono text-[#4A4030] flex items-center justify-between">
          <span>curators:</span>
          <span className="text-right text-[#8A7D5E] truncate max-w-[150px]">
            {data.contributors.join(', ')}
          </span>
        </div>
      )}
    </aside>
  );
}
