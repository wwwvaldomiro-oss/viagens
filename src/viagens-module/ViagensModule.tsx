import { useState, useMemo, useEffect } from 'react';
import { 
  Plane, 
  Bus, 
  Car,
  Sparkles, 
  Search, 
  Calendar, 
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { 
  ViagensModuleProps, 
  SearchQuery, 
  SearchFilters, 
  Ticket, 
  DailyPriceTrend 
} from './types';
import { POPULAR_LOCATIONS } from './data/locations';
import { 
  generateTicketsForRoute, 
  filterAndSortTickets, 
  generateDailyPriceTrends,
  formatCurrencyBRL
} from './services/ticketEngine';
import { SearchBar } from './components/SearchBar';
import { TicketCard } from './components/TicketCard';
import { TransportComparisonBar } from './components/TransportComparisonBar';
import { FilterSidebar } from './components/FilterSidebar';
import { SortingTabs } from './components/SortingTabs';
import { PriceCalendarModal } from './components/PriceCalendarModal';
import { BookingModal } from './components/BookingModal';
import { PriceAlertModal } from './components/PriceAlertModal';
import { ExploreDestinations } from './components/ExploreDestinations';
import { LoyaltyQuoteTicker } from './components/LoyaltyQuoteTicker';

export function ViagensModule({
  initialOrigin,
  initialDestination,
  defaultTransport = 'all',
  onBookTicket,
  embedMode = 'full',
  className = '',
  hostAppInfo,
  onOpenCarPlatform
}: ViagensModuleProps) {
  // Initial default locations
  const defaultOrigin = initialOrigin || POPULAR_LOCATIONS.find(l => l.code === 'SAO') || POPULAR_LOCATIONS[0];
  const defaultDest = initialDestination || POPULAR_LOCATIONS.find(l => l.code === 'RIO') || POPULAR_LOCATIONS[6];

  // Tomorrow's date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  const formattedTomorrow = tomorrow.toISOString().split('T')[0];

  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + 8);
  const formattedReturn = returnDate.toISOString().split('T')[0];

  // Search State
  const [query, setQuery] = useState<SearchQuery>({
    origin: defaultOrigin,
    destination: defaultDest,
    departureDate: formattedTomorrow,
    returnDate: formattedReturn,
    tripType: 'round_trip',
    passengers: { adults: 1, children: 0, infants: 0 },
    transportType: defaultTransport,
    travelClass: 'economy'
  });

  // Filters State
  const [filters, setFilters] = useState<SearchFilters>({
    transportType: defaultTransport,
    minPrice: 0,
    maxPrice: 2000,
    stops: 'all',
    companies: [],
    timeOfDay: [],
    baggageIncluded: false,
    sortBy: 'cheapest',
    paymentMode: 'money',
    milesPrograms: [],
    maxMiles: 60000,
    onlyGoodDeals: false
  });

  // Modals state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedTicketForBooking, setSelectedTicketForBooking] = useState<Ticket | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Generate Raw tickets for the current route and date
  const rawTickets = useMemo(() => {
    return generateTicketsForRoute(
      query.origin,
      query.destination,
      query.departureDate,
      'all'
    );
  }, [query.origin, query.destination, query.departureDate]);

  // Determine lowest and highest price to set filter bounds
  const lowestPriceInResults = useMemo(() => {
    if (rawTickets.length === 0) return 40;
    return Math.min(...rawTickets.map(t => t.price));
  }, [rawTickets]);

  const highestPriceInResults = useMemo(() => {
    if (rawTickets.length === 0) return 1500;
    return Math.max(...rawTickets.map(t => t.price)) + 50;
  }, [rawTickets]);

  // Update filters max price if new results exceed it
  useEffect(() => {
    if (highestPriceInResults > 0) {
      setFilters(prev => ({
        ...prev,
        maxPrice: Math.max(prev.maxPrice, highestPriceInResults)
      }));
    }
  }, [highestPriceInResults]);

  // Daily Price Trends for Skyscanner calendar
  const priceTrends: DailyPriceTrend[] = useMemo(() => {
    return generateDailyPriceTrends(query.origin, query.destination, query.departureDate);
  }, [query.origin, query.destination, query.departureDate]);

  // Filtered and sorted tickets
  const filteredTickets = useMemo(() => {
    return filterAndSortTickets(rawTickets, filters);
  }, [rawTickets, filters]);

  // Handler when user triggers a new search
  const handleSearchSubmit = (newQuery: SearchQuery) => {
    setQuery(newQuery);
    setFilters(prev => ({ ...prev, transportType: newQuery.transportType }));
  };

  // Handler to pick a date from the calendar
  const handleSelectDateFromCalendar = (dateStr: string) => {
    setQuery(prev => ({ ...prev, departureDate: dateStr }));
  };

  const lowestPriceToday = rawTickets.length > 0 ? Math.min(...rawTickets.map(t => t.price)) : 89;

  return (
    <div className={`w-full text-slate-900 ${className}`}>
      {/* Search Header Container with Hero backdrop */}
      <div className="relative rounded-3xl overflow-hidden mb-8 border border-slate-200/80 shadow-xs bg-slate-900">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/hero_travel_brazil_1793843061046.jpg"
            alt="Paisagem de Viagens no Brasil"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 md:p-8 lg:p-10 max-w-6xl mx-auto space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Módulo de Consulta & Programação de Viagens (Voos & Ônibus)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight text-balance">
              Compare e Programe Passagens Aéreas e Rodoviárias
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl text-balance">
              Pesquise tarifas reais em dinheiro ou milhas para voos e ônibus nacionais e internacionais, com link direto de emissão oficial.
            </p>
          </div>

          {/* Embedded Search Bar with Emission Mode */}
          <SearchBar
            query={query}
            onSearch={handleSearchSubmit}
            onOpenPriceCalendar={() => setIsCalendarOpen(true)}
            onOpenPriceAlert={() => setIsAlertOpen(true)}
            paymentMode={filters.paymentMode}
            onPaymentModeChange={(mode) => setFilters(prev => ({ ...prev, paymentMode: mode }))}
            onOpenCarPlatform={onOpenCarPlatform}
          />
        </div>
      </div>

      {/* Main Results Workspace */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Banner do Novo Projeto Independente de Estradas & Pedágios */}
        {onOpenCarPlatform && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/70 border border-orange-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-950">
                    Novo Projeto Independente
                  </span>
                  <span className="text-[10px] font-bold bg-orange-200/90 text-orange-950 px-2 py-0.5 rounded-md">
                    RODOVIAS & PEDÁGIOS BRASIL
                  </span>
                </div>
                <p className="text-xs text-orange-900/90 mt-1 max-w-2xl">
                  Vai viajar de carro particular ou gerenciar frotas? O sistema rodoviário agora é uma plataforma totalmente independente com cálculo de pedágios por eixo, postos da PRF, consumo de combustível e envio de rotas para GPS.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenCarPlatform}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <span>Acessar Plataforma Rodoviária</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Multi-modal Comparison Banner (Bus vs Flight) */}
        <TransportComparisonBar
          tickets={rawTickets}
          currentTransportFilter={filters.transportType}
          onSelectTransportFilter={(type) => setFilters(prev => ({ ...prev, transportType: type }))}
        />

        {/* Real-time Sources & Miles Market Quotation Ticker */}
        <LoyaltyQuoteTicker
          paymentMode={filters.paymentMode}
          onSelectPaymentMode={(mode) => setFilters(prev => ({ ...prev, paymentMode: mode }))}
        />

        {/* Results Layout: Filters Sidebar (Left) + Ticket List (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden col-span-12 flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-800">
              {filteredTickets.length} passagens encontradas
            </span>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros</span>
            </button>
          </div>

          {/* Filters Sidebar */}
          <div className={`lg:col-span-4 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              tickets={rawTickets}
              lowestPricePossible={lowestPriceInResults}
              highestPricePossible={highestPriceInResults}
            />
          </div>

          {/* Tickets Results List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Sorting Tabs */}
            <SortingTabs
              filters={filters}
              onSortChange={(sortBy) => setFilters(prev => ({ ...prev, sortBy }))}
              tickets={filteredTickets}
            />

            {/* Results Header */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <div>
                Exibindo <b className="text-slate-800 font-mono-numbers">{filteredTickets.length}</b> opções para{' '}
                <span className="font-semibold text-slate-800">{query.origin.city} ➔ {query.destination.city}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(true)}
                className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Ver gráfico de preços</span>
              </button>
            </div>

            {/* Ticket Cards List */}
            {filteredTickets.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <Search className="w-8 h-8 mx-auto text-slate-300" />
                <h4 className="text-base font-bold text-slate-900">
                  Nenhuma passagem encontrada com os filtros selecionados
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tente ajustar a faixa de preço mínimo e máximo ou selecionar "Todos os Transportes" para visualizar mais opções.
                </p>
                <button
                  type="button"
                  onClick={() => setFilters({
                    transportType: 'all',
                    minPrice: 0,
                    maxPrice: highestPriceInResults,
                    stops: 'all',
                    companies: [],
                    timeOfDay: [],
                    baggageIncluded: false,
                    sortBy: 'cheapest',
                    paymentMode: 'money',
                    milesPrograms: [],
                    maxMiles: 60000,
                    onlyGoodDeals: false
                  })}
                  className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-sky-500"
                >
                  Restaurar Filtros Padrão
                </button>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  paymentMode={filters.paymentMode}
                  onSelect={(t) => setSelectedTicketForBooking(t)}
                />
              ))
            )}
          </div>
        </div>

        {/* Explore Cheapest Destinations (Skyscanner style) */}
        <div className="pt-6 border-t border-slate-200/80">
          <ExploreDestinations
            currentOrigin={query.origin}
            onSelectDestination={(dest) => {
              setQuery(prev => ({ ...prev, destination: dest }));
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
          />
        </div>
      </div>

      {/* Skyscanner Price Trend Calendar Modal */}
      <PriceCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        trends={priceTrends}
        onSelectDate={handleSelectDateFromCalendar}
        origin={query.origin}
        destination={query.destination}
      />

      {/* Price Alert Modal */}
      <PriceAlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        origin={query.origin}
        destination={query.destination}
        currentLowestPrice={lowestPriceToday}
      />

      {/* Booking and Seat Selection Modal */}
      <BookingModal
        ticket={selectedTicketForBooking}
        isOpen={!!selectedTicketForBooking}
        onClose={() => setSelectedTicketForBooking(null)}
        onConfirmBooking={(ticket, details) => {
          if (onBookTicket) {
            onBookTicket(ticket, details);
          }
        }}
        hostAppInfo={hostAppInfo}
      />
    </div>
  );
}
export default ViagensModule;
