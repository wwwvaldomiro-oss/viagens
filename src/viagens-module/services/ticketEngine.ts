import { Ticket, Location, Company, DailyPriceTrend, SearchFilters, TransportType } from '../types';
import { AIRLINES, BUS_COMPANIES } from '../data/companies';

// Distance estimator between state capitals in km (approximate)
const DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  'SP': { 'RJ': 430, 'MG': 580, 'PR': 400, 'DF': 1000, 'SC': 700, 'RS': 1100, 'BA': 1950, 'CE': 3100, 'PE': 2650, 'GO': 900 },
  'RJ': { 'SP': 430, 'MG': 440, 'PR': 850, 'DF': 1150, 'SC': 1140, 'RS': 1550, 'BA': 1650, 'CE': 2800, 'PE': 2300, 'GO': 1300 },
  'MG': { 'SP': 580, 'RJ': 440, 'PR': 1000, 'DF': 740, 'BA': 1370, 'CE': 2500, 'PE': 2050, 'GO': 900 },
  'PR': { 'SP': 400, 'SC': 300, 'RS': 710, 'RJ': 850, 'MG': 1000, 'DF': 1350 },
  'DF': { 'SP': 1000, 'RJ': 1150, 'MG': 740, 'GO': 200, 'BA': 1440, 'PR': 1350 }
};

