import { Ticket, Location, Company, DailyPriceTrend, SearchFilters, TransportType, LoyaltyProgramId, MilesOption } from '../types';
import { AIRLINES, BUS_COMPANIES } from '../data/companies';
import { getVerifiedProviderFeed, LOYALTY_MARKET_QUOTES } from './loyaltyMarketData';

// Coordinates lookup for distance estimation (domestic and international)
const LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Brazilian domestic
  'SAO': { lat: -23.5505, lng: -46.6333 },
  'GRU': { lat: -23.4356, lng: -46.4731 },
  'CGH': { lat: -23.6273, lng: -46.6566 },
  'VCP': { lat: -23.0074, lng: -47.1345 },
  'TIETÊ': { lat: -23.5162, lng: -46.6253 },
  'BARRA FUNDA': { lat: -23.5255, lng: -46.6668 },
  'RIO': { lat: -22.9068, lng: -43.1729 },
  'SDU': { lat: -22.9105, lng: -43.1631 },
  'GIG': { lat: -22.8089, lng: -43.2436 },
  'NOVO RIO': { lat: -22.8988, lng: -43.2096 },
  'BHZ': { lat: -19.9167, lng: -43.9345 },
  'CNF': { lat: -19.6244, lng: -43.9719 },
  'TER-BH': { lat: -19.9136, lng: -43.9425 },
  'BSB': { lat: -15.8697, lng: -47.9172 },
  'TER-BSB': { lat: -15.8272, lng: -47.9547 },
  'CWB': { lat: -25.5327, lng: -49.1758 },
  'RODO-CWB': { lat: -25.4367, lng: -49.2592 },
  'FLN': { lat: -27.6705, lng: -48.5525 },
  'TER-FLN': { lat: -27.5969, lng: -48.5569 },
  'SSA': { lat: -12.9086, lng: -38.3225 },
  'TER-SSA': { lat: -12.9789, lng: -38.4619 },
  'POA': { lat: -29.9935, lng: -51.1711 },
  'TER-POA': { lat: -30.0245, lng: -51.2178 },
  'REC': { lat: -8.1264, lng: -34.9228 },
  'TIP-REC': { lat: -8.0694, lng: -35.0022 },
  'FOR': { lat: -3.7763, lng: -38.5326 },
  'TER-FOR': { lat: -3.7667, lng: -38.5333 },
  'GYN': { lat: -16.6322, lng: -49.2217 },
  'TER-GYN': { lat: -16.6667, lng: -49.2667 },
  'IGU': { lat: -25.5958, lng: -54.4875 },
  'TER-IGU': { lat: -25.5183, lng: -54.5683 },
  'VIX': { lat: -20.2581, lng: -40.2864 },
  'VIX-AIR': { lat: -20.2581, lng: -40.2864 },
  'CPQ': { lat: -22.9056, lng: -47.0608 },
  'NAT': { lat: -5.7689, lng: -35.3664 },
  'MCZ': { lat: -9.5108, lng: -35.7917 },
  'MAO': { lat: -3.0358, lng: -60.0497 },
  'BEL': { lat: -1.3792, lng: -48.4764 },
  'CGB': { lat: -15.6528, lng: -56.1167 },
  'CGR': { lat: -20.4686, lng: -54.6725 },
  'JPA': { lat: -7.1483, lng: -34.9503 },
  'NVT': { lat: -26.8803, lng: -48.6514 },
  'TER-GRA': { lat: -29.3789, lng: -50.8736 },
  'TER-STS': { lat: -23.9353, lng: -46.3269 },
  'RAO': { lat: -21.1364, lng: -47.7767 },

  // International - North America
  'MIA': { lat: 25.7959, lng: -80.2870 },
  'MCO': { lat: 28.4312, lng: -81.3081 },
  'JFK': { lat: 40.6413, lng: -73.7781 },
  'EWR': { lat: 40.6895, lng: -74.1745 },
  'NYC': { lat: 40.7128, lng: -74.0060 },
  'LAX': { lat: 33.9416, lng: -118.4085 },
  'ORD': { lat: 41.9742, lng: -87.9073 },
  'CUN': { lat: 21.0365, lng: -86.8771 },

  // International - Europe
  'LIS': { lat: 38.7756, lng: -9.1354 },
  'OPO': { lat: 41.2421, lng: -8.6786 },
  'MAD': { lat: 40.4839, lng: -3.5680 },
  'BCN': { lat: 41.2974, lng: 2.0833 },
  'CDG': { lat: 49.0097, lng: 2.5479 },
  'PAR': { lat: 48.8566, lng: 2.3522 },
  'LHR': { lat: 51.4700, lng: -0.4543 },
  'LON': { lat: 51.5074, lng: -0.1278 },
  'FCO': { lat: 41.8003, lng: 12.2389 },
  'MXP': { lat: 45.6301, lng: 8.7231 },
  'FRA': { lat: 50.0379, lng: 8.5622 },
  'AMS': { lat: 52.3105, lng: 4.7683 },

  // International - South America
  'EZE': { lat: -34.8222, lng: -58.5358 },
  'AEP': { lat: -34.5592, lng: -58.4156 },
  'BUE': { lat: -34.6037, lng: -58.3816 },
  'SCL': { lat: -33.3930, lng: -70.7858 },
  'MVD': { lat: -34.8384, lng: -56.0308 },
  'LIM': { lat: -12.0219, lng: -77.1143 },
  'BOG': { lat: 4.7016, lng: -74.1469 },

  // International - Middle East & Asia
  'DXB': { lat: 25.2532, lng: 55.3657 },
  'DOH': { lat: 25.2731, lng: 51.6081 },
  'HND': { lat: 35.5494, lng: 139.7798 },
  'NRT': { lat: 35.7720, lng: 140.3929 }
};

