import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrencyBRL,
  formatMiles,
  formatDuration,
  generateTicketsForRoute,
  filterAndSortTickets,
  calculateModalComparison,
  generateDailyPriceTrends
} from '../services/ticketEngine';
import { POPULAR_LOCATIONS, searchLocations, normalizeSearchText } from '../data/locations';
import { SearchFilters } from '../types';

test('formatCurrencyBRL formats Brazilian Real correctly', () => {
  const formatted = formatCurrencyBRL(189.50);
  assert.ok(formatted.includes('189') || formatted.includes('190'));
  assert.ok(formatted.includes('R$'));
});

test('formatDuration outputs readable hours and minutes', () => {
  assert.equal(formatDuration(75), '1h 15m');
  assert.equal(formatDuration(120), '2h');
  assert.equal(formatDuration(45), '45m');
});

test('generateTicketsForRoute returns both flight and bus tickets for popular route', () => {
  const sp = POPULAR_LOCATIONS.find(l => l.code === 'SAO')!;
  const rj = POPULAR_LOCATIONS.find(l => l.code === 'RIO')!;
  
  const tickets = generateTicketsForRoute(sp, rj, '2026-11-15', 'all');
  assert.ok(tickets.length > 5, 'Should generate multiple tickets');

  const flights = tickets.filter(t => t.type === 'flight');
  const buses = tickets.filter(t => t.type === 'bus');

  assert.ok(flights.length > 0, 'Should have flight options');
  assert.ok(buses.length > 0, 'Should have bus options');

  // Check ticket properties
  const firstTicket = tickets[0];
  assert.ok(firstTicket.price > 0, 'Price must be positive');
  assert.ok(firstTicket.company.name.length > 0, 'Company name required');
  assert.ok(firstTicket.installments.count > 0, 'Installments required');
});

test('filterAndSortTickets filters by transport type and sorts by cheapest', () => {
  const sp = POPULAR_LOCATIONS.find(l => l.code === 'SAO')!;
  const rj = POPULAR_LOCATIONS.find(l => l.code === 'RIO')!;
  const allTickets = generateTicketsForRoute(sp, rj, '2026-11-15', 'all');

  const busFilters: SearchFilters = {
    transportType: 'bus',
    minPrice: 0,
    maxPrice: 9999,
    stops: 'all',
    companies: [],
    timeOfDay: [],
    baggageIncluded: false,
    sortBy: 'cheapest',
    paymentMode: 'money',
    milesPrograms: []
  };

  const filteredBuses = filterAndSortTickets(allTickets, busFilters);
  assert.ok(filteredBuses.length > 0);
  assert.ok(filteredBuses.every(t => t.type === 'bus'), 'All results should be buses');

  // Verify cheapest sorting order
  for (let i = 0; i < filteredBuses.length - 1; i++) {
    assert.ok(filteredBuses[i].price <= filteredBuses[i + 1].price, 'Tickets must be ordered by price ascending');
  }
});

test('filterAndSortTickets filters tickets within minPrice and maxPrice budget range', () => {
  const sp = POPULAR_LOCATIONS.find(l => l.code === 'SAO')!;
  const rj = POPULAR_LOCATIONS.find(l => l.code === 'RIO')!;
  const allTickets = generateTicketsForRoute(sp, rj, '2026-11-15', 'all');

  const prices = allTickets.map(t => t.price).sort((a, b) => a - b);
  const minBudget = prices[Math.floor(prices.length * 0.25)];
  const maxBudget = prices[Math.floor(prices.length * 0.75)];

  const rangeFilters: SearchFilters = {
    transportType: 'all',
    minPrice: minBudget,
    maxPrice: maxBudget,
    stops: 'all',
    companies: [],
    timeOfDay: [],
    baggageIncluded: false,
    sortBy: 'cheapest',
    paymentMode: 'money',
    milesPrograms: []
  };

  const filtered = filterAndSortTickets(allTickets, rangeFilters);
  assert.ok(filtered.length > 0, 'Should find tickets in the mid-range budget');
  assert.ok(
    filtered.every(t => t.price >= minBudget && t.price <= maxBudget),
    `All tickets must be between ${minBudget} and ${maxBudget}`
  );
  
  // Verify that any ticket with price < minBudget is excluded
  const cheaperTickets = allTickets.filter(t => t.price < minBudget);
  if (cheaperTickets.length > 0) {
    cheaperTickets.forEach(t => {
      assert.ok(!filtered.some(f => f.id === t.id), `Ticket ${t.id} under minBudget should be filtered out`);
    });
  }

  // Verify that any ticket with price > maxBudget is excluded
  const expensiveTickets = allTickets.filter(t => t.price > maxBudget);
  if (expensiveTickets.length > 0) {
    expensiveTickets.forEach(t => {
      assert.ok(!filtered.some(f => f.id === t.id), `Ticket ${t.id} over maxBudget should be filtered out`);
    });
  }
});

