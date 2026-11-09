import { useState } from 'react';
import { 
  X, 
  Plane, 
  Bus, 
  Check, 
  ShieldCheck, 
  ExternalLink,
  Luggage, 
  Calendar,
  Sparkles,
  ArrowRight,
  Copy,
  BookmarkCheck,
  Info,
  Clock,
  MapPin
} from 'lucide-react';
import { Ticket } from '../types';
import { formatCurrencyBRL, formatDuration, formatTime, formatDateBR } from '../services/ticketEngine';

interface BookingModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking?: (ticket: Ticket, bookingDetails: any) => void;
  hostAppInfo?: {
    appName: string;
    userName?: string;
    userBalance?: number;
    accountNumber?: string;
    userPoints?: number;
    loyaltyPrograms?: { id: string; name: string; balance: number }[];
  };
}

export function BookingModal({
  ticket,
  isOpen,
  onClose,
  onConfirmBooking
}: BookingModalProps) {
  if (!isOpen || !ticket) return null;

  const [copied, setCopied] = useState(false);
  const [savedToPlan, setSavedToPlan] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string>(ticket.milesOption.program);

  const isFlight = ticket.type === 'flight';
  const depTime = formatTime(ticket.departure.dateTime);
  const arrTime = formatTime(ticket.arrival.dateTime);

  const activeMiles = selectedProgram === ticket.milesOption.program
    ? ticket.milesOption
    : (ticket.alternativeMilesOptions?.find(o => o.program === selectedProgram) || ticket.milesOption);

  const copyTripDetails = () => {
    const text = `📋 PROGRAMAÇÃO DE VIAGEM
Transporte: ${isFlight ? 'Voo Comercial' : 'Ônibus Rodoviário'} (${ticket.company.name} ${ticket.flightOrBusNumber})
Rota: ${ticket.departure.location.city} (${ticket.departure.location.code}) ➔ ${ticket.arrival.location.city} (${ticket.arrival.location.code})
Horário: Partida às ${depTime} | Chegada às ${arrTime} (${formatDuration(ticket.durationMinutes)})
Classe: ${ticket.seatClass}
Bagagem: ${ticket.baggage.details}
Preço Oficial: ${formatCurrencyBRL(ticket.price)}
Milhas Necessárias: ${new Intl.NumberFormat('pt-BR').format(activeMiles.points)} pts (${activeMiles.programName}) + Taxa: ${formatCurrencyBRL(activeMiles.taxBRL)}
Link para Emissão Oficial: ${ticket.offerEmissionUrl}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveToPlan = () => {
    setSavedToPlan(true);
    if (onConfirmBooking) {
      onConfirmBooking(ticket, {
        savedAt: new Date().toISOString(),
        program: activeMiles.programName,
        points: activeMiles.points,
        price: ticket.price,
        emissionUrl: ticket.offerEmissionUrl
      });
    }
    setTimeout(() => setSavedToPlan(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${ticket.company.color}`}>
              {ticket.company.logoText.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="consultation-modal-title" className="text-sm sm:text-base font-bold text-slate-900">
                  Ficha de Consulta & Programação
                </h2>
                <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                  Sem Venda Direta
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {ticket.departure.location.city} ➔ {ticket.arrival.location.city} · {ticket.company.name} ({ticket.flightOrBusNumber})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar consulta"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice: Pure consultation / organization policy */}
        <div className="px-6 py-3 bg-blue-50/70 border-b border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <b>Finalidade de Consulta & Organização:</b> Esta plataforma é uma ferramenta de busca, inteligência tarifária e planejamento. Para garantir a segurança dos seus dados, a emissão do bilhete (por dinheiro ou milhas) é concluída diretamente no site oficial da transportadora credenciada.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Flight/Bus Itinerary Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                {isFlight ? <Plane className="w-4 h-4 text-sky-600" /> : <Bus className="w-4 h-4 text-blue-600" />}
                <span>{ticket.isInternational ? 'Voo Internacional Homologado' : (isFlight ? 'Voo Doméstico Regular' : 'Linha Rodoviária Interestadual')}</span>
              </span>
              <span className="font-mono-numbers font-medium text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(ticket.durationMinutes)} de duração</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 py-2 border-y border-slate-200/60">
              <div>
                <div className="text-2xl font-black text-slate-900 font-mono-numbers">{depTime}</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">{ticket.departure.location.name} ({ticket.departure.location.code})</div>
                <div className="text-[11px] text-slate-500">{ticket.departure.terminal}</div>
              </div>

              <div className="flex-1 text-center px-2">
                <ArrowRight className="w-5 h-5 mx-auto text-slate-300" />
                <span className={`text-[11px] font-bold block mt-1 ${ticket.stops === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {ticket.stops === 0 ? 'Direto (Sem escalas)' : `${ticket.stops} conexão`}
                </span>
                {ticket.stopDetails && ticket.stopDetails.length > 0 && (
                  <span className="text-[10px] text-slate-500 block">{ticket.stopDetails[0]}</span>
                )}
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-slate-900 font-mono-numbers">{arrTime}</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">{ticket.arrival.location.name} ({ticket.arrival.location.code})</div>
                <div className="text-[11px] text-slate-500">{ticket.arrival.terminal}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Classe Tarifária:</span>
                <span className="font-semibold text-slate-800">{ticket.seatClass}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Franquia de Bagagem:</span>
                <span className="font-semibold text-slate-800">{ticket.baggage.details}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Miles Comparison Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cash Tariffs */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Valor Extraído da Passagem (R$)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-numbers">
                {formatCurrencyBRL(ticket.price)}
              </div>
              <p className="text-xs text-slate-500 font-mono-numbers">
                em até {ticket.installments.count}x de {formatCurrencyBRL(ticket.installments.value)} sem juros no cartão
              </p>
              <div className="pt-2 text-[11px] text-emerald-700 font-medium">
                ✓ Valor de mercado atualizado com fornecedor oficial
              </div>
            </div>

            {/* Miles & Points */}
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Pontos Necessários</span>
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                  {activeMiles.programName}
                </span>
              </div>

              <div className="text-2xl sm:text-3xl font-black text-amber-950 font-mono-numbers">
                {new Intl.NumberFormat('pt-BR').format(activeMiles.points)}{' '}
                <span className="text-xs font-bold text-amber-700">pts</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 font-mono-numbers pt-1 border-t border-amber-200/60">
                <span>Taxa ANAC/Embarque:</span>
                <span className="font-bold text-slate-900">
                  {activeMiles.taxBRL > 0 ? formatCurrencyBRL(activeMiles.taxBRL) : 'R$ 0,00'}
                </span>
              </div>

              {/* Selector for other programs */}
              {ticket.alternativeMilesOptions && ticket.alternativeMilesOptions.length > 0 && (
                <div className="pt-1">
                  <label className="block text-[10px] text-amber-900 font-semibold mb-1">
                    Comparar outros programas:
                  </label>
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-white border border-amber-300 rounded-lg px-2 py-1"
                  >
                    <option key={`modal-prim-${ticket.id}-${ticket.milesOption.program}`} value={ticket.milesOption.program}>
                      {ticket.milesOption.programName} ({new Intl.NumberFormat('pt-BR').format(ticket.milesOption.points)} pts)
                    </option>
                    {ticket.alternativeMilesOptions
                      .filter(alt => alt.program !== ticket.milesOption.program)
                      .map(alt => (
                      <option key={`modal-alt-${ticket.id}-${alt.program}`} value={alt.program}>
                        {alt.programName} ({new Intl.NumberFormat('pt-BR').format(alt.points)} pts)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {/* Primary Link Button: External Emission */}
            <a
              href={ticket.offerEmissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
            >
              <span>Acessar Emissão Oficial na {ticket.company.name}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Copy Itinerary */}
              <button
                type="button"
                onClick={copyTripDetails}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copied ? 'Roteiro Copiado!' : 'Copiar Dados da Viagem'}</span>
              </button>

              {/* Save / Program Trip */}
              <button
                type="button"
                onClick={handleSaveToPlan}
                className="py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {savedToPlan ? <Check className="w-4 h-4 text-emerald-600" /> : <BookmarkCheck className="w-4 h-4 text-emerald-600" />}
                <span>{savedToPlan ? 'Salvo no Organizador!' : 'Adicionar ao Meu Roteiro'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default BookingModal;
