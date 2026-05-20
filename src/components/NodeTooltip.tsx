// src/components/NodeTooltip.tsx
import React from 'react';
import type { EtymNode } from '../types/etymology';
import { LANGUAGE_DEFS } from '../lib/languages';

interface Props {
  node: EtymNode;
  onClose: () => void;
}

export default function NodeTooltip({ node, onClose }: Props) {
  const def = LANGUAGE_DEFS[node.language] ?? LANGUAGE_DEFS['unknown'];

  return (
    <div
      className="absolute bottom-5 right-5 w-80 rounded-2xl border overflow-hidden z-50 select-none"
      style={{
        background: '#080B16',
        borderColor: def.stroke + '50',
        boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px ${def.stroke}30, 0 0 30px ${def.glow}`,
      }}
    >
      {/* Colored top bar */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${def.stroke}, ${def.stroke}50, transparent)` }} />

      <div className="p-5 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span
              className="inline-block text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border mb-2"
              style={{ color: def.stroke, borderColor: def.stroke + '40', background: def.fill }}
            >
              {def.name}
            </span>
            <h3 className="text-2xl font-serif font-bold capitalize"
              style={{ color: def.text, textShadow: `0 0 20px ${def.glow}` }}>
              {node.word}
            </h3>
            {node.romanized && (
              <span className="text-[11px] font-mono text-[#3D5480] italic mt-0.5 block">
                romanized: {node.romanized}
              </span>
            )}
          </div>
          <button onClick={onClose}
            className="text-[#3D5480] hover:text-[#EEF2FF] cursor-pointer text-xs font-mono border border-[#1E2848] hover:border-[#3D5480] rounded-lg px-2 py-1 transition-all duration-200 shrink-0 mt-1">
            ✕ close
          </button>
        </div>

        {/* Meaning */}
        <div className="bg-[#0B0E1A] border border-[#1E2848] rounded-xl p-3">
          <div className="text-[9px] font-mono text-[#3D5480] uppercase tracking-wider mb-1.5">Gloss meaning</div>
          <p className="text-sm font-serif italic text-[#8BA4CC] leading-relaxed">
            &ldquo;{node.meaning}&rdquo;
          </p>
        </div>

        {/* Era */}
        {node.era && (
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-[#3D5480]">Historical era</span>
            <span className="text-[#EEF2FF]">{node.era}</span>
          </div>
        )}

        {/* Reconstructed / Attested badge */}
        {node.isReconstructed ? (
          <div className="rounded-xl p-3 text-xs font-mono leading-relaxed"
            style={{ background: '#160E08', border: '1px solid #C0804040', color: '#E09858' }}>
            <div className="font-semibold mb-1">✶ Reconstructed Root</div>
            <div className="text-[10px] opacity-80">Not attested in writing — reconstructed by comparative linguists from sound change patterns.</div>
          </div>
        ) : (
          <div className="rounded-xl p-3 text-xs font-mono leading-relaxed"
            style={{ background: '#081508', border: '1px solid #28C06840', color: '#50D878' }}>
            <div className="font-semibold mb-1">✔ Attested Form</div>
            <div className="text-[10px] opacity-80">Verified in historical texts or physical inscriptions from this era.</div>
          </div>
        )}

        {/* Notes */}
        {node.notes && (
          <div className="text-[10px] font-mono text-[#3D5480] bg-[#0B0E1A] border border-[#1E2848] rounded-xl p-3 leading-relaxed">
            <div className="text-[9px] uppercase tracking-wider text-[#1E2848] mb-1">Historical context</div>
            {node.notes}
          </div>
        )}

      </div>
    </div>
  );
}