test('calculateModalComparison provides bus vs flight trade-off analysis', () => {
  const sp = POPULAR_LOCATIONS.find(l => l.code === 'SAO')!;
  const rj = POPULAR_LOCATIONS.find(l => l.code === 'RIO')!;
  const tickets = generateTicketsForRoute(sp, rj, '2026-11-15', 'all');

  const comparison = calculateModalComparison(tickets);
  assert.ok(comparison !== null);
  assert.ok(comparison.minFlight > 0);
  assert.ok(comparison.minBus > 0);
  assert.ok(comparison.fastestFlightMinutes < comparison.fastestBusMinutes, 'Flight should be faster than bus');
});

test('generateDailyPriceTrends generates 11 days of price trends', () => {
  const sp = POPULAR_LOCATIONS.find(l => l.code === 'SAO')!;
  const rj = POPULAR_LOCATIONS.find(l => l.code === 'RIO')!;

  const trends = generateDailyPriceTrends(sp, rj, '2026-11-15');
  assert.equal(trends.length, 11, 'Should generate 11 days of price trends');
  assert.ok(trends.some(t => t.isCurrentSearchDate));
});

test('normalizeSearchText removes diacritics and lowercases', () => {
  assert.equal(normalizeSearchText('São Paulo'), 'sao paulo');
  assert.equal(normalizeSearchText('Goiânia'), 'goiania');
  assert.equal(normalizeSearchText('FLORIANÓPOLIS'), 'florianopolis');
  assert.equal(normalizeSearchText(' Belém '), 'belem');
});

test('searchLocations finds cities with accent-insensitive search and prioritizes matches', () => {
  // Test search without accents
  const spResults = searchLocations('sao paulo');
  assert.ok(spResults.length > 0, 'Should find São Paulo');
  assert.equal(spResults[0].city, 'São Paulo');

  // Test IATA / station code exact match
  const bsbResults = searchLocations('BSB');
  assert.ok(bsbResults.length > 0);
  assert.equal(bsbResults[0].code, 'BSB');

  // Test partial city search
  const curitResults = searchLocations('curit');
  assert.ok(curitResults.length > 0);
  assert.ok(curitResults.some(l => l.city === 'Curitiba'));

  // Test filter by transport category
  const airportOnly = searchLocations('rio', 'airport');
  assert.ok(airportOnly.every(l => l.type === 'airport' || l.type === 'city_all'));

  const busOnly = searchLocations('rio', 'bus_station');
  assert.ok(busOnly.every(l => l.type === 'bus_station'));
});

test('formatMiles formats points with thousands separators', () => {
  assert.equal(formatMiles(14500), '14.500');
  assert.equal(formatMiles(3200), '3.200');
  assert.equal(formatMiles(850), '850');
});

test('generateTicketsForRoute generates complete miles options and loyalty data', () => {
  const sp = POPULAR_LOCATIONS.find(l => l.code === 'SAO')!;
  const rj = POPULAR_LOCATIONS.find(l => l.code === 'RIO')!;
  const tickets = generateTicketsForRoute(sp, rj, '2026-11-15', 'all');

  const flights = tickets.filter(t => t.type === 'flight');
  const buses = tickets.filter(t => t.type === 'bus');

  // Verify flight miles
  assert.ok(flights.length > 0);
  flights.forEach(f => {
    assert.ok(f.milesOption.points >= 4000, 'Flight miles should be realistic (>= 4000)');
    assert.ok(f.milesOption.taxBRL > 35, 'Flight airport tax should follow ANAC rules (> R$ 35)');
    assert.ok(f.milesOption.cpmValueBRL > 0, 'Flight CPM should be calculated');
    assert.ok(f.alternativeMilesOptions && f.alternativeMilesOptions.length > 0, 'Flight should have alternative loyalty programs');
    assert.ok(['latam_pass', 'smiles', 'azul_fidelidade'].includes(f.milesOption.program), 'Flight program should be airline loyalty');
  });

  // Verify bus miles
  assert.ok(buses.length > 0);
  buses.forEach(b => {
    assert.ok(b.milesOption.points >= 1000, 'Bus miles should be realistic (>= 1000)');
    assert.equal(b.milesOption.taxBRL, 0, 'Bus boarding tax with loyalty rewards should be R$ 0');
    assert.ok(b.milesOption.cpmValueBRL > 0, 'Bus CPM should be calculated');
    assert.ok(['clickbus_rewards', 'buser_pontos'].includes(b.milesOption.program), 'Bus program should be bus rewards');
  });
});

