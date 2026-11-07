import { useState, useRef, useEffect } from 'react';
import { Plane, Bus, MapPin, Search, X, Check, Building2, ChevronDown } from 'lucide-react';
import { Location } from '../types';
import { searchLocations, POPULAR_LOCATIONS, normalizeSearchText } from '../data/locations';

interface LocationAutocompleteInputProps {
  label: string;
  value: Location;
  onChange: (location: Location) => void;
  placeholder?: string;
  onOpenFullModal?: () => void;
  className?: string;
}

export function LocationAutocompleteInput({
  label,
  value,
  onChange,
  placeholder = 'Buscar cidade, aeroporto ou rodoviária...',
  onOpenFullModal,
  className = ''
}: LocationAutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'airport' | 'bus_station'>('all');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute matched locations
  const query = isTyping ? searchTerm : '';
  const matchingLocations = searchLocations(query, filterType);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleCloseDropdown();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const handleOpenDropdown = () => {
    setIsOpen(true);
    setIsTyping(false);
    setSearchTerm('');
    setHighlightedIndex(0);
  };

  const handleCloseDropdown = () => {
    setIsOpen(false);
    setIsTyping(false);
    setSearchTerm('');
    setHighlightedIndex(0);
  };

  const handleSelectLocation = (loc: Location) => {
    onChange(loc);
    handleCloseDropdown();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % Math.max(1, matchingLocations.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + matchingLocations.length) % Math.max(1, matchingLocations.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (matchingLocations.length > 0 && matchingLocations[highlightedIndex]) {
        handleSelectLocation(matchingLocations[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      handleCloseDropdown();
    }
  };

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      {/* Input container */}
      <div 
        onClick={() => {
          inputRef.current?.focus();
          handleOpenDropdown();
        }}
        className={`p-3 text-left hover:bg-slate-100/60 transition-colors group relative cursor-pointer ${
          isOpen ? 'bg-sky-50/40 ring-1 ring-sky-500/30' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <label 
            htmlFor={`loc-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer"
          >
            {label}
          </label>
          <span className="text-[10px] text-sky-600 font-medium group-hover:text-sky-700 transition-colors">
            {isOpen ? 'Digitando...' : 'Alterar'}
          </span>
        </div>

        {/* Dynamic Display / Autocomplete Input */}
        <div className="mt-1 flex items-center justify-between gap-1.5">
          <div className="flex-1 min-w-0">
            {isOpen ? (
              <div className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <input
                  id={`loc-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsTyping(true);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  autoFocus
                  className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchTerm('');
                      setIsTyping(false);
                      inputRef.current?.focus();
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-900 text-sm truncate block max-w-[170px]">
                  {value.city}
                </span>
                <span className="text-xs font-mono-numbers font-semibold text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded">
                  {value.code}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Subtitle location name */}
        {!isOpen && (
          <span className="block text-xs text-slate-500 truncate mt-0.5">
            {value.name}
          </span>
        )}
      </div>

      {/* Autocomplete Dropdown Popover */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full mt-2 w-full min-w-[320px] sm:min-w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header filter pills */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterType('airport')}
                className={`px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
                  filterType === 'airport'
                    ? 'bg-white text-sky-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plane className="w-3 h-3 text-sky-600" />
                <span>Voos</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('bus_station')}
                className={`px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
                  filterType === 'bus_station'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bus className="w-3 h-3 text-blue-600" />
                <span>Ônibus</span>
              </button>
            </div>

            {onOpenFullModal && (
              <button
                type="button"
                onClick={() => {
                  handleCloseDropdown();
                  onOpenFullModal();
                }}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700"
              >
                Ver todos
              </button>
            )}
          </div>

          {/* Quick context title */}
          <div className="px-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>{isTyping && searchTerm ? 'Cidades Encontradas' : 'Destinos Populares'}</span>
            <span className="font-mono-numbers">{matchingLocations.length} opções</span>
          </div>

          {/* Locations List */}
          <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-slate-50 pr-0.5">
            {matchingLocations.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <MapPin className="w-6 h-6 mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs font-semibold text-slate-800">
                  Nenhum local encontrado para "{searchTerm}"
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tente digitar o nome da capital, estado ou código (ex: SP, RIO, BSB, GRU)
                </p>
              </div>
            ) : (
              matchingLocations.map((loc, idx) => {
                const isSelected = value.id === loc.id;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={loc.id}
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelectLocation(loc)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                      isHighlighted || isSelected
                        ? 'bg-sky-50/80 text-sky-950'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Icon */}
                      <div className={`p-1.5 rounded-lg shrink-0 ${
                        loc.type === 'airport'
                          ? 'bg-sky-100 text-sky-700'
                          : loc.type === 'bus_station'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {loc.type === 'airport' ? (
                          <Plane className="w-3.5 h-3.5" />
                        ) : loc.type === 'bus_station' ? (
                          <Bus className="w-3.5 h-3.5" />
                        ) : (
                          <Building2 className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* Name & details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {loc.city}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {loc.state}
                          </span>
                          <span className="text-[10px] font-mono-numbers font-bold bg-slate-100 text-slate-600 px-1 py-0.2 rounded shrink-0">
                            {loc.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {loc.name}
                        </p>
                      </div>
                    </div>

                    {/* Selection tick */}
                    {isSelected && (
                      <Check className="w-4 h-4 text-sky-600 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Keyboard tip footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Use as teclas <b>↑</b> <b>↓</b> e <b>Enter</b> para navegar</span>
            <button
              type="button"
              onClick={handleCloseDropdown}
              className="text-slate-500 hover:text-slate-800 font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