// State capital approximate distances fallback in km
const DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  'SP': { 'RJ': 430, 'MG': 580, 'PR': 400, 'DF': 1000, 'SC': 700, 'RS': 1100, 'BA': 1950, 'CE': 3100, 'PE': 2650, 'GO': 900 },
  'RJ': { 'SP': 430, 'MG': 440, 'PR': 850, 'DF': 1150, 'SC': 1140, 'RS': 1550, 'BA': 1650, 'CE': 2800, 'PE': 2300, 'GO': 1300 },
  'MG': { 'SP': 580, 'RJ': 440, 'PR': 1000, 'DF': 740, 'BA': 1370, 'CE': 2500, 'PE': 2050, 'GO': 900 },
  'PR': { 'SP': 400, 'SC': 300, 'RS': 710, 'RJ': 850, 'MG': 1000, 'DF': 1350 },
  'DF': { 'SP': 1000, 'RJ': 1150, 'MG': 740, 'GO': 200, 'BA': 1440, 'PR': 1350 }
};

export function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function isInternationalLocation(loc: Location): boolean {
  if (loc.country && loc.country !== 'Brasil') return true;
  const internationalCodes = [
    'MIA', 'MCO', 'JFK', 'EWR', 'NYC', 'LAX', 'ORD', 'CUN',
    'LIS', 'OPO', 'MAD', 'BCN', 'CDG', 'PAR', 'LHR', 'LON',
    'FCO', 'MXP', 'FRA', 'AMS', 'EZE', 'AEP', 'BUE', 'SCL',
    'MVD', 'LIM', 'BOG', 'DXB', 'DOH', 'HND', 'NRT'
  ];
  return internationalCodes.includes(loc.code.toUpperCase());
}

export function getEstimatedDistance(origin: Location, destination: Location): number {
  const coordA = LOCATION_COORDINATES[origin.code] || (origin.coordinates ? { lat: origin.coordinates.lat, lng: origin.coordinates.lng } : null);
  const coordB = LOCATION_COORDINATES[destination.code] || (destination.coordinates ? { lat: destination.coordinates.lat, lng: destination.coordinates.lng } : null);

  if (coordA && coordB) {
    const dist = calculateHaversineKm(coordA.lat, coordA.lng, coordB.lat, coordB.lng);
    return Math.max(120, dist);
  }

  // Fallback for domestic states
  if (origin.state === destination.state) return 140;
  const matrixDist = DISTANCE_MATRIX[origin.state]?.[destination.state] || DISTANCE_MATRIX[destination.state]?.[origin.state];
  if (matrixDist) return matrixDist;

  // International fallback defaults
  if (isInternationalLocation(origin) || isInternationalLocation(destination)) {
    return 7200; // Average international route distance in km
  }

  return 750;
}

