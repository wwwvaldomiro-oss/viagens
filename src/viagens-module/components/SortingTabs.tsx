import { DollarSign, Zap, Award } from 'lucide-react';
import { SearchFilters, Ticket } from '../types';
import { formatCurrencyBRL, formatDuration } from '../services/ticketEngine';

interface SortingTabsProps {
  filters: SearchFilters;
  onSortChange: (sortBy: 'cheapest' | 'fastest' | 'recommended') => void;
  tickets: Ticket[];
}

export function SortingTabs({ filters, onSortChange, tickets }: SortingTabsProps) {
  const isMilesMode = filters.paymentMode === 'miles';

  // Compute lowest price and duration for the tabs preview
  const minPrice = tickets.length > 0 ? Math.min(...tickets.map(t => t.price)) : 0;
  const minPoints = tickets.length > 0 ? Math.min(...tickets.map(t => t.milesOption.points)) : 0;
  const minDuration = tickets.length > 0 ? Math.min(...tickets.map(t => t.durationMinutes)) : 0;

  return (
    <div className="grid grid-cols-3 gap-2 p-1 bg-slate-200/70 rounded-xl mb-4 border border-slate-300/40">
      {/* Cheapest / Lowest Points */}
      <button
        type="button"
        onClick={() => onSortChange('cheapest')}
        className={`py-2.5 px-3 rounded-lg text-center transition-all cursor-pointer ${
          filters.sortBy === 'cheapest'
            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
      >
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isMilesMode ? 'Menos Pontos' : 'Mais Barato'}</span>
        </div>
        {isMilesMode ? (
          minPoints > 0 && (
            <span className="text-[11px] font-mono-numbers text-amber-800 font-bold block mt-0.5">
              a partir de {new Intl.NumberFormat('pt-BR').format(minPoints)} pts
            </span>
          )
        ) : (
          minPrice > 0 && (
            <span className="text-[11px] font-mono-numbers text-slate-500 block mt-0.5">
              a partir de {formatCurrencyBRL(minPrice)}
            </span>
          )
        )}
      </button>

      {/* Recommended */}
      <button
        type="button"
        onClick={() => onSortChange('recommended')}
        className={`py-2.5 px-3 rounded-lg text-center transition-all cursor-pointer ${
          filters.sortBy === 'recommended'
            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
      >
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
          <Award className="w-3.5 h-3.5 text-sky-600" />
          <span>{isMilesMode ? 'Melhor Resgate' : 'Melhor Opção'}</span>
        </div>
        <span className="text-[11px] text-slate-500 block mt-0.5 truncate">
          {isMilesMode ? 'Maior CPM / Economia' : 'Custo-benefício ideal'}
        </span>
      </button>

      {/* Fastest */}
      <button
        type="button"
        onClick={() => onSortChange('fastest')}
        className={`py-2.5 px-3 rounded-lg text-center transition-all cursor-pointer ${
          filters.sortBy === 'fastest'
            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
      >
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Mais Rápido</span>
        </div>
        {minDuration > 0 && (
          <span className="text-[11px] font-mono-numbers text-slate-500 block mt-0.5">
            a partir de {formatDuration(minDuration)}
          </span>
        )}
      </button>
    </div>
  );
}
