import { useState } from 'react';
import { 
  X, 
  Plane, 
  Bus, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Wallet, 
  Luggage, 
  User, 
  Clock, 
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Ticket } from '../types';
import { formatCurrencyBRL, formatDuration, formatTime, formatDateBR } from '../services/ticketEngine';

interface BookingModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (ticket: Ticket, bookingDetails: any) => void;
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
  onConfirmBooking,
  hostAppInfo
}: BookingModalProps) {
  if (!isOpen || !ticket) return null;

  const [step, setStep] = useState<'details' | 'seats' | 'payment' | 'confirmed'>('details');
  const [selectedSeat, setSelectedSeat] = useState<string>(ticket.type === 'flight' ? '12A' : '05L');
  
  // Passenger form state
  const [passengerName, setPassengerName] = useState(hostAppInfo?.userName || 'Carlos Eduardo Silva');
  const [passengerDoc, setPassengerDoc] = useState('389.201.849-04');
  const [passengerEmail, setPassengerEmail] = useState('carlos.silva@email.com');
  const [passengerPhone, setPassengerPhone] = useState('(11) 98765-4321');
  
  // Payment option: pix, card, wallet, miles, points_cash
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'wallet' | 'miles' | 'points_cash'>('miles');
  const [selectedMilesProgram, setSelectedMilesProgram] = useState<string>(ticket.milesOption.program);
  const [loyaltyAccountNumber, setLoyaltyAccountNumber] = useState('38920184904');
  const [bookingRef, setBookingRef] = useState<string>('');

  const isFlight = ticket.type === 'flight';

  // Chosen miles option
  const activeMiles = selectedMilesProgram === ticket.milesOption.program
    ? ticket.milesOption
    : (ticket.alternativeMilesOptions?.find(o => o.program === selectedMilesProgram) || ticket.milesOption);

  // Sample seats for interactive picker
  const flightSeats = [
    { row: '10', seats: ['A', 'B', 'C', 'D', 'E', 'F'] },
    { row: '11', seats: ['A', 'B', 'C', 'D', 'E', 'F'] },
    { row: '12', seats: ['A', 'B', 'C', 'D', 'E', 'F'] },
    { row: '14', seats: ['A', 'B', 'C', 'D', 'E', 'F'] }
  ];

  const busSeats = [
    ['01L', '02L', 'corredor', '03L', '04L'],
    ['05L', '06L', 'corredor', '07L', '08L'],
    ['09L', '10L', 'corredor', '11L', '12L'],
    ['13L', '14L', 'corredor', '15L', '16L']
  ];

  const handleFinalizeBooking = () => {
    const generatedRef = `BR-VIAG-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(generatedRef);
    setStep('confirmed');

    const isMilesPayment = paymentMethod === 'miles';
    const isHybridPayment = paymentMethod === 'points_cash';

    onConfirmBooking(ticket, {
      locator: generatedRef,
      seat: selectedSeat,
      passenger: { name: passengerName, doc: passengerDoc, email: passengerEmail, phone: passengerPhone },
      paymentMethod,
      totalAmount: isMilesPayment ? activeMiles.taxBRL : isHybridPayment ? (activeMiles.cashOption?.cashAmount || ticket.price) : ticket.price,
      pointsDebited: isMilesPayment ? activeMiles.points : isHybridPayment ? (activeMiles.cashOption?.reducedPoints || Math.round(activeMiles.points * 0.5)) : 0,
      loyaltyProgram: (isMilesPayment || isHybridPayment) ? activeMiles.programName : undefined,
      taxPaid: activeMiles.taxBRL,
      bookedAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${ticket.company.color}`}>
              {ticket.company.logoText.slice(0, 3)}
            </div>
            <div>
              <h2 id="booking-modal-title" className="text-sm sm:text-base font-bold text-slate-900">
                Reserva com {ticket.company.name}
              </h2>
              <p className="text-xs text-slate-500">
                {ticket.departure.location.city} ➔ {ticket.arrival.location.city} · {ticket.flightOrBusNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar reserva"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper (except confirmed) */}
        {step !== 'confirmed' && (
          <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between text-xs">
            <button
              onClick={() => setStep('details')}
              className={`font-semibold flex items-center gap-1.5 ${
                step === 'details' ? 'text-sky-700' : 'text-slate-500'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-300 text-[10px] flex items-center justify-center">1</span>
              <span>Passageiro</span>
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => setStep('seats')}
              className={`font-semibold flex items-center gap-1.5 ${
                step === 'seats' ? 'text-sky-700' : 'text-slate-500'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-300 text-[10px] flex items-center justify-center">2</span>
              <span>Assento ({selectedSeat})</span>
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => setStep('payment')}
              className={`font-semibold flex items-center gap-1.5 ${
                step === 'payment' ? 'text-sky-700' : 'text-slate-500'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-300 text-[10px] flex items-center justify-center">3</span>
              <span>Pagamento</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* STEP 1: Details & Passenger */}
          {step === 'details' && (
            <div className="space-y-5">
              {/* Trip Recap Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    {isFlight ? <Plane className="w-3.5 h-3.5 text-sky-600" /> : <Bus className="w-3.5 h-3.5 text-blue-600" />}
                    {isFlight ? 'Passagem Aérea' : 'Passagem Rodoviária'}
                  </span>
                  <span className="font-mono-numbers font-medium">{formatDuration(ticket.durationMinutes)}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-bold text-slate-900 font-mono-numbers">{formatTime(ticket.departure.dateTime)}</div>
                    <div className="text-xs font-semibold text-slate-700">{ticket.departure.location.name}</div>
                  </div>
                  <div className="flex-1 text-center text-xs text-slate-400">
                    <ArrowRight className="w-4 h-4 mx-auto text-slate-300" />
                    <span>{ticket.stops === 0 ? 'Direto' : `${ticket.stops} parada`}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900 font-mono-numbers">{formatTime(ticket.arrival.dateTime)}</div>
                    <div className="text-xs font-semibold text-slate-700">{ticket.arrival.location.name}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span>Classe: <b>{ticket.seatClass}</b></span>
                  <span>{ticket.baggage.details}</span>
                </div>
              </div>

              {/* Passenger Form */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Dados do Passageiro Titular
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CPF / Documento</label>
                    <input
                      type="text"
                      value={passengerDoc}
                      onChange={(e) => setPassengerDoc(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail para envio do Bilhete</label>
                    <input
                      type="email"
                      value={passengerEmail}
                      onChange={(e) => setPassengerEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone Celular / WhatsApp</label>
                    <input
                      type="tel"
                      value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep('seats')}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <span>Continuar para Escolha de Assento</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Interactive Seat Picker */}
          {step === 'seats' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {isFlight ? 'Cabine do Avião' : 'Mapa de Assentos do Ônibus'}
                  </h3>
                  <p className="text-xs text-slate-500">Selecione seu assento preferido sem taxa adicional</p>
                </div>
                <div className="text-xs text-slate-600">
                  Assento selecionado: <b className="text-sky-700 font-mono-numbers">{selectedSeat}</b>
                </div>
              </div>

              {/* Seat Legend */}
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-sky-600" /> Selecionado
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200" /> Disponível
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-slate-300 opacity-60" /> Ocupado
                </span>
              </div>

              {/* Airplane Seat Map */}
              {isFlight ? (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 max-w-sm mx-auto space-y-2">
                  <div className="text-center text-[11px] font-semibold text-slate-400 mb-2">Frente da Aeronave</div>
                  {flightSeats.map((row) => (
                    <div key={row.row} className="flex items-center justify-center gap-2">
                      <span className="w-6 text-xs text-slate-400 font-mono-numbers">{row.row}</span>
                      <div className="flex gap-1.5">
                        {row.seats.slice(0, 3).map((letter) => {
                          const seatId = `${row.row}${letter}`;
                          const isOccupied = seatId === '10B' || seatId === '11E';
                          const isSel = selectedSeat === seatId;
                          return (
                            <button
                              key={seatId}
                              disabled={isOccupied}
                              onClick={() => setSelectedSeat(seatId)}
                              className={`w-7 h-8 rounded text-[11px] font-semibold transition-all ${
                                isSel
                                  ? 'bg-sky-600 text-white ring-2 ring-sky-600/30 font-bold'
                                  : isOccupied
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:border-sky-500'
                              }`}
                            >
                              {letter}
                            </button>
                          );
                        })}
                      </div>
                      <div className="w-4 text-center text-[10px] text-slate-300">|</div>
                      <div className="flex gap-1.5">
                        {row.seats.slice(3, 6).map((letter) => {
                          const seatId = `${row.row}${letter}`;
                          const isOccupied = seatId === '12D';
                          const isSel = selectedSeat === seatId;
                          return (
                            <button
                              key={seatId}
                              disabled={isOccupied}
                              onClick={() => setSelectedSeat(seatId)}
                              className={`w-7 h-8 rounded text-[11px] font-semibold transition-all ${
                                isSel
                                  ? 'bg-sky-600 text-white ring-2 ring-sky-600/30 font-bold'
                                  : isOccupied
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:border-sky-500'
                              }`}
                            >
                              {letter}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Bus Seat Map */
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 max-w-sm mx-auto space-y-2">
                  <div className="text-center text-[11px] font-semibold text-slate-400 mb-2">Motorista (Frente)</div>
                  {busSeats.map((row, rIdx) => (
                    <div key={rIdx} className="flex items-center justify-center gap-2">
                      <div className="flex gap-1.5">
                        {row.slice(0, 2).map((seatId) => {
                          const isOccupied = seatId === '02L' || seatId === '10L';
                          const isSel = selectedSeat === seatId;
                          return (
                            <button
                              key={seatId}
                              disabled={isOccupied}
                              onClick={() => setSelectedSeat(seatId)}
                              className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                                isSel
                                  ? 'bg-blue-600 text-white ring-2 ring-blue-600/30 font-bold'
                                  : isOccupied
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-500'
                              }`}
                            >
                              {seatId}
                            </button>
                          );
                        })}
                      </div>
                      <div className="w-8 text-center text-[10px] text-slate-300">corredor</div>
                      <div className="flex gap-1.5">
                        {row.slice(3, 5).map((seatId) => {
                          const isOccupied = seatId === '04L' || seatId === '16L';
                          const isSel = selectedSeat === seatId;
                          return (
                            <button
                              key={seatId}
                              disabled={isOccupied}
                              onClick={() => setSelectedSeat(seatId)}
                              className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                                isSel
                                  ? 'bg-blue-600 text-white ring-2 ring-blue-600/30 font-bold'
                                  : isOccupied
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-500'
                              }`}
                            >
                              {seatId}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <span>Continuar para Pagamento</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Options & Host App Integration */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Forma de Pagamento & Emissão
                </h3>
                <p className="text-xs text-slate-500">
                  Selecione se deseja emitir em <b>Dinheiro</b>, <b>Milhas & Pontos de Fidelidade</b> ou <b>Pontos + R$</b>
                </p>
              </div>

              <div className="space-y-2.5">
                {/* 1. MILES & POINTS REDEMPTION OPTION */}
                <div className={`p-3.5 rounded-xl border transition-all ${
                  paymentMethod === 'miles'
                    ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'miles'}
                      onChange={() => setPaymentMethod('miles')}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Resgate por Milhas & Pontos ({activeMiles.programName})
                        </span>
                        <span className="text-xs font-extrabold text-amber-900 font-mono-numbers">
                          {new Intl.NumberFormat('pt-BR').format(activeMiles.points)} pts{' '}
                          <span className="text-[11px] font-medium text-slate-600">
                            {activeMiles.taxBRL > 0 ? `+ ${formatCurrencyBRL(activeMiles.taxBRL)} taxas` : '(Sem taxas)'}
                          </span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Emissão direta no programa parceiro com confirmação eletrônica instantânea
                      </p>
                    </div>
                  </label>

                  {/* Active miles sub-controls */}
                  {paymentMethod === 'miles' && (
                    <div className="mt-3 pt-3 border-t border-amber-200/70 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                            Programa de Fidelidade Selecionado
                          </label>
                          <select
                            value={selectedMilesProgram}
                            onChange={(e) => setSelectedMilesProgram(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-slate-900 focus:ring-amber-500"
                          >
                            <option value={ticket.milesOption.program}>
                              {ticket.milesOption.programName} ({new Intl.NumberFormat('pt-BR').format(ticket.milesOption.points)} pts)
                            </option>
                            {ticket.alternativeMilesOptions?.map(alt => (
                              <option key={alt.program} value={alt.program}>
                                {alt.programName} ({new Intl.NumberFormat('pt-BR').format(alt.points)} pts)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                            Nº da Conta / CPF do Programa
                          </label>
                          <input
                            type="text"
                            value={loyaltyAccountNumber}
                            onChange={(e) => setLoyaltyAccountNumber(e.target.value)}
                            placeholder="CPF ou código de fidelidade"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-slate-900 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      {/* SuperApp Points balance status if host provides */}
                      {hostAppInfo && (
                        <div className="p-2.5 bg-white/80 rounded-lg border border-amber-200 text-xs flex items-center justify-between">
                          <span className="text-slate-700">
                            Saldo em <b>{hostAppInfo.appName}</b>:
                          </span>
                          <span className="font-bold font-mono-numbers text-amber-900">
                            {new Intl.NumberFormat('pt-BR').format(hostAppInfo.userPoints || 48500)} pontos disponíveis
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. HYBRID: POINTS + CASH */}
                {activeMiles.cashOption && (
                  <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'points_cash'
                      ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'points_cash'}
                      onChange={() => setPaymentMethod('points_cash')}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                          Pontos + Dinheiro ({activeMiles.programName})
                        </span>
                        <span className="text-xs font-bold text-indigo-700 font-mono-numbers">
                          {new Intl.NumberFormat('pt-BR').format(activeMiles.cashOption.reducedPoints)} pts + {formatCurrencyBRL(activeMiles.cashOption.cashAmount)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Ideal quando você não tem o saldo total de milhas
                      </p>
                    </div>
                  </label>
                )}

                {/* 3. Host App Wallet */}
                {hostAppInfo && (
                  <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'wallet'}
                      onChange={() => setPaymentMethod('wallet')}
                      className="mt-0.5 text-sky-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-sky-600" />
                          Saldo em Reais {hostAppInfo.appName}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 font-mono-numbers">
                          Saldo: {formatCurrencyBRL(hostAppInfo.userBalance || 0)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Débito instantâneo direto do saldo bancário do aplicativo
                      </p>
                    </div>
                  </label>
                )}

                {/* 4. PIX */}
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'pix'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="payment-method"
                    checked={paymentMethod === 'pix'}
                    onChange={() => setPaymentMethod('pix')}
                    className="mt-0.5 text-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                        PIX Instantâneo
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        5% de desconto
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Confirmação imediata com emissão automática do voucher digital
                    </p>
                  </div>
                </label>

                {/* 5. Credit Card */}
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="payment-method"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mt-0.5 text-sky-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-600" />
                        Cartão de Crédito
                      </span>
                      <span className="text-xs text-slate-500 font-mono-numbers">
                        em até {ticket.installments.count}x sem juros
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Visa, Mastercard, Elo, Hipercard e American Express
                    </p>
                  </div>
                </label>
              </div>

              {/* Safe Security Notice */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Emissão oficial protegida e auditada pela transportadora e programa de recompensas.</span>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep('seats')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeBooking}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                >
                  <span>
                    {paymentMethod === 'miles'
                      ? `Confirmar Emissão com Milhas (${new Intl.NumberFormat('pt-BR').format(activeMiles.points)} pts)`
                      : paymentMethod === 'points_cash'
                      ? `Confirmar Pontos + R$ (${formatCurrencyBRL(activeMiles.cashOption?.cashAmount || ticket.price)})`
                      : `Confirmar e Pagar ${formatCurrencyBRL(ticket.price)}`}
                  </span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmed State / Digital Voucher */}
          {step === 'confirmed' && (
            <div className="text-center py-4 space-y-5 animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Reserva Emitida com Sucesso
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  Boa viagem, {passengerName.split(' ')[0]}!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Seu bilhete eletrônico foi enviado para <b>{passengerEmail}</b>
                </p>
              </div>

              {/* Digital Boarding Pass */}
              <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{ticket.company.name}</span>
                    <span className="text-xs text-slate-400 font-mono-numbers">{ticket.flightOrBusNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Localizador</span>
                    <span className="text-xs font-bold font-mono-numbers text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                      {bookingRef}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Passageiro</span>
                    <span className="font-semibold text-slate-800">{passengerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assento</span>
                    <span className="font-bold text-slate-900 font-mono-numbers">{selectedSeat} ({ticket.seatClass})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Partida</span>
                    <span className="font-semibold text-slate-800">{formatTime(ticket.departure.dateTime)} · {ticket.departure.location.code}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Chegada</span>
                    <span className="font-semibold text-slate-800">{formatTime(ticket.arrival.dateTime)} · {ticket.arrival.location.code}</span>
                  </div>
                </div>

                {/* Pricing / Miles Details */}
                <div className="pt-3 border-t border-slate-200 text-xs space-y-1">
                  {paymentMethod === 'miles' ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Programa & Milhas Debitadas:</span>
                        <span className="font-bold text-amber-800 font-mono-numbers">
                          {new Intl.NumberFormat('pt-BR').format(activeMiles.points)} pts ({activeMiles.programName})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Taxa de Embarque Paga:</span>
                        <span className="font-bold text-slate-900 font-mono-numbers">
                          {activeMiles.taxBRL > 0 ? formatCurrencyBRL(activeMiles.taxBRL) : 'R$ 0,00'}
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium">
                        Economia equivalente de {formatCurrencyBRL(ticket.price - activeMiles.taxBRL)} em relação à tarifa em dinheiro!
                      </div>
                    </>
                  ) : paymentMethod === 'points_cash' ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Pontos Debitados:</span>
                        <span className="font-bold text-indigo-700 font-mono-numbers">
                          {new Intl.NumberFormat('pt-BR').format(activeMiles.cashOption?.reducedPoints || 0)} pts
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Valor em Dinheiro Pago:</span>
                        <span className="font-bold text-slate-900 font-mono-numbers">
                          {formatCurrencyBRL(activeMiles.cashOption?.cashAmount || ticket.price)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Valor Total Pago:</span>
                      <span className="font-bold text-slate-900 font-mono-numbers text-sm">
                        {formatCurrencyBRL(ticket.price)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Concluir e Voltar às Buscas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
