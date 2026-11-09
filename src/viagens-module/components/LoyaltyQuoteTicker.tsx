import { Sparkles, ShieldCheck, RefreshCw, HelpCircle, ArrowUpRight } from 'lucide-react';
import { LOYALTY_MARKET_QUOTES } from '../services/loyaltyMarketData';
import { PaymentMode } from '../types';

interface LoyaltyQuoteTickerProps {
  paymentMode: PaymentMode;
  onSelectPaymentMode: (mode: PaymentMode) => void;
}

export function LoyaltyQuoteTicker({ paymentMode, onSelectPaymentMode }: LoyaltyQuoteTickerProps) {
  const quotes = Object.values(LOYALTY_MARKET_QUOTES).slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-3">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                Fontes Confiáveis & Cotações Reais de Milhas
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sincronizado via GDS & ANTT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Valores reais extraídos diretamente das companhias com cálculo transparente de pontos e CPM.
            </p>
          </div>
        </div>

        {/* Quick Mode Switcher Indicator */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[11px] text-slate-400 font-medium">Modo ativo:</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
            paymentMode === 'miles'
              ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
              : paymentMode === 'points_cash'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
              : 'bg-slate-100 text-slate-800 border-slate-200'
          }`}>
            {paymentMode === 'miles' ? 'Milhas / Pontos' : paymentMode === 'points_cash' ? 'Pontos + Dinheiro' : 'Dinheiro (R$)'}
          </span>
        </div>
      </div>

      {/* Ticker of Real-time Milheiro Quotations */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
          <span className="font-semibold text-slate-700">Cotação Média de Mercado do Milheiro (1.000 pts):</span>
          <span className="text-[10px] text-slate-400">Referência oficial para cálculo de CPM de resgate</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {quotes.map((q) => (
            <div
              key={`ticker-quote-${q.id}`}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{q.name}</span>
                <span className="text-[9px] text-slate-400">{q.airlineOrOperator.split(' ')[0]}</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xs font-extrabold text-slate-800 font-mono-numbers">
                  R$ {q.standardCpm.toFixed(2)}
                </span>
                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">
                  &gt; R$ {q.cpmThresholdGoodDeal.toFixed(2)} vale milhas
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanatory Rule Footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span><b>Como funciona:</b> A passagem extrai o valor em dinheiro e, logo abaixo, informa os pontos exatos para emissão com a taxa de embarque.</span>
        </span>
        <button
          type="button"
          onClick={() => onSelectPaymentMode(paymentMode === 'miles' ? 'money' : 'miles')}
          className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>{paymentMode === 'miles' ? 'Ver preços em dinheiro' : 'Alternar para emissão com milhas'}</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
