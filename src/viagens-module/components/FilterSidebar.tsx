import { SlidersHorizontal, RotateCcw, Plane, Bus, Luggage, Clock } from 'lucide-react';
import { SearchFilters, Ticket, TransportType } from '../types';
import { ALL_COMPANIES } from '../data/companies';
import { formatCurrencyBRL } from '../services/ticketEngine';

interface FilterSidebarProps {
  filters: SearchFilters;
  onChange: (updatedFilters: SearchFilters) => void;
  tickets: Ticket[];
  lowestPricePossible?: number;
  highestPricePossible: number;
}

export function FilterSidebar({
  filters,
  onChange,
  tickets,
  lowestPricePossible = 40,
  highestPricePossible
}: FilterSidebarProps) {
  const flightCount = tickets.filter(t => t.type === 'flight').length;
  const busCount = tickets.filter(t => t.type === 'bus').length;

  const minBound = Math.max(0, Math.floor(lowestPricePossible / 10) * 10);
  const maxBound = Math.max(minBound + 100, Math.ceil((highestPricePossible || 1500) / 10) * 10);

  const currentMin = Math.max(minBound, Math.min(filters.minPrice ?? minBound, maxBound));
  const currentMax = Math.min(maxBound, Math.max(filters.maxPrice ?? maxBound, minBound));

  // Count tickets matching current price range
  const ticketsInBudget = tickets.filter(
    t => t.price >= currentMin && t.price <= currentMax
  ).length;

  const handleReset = () => {
    onChange({
      transportType: 'all',
      minPrice: minBound,
      maxPrice: maxBound,
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
  };

  const toggleMilesProgram = (programId: string) => {
    const current = filters.milesPrograms || [];
    const exists = current.includes(programId);
    const updated = exists ? current.filter(p => p !== programId) : [...current, programId];
    onChange({ ...filters, milesPrograms: updated });
  };

  const handleMinSliderChange = (newVal: number) => {
    const validMin = Math.min(newVal, currentMax);
    onChange({ ...filters, minPrice: validMin });
  };

  const handleMaxSliderChange = (newVal: number) => {
    const validMax = Math.max(newVal, currentMin);
    onChange({ ...filters, maxPrice: validMax });
  };

  const applyBudgetPreset = (min: number, max: number) => {
    onChange({
      ...filters,
      minPrice: Math.max(minBound, min),
      maxPrice: Math.min(maxBound, max)
    });
  };

  const toggleCompany = (companyId: string) => {
    const exists = filters.companies.includes(companyId);
    const updated = exists
      ? filters.companies.filter(c => c !== companyId)
      : [...filters.companies, companyId];
    onChange({ ...filters, companies: updated });
  };

  const toggleTimeOfDay = (slot: 'dawn' | 'morning' | 'afternoon' | 'night') => {
    const exists = filters.timeOfDay.includes(slot);
    const updated = exists
      ? filters.timeOfDay.filter(s => s !== slot)
      : [...filters.timeOfDay, slot];
    onChange({ ...filters, timeOfDay: updated });
  };

  // Percentage calculations for dual slider active track
  const rangeSpan = Math.max(1, maxBound - minBound);
  const leftPercent = Math.max(0, Math.min(100, ((currentMin - minBound) / rangeSpan) * 100));
  const rightPercent = Math.max(0, Math.min(100, ((maxBound - currentMax) / rangeSpan) * 100));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-700" />
          <h4 className="text-sm font-bold text-slate-900">Filtros & Pagamento</h4>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Limpar
        </button>
      </div>

      {/* 0. Payment Mode Selector (Dinheiro vs Milhas vs Pontos+Dinheiro) */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Forma de Emissão
        </span>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => onChange({ ...filters, paymentMode: 'money' })}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
              filters.paymentMode === 'money'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dinheiro (R$)
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, paymentMode: 'miles' })}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
              filters.paymentMode === 'miles'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Milhas / Pts
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, paymentMode: 'points_cash' })}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
              filters.paymentMode === 'points_cash'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pontos + R$
          </button>
        </div>
      </div>

      {/* Miles / Loyalty Program Filters (Visible in miles or points_cash mode) */}
      {(filters.paymentMode === 'miles' || filters.paymentMode === 'points_cash') && (
        <div className="space-y-4 p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
              Programas de Fidelidade
            </span>
            <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 px-1.5 py-0.5 rounded">
              Resgate
            </span>
          </div>

          <div className="space-y-1.5">
            {[
              { id: 'latam_pass', label: 'LATAM Pass', type: 'Aéreo' },
              { id: 'smiles', label: 'Smiles (GOL)', type: 'Aéreo' },
              { id: 'azul_fidelidade', label: 'Azul Fidelidade', type: 'Aéreo' },
              { id: 'livelo', label: 'Livelo / Bancos', type: 'Pontos' },
              { id: 'clickbus_rewards', label: 'ClickBus Rewards', type: 'Rodoviário' },
              { id: 'buser_pontos', label: 'Buser Fidelidade', type: 'Rodoviário' },
              { id: 'superapp_points', label: 'Pontos SuperApp', type: 'Direto' },
            ].map(prog => {
              const isChecked = !filters.milesPrograms?.length || filters.milesPrograms.includes(prog.id);
              return (
                <label
                  key={`filter-prog-${prog.id}`}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-amber-100/40 cursor-pointer text-xs font-medium text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleMilesProgram(prog.id)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>{prog.label}</span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-medium">
                    {prog.type}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Max Miles Slider */}
          <div className="space-y-1.5 pt-2 border-t border-amber-200/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-950">Máximo de Pontos:</span>
              <span className="font-bold text-amber-900 font-mono-numbers">
                {new Intl.NumberFormat('pt-BR').format(filters.maxMiles || 60000)} pts
              </span>
            </div>
            <input
              type="range"
              min="3000"
              max="80000"
              step="1000"
              value={filters.maxMiles || 60000}
              onChange={(e) => onChange({ ...filters, maxMiles: Number(e.target.value) })}
              className="w-full accent-amber-600 cursor-pointer h-1.5 bg-amber-200/70 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-amber-800 font-mono-numbers">
              <span>3.000 pts</span>
              <span>80.000 pts</span>
            </div>
          </div>

          {/* Only Good Deals (CPM) */}
          <label className="flex items-center gap-2 pt-1 cursor-pointer text-xs font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={filters.onlyGoodDeals || false}
              onChange={(e) => onChange({ ...filters, onlyGoodDeals: e.target.checked })}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>Apenas Excelente Resgate (Alto CPM)</span>
          </label>
        </div>
      )}

      {/* 1. Transport Type */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Tipo de Transporte
        </span>
        <div className="space-y-1.5">
          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="filter-transport"
                checked={filters.transportType === 'all'}
                onChange={() => onChange({ ...filters, transportType: 'all' })}
                className="text-sky-600 focus:ring-sky-500"
              />
              Todos ({tickets.length})
            </span>
          </label>
          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="filter-transport"
                checked={filters.transportType === 'flight'}
                onChange={() => onChange({ ...filters, transportType: 'flight' })}
                className="text-sky-600 focus:ring-sky-500"
              />
              <Plane className="w-3.5 h-3.5 text-sky-600" />
              Somente Voos
            </span>
            <span className="text-slate-400 font-mono-numbers">({flightCount})</span>
          </label>
          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="filter-transport"
                checked={filters.transportType === 'bus'}
                onChange={() => onChange({ ...filters, transportType: 'bus' })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <Bus className="w-3.5 h-3.5 text-blue-600" />
              Somente Ônibus
            </span>
            <span className="text-slate-400 font-mono-numbers">({busCount})</span>
          </label>
        </div>
      </div>

      {/* 2. Stops */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Paradas / Conexões
        </span>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="radio"
              name="filter-stops"
              checked={filters.stops === 'all'}
              onChange={() => onChange({ ...filters, stops: 'all' })}
              className="text-sky-600 focus:ring-sky-500"
            />
            Qualquer número de paradas
          </label>
          <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="radio"
              name="filter-stops"
              checked={filters.stops === 'direct'}
              onChange={() => onChange({ ...filters, stops: 'direct' })}
              className="text-sky-600 focus:ring-sky-500"
            />
            Somente Direto (Sem conexões)
          </label>
        </div>
      </div>

      {/* 3. Price Range Slider (Min and Max Budget) */}
      <div className="space-y-3.5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Faixa de Preço
            </span>
            <span className="text-[11px] text-slate-500 font-mono-numbers">
              {ticketsInBudget} de {tickets.length} opções disponíveis
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold font-mono-numbers text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60 inline-block">
              {formatCurrencyBRL(currentMin)} – {formatCurrencyBRL(currentMax)}
            </span>
          </div>
        </div>

        {/* Visual Dual Slider Track */}
        <div className="relative pt-2 pb-1">
          {/* Background rail */}
          <div className="h-2 w-full bg-slate-100 rounded-full relative overflow-hidden">
            {/* Active range highlight */}
            <div
              className="absolute top-0 bottom-0 bg-sky-500 rounded-full transition-all"
              style={{
                left: `${leftPercent}%`,
                right: `${rightPercent}%`
              }}
            />
          </div>

          {/* Dual Range Controls (Stacked or coordinated) */}
          <div className="space-y-2 mt-3">
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Mínimo:</span>
                <span className="font-bold text-slate-800 font-mono-numbers">{formatCurrencyBRL(currentMin)}</span>
              </div>
              <input
                type="range"
                min={minBound}
                max={maxBound}
                step="5"
                value={currentMin}
                aria-label="Preço mínimo"
                onChange={(e) => handleMinSliderChange(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Máximo:</span>
                <span className="font-bold text-slate-800 font-mono-numbers">{formatCurrencyBRL(currentMax)}</span>
              </div>
              <input
                type="range"
                min={minBound}
                max={maxBound}
                step="5"
                value={currentMax}
                aria-label="Preço máximo"
                onChange={(e) => handleMaxSliderChange(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Bound labels */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers mt-2">
            <span>Mín: {formatCurrencyBRL(minBound)}</span>
            <span>Máx: {formatCurrencyBRL(maxBound)}</span>
          </div>
        </div>

        {/* Budget Presets */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Atalhos de Orçamento
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => applyBudgetPreset(minBound, maxBound)}
              className={`text-[11px] font-semibold py-1 px-2 rounded-lg border text-center transition-all ${
                currentMin <= minBound && currentMax >= maxBound
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Qualquer valor
            </button>
            <button
              type="button"
              onClick={() => applyBudgetPreset(minBound, 120)}
              className={`text-[11px] font-semibold py-1 px-2 rounded-lg border text-center transition-all ${
                currentMin <= minBound && currentMax === 120
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Até R$ 120
            </button>
            <button
              type="button"
              onClick={() => applyBudgetPreset(100, 300)}
              className={`text-[11px] font-semibold py-1 px-2 rounded-lg border text-center transition-all ${
                currentMin === 100 && currentMax === 300
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              R$ 100 – R$ 300
            </button>
            <button
              type="button"
              onClick={() => applyBudgetPreset(250, maxBound)}
              className={`text-[11px] font-semibold py-1 px-2 rounded-lg border text-center transition-all ${
                currentMin === 250 && currentMax >= maxBound
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              A partir de R$ 250
            </button>
          </div>
        </div>
      </div>

      {/* 4. Departure Time slots */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Horário de Partida
        </span>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'dawn', label: 'Madrugada', sub: '00:00 - 06:00' },
            { id: 'morning', label: 'Manhã', sub: '06:00 - 12:00' },
            { id: 'afternoon', label: 'Tarde', sub: '12:00 - 18:00' },
            { id: 'night', label: 'Noite', sub: '18:00 - 24:00' }
          ].map((slot) => {
            const isChecked = filters.timeOfDay.includes(slot.id as any);
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => toggleTimeOfDay(slot.id as any)}
                className={`p-2 rounded-xl border text-left transition-all ${
                  isChecked
                    ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-bold block">{slot.label}</span>
                <span className="text-[10px] text-slate-500 font-mono-numbers block mt-0.5">{slot.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Baggage */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Bagagem
        </span>
        <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={filters.baggageIncluded}
            onChange={(e) => onChange({ ...filters, baggageIncluded: e.target.checked })}
            className="rounded text-sky-600 focus:ring-sky-500"
          />
          <Luggage className="w-4 h-4 text-slate-500" />
          <span>Bagagem despachada/bagageiro inclusa</span>
        </label>
      </div>

      {/* 6. Companies */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Companhias
        </span>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {ALL_COMPANIES.map(company => {
            const companyTickets = tickets.filter(t => t.company.id === company.id);
            if (companyTickets.length === 0) return null;
            const isChecked = filters.companies.length === 0 || filters.companies.includes(company.id);

            return (
              <label
                key={company.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700"
              >
                <div className="flex items-center gap-2 truncate">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCompany(company.id)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="truncate">{company.name}</span>
                </div>
                <span className="text-slate-400 font-mono-numbers text-[11px] shrink-0">
                  ({companyTickets.length})
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
