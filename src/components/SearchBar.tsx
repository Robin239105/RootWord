// src/components/SearchBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { getAllSeedWords } from '../lib/etymology';

interface Props {
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export default function SearchBar({ placeholder = 'type any word...', initialValue = '', className = '' }: Props) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [seeds, setSeeds] = useState<string[]>([]);

  useEffect(() => {
    // Load available seeds client-side
    setSeeds(getAllSeedWords());
  }, []);

  // Filter seeds based on query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const val = query.toLowerCase().trim();
    const filtered = seeds.filter(s => s.startsWith(val) && s !== val);
    setSuggestions(filtered.slice(0, 5));
  }, [query, seeds]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (wordToSearch: string) => {
    if (!wordToSearch.trim()) return;
    window.location.href = `/explore/${encodeURIComponent(wordToSearch.trim().toLowerCase())}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(query);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative w-full max-w-lg ${className}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-[#1A1810] text-[#EDE0C4] placeholder-[#4A4030] border border-[#2E2B22] focus:border-[#C4973A] focus:outline-none rounded px-4 py-3 text-sm font-mono tracking-wide shadow-inner transition-aesthetic"
        />
        <button
          onClick={() => handleSearchSubmit(query)}
          className="absolute right-3 text-[#8A7D5E] hover:text-[#C4973A] font-mono text-xs cursor-pointer transition-aesthetic"
        >
          [enter]
        </button>
      </div>

      {isOpen && (query.trim().length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1810] border border-[#2E2B22] rounded shadow-2xl z-50 overflow-hidden font-mono text-xs text-[#8A7D5E] parchment-glow">
          {/* Seeds Autocomplete Suggestions */}
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setQuery(suggestion);
                handleSearchSubmit(suggestion);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-[#1E1B12] hover:text-[#EDE0C4] flex justify-between items-center border-b border-[#181614] transition-colors"
            >
              <span>{suggestion}</span>
              <span className="text-[10px] text-[#C4973A] font-semibold">curated seed ✶</span>
            </button>
          ))}

          {/* Exact match or general Search fallback */}
          <button
            onClick={() => handleSearchSubmit(query)}
            className="w-full text-left px-4 py-3 bg-[#131210] hover:bg-[#1C1A12] text-[#EDE0C4] flex items-center justify-between transition-colors"
          >
            <span>Search etymology for &quot;{query.trim().toLowerCase()}&quot;</span>
            <span className="text-[10px] text-[#4A4030]">wiktionary api ➜</span>
          </button>
        </div>
      )}
    </div>
  );
}
