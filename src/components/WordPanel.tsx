// src/components/WordPanel.tsx
import React from 'react';
import type { WordData } from '../types/etymology';
import { LANGUAGE_DEFS } from '../lib/languages';

interface Props { data: WordData; }

const LANG_ICON: Record<string, string> = {
  'english':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','middle-english':'📜','old-english':'⚔️','old-french':'⚜️',
  'latin':'🏛️','medieval-latin':'✝️','ancient-greek':'🏺','proto-greek':'◎',
  'proto-germanic':'⚙️','proto-indo-european':'🌍','arabic':'🌙','old-norse':'🪓','unknown':'✶',
};

export default function WordPanel({ data }: Props) {
  const cleanDef = data.definition.replace(/<[^>]*>/g, '').slice(0, 200);

  return (
    <aside className="w-72 h-full bg-[#080B16] border-r border-[#1E2848] flex flex-col overflow-hidden shrink-0">

      {/* Top gold accent */}
      <div className="h-0.5 shrink-0"
        style={{ background: 'linear-gradient(90deg, transparent, #F0B840, #3DDBA0, transparent)' }} />

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

        {/* Word heading */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#EEF2FF] capitalize leading-tight mb-2"
            style={{ textShadow: '0 0 30px rgba(240,184,64,0.25)' }}>
            {data.word}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-mono text-[#F0B840] bg-[#1E1A08] border border-[#F0B840]/30 px-2.5 py-0.5 rounded-md">
              {data.ipa}
            </span>
            <span className="text-xs font-mono text-[#3D5480] italic bg-[#0E1224] px-2 py-0.5 rounded border border-[#1E2848]">
              {data.partOfSpeech}
            </span>
          </div>
        </div>

        <div className="h-px bg-[#1E2848]" />

        {/* Definition */}
        <div>
          <div className="text-[10px] font-mono text-[#3D5480] uppercase tracking-[0.18em] mb-2">Definition</div>
          <p className="text-sm font-serif italic text-[#8BA4CC] leading-relaxed">
            &ldquo;{cleanDef}&rdquo;
          </p>
        </div>

        <div className="h-px bg-[#1E2848]" />

        {/* Ancestral path — visual tree stem */}
        <div>
          <div className="text-[10px] font-mono text-[#3D5480] uppercase tracking-[0.18em] mb-3">Ancestral Path</div>
          <div className="flex flex-col">
            {data.languagePath.map((lang, i) => {
              const def = LANGUAGE_DEFS[lang] ?? LANGUAGE_DEFS['unknown'];
              const isLast = i === data.languagePath.length - 1;
              const icon = LANG_ICON[lang] ?? '◈';
              return (
                <div key={`${lang}-${i}`}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200
                    ${isLast
                      ? 'bg-[#1E1A08] border border-[#F0B840]/30'
                      : 'hover:bg-[#0E1224]'}`}>
                    <span className="text-base w-6 text-center shrink-0 leading-none">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-mono truncate ${isLast ? 'font-semibold' : ''}`}
                        style={{ color: def.stroke }}>
                        {def.name}
                      </div>
                      <div className="text-[9px] font-mono text-[#3D5480]">{def.family} family</div>
                    </div>
                    {isLast && <span className="text-[8px] font-mono text-[#F0B840] shrink-0 bg-[#F0B840]/10 px-1.5 py-0.5 rounded">now</span>}
                  </div>
                  {!isLast && (
                    <div className="flex ml-6 my-0.5">
                      <div className="w-px h-3 ml-2.5" style={{ background: `${def.stroke}40` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-[#1E2848]" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0B0E1A] border border-[#1E2848] rounded-xl p-3 text-center">
            <div className="text-[9px] font-mono text-[#3D5480] uppercase tracking-wider mb-1.5">Attested</div>
            <div className="text-xs font-mono text-[#EEF2FF] font-semibold leading-tight">{data.firstAttestedCentury}</div>
          </div>
          <div className="bg-[#0B0E1A] border border-[#1E2848] rounded-xl p-3 text-center">
            <div className="text-[9px] font-mono text-[#3D5480] uppercase tracking-wider mb-1.5">Depth</div>
            <div className="text-2xl font-mono font-bold" style={{ color: '#F0B840', textShadow: '0 0 12px rgba(240,184,64,0.4)' }}>
              {data.rootDepth}
            </div>
          </div>
        </div>

        {/* Cognates */}
        {data.cognates?.length > 0 && (
          <>
            <div className="h-px bg-[#1E2848]" />
            <div>
              <div className="text-[10px] font-mono text-[#3D5480] uppercase tracking-[0.18em] mb-3">Related Cognates</div>
              <div className="flex flex-wrap gap-2">
                {data.cognates.map(c => (
                  <button key={c}
                    onClick={() => window.location.href = `/explore/${encodeURIComponent(c.toLowerCase())}`}
                    className="text-xs font-mono text-[#8BA4CC] hover:text-[#EEF2FF] bg-[#0B0E1A] hover:bg-[#111830] border border-[#1E2848] hover:border-[#F0B840]/40 rounded-lg px-3 py-1.5 cursor-pointer transition-all duration-200">
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#1E2848] shrink-0 flex justify-between text-[9px] font-mono text-[#1E2848]">
        <span className="text-[#3D5480]">source</span>
        <span className="text-[#3D5480] truncate ml-2">{data.contributors?.join(', ') ?? 'wiktionary'}</span>
      </div>
    </aside>
  );
}
