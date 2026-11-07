import { useState } from 'react';
import { Bell, X, Check, Mail, Sparkles } from 'lucide-react';
import { Location } from '../types';
import { formatCurrencyBRL } from '../services/ticketEngine';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  origin: Location;
  destination: Location;
  currentLowestPrice: number;
}

export function PriceAlertModal({
  isOpen,
  onClose,
  origin,
  destination,
  currentLowestPrice
}: PriceAlertModalProps) {
  if (!isOpen) return null;

  const [email, setEmail] = useState('viajante@email.com');
  const [targetPrice, setTargetPrice] = useState(Math.round(currentLowestPrice * 0.85));
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      onClose();
      setSaved(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-modal-title"
      >
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-sky-600" />
            <h2 id="alert-modal-title" className="text-base font-bold text-slate-900">
              Alerta de Preço Baixo
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar alerta"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saved ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Alerta ativado com sucesso!</h3>
            <p className="text-xs text-slate-500">
              Avisaremos você em <b>{email}</b> assim que o preço cair para menos de {formatCurrencyBRL(targetPrice)}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-950 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                O monitoramento Skyscanner avisa instantaneamente quando houver promoções relâmpago de passagens de ônibus e avião para <b>{origin.city} ➔ {destination.city}</b>.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Avisar-me se o preço for menor que:
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">R$</span>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2 text-sm font-bold font-mono-numbers text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Preço mais barato atual: {formatCurrencyBRL(currentLowestPrice)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail para notificações
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Ativar Alerta
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
