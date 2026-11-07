import { useState, useMemo } from 'react';
import { 
  Plane, 
  Bus, 
  Clock, 
  Luggage, 
  Wifi, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { Ticket } from '../types';
import { formatCurrencyBRL, formatDuration, formatTime, formatDateBR } from '../services/ticketEngine';

interface TicketCardProps {
  ticket: Ticket;
  paymentMode?: 'money' | 'miles' | 'points_cash';
  onSelect: (ticket: Ticket) => void;
}

export function TicketCard({ ticket, paymentMode = 'money', onSelect }: TicketCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string>(ticket.milesOption.program);

  const depTime = formatTime(ticket.departure.dateTime);
  const arrTime = formatTime(ticket.arrival.dateTime);

  const isFlight = ticket.type === 'flight';

  // Active miles option based on selected loyalty program
  const activeMilesOption = useMemo(() => {
    if (ticket.milesOption.program === selectedProgram) {
      return ticket.milesOption;
    }
    const alt = ticket.alternativeMilesOptions?.find(o => o.program === selectedProgram);
    return alt || ticket.milesOption;
  }, [ticket, selectedProgram]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all shadow-xs hover:shadow-md overflow-hidden group">
      {/* Deal tag bar if any */}
      <div className="px-5 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {paymentMode === 'miles' && (
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Emissão por Milhas & Pontos
            </span>
          )}
          {paymentMode === 'points_cash' && (
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1 text-[11px]">
              Pontos + Dinheiro
            </span>
          )}
          {activeMilesOption.isGoodDeal && (
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              {activeMilesOption.badgeLabel || 'Excelente Resgate'} (CPM: {formatCurrencyBRL(activeMilesOption.cpmValueBRL)}/k)
            </span>
          )}
          {ticket.tags && ticket.tags.includes('cheapest') && (
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Opção Mais Barata
            </span>
          )}
          {ticket.tags && ticket.tags.includes('fastest') && (
            <span className="font-semibold text-amber-700 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Trajeto Mais Rápido
            </span>
          )}
          {ticket.tags && ticket.tags.includes('flash_deal') && (
            <span className="font-semibold text-rose-600 flex items-center gap-1">
              🔥 Desconto de {ticket.discountPercentage}%
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Fornecedor oficial: {ticket.partnerName}
        </span>
      </div>

      {/* Main Ticket Layout */}
      <div className="p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        {/* Left: Carrier Info & Route Schedule */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Company Info */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs bg-gradient-to-br ${ticket.company.color}`}>
                {ticket.company.logoText.slice(0, 4)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{ticket.company.name}</span>
                  <span className="text-xs text-slate-500 font-mono-numbers">
                    {ticket.flightOrBusNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    {isFlight ? (
                      <>
                        <Plane className="w-3 h-3 text-sky-600" />
                        <span>Voo Comercial</span>
                      </>
                    ) : (
                      <>
                        <Bus className="w-3 h-3 text-blue-600" />
                        <span>Ônibus Rodoviário</span>
                      </>
                    )}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-600 font-medium">{ticket.seatClass}</span>
                </div>
              </div>
            </div>

            {/* Baggage Tag & Loyalty Program selector */}
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              {/* Program selector for miles */}
              {(paymentMode === 'miles' || paymentMode === 'points_cash') && ticket.alternativeMilesOptions && ticket.alternativeMilesOptions.length > 0 && (
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:ring-sky-500"
                >
                  <option value={ticket.milesOption.program}>{ticket.milesOption.programName}</option>
                  {ticket.alternativeMilesOptions.map(alt => (
                    <option key={alt.program} value={alt.program}>{alt.programName}</option>
                  ))}
                </select>
              )}

              <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <Luggage className="w-3.5 h-3.5 text-slate-400" />
                <span>{ticket.baggage.carryOn ? 'Mão inclusa' : 'Sem bagagem'}</span>
                {ticket.baggage.checked && (
                  <span className="text-emerald-600 font-medium">· + Despachada</span>
                )}
              </div>
            </div>
          </div>

          {/* Time & Flight/Route Progression Bar */}
          <div className="grid grid-cols-12 items-center gap-3 pt-2">
            {/* Departure */}
            <div className="col-span-4 text-left">
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-numbers">
                {depTime}
              </div>
              <div className="font-bold text-xs text-slate-700 mt-0.5">
                {ticket.departure.location.code}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {ticket.departure.location.city}
              </div>
            </div>

            {/* Duration Center Bar */}
            <div className="col-span-4 text-center px-2">
              <span className="text-xs font-semibold text-slate-500 font-mono-numbers block mb-1">
                {formatDuration(ticket.durationMinutes)}
              </span>
              <div className="relative flex items-center justify-center">
                <div className="w-full h-0.5 bg-slate-200" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-slate-400">
                  {isFlight ? <Plane className="w-3.5 h-3.5" /> : <Bus className="w-3.5 h-3.5" />}
                </div>
              </div>
              <span className={`text-[11px] font-medium block mt-1 ${
                ticket.stops === 0 ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {ticket.stops === 0 ? 'Direto' : `${ticket.stops} parada`}
              </span>
            </div>

            {/* Arrival */}
            <div className="col-span-4 text-right">
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-numbers">
                {arrTime}
              </div>
              <div className="font-bold text-xs text-slate-700 mt-0.5">
                {ticket.arrival.location.code}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {ticket.arrival.location.city}
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Divider on Desktop */}
        <div className="hidden lg:block w-px self-stretch bg-slate-100" />

        {/* Right: Pricing & CTA */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between lg:justify-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 min-w-[210px]">
          <div className="text-left sm:text-right lg:text-right w-full">
            {paymentMode === 'miles' ? (
              /* Miles Display */
              <div>
                <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                  {activeMilesOption.programName}
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-numbers tracking-tight">
                  {new Intl.NumberFormat('pt-BR').format(activeMilesOption.points)}{' '}
                  <span className="text-base font-bold text-slate-500">pts</span>
                </div>
                <p className="text-xs text-slate-600 font-mono-numbers mt-0.5">
                  {activeMilesOption.taxBRL > 0 ? (
                    <>+ {formatCurrencyBRL(activeMilesOption.taxBRL)} taxas</>
                  ) : (
                    <span className="text-emerald-600 font-medium">Taxa R$ 0,00</span>
                  )}
                </p>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Valor em dinheiro: {formatCurrencyBRL(ticket.price)}
                </span>
              </div>
            ) : paymentMode === 'points_cash' ? (
              /* Points + Cash Display */
              <div>
                <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
                  {activeMilesOption.programName} + R$
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-numbers tracking-tight">
                  {new Intl.NumberFormat('pt-BR').format(activeMilesOption.cashOption?.reducedPoints || Math.round(activeMilesOption.points * 0.5))} pts
                </div>
                <p className="text-xs font-bold text-indigo-700 font-mono-numbers mt-0.5">
                  + {formatCurrencyBRL(activeMilesOption.cashOption?.cashAmount || Math.round(ticket.price * 0.5))}
                </p>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Economize {formatCurrencyBRL(ticket.price - (activeMilesOption.cashOption?.cashAmount || 0))}
                </span>
              </div>
            ) : (
              /* Regular Money Display */
              <div>
                {ticket.originalPrice && (
                  <span className="text-xs text-slate-400 line-through font-mono-numbers block">
                    {formatCurrencyBRL(ticket.originalPrice)}
                  </span>
                )}
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-numbers tracking-tight">
                  {formatCurrencyBRL(ticket.price)}
                </div>
                <p className="text-xs text-slate-500 font-mono-numbers mt-0.5">
                  em até {ticket.installments.count}x de {formatCurrencyBRL(ticket.installments.value)} s/ juros
                </p>
                <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-amber-700">
                  <span>ou <b>{new Intl.NumberFormat('pt-BR').format(activeMilesOption.points)} pts</b> ({activeMilesOption.programName})</span>
                </div>
              </div>
            )}

            <span className="text-[11px] text-emerald-600 font-medium block mt-1">
              {ticket.seatsAvailable} {ticket.seatsAvailable === 1 ? 'assento restante' : 'assentos restantes'}
            </span>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <button
              type="button"
              onClick={() => onSelect(ticket)}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>{paymentMode === 'miles' ? 'Emitir com Milhas' : paymentMode === 'points_cash' ? 'Emitir Pontos + R$' : 'Ver Oferta'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 py-1"
            >
              <span>{isExpanded ? 'Ocultar detalhes' : 'Ver itinerário & milhas'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Itinerary & Policy Drawer */}
      {isExpanded && (
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Itinerary details */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                Detalhes da Rota
              </span>
              <div className="space-y-1.5 border-l-2 border-sky-400 pl-3">
                <div>
                  <span className="font-bold text-slate-800">{depTime} - {ticket.departure.location.name}</span>
                  <p className="text-[11px] text-slate-500">{ticket.departure.terminal}</p>
                </div>
                {ticket.stopDetails && ticket.stopDetails.length > 0 && (
                  <div className="py-1 text-amber-700 font-medium">
                    ⚠️ {ticket.stopDetails.join(', ')}
                  </div>
                )}
                <div>
                  <span className="font-bold text-slate-800">{arrTime} - {ticket.arrival.location.name}</span>
                  <p className="text-[11px] text-slate-500">{ticket.arrival.terminal}</p>
                </div>
              </div>
            </div>

            {/* Baggage & Amenities */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                Comodidades & Bagagem
              </span>
              <ul className="space-y-1 text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{ticket.baggage.details}</span>
                </li>
                {ticket.amenities.map((am, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{am}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Loyalty & Miles Breakdown Section */}
          <div className="pt-3 border-t border-slate-200/60 space-y-2">
            <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
              Tabela Comparativa de Resgate por Milhas & Programas de Recompensa
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Primary program */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{ticket.milesOption.programName}</span>
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                    Principal
                  </span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 font-mono-numbers">
                  {new Intl.NumberFormat('pt-BR').format(ticket.milesOption.points)} pts
                </div>
                <div className="text-[11px] text-slate-500 font-mono-numbers flex justify-between">
                  <span>Taxa: {ticket.milesOption.taxBRL > 0 ? formatCurrencyBRL(ticket.milesOption.taxBRL) : 'R$ 0,00'}</span>
                  <span className="text-emerald-700 font-medium">CPM: {formatCurrencyBRL(ticket.milesOption.cpmValueBRL)}/k</span>
                </div>
              </div>

              {/* Alternative programs */}
              {ticket.alternativeMilesOptions?.map((alt) => (
                <div key={alt.program} className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{alt.programName}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {alt.badgeLabel || 'Parceiro'}
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono-numbers">
                    {new Intl.NumberFormat('pt-BR').format(alt.points)} pts
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono-numbers flex justify-between">
                    <span>Taxa: {alt.taxBRL > 0 ? formatCurrencyBRL(alt.taxBRL) : 'R$ 0,00'}</span>
                    <span className="text-emerald-700 font-medium">CPM: {formatCurrencyBRL(alt.cpmValueBRL)}/k</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              * O CPM (Custo Por Milheiro) mede a economia real das suas milhas em relação ao valor em dinheiro. Acima de R$ 17,50 é considerado um excelente resgate.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Cancelamento gratuito garantido por lei até 24h após a compra</span>
            <span>Tarifa confirmada em tempo real com {ticket.partnerName}</span>
          </div>
        </div>
      )}
    </div>
  );
}
