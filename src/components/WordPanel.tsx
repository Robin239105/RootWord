// src/components/WordPanel.tsx
import React from 'react';
import type { WordData } from '../types/etymology';
import { LANGUAGE_DEFS } from '../lib/languages';

interface Props {
  data: WordData;
}

const LANG_ICONS: Record<string, string> = {
  'english': '🇬🇧',
  'middle-english': '📜',
  'old-english': '⚔️',
  'old-french': '⚜️',
  'latin': '🏛️',
  'medieval-latin': '✝️',
  'ancient-greek': '🏺',
  'proto-greek': '◎',
  'proto-germanic': '◎',
  'proto-indo-european': '◈',
  'arabic': '🌙',
  'old-norse': '🪓',
  'unknown': '✶',
};

export default function WordPanel({ data }: Props) {
  const cleanDefinition = data.definition.replace(/<[^>]*>/g, '').slice(0, 200);

  const handleCognateClick = (cognate: string) => {
    window.location.href = `/explore/${encodeURIComponent(cognate.toLowerCase().trim())}`;
  };

  return (
    <aside className="w-72 h-full bg-[#111009] border-r border-[#1E1B14] flex flex-col overflow-y-auto shrink-0">

      {/* Gold top accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-[#D4A843]/60 via-[#D4A843] to-[#D4A843]/60 shrink-0" />

      <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto">

        {/* Word + phonetics */}
        <div>
          <h1 className="text-3xl font-serif font-semibold text-[#F0E6CC] tracking-wide mb-2 capitalize leading-tight">
            {data.word}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-mono text-[#D4A843] bg-[#1A1710] border border-[#3A3525] px-2 py-0.5 rounded">
              {data.ipa}
            </span>
            <span className="text-[10px] font-mono text-[#5A5438]">·</span>
            <span className="text-xs font-mono text-[#7A6E54] italic bg-[#0E0D0B] px-2 py-0.5 rounded border border-[#1E1B14]">
              {data.partOfSpeech}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1E1B14]" />

        {/* Definition */}
        <div>
          <div className="text-[10px] font-mono text-[#5A5438] uppercase tracking-[0.15em] mb-2">Definition</div>
          <p className="text-sm font-serif italic text-[#C4AD82] leading-relaxed">
            &ldquo;{cleanDefinition}{cleanDefinition.length < data.definition.replace(/<[^>]*>/g, '').length ? '…' : ''}&rdquo;
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1E1B14]" />

        {/* Ancestral Path */}
        <div>
          <div className="text-[10px] font-mono text-[#5A5438] uppercase tracking-[0.15em] mb-3">Ancestral Path</div>
          <div className="flex flex-col gap-0">
            {data.languagePath.map((lang, index) => {
              const def = LANGUAGE_DEFS[lang] ?? LANGUAGE_DEFS['unknown'];
              const isLast = index === data.languagePath.length - 1;
              const icon = LANG_ICONS[lang] ?? '◈';
              return (
                <div key={`${lang}-${index}`}>
                  <div className={`flex items-center gap-3 py-2 px-2 rounded-lg ${isLast ? 'bg-[#1A1710] border border-[#3A3525]' : ''}`}>
                    <span className="text-sm w-5 text-center shrink-0">{icon}</span>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className={`text-xs font-mono truncate ${isLast ? 'text-[#F0E6CC] font-semibold' : 'text-[#C4AD82]'}`}>
                        {def.name}
                      </span>
                      {def.family && (
                        <span className="text-[9px] font-mono text-[#5A5438]">{def.family} family</span>
                      )}
                    </div>
                    {isLast && (
                      <span className="text-[9px] font-mono text-[#D4A843] shrink-0">current</span>
                    )}
                  </div>
                  {!isLast && (
                    <div className="flex items-center ml-4 my-0.5">
                      <div className="w-px h-3 bg-[#2E2A1C] ml-2" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1E1B14]" />

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0E0D0B] border border-[#1E1B14] rounded-lg p-3 text-center">
            <div className="text-[9px] font-mono text-[#5A5438] uppercase tracking-wider mb-1.5">Attested</div>
            <div className="text-xs font-mono text-[#F0E6CC] font-semibold leading-tight">
              {data.firstAttestedCentury}
            </div>
          </div>
          <div className="bg-[#0E0D0B] border border-[#1E1B14] rounded-lg p-3 text-center">
            <div className="text-[9px] font-mono text-[#5A5438] uppercase tracking-wider mb-1.5">Generations</div>
            <div className="text-lg font-mono text-[#D4A843] font-semibold">
              {data.rootDepth}
              <span className="text-[9px] text-[#5A5438] ml-1">levels</span>
            </div>
          </div>
        </div>

        {/* Cognates */}
        {data.cognates && data.cognates.length > 0 && (
          <>
            <div className="h-px bg-[#1E1B14]" />
            <div>
              <div className="text-[10px] font-mono text-[#5A5438] uppercase tracking-[0.15em] mb-3">Related Cognates</div>
              <div className="flex flex-wrap gap-2">
                {data.cognates.map((cog) => (
                  <button
                    key={cog}
                    onClick={() => handleCognateClick(cog)}
                    className="text-xs font-mono text-[#C4AD82] hover:text-[#F0E6CC] bg-[#0E0D0B] hover:bg-[#161410] border border-[#1E1B14] hover:border-[#D4A843]/50 rounded-lg px-3 py-1.5 cursor-pointer transition-all duration-200"
                  >
                    {cog}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[#1E1B14] shrink-0">
        <div className="flex items-center justify-between text-[9px] font-mono text-[#3A3525]">
          <span>source</span>
          <span className="text-[#5A5438]">{data.contributors?.join(', ') ?? 'wiktionary-api'}</span>
        </div>
      </div>
    </aside>
  );
}