test('filterAndSortTickets filters by loyalty program and sorts by lowest miles', () => {
  const sp = POPULAR_LOCATIONS.find(l => l.code === 'SAO')!;
  const rj = POPULAR_LOCATIONS.find(l => l.code === 'RIO')!;
  const tickets = generateTicketsForRoute(sp, rj, '2026-11-15', 'all');

  const milesFilters: SearchFilters = {
    transportType: 'all',
    minPrice: 0,
    maxPrice: 9999,
    stops: 'all',
    companies: [],
    timeOfDay: [],
    baggageIncluded: false,
    sortBy: 'cheapest',
    paymentMode: 'miles',
    milesPrograms: ['smiles'],
    maxMiles: 30000,
    onlyGoodDeals: false
  };

  const filtered = filterAndSortTickets(tickets, milesFilters);
  assert.ok(filtered.length > 0, 'Should find tickets matching smiles');

  // Check all have smiles either as primary or alternative
  filtered.forEach(t => {
    const progs = [t.milesOption.program, ...(t.alternativeMilesOptions?.map(o => o.program) || [])];
    assert.ok(progs.includes('smiles'), 'Ticket must offer Smiles redemption');
    assert.ok(t.milesOption.points <= 30000, 'Ticket must be under maxMiles');
  });

  // Check sorting by lowest points
  for (let i = 0; i < filtered.length - 1; i++) {
    assert.ok(
      filtered[i].milesOption.points <= filtered[i + 1].milesOption.points,
      'Tickets should be ordered by points ascending in miles mode'
    );
  }
});

test('Ticket extracts monetary price and calculates required points accurately with taxes', () => {
  const sp = POPULAR_LOCATIONS.find(l => l.code === 'SAO')!;
  const rj = POPULAR_LOCATIONS.find(l => l.code === 'RIO')!;
  const tickets = generateTicketsForRoute(sp, rj, '2026-11-20', 'all');

  assert.ok(tickets.length > 0);

  tickets.forEach(ticket => {
    // 1. Must extract valid monetary price
    assert.ok(ticket.price > 0, 'Extracted ticket cash price must be > 0');
    assert.ok(ticket.installments.value > 0, 'Installment value must be calculated');

    // 2. Must inform necessary points
    assert.ok(ticket.milesOption.points > 0, 'Required points must be informed');
    assert.ok(ticket.milesOption.programName.length > 0, 'Loyalty program name required');
    assert.ok(ticket.milesOption.cpmValueBRL > 0, 'CPM calculation required');

    // 3. Must attach verified GDS or ANTT source
    assert.ok(ticket.verifiedSource !== undefined, 'Verified provider feed must be present');
    assert.ok(ticket.verifiedSource!.providerName.length > 0, 'Provider name must be informed');
    assert.ok(ticket.verifiedSource!.reliability.length > 0, 'Reliability score required');
  });
});

test('searchLocations finds international airports like Miami, Orlando, Lisbon, Paris and New York', () => {
  const miami = searchLocations('Miami');
  assert.ok(miami.length > 0, 'Should find Miami');
  assert.equal(miami[0].code, 'MIA');

  const lisboa = searchLocations('Lisboa');
  assert.ok(lisboa.length > 0, 'Should find Lisboa');
  assert.equal(lisboa[0].code, 'LIS');

  const ny = searchLocations('New York');
  assert.ok(ny.length > 0, 'Should find New York via English synonym');

  const orlando = searchLocations('Orlando');
  assert.ok(orlando.length > 0, 'Should find Orlando');
  assert.equal(orlando[0].code, 'MCO');

  const paris = searchLocations('Paris');
  assert.ok(paris.length > 0, 'Should find Paris');
  assert.ok(paris.some(l => l.code === 'CDG' || l.code === 'PAR'));
});

test('generateTicketsForRoute correctly handles international routes (e.g. São Paulo to Miami or Lisbon)', () => {
  const gru = POPULAR_LOCATIONS.find(l => l.code === 'GRU')!;
  const mia = searchLocations('MIA')[0];
  assert.ok(mia, 'MIA should exist');

  const tickets = generateTicketsForRoute(gru, mia, '2026-11-20', 'all');
  assert.ok(tickets.length > 0, 'Should generate international tickets');

  // Must only contain flight tickets (NO bus tickets to Miami!)
  assert.ok(tickets.every(t => t.type === 'flight'), 'International route to Miami must not contain bus options');

  // Must be marked as international and have valid direct emission link
  tickets.forEach(ticket => {
    assert.equal(ticket.isInternational, true, 'Ticket must be marked as international');
    assert.ok(ticket.price >= 2000, 'International long-haul flight price must be realistic (>= R$ 2000)');
    assert.ok(ticket.durationMinutes > 400, 'Flight to Miami should have realistic duration (> 400 mins)');
    assert.ok(ticket.offerEmissionUrl.startsWith('https://'), 'Must have official emission URL');
    assert.ok(ticket.milesOption.points >= 40000, 'International flight miles should be realistic (>= 40.000 pts)');
  });
});