export function getEstimatedDistance(origState: string, destState: string): number {
  if (origState === destState) return 120;
  return DISTANCE_MATRIX[origState]?.[destState] || DISTANCE_MATRIX[destState]?.[origState] || 750;
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatMiles(points: number): string {
  return new Intl.NumberFormat('pt-BR').format(points);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateBR(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function generateTicketsForRoute(
  origin: Location,
  destination: Location,
  dateStr: string,
  transportType: TransportType = 'all'
): Ticket[] {
  const distance = getEstimatedDistance(origin.state, destination.state);
  const tickets: Ticket[] = [];

  // Deterministic seed based on date and route to keep results consistent
  const dateSeed = dateStr.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
  const routeSeed = (origin.name.length * 7 + destination.name.length * 13) % 100;

  // 1. Generate Flight Tickets (if applicable and distance > 250km)
  if (transportType === 'all' || transportType === 'flight') {
    const flightSchedules = [
      { depHour: 6, depMin: 15, isDirect: true },
      { depHour: 8, depMin: 45, isDirect: true },
      { depHour: 11, depMin: 20, isDirect: false },
      { depHour: 14, depMin: 10, isDirect: true },
      { depHour: 17, depMin: 35, isDirect: true },
      { depHour: 20, depMin: 50, isDirect: true },
      { depHour: 22, depMin: 30, isDirect: false }
    ];

    const flightBaseDuration = Math.max(55, Math.round((distance / 700) * 60) + 20); // minutes
    const flightBasePrice = Math.max(149, Math.round(110 + distance * 0.32));

    flightSchedules.forEach((sch, idx) => {
      const company = AIRLINES[idx % AIRLINES.length];
      const duration = sch.isDirect ? flightBaseDuration : flightBaseDuration + 105;
      
      // Price calculation with slight variation
      const priceMultiplier = 0.85 + (((dateSeed + routeSeed + idx * 23) % 45) / 100);
      const price = Math.round(flightBasePrice * priceMultiplier);
      const originalPrice = Math.round(price * 1.25);
      
      const depDate = new Date(`${dateStr}T${String(sch.depHour).padStart(2, '0')}:${String(sch.depMin).padStart(2, '0')}:00`);
      const arrDate = new Date(depDate.getTime() + duration * 60 * 1000);

      // Seat class
      const seatClasses = ['Econômica Promo', 'Econômica Regular', 'Premium Economy'];
      const seatClass = seatClasses[idx % seatClasses.length];

      // Loyalty miles calculation for flights
      let loyaltyProgram: 'latam_pass' | 'smiles' | 'azul_fidelidade' = 'smiles';
      let programName = 'Smiles';
      if (company.id === 'latam') {
        loyaltyProgram = 'latam_pass';
        programName = 'LATAM Pass';
      } else if (company.id === 'azul') {
        loyaltyProgram = 'azul_fidelidade';
        programName = 'Azul Fidelidade';
      }

      // Airport boarding tax (Taxa ANAC ~ R$ 37,90 to R$ 42,50)
      const taxBRL = 38.50 + (idx % 3) * 1.70;
      // Points: roughly 1000 points per R$ 16 ~ R$ 24, rounded to hundreds
      const pointRate = 18.5 + ((idx * 7) % 6) - 2;
      const points = Math.max(4200, Math.round(((price - taxBRL) / pointRate) * 10) * 100);
      const cpmValueBRL = Math.round(((price - taxBRL) / points) * 1000 * 100) / 100;
      const isGoodDeal = cpmValueBRL >= 18.0;

      const ticket: Ticket = {
        id: `flight-${company.id}-${dateStr}-${idx}`,
        type: 'flight',
        company,
        departure: {
          location: origin.type === 'bus_station' ? { ...origin, name: `Aeroporto próximo a ${origin.city}`, type: 'airport', code: origin.city.slice(0, 3).toUpperCase() } : origin,
          dateTime: depDate.toISOString(),
          terminal: 'Terminal 2'
        },
        arrival: {
          location: destination.type === 'bus_station' ? { ...destination, name: `Aeroporto próximo a ${destination.city}`, type: 'airport', code: destination.city.slice(0, 3).toUpperCase() } : destination,
          dateTime: arrDate.toISOString(),
          terminal: 'Terminal 1'
        },
        durationMinutes: duration,
        stops: sch.isDirect ? 0 : 1,
        stopDetails: sch.isDirect ? [] : [`Conexão em Brasília (BSB) - 1h15m`],
        price,
        originalPrice: idx % 2 === 0 ? originalPrice : undefined,
        discountPercentage: idx % 2 === 0 ? 20 : undefined,
        installments: {
          count: 10,
          value: Math.round((price / 10) * 100) / 100,
          interestFree: true
        },
        seatClass,
        baggage: {
          carryOn: true,
          checked: idx % 3 === 0,
          details: idx % 3 === 0 ? 'Mochila + Bagagem de mão 10kg + Despachada 23kg' : 'Mochila + Bagagem de mão 10kg inclusa'
        },
        amenities: ['Mochila 10kg inclusa', 'Tomada USB no assento', 'Wi-Fi a bordo', 'Lanche e bebidas inclusos'],
        seatsAvailable: 3 + ((dateSeed + idx * 5) % 12),
        partnerName: idx % 2 === 0 ? company.name : 'Decolar Parcerias',
        flightOrBusNumber: `${company.code} ${1200 + idx * 47}`,
        milesOption: {
          program: loyaltyProgram,
          programName,
          programType: 'airline',
          points,
          taxBRL,
          cpmValueBRL,
          isGoodDeal,
          badgeLabel: isGoodDeal ? 'Excelente Resgate' : 'Milhas Standard',
          cashOption: {
            cashAmount: Math.round(price * 0.45 + taxBRL),
            reducedPoints: Math.round(points * 0.5)
          }
        },
        alternativeMilesOptions: [
          {
            program: 'livelo',
            programName: 'Livelo',
            programType: 'bank',
            points: Math.round(points * 1.15 / 100) * 100,
            taxBRL,
            cpmValueBRL: Math.round(((price - taxBRL) / (points * 1.15)) * 1000 * 100) / 100,
            isGoodDeal: false,
            badgeLabel: 'Transferência 1:1'
          },
          {
            program: 'superapp_points',
            programName: 'Pontos SuperApp',
            programType: 'superapp',
            points: Math.round(points * 1.05 / 100) * 100,
            taxBRL,
            cpmValueBRL: Math.round(((price - taxBRL) / (points * 1.05)) * 1000 * 100) / 100,
            isGoodDeal: true,
            badgeLabel: 'Débito Direto na Conta'
          }
        ]
      };

      tickets.push(ticket);
    });
  }

  // 2. Generate Bus Tickets
  if (transportType === 'all' || transportType === 'bus') {
    const busSchedules = [
      { depHour: 7, depMin: 0, serviceClass: 'Semi-Leito' },
      { depHour: 9, depMin: 30, serviceClass: 'Convencional' },
      { depHour: 13, depMin: 15, serviceClass: 'Semi-Leito' },
      { depHour: 18, depMin: 0, serviceClass: 'Leito Executivo' },
      { depHour: 21, depMin: 30, serviceClass: 'Leito-Cama 180°' },
      { depHour: 23, depMin: 15, serviceClass: 'Leito-Cama 180°' },
      { depHour: 23, depMin: 59, serviceClass: 'Semi-Leito' }
    ];

    const busSpeedKmh = 68;
    const busBaseDuration = Math.max(90, Math.round((distance / busSpeedKmh) * 60)); // minutes
    const busBasePrice = Math.max(49, Math.round(35 + distance * 0.16));

    busSchedules.forEach((sch, idx) => {
      const company = BUS_COMPANIES[idx % BUS_COMPANIES.length];
      const duration = busBaseDuration + (idx % 2 === 0 ? 0 : 40);
      
      let classMultiplier = 1.0;
      if (sch.serviceClass.includes('Convencional')) classMultiplier = 0.82;
      if (sch.serviceClass.includes('Executivo')) classMultiplier = 1.25;
      if (sch.serviceClass.includes('Leito-Cama')) classMultiplier = 1.55;

      const priceMultiplier = 0.88 + (((dateSeed + routeSeed + idx * 17) % 35) / 100);
      const price = Math.round(busBasePrice * classMultiplier * priceMultiplier);
      const originalPrice = Math.round(price * 1.2);

      const depDate = new Date(`${dateStr}T${String(sch.depHour).padStart(2, '0')}:${String(sch.depMin).padStart(2, '0')}:00`);
      const arrDate = new Date(depDate.getTime() + duration * 60 * 1000);

      const amenities = ['Bagagem 30kg + Mão 5kg'];
      if (sch.serviceClass.includes('Leito')) {
        amenities.push('Reclinação 150° a 180°', 'Carregador USB individual', 'Água mineral cortesia', 'Ar condicionado');
      } else {
        amenities.push('Tomada USB', 'Ar condicionado ecológico', 'Assentos reclináveis');
      }

      // Bus loyalty points (ClickBus Rewards or Buser Fidelidade)
      const busProgram = idx % 2 === 0 ? 'clickbus_rewards' : 'buser_pontos';
      const busProgramName = idx % 2 === 0 ? 'ClickBus Rewards' : 'Buser Fidelidade';
      const busPoints = Math.max(1200, Math.round((price * 32) / 100) * 100);
      const busCpm = Math.round((price / busPoints) * 1000 * 100) / 100;
      const isGoodBusDeal = busCpm >= 28.0;

      const ticket: Ticket = {
        id: `bus-${company.id}-${dateStr}-${idx}`,
        type: 'bus',
        company,
        departure: {
          location: origin.type === 'airport' ? { ...origin, name: `Terminal Rodoviário de ${origin.city}`, type: 'bus_station', code: `ROD-${origin.state}` } : origin,
          dateTime: depDate.toISOString(),
          terminal: 'Plataforma 14 a 22'
        },
        arrival: {
          location: destination.type === 'airport' ? { ...destination, name: `Terminal Rodoviário de ${destination.city}`, type: 'bus_station', code: `ROD-${destination.state}` } : destination,
          dateTime: arrDate.toISOString(),
          terminal: 'Plataforma Desembarque'
        },
        durationMinutes: duration,
        stops: idx % 3 === 0 ? 2 : 0,
        stopDetails: idx % 3 === 0 ? ['1 Parada para alimentação (30 min)'] : [],
        price,
        originalPrice: idx % 3 === 0 ? originalPrice : undefined,
        discountPercentage: idx % 3 === 0 ? 17 : undefined,
        installments: {
          count: 6,
          value: Math.round((price / 6) * 100) / 100,
          interestFree: true
        },
        seatClass: sch.serviceClass,
        baggage: {
          carryOn: true,
          checked: true,
          details: 'Bagagem no bagageiro até 30kg + mala de mão 5kg inclusos grátis'
        },
        amenities,
        seatsAvailable: 5 + ((dateSeed + idx * 7) % 24),
        partnerName: idx % 2 === 0 ? company.name : 'ClickBus Parcerias',
        flightOrBusNumber: `${company.code} ${500 + idx * 12}`,
        milesOption: {
          program: busProgram,
          programName: busProgramName,
          programType: 'bus',
          points: busPoints,
          taxBRL: 0, // No airport tax for buses
          cpmValueBRL: busCpm,
          isGoodDeal: isGoodBusDeal,
          badgeLabel: 'Taxa R$ 0,00',
          cashOption: {
            cashAmount: Math.round(price * 0.45),
            reducedPoints: Math.round(busPoints * 0.55)
          }
        },
        alternativeMilesOptions: [
          {
            program: 'superapp_points',
            programName: 'Pontos SuperApp',
            programType: 'superapp',
            points: Math.round(busPoints * 0.95 / 100) * 100,
            taxBRL: 0,
            cpmValueBRL: Math.round((price / (busPoints * 0.95)) * 1000 * 100) / 100,
            isGoodDeal: true,
            badgeLabel: 'Resgate SuperApp 5% OFF'
          }
        ]
      };

      tickets.push(ticket);
    });
  }

  // Tag cheapest, fastest, recommended
  if (tickets.length > 0) {
    const sortedByPrice = [...tickets].sort((a, b) => a.price - b.price);
    const sortedByDuration = [...tickets].sort((a, b) => a.durationMinutes - b.durationMinutes);

    const cheapestId = sortedByPrice[0].id;
    const fastestId = sortedByDuration[0].id;

    // Recommended: balance of price and duration
    const scored = [...tickets].map(t => {
      const priceScore = (t.price / sortedByPrice[0].price);
      const durationScore = (t.durationMinutes / sortedByDuration[0].durationMinutes);
      return { id: t.id, score: priceScore * 0.55 + durationScore * 0.45 };
    }).sort((a, b) => a.score - b.score);

    const recommendedId = scored[0].id;

    tickets.forEach(t => {
      t.tags = [];
      if (t.id === cheapestId) t.tags.push('cheapest');
      if (t.id === fastestId) t.tags.push('fastest');
      if (t.id === recommendedId && t.id !== cheapestId && t.id !== fastestId) t.tags.push('recommended');
      if (t.discountPercentage && t.discountPercentage >= 20) t.tags.push('flash_deal');
    });
  }

  return tickets;
}

export function filterAndSortTickets(tickets: Ticket[], filters: SearchFilters): Ticket[] {
  let result = tickets.filter(ticket => {
    // 1. Transport filter
    if (filters.transportType !== 'all' && ticket.type !== filters.transportType) {
      return false;
    }

    // 2. Min & Max Price filter (or max points in miles mode)
    if (filters.paymentMode === 'miles') {
      if (filters.maxMiles && ticket.milesOption.points > filters.maxMiles) {
        return false;
      }
    } else {
      if (ticket.price < filters.minPrice || ticket.price > filters.maxPrice) {
        return false;
      }
    }

    // 3. Stops filter
    if (filters.stops === 'direct' && ticket.stops > 0) {
      return false;
    }
    if (filters.stops === 'with_stops' && ticket.stops === 0) {
      return false;
    }

    // 4. Company filter
    if (filters.companies.length > 0 && !filters.companies.includes(ticket.company.id)) {
      return false;
    }

    // 5. Miles Programs filter (when active)
    if (filters.milesPrograms && filters.milesPrograms.length > 0) {
      const allPrograms = [
        ticket.milesOption.program,
        ...(ticket.alternativeMilesOptions?.map(o => o.program) || [])
      ];
      const hasMatchingProgram = filters.milesPrograms.some(p => allPrograms.includes(p as any));
      if (!hasMatchingProgram) return false;
    }

    // 6. Good deals only (when checked)
    if (filters.onlyGoodDeals && !ticket.milesOption.isGoodDeal) {
      return false;
    }

    // 7. Baggage included filter
    if (filters.baggageIncluded && !ticket.baggage.checked) {
      return false;
    }

    // 8. Time of day filter
    if (filters.timeOfDay.length > 0) {
      const hour = new Date(ticket.departure.dateTime).getHours();
      const inDawn = hour >= 0 && hour < 6;
      const inMorning = hour >= 6 && hour < 12;
      const inAfternoon = hour >= 12 && hour < 18;
      const inNight = hour >= 18 && hour < 24;

      const matchesTime = (
        (filters.timeOfDay.includes('dawn') && inDawn) ||
        (filters.timeOfDay.includes('morning') && inMorning) ||
        (filters.timeOfDay.includes('afternoon') && inAfternoon) ||
        (filters.timeOfDay.includes('night') && inNight)
      );

      if (!matchesTime) return false;
    }

    return true;
  });

  // Sort
  if (filters.sortBy === 'cheapest') {
    if (filters.paymentMode === 'miles') {
      result.sort((a, b) => a.milesOption.points - b.milesOption.points);
    } else if (filters.paymentMode === 'points_cash') {
      result.sort((a, b) => {
        const cashA = a.milesOption.cashOption?.cashAmount ?? a.price;
        const cashB = b.milesOption.cashOption?.cashAmount ?? b.price;
        return cashA - cashB;
      });
    } else {
      result.sort((a, b) => a.price - b.price);
    }
  } else if (filters.sortBy === 'fastest') {
    result.sort((a, b) => a.durationMinutes - b.durationMinutes);
  } else {
    // Recommended
    result.sort((a, b) => {
      const aHasTag = a.tags?.includes('recommended') ? -1 : 0;
      const bHasTag = b.tags?.includes('recommended') ? -1 : 0;
      if (aHasTag !== bHasTag) return aHasTag - bHasTag;
      if (filters.paymentMode === 'miles') {
        return a.milesOption.points - b.milesOption.points;
      }
      return a.price - b.price;
    });
  }

  return result;
}

export function generateDailyPriceTrends(origin: Location, destination: Location, baseDateStr: string): DailyPriceTrend[] {
  const trends: DailyPriceTrend[] = [];
  const baseDate = new Date(`${baseDateStr}T12:00:00`);
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // 7 days around baseDate (-3 to +3 or 0 to +13)
  for (let i = -2; i <= 8; i++) {
    const curDate = new Date(baseDate);
    curDate.setDate(baseDate.getDate() + i);

    const year = curDate.getFullYear();
    const month = String(curDate.getMonth() + 1).padStart(2, '0');
    const day = String(curDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const tickets = generateTicketsForRoute(origin, destination, dateStr, 'all');
    const flightTickets = tickets.filter(t => t.type === 'flight');
    const busTickets = tickets.filter(t => t.type === 'bus');

    const lowestFlight = flightTickets.length > 0 ? Math.min(...flightTickets.map(t => t.price)) : undefined;
    const lowestBus = busTickets.length > 0 ? Math.min(...busTickets.map(t => t.price)) : undefined;

    const overall = Math.min(...tickets.map(t => t.price));

    trends.push({
      date: dateStr,
      dayOfWeek: daysOfWeek[curDate.getDay()],
      dayNumber: curDate.getDate(),
      lowestFlightPrice: lowestFlight,
      lowestBusPrice: lowestBus,
      overallLowest: overall,
      isCurrentSearchDate: dateStr === baseDateStr
    });
  }

  return trends;
}

export function calculateModalComparison(tickets: Ticket[]) {
  const flightTickets = tickets.filter(t => t.type === 'flight');
  const busTickets = tickets.filter(t => t.type === 'bus');

  if (flightTickets.length === 0 || busTickets.length === 0) {
    return null;
  }

  const minFlight = Math.min(...flightTickets.map(t => t.price));
  const minBus = Math.min(...busTickets.map(t => t.price));
  
  const fastestFlight = Math.min(...flightTickets.map(t => t.durationMinutes));
  const fastestBus = Math.min(...busTickets.map(t => t.durationMinutes));

  const busSavings = minFlight - minBus;
  const flightTimeSavedMinutes = fastestBus - fastestFlight;

  return {
    minFlight,
    minBus,
    fastestFlightMinutes: fastestFlight,
    fastestBusMinutes: fastestBus,
    busSavings,
    flightTimeSavedMinutes,
    recommendation: busSavings > 150 ? 'bus_savings' : 'flight_speed'
  };
}
