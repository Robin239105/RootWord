// src/components/SearchBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { getAllSeedWords } from '../lib/etymology';

interface Props {
  placeholder?: string;
  initialValue?: string;
}

export default function SearchBar({ placeholder = 'type any word…', initialValue = '' }: Props) {
  const [query, setQuery]           = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen]             = useState(false);
  const [focused, setFocused]       = useState(false);
  const [seeds, setSeeds]           = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSeeds(getAllSeedWords()); }, []);

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    const v = query.toLowerCase().trim();
    setSuggestions(seeds.filter(s => s.startsWith(v) && s !== v).slice(0, 6));
  }, [query, seeds]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (w: string) => {
    if (!w.trim()) return;
    window.location.href = `/explore/${encodeURIComponent(w.trim().toLowerCase())}`;
  };

  const showDrop = open && query.trim().length > 0;

  return (
    <div ref={wrapRef} className="relative w-full">

      {/* Input */}
      <div className={`flex items-center rounded-2xl border transition-all duration-250 ${
        focused
          ? 'border-[#F0B840]/60 bg-[#0E1224]'
          : 'border-[#1E2848] bg-[#0B0E1A]'
        }`}
        style={focused ? { boxShadow: '0 0 0 3px rgba(240,184,64,0.18), 0 0 30px rgba(240,184,64,0.10)' } : {}}
      >
        <span className="pl-5 text-[#3D5480] text-lg select-none shrink-0">⌕</span>

        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={e => { if (e.key === 'Enter') go(query); if (e.key === 'Escape') setOpen(false); }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[#EEF2FF] placeholder-[#1E2848] px-4 py-4 text-base font-mono tracking-wide focus:outline-none"
          style={{ caretColor: '#F0B840' }}
          autoComplete="off" spellCheck="false"
        />

        <button onClick={() => go(query)}
          className="mr-4 shrink-0 text-[11px] font-mono text-[#3D5480] hover:text-[#F0B840] border border-[#1E2848] hover:border-[#F0B840]/50 rounded-xl px-3 py-1.5 bg-[#06080F] hover:bg-[#0E1224] transition-all duration-200 cursor-pointer">
          ↵ enter
        </button>
      </div>

      {/* Dropdown */}
      {showDrop && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0E1A] border border-[#1E2848] rounded-2xl overflow-hidden z-50"
          style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(30,40,72,0.8)' }}>

          {suggestions.length > 0 && (
            <div className="border-b border-[#1E2848]">
              <div className="px-4 pt-3 pb-1 text-[9px] font-mono text-[#3D5480] uppercase tracking-widest">Curated seeds</div>
              {suggestions.map(s => (
                <button key={s}
                  onClick={() => { setQuery(s); go(s); }}
                  className="w-full text-left px-4 py-3 hover:bg-[#111830] text-[#8BA4CC] hover:text-[#EEF2FF] flex justify-between items-center border-b border-[#0B0E1A] last:border-0 transition-colors duration-150 font-mono text-sm">
                  <span>{s}</span>
                  <span className="text-[9px] text-[#F0B840] bg-[#1E1A08] border border-[#F0B840]/30 px-2 py-0.5 rounded-full">✶ seed</span>
                </button>
              ))}
            </div>
          )}

          <button onClick={() => go(query)}
            className="w-full px-4 py-4 bg-[#080B16] hover:bg-[#0E1224] flex items-center justify-between transition-colors duration-150 cursor-pointer group">
            <div className="flex items-center gap-3">
              <span className="text-[#F0B840] text-lg">⌕</span>
              <span className="font-mono text-sm text-[#EEF2FF]">
                Search <span className="text-[#F0B840]">&ldquo;{query.trim()}&rdquo;</span> via Wiktionary
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#3D5480] group-hover:text-[#8BA4CC] transition-colors">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
