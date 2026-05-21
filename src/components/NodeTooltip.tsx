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
    <div className="absolute bottom-6 right-6 w-80 bg-[#1A1810] border border-[#2E2B22] shadow-2xl p-5 rounded font-mono text-xs text-[#8A7D5E] select-none z-40 parchment-glow flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header with Title and Close Button */}
      <div className="flex items-start justify-between">
        <div>
          <span
            className="text-[9px] uppercase px-1.5 py-0.5 rounded border tracking-wider font-semibold"
            style={{
              color: def.stroke,
              borderColor: `${def.stroke}40`,
              backgroundColor: `${def.fill}`,
            }}
          >
            {def.name}
          </span>
          <h3 className="text-xl font-serif font-medium text-[#EDE0C4] mt-2 capitalize">
            {node.word}
          </h3>
          {node.romanized && (
            <span className="text-[10px] text-[#4A4030] italic font-serif mt-0.5 block">
              romanized: {node.romanized}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[#4A4030] hover:text-[#EDE0C4] cursor-pointer text-sm font-semibold transition-colors"
        >
          [x]
        </button>
      </div>

      {/* Meaning Gloss */}
      <div className="border-t border-[#181614] pt-3">
        <span className="text-[9px] text-[#4A4030] uppercase tracking-wider block mb-1">
          gloss meaning
        </span>
        <span className="text-sm font-serif italic text-[#EDE0C4] leading-relaxed">
          &ldquo;{node.meaning}&rdquo;
        </span>
      </div>

      {/* Era / Attestation */}
      {node.era && (
        <div className="flex justify-between items-center text-[10px] py-1 border-b border-[#181614]">
          <span className="text-[#4A4030]">historical era</span>
          <span className="text-[#EDE0C4] font-medium">{node.era}</span>
        </div>
      )}

      {/* Reconstruction comparative linguistics warning */}
      {node.isReconstructed ? (
        <div className="bg-[#1C150A] border border-[#3A2E18] text-[#A07828] p-3 rounded leading-relaxed text-[10px]">
          <span className="font-semibold block mb-0.5">✶ Reconstructed Root</span>
          This form is not attested in written literature. It has been reconstructed by comparative
          linguists based on regular sound changes.
        </div>
      ) : (
        <div className="bg-[#111510] border border-[#1E3A18] text-[#4A803E] p-2.5 rounded leading-relaxed text-[10px]">
          <span className="font-semibold block mb-0.5">✔ Attested Form</span>
          This word or root is verified in historical texts or physical writing from this era.
        </div>
      )}

      {/* Extra notes */}
      {node.notes && (
        <div className="text-[10px] leading-relaxed text-[#8A7D5E] bg-[#131210] p-2.5 rounded border border-[#2E2B22]">
          <span className="text-[9px] text-[#4A4030] uppercase tracking-wider block mb-1 font-semibold">
            historical context
          </span>
          {node.notes}
        </div>
      )}

      <div className="text-[8px] text-[#4A4030] text-right mt-1">id: {node.id}</div>
    </div>
  );
}
