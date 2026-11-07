import { useState } from 'react';
import { 
  Building2, 
  Wallet, 
  User, 
  Bell, 
  CreditCard, 
  QrCode, 
  ArrowUpRight, 
  Layers, 
  CheckCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ViagensModule } from '../viagens-module/ViagensModule';
import { Ticket } from '../viagens-module/types';
import { formatCurrencyBRL } from '../viagens-module/services/ticketEngine';

interface SuperAppHostSimulatorProps {
  onExitSimulator?: () => void;
}

export function SuperAppHostSimulator({ onExitSimulator }: SuperAppHostSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'viagens' | 'wallet' | 'profile'>('viagens');
  const [balance, setBalance] = useState(4850.00);
  const [points, setPoints] = useState(48500);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const handleBookingConfirmed = (ticket: Ticket, bookingDetails: any) => {
    // Deduct from host wallet if paid with wallet
    if (bookingDetails.paymentMethod === 'wallet') {
      setBalance(prev => Math.max(0, prev - ticket.price));
    } else if (bookingDetails.paymentMethod === 'miles') {
      // Deduct points
      const pts = bookingDetails.pointsDebited || ticket.milesOption.points;
      setPoints(prev => Math.max(0, prev - pts));
      // Deduct boarding tax if any from wallet
      if (bookingDetails.taxPaid > 0) {
        setBalance(prev => Math.max(0, Math.round((prev - bookingDetails.taxPaid) * 100) / 100));
      }
    } else if (bookingDetails.paymentMethod === 'points_cash') {
      const pts = bookingDetails.pointsDebited || (ticket.milesOption.cashOption?.reducedPoints || 0);
      setPoints(prev => Math.max(0, prev - pts));
      const cash = bookingDetails.totalAmount || (ticket.milesOption.cashOption?.cashAmount || 0);
      setBalance(prev => Math.max(0, Math.round((prev - cash) * 100) / 100));
    }

    setRecentBookings(prev => [
      {
        id: bookingDetails.locator,
        company: ticket.company.name,
        route: `${ticket.departure.location.city} ➔ ${ticket.arrival.location.city}`,
        type: ticket.type === 'flight' ? 'Voo' : 'Ônibus',
        seat: bookingDetails.seat,
        price: ticket.price,
        paymentMethod: bookingDetails.paymentMethod,
        pointsDebited: bookingDetails.pointsDebited,
        loyaltyProgram: bookingDetails.loyaltyProgram,
        totalAmount: bookingDetails.totalAmount,
        date: new Date().toLocaleDateString('pt-BR')
      },
      ...prev
    ]);

    const msg = bookingDetails.paymentMethod === 'miles'
      ? `Reserva ${bookingDetails.locator} confirmada com ${new Intl.NumberFormat('pt-BR').format(bookingDetails.pointsDebited)} pontos (${bookingDetails.loyaltyProgram})!`
      : `Reserva ${bookingDetails.locator} confirmada no Módulo VIAGENS!`;
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  return (
    <div className="w-full bg-slate-100 min-h-screen pb-16">
      {/* Simulation Banner Notice */}
      <div className="bg-amber-400 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-amber-500">
        <div className="flex items-center gap-2 mx-auto">
          <Layers className="w-4 h-4 text-slate-900" />
          <span>
            <b>Simulador de Aplicativo Hospedeiro Ativo</b> — Demonstração de entrega do módulo <code>&lt;ViagensModule /&gt;</code> dentro de outro app
          </span>
        </div>
        {onExitSimulator && (
          <button
            onClick={onExitSimulator}
            className="text-[11px] font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Sair do Simulador
          </button>
        )}
      </div>

      {/* Host App Navigation Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center text-slate-950 font-black text-sm">
              BR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">SuperApp Brasil</span>
                <span className="text-[10px] bg-slate-800 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">
                  App Principal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Banco Digital & Serviços Integrados</p>
            </div>
          </div>

          {/* User Quick Info in Host App */}
          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-4 text-right">
              <div>
                <span className="text-slate-400 block text-[10px]">Pontos Fidelidade</span>
                <span className="font-bold font-mono-numbers text-amber-400 text-sm">
                  {new Intl.NumberFormat('pt-BR').format(points)} pts
                </span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <span className="text-slate-400 block text-[10px]">Saldo da Conta</span>
                <span className="font-bold font-mono-numbers text-emerald-400 text-sm">
                  {formatCurrencyBRL(balance)}
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Host App Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 overflow-x-auto text-xs font-medium border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('home')}
            className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'home'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Início & Conta
          </button>
          <button
            onClick={() => setActiveTab('viagens')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'viagens'
                ? 'border-sky-400 text-sky-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Módulo VIAGENS (Ativo)</span>
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'wallet'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Minhas Reservas ({recentBookings.length})
          </button>
        </div>
      </header>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Content Switcher */}
      <main className="max-w-6xl mx-auto px-4 pt-6">
        {activeTab === 'viagens' && (
          <div className="space-y-6">
            {/* Host App Banner inside */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-sky-950">
              <div className="flex items-center gap-2.5">
                <Wallet className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <b className="block text-slate-900">Integração com Carteira SuperApp</b>
                  Você pode usar seu saldo de <b>{formatCurrencyBRL(balance)}</b> para pagar passagens de ônibus ou avião sem sair do app.
                </div>
              </div>
              <span className="bg-white text-sky-700 font-bold px-2.5 py-1 rounded-lg border border-sky-200 shrink-0">
                Cashback 3% Ativo
              </span>
            </div>

            {/* Render the actual ViagensModule with Host App context */}
            <ViagensModule
              onBookTicket={handleBookingConfirmed}
              hostAppInfo={{
                appName: 'SuperApp Brasil',
                userName: 'Carlos Eduardo Silva',
                userBalance: balance,
                accountNumber: '48291-0',
                userPoints: points,
                loyaltyPrograms: [
                  { id: 'superapp_points', name: 'Pontos SuperApp', balance: points },
                  { id: 'latam_pass', name: 'LATAM Pass', balance: 32000 },
                  { id: 'smiles', name: 'Smiles (GOL)', balance: 19400 },
                  { id: 'azul_fidelidade', name: 'Azul Fidelidade', balance: 24100 },
                  { id: 'livelo', name: 'Livelo', balance: 52000 },
                  { id: 'clickbus_rewards', name: 'ClickBus Rewards', balance: 3800 }
                ]
              }}
            />
          </div>
        )}

        {activeTab === 'home' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Painel Geral do SuperApp Hospedeiro</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Este aplicativo simula uma carteira digital / super app que contratou o módulo <b>VIAGENS</b> para oferecer busca e emissão de passagens em dinheiro e milhas aos seus clientes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left">
                <span className="text-xs text-slate-400 block">Saldo em Conta</span>
                <span className="text-lg font-bold text-slate-900 font-mono-numbers">{formatCurrencyBRL(balance)}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left">
                <span className="text-xs text-slate-400 block">Pontos Fidelidade</span>
                <span className="text-lg font-bold text-amber-700 font-mono-numbers">{new Intl.NumberFormat('pt-BR').format(points)} pts</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left">
                <span className="text-xs text-slate-400 block">Passagens Compradas</span>
                <span className="text-lg font-bold text-slate-900 font-mono-numbers">{recentBookings.length}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left">
                <span className="text-xs text-slate-400 block">Status da Integração</span>
                <span className="text-xs font-bold text-emerald-600 block mt-1">Conectado (SDK v1.0)</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('viagens')}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Abrir Módulo de Viagens
            </button>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Minhas Reservas Emitidas pelo Módulo VIAGENS
            </h3>
            {recentBookings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Nenhuma passagem reservada ainda nesta sessão. Vá até a aba "Módulo VIAGENS" e selecione uma passagem para simular a compra.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentBookings.map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{b.company} ({b.type})</span>
                        <span className="text-[11px] font-mono-numbers bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {b.id}
                        </span>
                        {b.paymentMethod === 'miles' && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                            Resgate Milhas ({b.loyaltyProgram})
                          </span>
                        )}
                        {b.paymentMethod === 'points_cash' && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-900 font-bold px-1.5 py-0.5 rounded">
                            Pontos + R$
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 mt-0.5">{b.route} · Assento {b.seat}</p>
                    </div>
                    <div className="text-right">
                      {b.paymentMethod === 'miles' ? (
                        <>
                          <span className="font-bold text-amber-900 font-mono-numbers block">
                            {new Intl.NumberFormat('pt-BR').format(b.pointsDebited || 0)} pts
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono-numbers block">
                            + {formatCurrencyBRL(b.totalAmount || 0)} taxa
                          </span>
                        </>
                      ) : b.paymentMethod === 'points_cash' ? (
                        <>
                          <span className="font-bold text-indigo-900 font-mono-numbers block">
                            {new Intl.NumberFormat('pt-BR').format(b.pointsDebited || 0)} pts
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono-numbers block">
                            + {formatCurrencyBRL(b.totalAmount || 0)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-slate-900 font-mono-numbers block">
                          {formatCurrencyBRL(b.price)}
                        </span>
                      )}
                      <span className="text-[10px] text-emerald-600 font-semibold">Emitido</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
