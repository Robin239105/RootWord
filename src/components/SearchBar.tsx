// src/components/SearchBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { getAllSeedWords } from '../lib/etymology';

interface Props {
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export default function SearchBar({ placeholder = 'type any word…', initialValue = '', className = '' }: Props) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [seeds, setSeeds] = useState<string[]>([]);

  useEffect(() => {
    setSeeds(getAllSeedWords());
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const val = query.toLowerCase().trim();
    const filtered = seeds.filter(s => s.startsWith(val) && s !== val);
    setSuggestions(filtered.slice(0, 6));
  }, [query, seeds]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigate = (word: string) => {
    if (!word.trim()) return;
    window.location.href = `/explore/${encodeURIComponent(word.trim().toLowerCase())}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') navigate(query);
    if (e.key === 'Escape') setIsOpen(false);
  };

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div ref={dropdownRef} className={`relative w-full max-w-xl ${className}`}>

      {/* Input row */}
      <div
        className={`relative flex items-center rounded-xl border transition-all duration-200 ${
          focused
            ? 'border-[#D4A843]/60 bg-[#1A1710]'
            : 'border-[#2E2A1C] bg-[#161410]'
        }`}
        style={focused ? { boxShadow: '0 0 0 3px rgba(212,168,67,0.15), 0 0 20px rgba(212,168,67,0.08)' } : {}}
      >
        {/* Search icon */}
        <span className="pl-4 text-[#7A6E54] text-sm select-none shrink-0">⌕</span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => { setFocused(true); setIsOpen(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[#F0E6CC] placeholder-[#3A3525] px-3 py-3.5 text-sm font-mono tracking-wide focus:outline-none"
          style={{ caretColor: '#D4A843' }}
          autoComplete="off"
          spellCheck="false"
        />

        <button
          onClick={() => navigate(query)}
          className="mr-3 shrink-0 text-[10px] font-mono text-[#7A6E54] hover:text-[#D4A843] border border-[#2E2A1C] hover:border-[#D4A843]/50 rounded-md px-2.5 py-1 transition-all duration-200 cursor-pointer bg-[#0C0B09] hover:bg-[#1A1710]"
        >
          ↵ enter
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#161410] border border-[#2E2A1C] rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(58,53,37,0.5)' }}
        >
          {/* Curated suggestions */}
          {suggestions.length > 0 && (
            <div className="border-b border-[#1E1B14]">
              <div className="px-4 pt-2.5 pb-1 text-[9px] font-mono text-[#3A3525] uppercase tracking-widest">Curated Seeds</div>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); navigate(s); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#1A1710] text-[#C4AD82] hover:text-[#F0E6CC] flex justify-between items-center border-b border-[#0E0D0B] last:border-0 transition-colors duration-150 font-mono text-sm"
                >
                  <span>{s}</span>
                  <span className="text-[9px] text-[#D4A843] bg-[#1A1710] border border-[#3A3525] px-1.5 py-0.5 rounded">✶ seed</span>
                </button>
              ))}
            </div>
          )}

          {/* Live Wiktionary search */}
          <button
            onClick={() => navigate(query)}
            className="w-full text-left px-4 py-3.5 bg-[#0E0D0B] hover:bg-[#161410] flex items-center justify-between transition-colors duration-150 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[#D4A843] text-base">⌕</span>
              <span className="font-mono text-sm text-[#F0E6CC]">
                Search <span className="text-[#D4A843]">&ldquo;{query.trim()}&rdquo;</span>
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#5A5438] group-hover:text-[#7A6E54] transition-colors">wiktionary api →</span>
          </button>
        </div>
      )}
    </div>
  );
}
