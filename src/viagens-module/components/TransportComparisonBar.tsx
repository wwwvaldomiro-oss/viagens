import { Bus, Plane, Clock, TrendingDown, ArrowRight, Zap } from 'lucide-react';
import { calculateModalComparison, formatCurrencyBRL, formatDuration } from '../services/ticketEngine';
import { Ticket, TransportType } from '../types';

interface TransportComparisonBarProps {
  tickets: Ticket[];
  currentTransportFilter: TransportType;
  onSelectTransportFilter: (type: TransportType) => void;
}

export function TransportComparisonBar({
  tickets,
  currentTransportFilter,
  onSelectTransportFilter
}: TransportComparisonBarProps) {
  const comparison = calculateModalComparison(tickets);
  if (!comparison) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-700/60 mb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Summary insight */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Comparativo Inteligente de Modais
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white text-balance">
            {comparison.busSavings > 80 ? (
              <span>
                Vá de ônibus e economize até <span className="text-emerald-400 font-mono-numbers">{formatCurrencyBRL(comparison.busSavings)}</span> por pessoa!
              </span>
            ) : (
              <span>
                Voe de avião e economize <span className="text-sky-400 font-mono-numbers">{formatDuration(comparison.flightTimeSavedMinutes)}</span> de viagem!
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-300">
            Compare preços e tempo de viagem porta a porta para tomar a melhor decisão.
          </p>
        </div>

        {/* Right: Quick comparison cards */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Bus card */}
          <button
            type="button"
            onClick={() => onSelectTransportFilter(currentTransportFilter === 'bus' ? 'all' : 'bus')}
            className={`flex-1 sm:flex-initial p-3 rounded-xl border text-left transition-all ${
              currentTransportFilter === 'bus'
                ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-500/30'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-1.5 text-xs text-blue-300 font-medium">
                <Bus className="w-3.5 h-3.5" />
                <span>Ônibus</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-semibold">
                Mais Barato
              </span>
            </div>
            <div className="text-sm sm:text-base font-bold text-white font-mono-numbers">
              {formatCurrencyBRL(comparison.minBus)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>a partir de {formatDuration(comparison.fastestBusMinutes)}</span>
            </div>
          </button>

          {/* Flight card */}
          <button
            type="button"
            onClick={() => onSelectTransportFilter(currentTransportFilter === 'flight' ? 'all' : 'flight')}
            className={`flex-1 sm:flex-initial p-3 rounded-xl border text-left transition-all ${
              currentTransportFilter === 'flight'
                ? 'bg-sky-600/30 border-sky-400 ring-2 ring-sky-500/30'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-1.5 text-xs text-sky-300 font-medium">
                <Plane className="w-3.5 h-3.5" />
                <span>Avião</span>
              </div>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-semibold">
                Mais Rápido
              </span>
            </div>
            <div className="text-sm sm:text-base font-bold text-white font-mono-numbers">
              {formatCurrencyBRL(comparison.minFlight)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>a partir de {formatDuration(comparison.fastestFlightMinutes)}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
