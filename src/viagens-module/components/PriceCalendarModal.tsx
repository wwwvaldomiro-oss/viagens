import { Calendar, ChevronLeft, ChevronRight, X, Plane, Bus, Sparkles } from 'lucide-react';
import { DailyPriceTrend, Location } from '../types';
import { formatCurrencyBRL } from '../services/ticketEngine';

interface PriceCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  trends: DailyPriceTrend[];
  onSelectDate: (dateStr: string) => void;
  origin: Location;
  destination: Location;
}

export function PriceCalendarModal({
  isOpen,
  onClose,
  trends,
  onSelectDate,
  origin,
  destination
}: PriceCalendarModalProps) {
  if (!isOpen) return null;

  const minOverall = Math.min(...trends.map(t => t.overallLowest));
  const maxOverall = Math.max(...trends.map(t => t.overallLowest));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              <h2 id="calendar-modal-title" className="text-base font-bold text-slate-900">
                Calendário de Menores Preços
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare as datas mais baratas para viajar entre {origin.city} e {destination.city}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar calendário"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Best Deal Callout */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Menor valor encontrado neste período: <b>{formatCurrencyBRL(minOverall)}</b>
              </span>
            </div>
            <span className="text-emerald-700 font-medium">Melhores dias destacados em verde</span>
          </div>

          {/* Bar Chart / Price Matrix */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <span className="font-semibold text-slate-700">Preço mínimo por dia de partida</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Mais Barato
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" /> Preço Médio
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Alta Procura
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2 pt-6 pb-2">
              {trends.map((item) => {
                const isCheapest = item.overallLowest === minOverall;
                const isHigh = item.overallLowest >= maxOverall * 0.9;
                
                // Relative height for bar visualization (from 35% to 100%)
                const heightPercent = Math.max(
                  35,
                  Math.round(((item.overallLowest - minOverall) / (maxOverall - minOverall || 1)) * 65 + 35)
                );

                return (
                  <button
                    key={item.date}
                    onClick={() => {
                      onSelectDate(item.date);
                      onClose();
                    }}
                    className={`group flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                      item.isCurrentSearchDate
                        ? 'border-sky-500 bg-sky-50/70 shadow-xs ring-2 ring-sky-500/20'
                        : isCheapest
                        ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {/* Day & Weekday */}
                    <span className="text-[11px] font-medium text-slate-500 uppercase">{item.dayOfWeek}</span>
                    <span className="text-sm font-bold text-slate-900 font-mono-numbers">{item.dayNumber}</span>

                    {/* Visual Bar Indicator */}
                    <div className="w-full h-16 flex items-end justify-center py-1">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-3 rounded-t-sm transition-all group-hover:w-4 ${
                          isCheapest
                            ? 'bg-emerald-500'
                            : isHigh
                            ? 'bg-amber-400'
                            : 'bg-sky-400'
                        }`}
                      />
                    </div>

                    {/* Price */}
                    <div className="mt-1">
                      <span className={`text-[11px] font-bold block font-mono-numbers ${
                        isCheapest ? 'text-emerald-700' : 'text-slate-700'
                      }`}>
                        {formatCurrencyBRL(item.overallLowest)}
                      </span>
                    </div>

                    {/* Breakdown sub-labels */}
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400">
                      {item.lowestBusPrice && (
                        <span title={`Ônibus a partir de ${formatCurrencyBRL(item.lowestBusPrice)}`}>🚌</span>
                      )}
                      {item.lowestFlightPrice && (
                        <span title={`Voo a partir de ${formatCurrencyBRL(item.lowestFlightPrice)}`}>✈️</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tips section */}
          <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <Bus className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <b className="text-slate-900 block mb-0.5">Dica para Ônibus</b>
                Viagens noturnas em leito-cama economizam uma diária de hotel e costumam ter menor variação de preço.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Plane className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <b className="text-slate-900 block mb-0.5">Dica para Voos</b>
                Voos às terças, quartas e sábados geralmente contam com tarifas promocionais mais atrativas.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Clique em qualquer dia para ver os bilhetes disponíveis</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-xs hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