export function generateEmissionUrl(
  companyId: string,
  originCode: string,
  destCode: string,
  dateStr: string,
  isBus: boolean,
  originCity: string,
  destCity: string
): string {
  if (isBus) {
    const slugOrig = originCity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
    const slugDest = destCity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
    return `https://www.clickbus.com.br/onibus/${slugOrig}/${slugDest}?departureDate=${dateStr}`;
  }

  const orig = encodeURIComponent(originCode);
  const dest = encodeURIComponent(destCode);

  switch (companyId) {
    case 'latam':
      return `https://www.latamairlines.com/br/pt/ofertas-voos?origin=${orig}&destination=${dest}&outboundDate=${dateStr}&cabin=economy`;
    case 'gol':
      return `https://www.voegol.com.br/compre-sua-passagem/busca?origem=${orig}&destino=${dest}&ida=${dateStr}`;
    case 'azul':
      return `https://www.voeazul.com.br/br/pt/home/selecao-voo?origin=${orig}&destination=${dest}&departureDate=${dateStr}`;
    case 'tap':
      return `https://www.flytap.com/pt-br/reserva-de-voos?origin=${orig}&destination=${dest}&departureDate=${dateStr}`;
    case 'american':
      return `https://www.aa.com.br/booking/find-flights?origin=${orig}&destination=${dest}&departDate=${dateStr}`;
    case 'airfrance':
      return `https://www.airfrance.com.br/search/advanced?origin=${orig}&destination=${dest}&departureDate=${dateStr}`;
    case 'iberia':
      return `https://www.iberia.com/br/voos/?origin=${orig}&destination=${dest}&departureDate=${dateStr}`;
    case 'united':
      return `https://www.united.com/pt/br/fsr/choose-flights?f=${orig}&t=${dest}&d=${dateStr}`;
    case 'british':
      return `https://www.britishairways.com/travel/fx/public/pt_br?departurePoint=${orig}&destinationPoint=${dest}&departDate=${dateStr}`;
    case 'emirates':
      return `https://www.emirates.com/br/portuguese/book/?orig=${orig}&dest=${dest}&departDate=${dateStr}`;
    case 'aerolineas':
      return `https://www.aerolineas.com.ar/voos?from=${orig}&to=${dest}&date=${dateStr}`;
    default:
      return `https://www.google.com/travel/flights?q=flights%20from%20${orig}%20to%20${dest}%20on%20${dateStr}`;
  }
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

export function getEligibleAirlinesForRoute(origin: Location, destination: Location): Company[] {
  const isInter = isInternationalLocation(origin) || isInternationalLocation(destination);
  if (!isInter) {
    // Domestic airlines
    return AIRLINES.filter(a => ['latam', 'gol', 'azul', 'voepass'].includes(a.id));
  }

  const destCode = destination.code.toUpperCase();
  const origCode = origin.code.toUpperCase();
  const checkCode = (c: string) => origCode === c || destCode === c;

  // North America
  if (['MIA', 'MCO', 'JFK', 'EWR', 'NYC', 'LAX', 'ORD', 'CUN'].some(checkCode) || destination.country === 'Estados Unidos' || destination.country === 'México') {
    return AIRLINES.filter(a => ['american', 'united', 'latam'].includes(a.id));
  }

  // Europe
  if (['LIS', 'OPO', 'MAD', 'BCN', 'CDG', 'PAR', 'LHR', 'LON', 'FCO', 'MXP', 'FRA', 'AMS'].some(checkCode) || ['Portugal', 'França', 'Espanha', 'Reino Unido', 'Itália', 'Alemanha', 'Holanda'].includes(destination.country || '')) {
    return AIRLINES.filter(a => ['tap', 'airfrance', 'iberia', 'british', 'latam'].includes(a.id));
  }

  // South America
  if (['EZE', 'AEP', 'BUE', 'SCL', 'MVD', 'LIM', 'BOG'].some(checkCode) || ['Argentina', 'Chile', 'Uruguai', 'Peru', 'Colômbia'].includes(destination.country || '')) {
    return AIRLINES.filter(a => ['aerolineas', 'latam', 'gol'].includes(a.id));
  }

  // Middle East & Asia
  if (['DXB', 'DOH', 'HND', 'NRT'].some(checkCode) || ['Emirados Árabes', 'Catar', 'Japão'].includes(destination.country || '')) {
    return AIRLINES.filter(a => ['emirates', 'british', 'airfrance', 'latam'].includes(a.id));
  }

  // Fallback international
  return AIRLINES.filter(a => !['voepass', 'cometa', '1001'].includes(a.id));
}

export function generateTicketsForRoute(
  origin: Location,
  destination: Location,
  dateStr: string,
  transportType: TransportType = 'all'
): Ticket[] {
  const distance = getEstimatedDistance(origin, destination);
  const isInter = isInternationalLocation(origin) || isInternationalLocation(destination);
  const tickets: Ticket[] = [];

  // Deterministic seed based on date and route to keep results consistent
  const dateSeed = dateStr.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
  const routeSeed = (origin.name.length * 7 + destination.name.length * 13) % 100;

  // 1. Generate Flight Tickets (if applicable)
  if (transportType === 'all' || transportType === 'flight') {
    const flightSchedules = isInter ? [
      { depHour: 7, depMin: 15, isDirect: false, stopDesc: 'Conexão em Brasília (BSB) - 1h45m' },
      { depHour: 10, depMin: 30, isDirect: true, stopDesc: '' },
      { depHour: 14, depMin: 20, isDirect: false, stopDesc: 'Conexão em São Paulo (GRU) - 2h10m' },
      { depHour: 19, depMin: 45, isDirect: true, stopDesc: '' },
      { depHour: 22, depMin: 10, isDirect: true, stopDesc: '' },
      { depHour: 23, depMin: 55, isDirect: false, stopDesc: 'Conexão em Miami (MIA) / Lisboa (LIS) - 2h30m' }
    ] : [
      { depHour: 6, depMin: 15, isDirect: true, stopDesc: '' },
      { depHour: 8, depMin: 45, isDirect: true, stopDesc: '' },
      { depHour: 11, depMin: 20, isDirect: false, stopDesc: 'Conexão em Brasília (BSB) - 1h15m' },
      { depHour: 14, depMin: 10, isDirect: true, stopDesc: '' },
      { depHour: 17, depMin: 35, isDirect: true, stopDesc: '' },
      { depHour: 20, depMin: 50, isDirect: true, stopDesc: '' },
      { depHour: 22, depMin: 30, isDirect: false, stopDesc: 'Conexão em Belo Horizonte (CNF) - 1h20m' }
    ];

    // Speed calculation
    const cruiseSpeedKmh = isInter ? 840 : 720;
    const flightBaseDuration = Math.max(50, Math.round((distance / cruiseSpeedKmh) * 60) + 35); // minutes

    // Base price calibration based on real market data
    let flightBasePrice = 320;
    let boardingTax = 42.50;
    let baseMilesRate = 20.0;

    if (isInter) {
      if (distance < 3800) {
        // South America (EZE, SCL, MVD)
        flightBasePrice = Math.round(1180 + (distance - 1500) * 0.32);
        boardingTax = 195.0;
        baseMilesRate = 32.0;
      } else if (distance < 7800) {
        // North America (MIA, JFK, ORD)
        flightBasePrice = Math.round(2480 + (distance - 6500) * 0.28);
        boardingTax = 310.0;
        baseMilesRate = 42.0;
      } else if (distance < 11000) {
        // Europe (LIS, CDG, LHR, MAD)
        flightBasePrice = Math.round(3150 + (distance - 7800) * 0.30);
        boardingTax = 360.0;
        baseMilesRate = 48.0;
      } else {
        // Asia / Middle East (DXB, HND)
        flightBasePrice = Math.round(4900 + (distance - 11000) * 0.32);
        boardingTax = 440.0;
        baseMilesRate = 56.0;
      }
    } else {
      // Domestic Brazilian route
      flightBasePrice = Math.max(189, Math.round(140 + distance * 0.28));
      boardingTax = 38.50;
      baseMilesRate = 18.5;
    }

    const availableAirlines = getEligibleAirlinesForRoute(origin, destination);

    flightSchedules.forEach((sch, idx) => {
      const company = availableAirlines[idx % availableAirlines.length];
      const duration = sch.isDirect ? flightBaseDuration : flightBaseDuration + (isInter ? 165 : 105);
      
      // Price calculation with realistic slight variation
      const priceMultiplier = 0.88 + (((dateSeed + routeSeed + idx * 23) % 35) / 100);
      const price = Math.round(flightBasePrice * priceMultiplier);
      const originalPrice = Math.round(price * 1.25);
      
      const depDate = new Date(`${dateStr}T${String(sch.depHour).padStart(2, '0')}:${String(sch.depMin).padStart(2, '0')}:00`);
      const arrDate = new Date(depDate.getTime() + duration * 60 * 1000);

      // Seat class
      const seatClasses = ['Econômica Promo', 'Econômica Regular', 'Premium Economy'];
      const seatClass = seatClasses[idx % seatClasses.length];

      // Primary loyalty program
      let loyaltyProgram: LoyaltyProgramId = 'smiles';
      let programName = 'Smiles';
      if (company.id === 'latam') {
        loyaltyProgram = 'latam_pass';
        programName = 'LATAM Pass';
      } else if (company.id === 'azul') {
        loyaltyProgram = 'azul_fidelidade';
        programName = 'Azul Fidelidade';
      } else if (company.id === 'tap') {
        loyaltyProgram = 'smiles';
        programName = 'TAP Miles&Go / Smiles';
      } else if (company.id === 'american') {
        loyaltyProgram = 'smiles';
        programName = 'AAdvantage / Smiles';
      } else if (company.id === 'airfrance') {
        loyaltyProgram = 'smiles';
        programName = 'Flying Blue / Smiles';
      } else if (company.id === 'iberia') {
        loyaltyProgram = 'latam_pass';
        programName = 'Iberia Plus / LATAM';
      } else if (company.id === 'united') {
        loyaltyProgram = 'azul_fidelidade';
        programName = 'MileagePlus / Azul';
      } else if (company.id === 'british') {
        loyaltyProgram = 'latam_pass';
        programName = 'Executive Club / LATAM';
      } else if (company.id === 'emirates') {
        loyaltyProgram = 'smiles';
        programName = 'Emirates Skywards / Smiles';
      } else if (company.id === 'aerolineas') {
        loyaltyProgram = 'smiles';
        programName = 'Aerolíneas Plus / Smiles';
      }

      const taxBRL = Math.round((boardingTax + (idx % 3) * 3.5) * 100) / 100;
      const pointRate = baseMilesRate + ((idx * 5) % 6) - 2;
      const points = Math.max(isInter ? 18000 : 4200, Math.round(((price - taxBRL) / pointRate) * 10) * 100);
      const cpmValueBRL = Math.round(((price - taxBRL) / points) * 1000 * 100) / 100;
      const isGoodDeal = cpmValueBRL >= (LOYALTY_MARKET_QUOTES[loyaltyProgram]?.cpmThresholdGoodDeal || 18.0);

      // Alternatives
      const altOptions: MilesOption[] = [];
      const addedPrograms = new Set<string>([loyaltyProgram]);

      if (!addedPrograms.has('smiles')) {
        addedPrograms.add('smiles');
        const smilesPts = Math.round((points * 1.05) / 100) * 100;
        altOptions.push({
          program: 'smiles',
          programName: 'Smiles (GOL & Parceiras)',
          programType: 'airline',
          points: smilesPts,
          taxBRL,
          cpmValueBRL: Math.round(((price - taxBRL) / smilesPts) * 1000 * 100) / 100,
          isGoodDeal: ((price - taxBRL) / smilesPts) * 1000 >= 16.5,
          badgeLabel: 'Emissão Parceiras'
        });
      }

      if (!addedPrograms.has('latam_pass')) {
        addedPrograms.add('latam_pass');
        const latamPts = Math.round((points * 0.94) / 100) * 100;
        altOptions.push({
          program: 'latam_pass',
          programName: 'LATAM Pass',
          programType: 'airline',
          points: latamPts,
          taxBRL,
          cpmValueBRL: Math.round(((price - taxBRL) / latamPts) * 1000 * 100) / 100,
          isGoodDeal: ((price - taxBRL) / latamPts) * 1000 >= 24.0,
          badgeLabel: 'Tabela Dinâmica'
        });
      }

      if (!addedPrograms.has('azul_fidelidade')) {
        addedPrograms.add('azul_fidelidade');
        const azulPts = Math.round((points * 1.02) / 100) * 100;
        altOptions.push({
          program: 'azul_fidelidade',
          programName: 'Azul Fidelidade',
          programType: 'airline',
          points: azulPts,
          taxBRL,
          cpmValueBRL: Math.round(((price - taxBRL) / azulPts) * 1000 * 100) / 100,
          isGoodDeal: ((price - taxBRL) / azulPts) * 1000 >= 19.5,
          badgeLabel: 'Interline Azul'
        });
      }

      if (!addedPrograms.has('livelo')) {
        addedPrograms.add('livelo');
        const liveloPts = Math.round((points * 1.10) / 100) * 100;
        altOptions.push({
          program: 'livelo',
          programName: 'Livelo',
          programType: 'bank',
          points: liveloPts,
          taxBRL,
          cpmValueBRL: Math.round(((price - taxBRL) / liveloPts) * 1000 * 100) / 100,
          isGoodDeal: false,
          badgeLabel: 'Transferência Bancária'
        });
      }

      const offerEmissionUrl = generateEmissionUrl(
        company.id,
        origin.code,
        destination.code,
        dateStr,
        false,
        origin.city,
        destination.city
      );

      const ticket: Ticket = {
        id: `flight-${company.id}-${dateStr}-${idx}`,
        type: 'flight',
        company,
        departure: {
          location: origin.type === 'bus_station' ? { ...origin, name: `Aeroporto próximo a ${origin.city}`, type: 'airport', code: origin.city.slice(0, 3).toUpperCase() } : origin,
          dateTime: depDate.toISOString(),
          terminal: isInter ? 'Terminal 3 Internacional' : 'Terminal 2'
        },
        arrival: {
          location: destination.type === 'bus_station' ? { ...destination, name: `Aeroporto próximo a ${destination.city}`, type: 'airport', code: destination.city.slice(0, 3).toUpperCase() } : destination,
          dateTime: arrDate.toISOString(),
          terminal: isInter ? 'Terminal Internacional' : 'Terminal 1'
        },
        durationMinutes: duration,
        stops: sch.isDirect ? 0 : 1,
        stopDetails: sch.isDirect ? [] : [sch.stopDesc],
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
          checked: isInter || idx % 3 === 0,
          details: isInter ? 'Mochila + Bagagem de mão 10kg + 1 Bagagem despachada 23kg inclusa' : (idx % 3 === 0 ? 'Mochila + Bagagem de mão 10kg + Despachada 23kg' : 'Mochila + Bagagem de mão 10kg inclusa')
        },
        amenities: isInter ? [
          'Bagagem despachada 23kg',
          'Refeições e bebidas internacionais a bordo',
          'Entretenimento de bordo individual',
          'Tomadas e USB no assento',
          'Wi-Fi a bordo'
        ] : [
          'Mochila 10kg inclusa',
          'Tomada USB no assento',
          'Wi-Fi a bordo',
          'Lanche e bebidas inclusos'
        ],
        seatsAvailable: 3 + ((dateSeed + idx * 5) % 12),
        partnerName: company.name,
        flightOrBusNumber: `${company.code} ${isInter ? 8000 + idx * 11 : 1200 + idx * 47}`,
        verifiedSource: getVerifiedProviderFeed('flight', company.id, company.name),
        offerEmissionUrl,
        isInternational: isInter,
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
        alternativeMilesOptions: altOptions
      };

      tickets.push(ticket);
    });
  }

  // 2. Generate Bus Tickets ONLY for domestic Brazilian routes
  if (!isInter && (transportType === 'all' || transportType === 'bus')) {
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

      // Bus loyalty points
      const busProgram: LoyaltyProgramId = idx % 2 === 0 ? 'clickbus_rewards' : 'buser_pontos';
      const busProgramName = idx % 2 === 0 ? 'ClickBus Rewards' : 'Buser Fidelidade';
      const busPoints = Math.max(1200, Math.round((price * 32) / 100) * 100);
      const busCpm = Math.round((price / busPoints) * 1000 * 100) / 100;
      const isGoodBusDeal = busCpm >= 28.0;

      const offerEmissionUrl = generateEmissionUrl(
        company.id,
        origin.code,
        destination.code,
        dateStr,
        true,
        origin.city,
        destination.city
      );

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
        partnerName: company.name,
        flightOrBusNumber: `${company.code} ${500 + idx * 12}`,
        verifiedSource: getVerifiedProviderFeed('bus', company.id, company.name),
        offerEmissionUrl,
        isInternational: false,
        milesOption: {
          program: busProgram,
          programName: busProgramName,
          programType: 'bus',
          points: busPoints,
          taxBRL: 0,
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

  // 7 days around baseDate
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

    const overall = tickets.length > 0 ? Math.min(...tickets.map(t => t.price)) : 0;

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
