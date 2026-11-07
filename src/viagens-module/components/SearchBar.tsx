import { useState } from 'react';
import { 
  Plane, 
  Bus, 
  Car,
  ArrowRightLeft, 
  Calendar, 
  Users, 
  Search, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { SearchQuery, Location, TransportType, TripType } from '../types';
import { LocationPickerModal } from './LocationPickerModal';
import { LocationAutocompleteInput } from './LocationAutocompleteInput';
import { formatDateBR } from '../services/ticketEngine';

interface SearchBarProps {
  query: SearchQuery;
  onSearch: (updatedQuery: SearchQuery) => void;
  onOpenPriceCalendar: () => void;
  onOpenPriceAlert: () => void;
}

export function SearchBar({
  query,
  onSearch,
  onOpenPriceCalendar,
  onOpenPriceAlert
}: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState<SearchQuery>(query);
  const [activePicker, setActivePicker] = useState<'origin' | 'destination' | null>(null);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);

  const handleSwapLocations = () => {
    setLocalQuery(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  const handleTransportChange = (transport: TransportType) => {
    const updated = { ...localQuery, transportType: transport };
    setLocalQuery(updated);
    onSearch(updated);
  };

  const handleTripTypeChange = (tripType: TripType) => {
    setLocalQuery(prev => ({ ...prev, tripType }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localQuery);
  };

  const totalPassengers = 
    localQuery.passengers.adults + 
    localQuery.passengers.children + 
    localQuery.passengers.infants;

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-5 md:p-6 transition-all">
      {/* Top Controls: Transport Type + Trip Type + Tools */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        {/* Transport Type Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleTransportChange('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              localQuery.transportType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Todos os Transportes</span>
          </button>
          <button
            type="button"
            onClick={() => handleTransportChange('flight')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              localQuery.transportType === 'flight'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Voos</span>
          </button>
          <button
            type="button"
            onClick={() => handleTransportChange('bus')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              localQuery.transportType === 'bus'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Ônibus</span>
          </button>
          <button
            type="button"
            onClick={() => handleTransportChange('car')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              localQuery.transportType === 'car'
                ? 'bg-white text-orange-700 shadow-xs ring-1 ring-orange-500/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-orange-600" />
            <span>Carros</span>
            <span className="text-[9px] bg-orange-100 text-orange-700 font-extrabold px-1 rounded">ESTRADA</span>
          </button>
        </div>

        {/* Trip Type & Skyscanner Shortcuts */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => handleTripTypeChange('round_trip')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                localQuery.tripType === 'round_trip'
                  ? 'text-sky-700 font-semibold bg-sky-50'
                  : 'hover:text-slate-900'
              }`}
            >
              Ida e volta
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => handleTripTypeChange('one_way')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                localQuery.tripType === 'one_way'
                  ? 'text-sky-700 font-semibold bg-sky-50'
                  : 'hover:text-slate-900'
              }`}
            >
              Somente ida
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenPriceCalendar}
            className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-sky-50 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mês mais barato</span>
          </button>
        </div>
      </div>

      {/* Main Search Inputs Grid */}
      <form onSubmit={handleFormSubmit} className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
          {/* Origin & Destination Block with Autocomplete (Cols 1-6) */}
          <div className="md:col-span-6 relative flex flex-col sm:flex-row items-stretch bg-slate-50 rounded-xl border border-slate-200 overflow-visible divide-y sm:divide-y-0 sm:divide-x divide-slate-200 z-20">
            {/* Origin Autocomplete Input */}
            <LocationAutocompleteInput
              label="De (Origem)"
              value={localQuery.origin}
              onChange={(loc) => setLocalQuery(prev => ({ ...prev, origin: loc }))}
              placeholder="Digite a cidade ou código (ex: SP, GRU, Rio)..."
              onOpenFullModal={() => setActivePicker('origin')}
            />

            {/* Swap Button */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden sm:block pointer-events-auto">
              <button
                type="button"
                onClick={handleSwapLocations}
                title="Inverter origem e destino"
                aria-label="Inverter origem e destino"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-sky-600 hover:scale-105 transition-all cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Destination Autocomplete Input */}
            <LocationAutocompleteInput
              label="Para (Destino)"
              value={localQuery.destination}
              onChange={(loc) => setLocalQuery(prev => ({ ...prev, destination: loc }))}
              placeholder="Digite a cidade ou código (ex: Curitiba, CWB)..."
              onOpenFullModal={() => setActivePicker('destination')}
            />
          </div>

          {/* Dates Block (Cols 7-9) */}
          <div className="md:col-span-3 flex items-stretch bg-slate-50 rounded-xl border border-slate-200 overflow-hidden divide-x divide-slate-200">
            {/* Departure Date */}
            <div className="flex-1 p-3 flex flex-col justify-center">
              <label htmlFor="dep-date-input" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Ida
              </label>
              <input
                id="dep-date-input"
                type="date"
                value={localQuery.departureDate}
                onChange={(e) => setLocalQuery(prev => ({ ...prev, departureDate: e.target.value }))}
                className="w-full mt-1 bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Return Date (if round trip) */}
            {localQuery.tripType === 'round_trip' ? (
              <div className="flex-1 p-3 flex flex-col justify-center">
                <label htmlFor="ret-date-input" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Volta
                </label>
                <input
                  id="ret-date-input"
                  type="date"
                  value={localQuery.returnDate || ''}
                  onChange={(e) => setLocalQuery(prev => ({ ...prev, returnDate: e.target.value }))}
                  className="w-full mt-1 bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleTripTypeChange('round_trip')}
                className="flex-1 p-3 text-left hover:bg-slate-100/60 flex flex-col justify-center text-slate-400 transition-colors"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider">Volta</span>
                <span className="text-xs text-sky-600 font-medium mt-1">+ Adicionar</span>
              </button>
            )}
          </div>

          {/* Passengers & Class (Cols 10-12) */}
          <div className="md:col-span-3 relative">
            <button
              type="button"
              onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
              className="w-full h-full p-3.5 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 text-left flex items-center justify-between transition-colors"
            >
              <div>
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Viajantes e Classe
                </span>
                <div className="mt-1 font-bold text-slate-900 text-sm">
                  {totalPassengers} {totalPassengers === 1 ? 'passageiro' : 'passageiros'}
                </div>
                <span className="block text-xs text-slate-500 capitalize">
                  {localQuery.travelClass === 'economy' ? 'Econômica / Leito' : localQuery.travelClass}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Passenger Popover */}
            {showPassengerDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-30 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-slate-900 block">Adultos</span>
                    <span className="text-xs text-slate-400">A partir de 12 anos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={localQuery.passengers.adults <= 1}
                      onClick={() => setLocalQuery(prev => ({
                        ...prev,
                        passengers: { ...prev.passengers, adults: Math.max(1, prev.passengers.adults - 1) }
                      }))}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-sm font-bold font-mono-numbers text-slate-900">
                      {localQuery.passengers.adults}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLocalQuery(prev => ({
                        ...prev,
                        passengers: { ...prev.passengers, adults: prev.passengers.adults + 1 }
                      }))}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-slate-900 block">Crianças</span>
                    <span className="text-xs text-slate-400">2 a 11 anos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={localQuery.passengers.children <= 0}
                      onClick={() => setLocalQuery(prev => ({
                        ...prev,
                        passengers: { ...prev.passengers, children: Math.max(0, prev.passengers.children - 1) }
                      }))}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-sm font-bold font-mono-numbers text-slate-900">
                      {localQuery.passengers.children}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLocalQuery(prev => ({
                        ...prev,
                        passengers: { ...prev.passengers, children: prev.passengers.children + 1 }
                      }))}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Classe de Viagem
                  </label>
                  <select
                    value={localQuery.travelClass}
                    onChange={(e) => setLocalQuery(prev => ({ ...prev, travelClass: e.target.value }))}
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="economy">Econômica / Todas as classes de ônibus</option>
                    <option value="premium">Premium Economy / Leito Executivo</option>
                    <option value="executive">Executiva / Leito-Cama 180°</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassengerDropdown(false)}
                  className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Concluir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Comparação simultânea de passagens aéreas e rodoviárias
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenPriceAlert}
              className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors whitespace-nowrap"
            >
              Criar Alerta
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-xl shadow-md shadow-sky-600/20 hover:shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>Buscar Passagens</span>
            </button>
          </div>
        </div>
      </form>

      {/* Location Modals */}
      <LocationPickerModal
        isOpen={activePicker === 'origin'}
        onClose={() => setActivePicker(null)}
        title="Escolha a Origem (De onde você vai sair?)"
        currentSelected={localQuery.origin}
        onSelect={(loc) => setLocalQuery(prev => ({ ...prev, origin: loc }))}
      />

      <LocationPickerModal
        isOpen={activePicker === 'destination'}
        onClose={() => setActivePicker(null)}
        title="Escolha o Destino (Para onde você vai?)"
        currentSelected={localQuery.destination}
        onSelect={(loc) => setLocalQuery(prev => ({ ...prev, destination: loc }))}
      />
    </div>
  );
}
