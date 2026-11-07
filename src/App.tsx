import { useState, useEffect } from 'react';
import { 
  Plane, 
  Bus, 
  Car,
  Compass, 
  Code, 
  Layers, 
  Sparkles,
  Share2,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { ViagensModule } from './viagens-module/ViagensModule';
import { CarRoadTripPlanner } from './viagens-module/components/car-planner/CarRoadTripPlanner';
import { SuperAppHostSimulator } from './components/SuperAppHostSimulator';
import { IntegrationDocs } from './components/IntegrationDocs';
import { Ticket } from './viagens-module/types';

export default function App() {
  const [viewMode, setViewMode] = useState<'standalone' | 'cars' | 'host_simulator' | 'docs'>('standalone');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setIsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBookingFromModule = (ticket: Ticket, bookingDetails: any) => {
    showToast(`Passagem ${ticket.company.name} (${bookingDetails.locator}) confirmada no Módulo VIAGENS!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Contract (Zone 1: Brand, Zone 2: Nav Links, Zone 3: Single Primary Action) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Title (One Line Wordmark) */}
          <button
            onClick={() => setViewMode('standalone')}
            className="flex items-center gap-2.5 text-left shrink-0 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:bg-sky-500 transition-colors">
              V
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
              VIAGENS
            </span>
          </button>

          {/* Zone 2: Clean 4-5 Navigation Links (Single-Line) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setViewMode('standalone')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'standalone' ? 'text-sky-600 font-bold' : ''
              }`}
            >
              Voos & Ônibus Baratos
            </button>
            <button
              onClick={() => setViewMode('cars')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                viewMode === 'cars' ? 'text-orange-600 font-bold' : ''
              }`}
            >
              <Car className="w-3.5 h-3.5 text-orange-600" />
              <span>Carros & Pedágios</span>
            </button>
            <button
              onClick={() => setViewMode('host_simulator')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                viewMode === 'host_simulator' ? 'text-sky-600 font-bold' : ''
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulador SuperApp</span>
            </button>
            <button
              onClick={() => setViewMode('docs')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                viewMode === 'docs' ? 'text-sky-600 font-bold' : ''
              }`}
            >
              <Code className="w-3.5 h-3.5 text-sky-600" />
              <span>Documentação SDK</span>
            </button>
          </nav>

          {/* Zone 3: One Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            {viewMode === 'host_simulator' ? (
              <button
                onClick={() => setViewMode('standalone')}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                Voltar ao Módulo Puro
              </button>
            ) : (
              <button
                onClick={() => setViewMode('host_simulator')}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Testar Embutido no App</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Google Maps Quota Warning Banner (Compliance CF / Skill Requirement) */}
      {isQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-16 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1">
        {viewMode === 'standalone' && (
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
            <ViagensModule onBookTicket={handleBookingFromModule} />
          </main>
        )}

        {viewMode === 'cars' && (
          <CarRoadTripPlanner onBackToTickets={() => setViewMode('standalone')} />
        )}

        {viewMode === 'host_simulator' && (
          <SuperAppHostSimulator onExitSimulator={() => setViewMode('standalone')} />
        )}

        {viewMode === 'docs' && (
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <IntegrationDocs />
          </main>
        )}
      </div>

      {/* Floating Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800">Módulo VIAGENS</span>
            <span aria-hidden="true">·</span>
            <span>Versão 1.0 (Passagens de Ônibus e Avião)</span>
            <span aria-hidden="true">·</span>
            <span>Inspirado no Skyscanner Brasil</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Desenvolvido para integração desacoplada em múltiplos aplicativos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
