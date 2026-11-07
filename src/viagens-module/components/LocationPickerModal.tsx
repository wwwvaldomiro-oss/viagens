import { useState } from 'react';
import { Search, MapPin, Plane, Bus, X, Check } from 'lucide-react';
import { Location } from '../types';
import { searchLocations, POPULAR_LOCATIONS } from '../data/locations';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: Location) => void;
  title: string;
  currentSelected?: Location;
}

export function LocationPickerModal({
  isOpen,
  onClose,
  onSelect,
  title,
  currentSelected
}: LocationPickerModalProps) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'airport' | 'bus_station'>('all');

  if (!isOpen) return null;

  const locations = searchLocations(query, filterType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 id="location-modal-title" className="text-base font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">Selecione uma cidade, aeroporto ou rodoviária</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar janela"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input & filter tabs */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite o nome da cidade, aeroporto ou código (ex: SP, GRU, Rio, Tietê)..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-900 placeholder:text-slate-400 shadow-xs"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-lg">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('airport')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all ${
                filterType === 'airport'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plane className="w-3.5 h-3.5 text-sky-600" />
              Aeroportos
            </button>
            <button
              onClick={() => setFilterType('bus_station')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all ${
                filterType === 'bus_station'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bus className="w-3.5 h-3.5 text-blue-600" />
              Rodoviárias
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100 p-2">
          {locations.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">Nenhum local encontrado para "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Tente buscar por nome de cidade ou sigla</p>
            </div>
          ) : (
            locations.map((loc) => {
              const isSelected = currentSelected?.id === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => {
                    onSelect(loc);
                    onClose();
                  }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-sky-50 text-sky-950'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      loc.type === 'airport'
                        ? 'bg-sky-100 text-sky-700'
                        : loc.type === 'bus_station'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {loc.type === 'airport' ? (
                        <Plane className="w-4 h-4" />
                      ) : loc.type === 'bus_station' ? (
                        <Bus className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">{loc.city}</span>
                        <span className="text-xs text-slate-400 font-mono-numbers bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                          {loc.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{loc.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400">{loc.state}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-sky-600" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{locations.length} locais disponíveis</span>
          <div className="flex items-center gap-2">
            <span>Dica: busque por <b>SP</b>, <b>RIO</b>, <b>BH</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}
