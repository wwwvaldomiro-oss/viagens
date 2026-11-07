import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  calculateRoadTripRoute, 
  calculateDistanceKm, 
  formatRouteDuration,
  generateDriverShareText 
} from '../services/tollEngine';
import { VEHICLE_CATEGORIES, BRAZIL_TOLL_PLAZAS } from '../data/tollPlazasData';

describe('Toll Engine & Road Trip Route Calculation', () => {
  const spOrigin = {
    id: 'sao_paulo',
    label: 'A',
    name: 'São Paulo, SP',
    lat: -23.5505,
    lng: -46.6333
  };

  const rjDestination = {
    id: 'rio_de_janeiro',
    label: 'B',
    name: 'Rio de Janeiro, RJ',
    lat: -22.9068,
    lng: -43.1729
  };

  it('calculates distance correctly using Haversine formula', () => {
    const straightDist = calculateDistanceKm(spOrigin.lat, spOrigin.lng, rjDestination.lat, rjDestination.lng);
    // Straight line distance SP -> Rio is approx 350-370 km
    assert.ok(straightDist > 340 && straightDist < 390, `Expected straight distance ~360km, got ${straightDist}`);
  });

  it('formats route duration into human-readable Portuguese style', () => {
    assert.strictEqual(formatRouteDuration(75), '1 h 15 min');
    assert.strictEqual(formatRouteDuration(335), '5 h 35 min');
    assert.strictEqual(formatRouteDuration(3020), '2 d 2 h 20 min');
  });

  it('calculates full road trip route from São Paulo to Rio de Janeiro for a passenger car', () => {
    const route = calculateRoadTripRoute({
      origin: spOrigin,
      destination: rjDestination,
      vehicleCategoryId: 'car',
      fuelTypeId: 'gasolina'
    });

    assert.ok(route.distanceKm > 400 && route.distanceKm < 480, `Expected highway distance ~430km, got ${route.distanceKm}`);
    assert.ok(route.tollPlazasCount >= 4, `Expected at least 4 toll plazas on Dutra, got ${route.tollPlazasCount}`);
    assert.ok(route.tollTotalBRL > 40, `Expected total toll > R$ 40, got ${route.tollTotalBRL}`);
    assert.ok(route.fuelTotalBRL > 100, `Expected fuel total > R$ 100, got ${route.fuelTotalBRL}`);
    assert.strictEqual(route.totalTripCostBRL, Number((route.tollTotalBRL + route.fuelTotalBRL).toFixed(2)));
    assert.ok(route.rotograma.length >= 3, 'Expected rotograma steps');
  });

  it('multiplies toll fees proportionally for heavier vehicles (truck 3 axles vs car)', () => {
    const carRoute = calculateRoadTripRoute({
      origin: spOrigin,
      destination: rjDestination,
      vehicleCategoryId: 'car'
    });

    const truckRoute = calculateRoadTripRoute({
      origin: spOrigin,
      destination: rjDestination,
      vehicleCategoryId: 'truck_3axles'
    });

    // 3-axle truck toll is approximately 3x of passenger car
    assert.ok(
      truckRoute.tollTotalBRL > carRoute.tollTotalBRL * 2.5,
      `Expected truck toll (${truckRoute.tollTotalBRL}) to be ~3x of car toll (${carRoute.tollTotalBRL})`
    );
  });

  it('charges lower motorcycle toll rates (1 eixo)', () => {
    const carRoute = calculateRoadTripRoute({
      origin: spOrigin,
      destination: rjDestination,
      vehicleCategoryId: 'car'
    });

    const motoRoute = calculateRoadTripRoute({
      origin: spOrigin,
      destination: rjDestination,
      vehicleCategoryId: 'motorcycle'
    });

    // Motorcycle toll is exactly half (50%) of passenger car rate
    assert.ok(
      motoRoute.tollTotalBRL < carRoute.tollTotalBRL,
      `Expected motorcycle toll (${motoRoute.tollTotalBRL}) to be lower than car (${carRoute.tollTotalBRL})`
    );
  });

  it('generates a formatted shareable driver itinerary text', () => {
    const route = calculateRoadTripRoute({
      origin: spOrigin,
      destination: rjDestination,
      vehicleCategoryId: 'car'
    });

    const shareText = generateDriverShareText(route);
    assert.ok(shareText.includes('PLANEJAMENTO DE VIAGEM'), 'Contains header');
    assert.ok(shareText.includes('São Paulo, SP'), 'Contains origin');
    assert.ok(shareText.includes('Rio de Janeiro, RJ'), 'Contains destination');
    assert.ok(shareText.includes('CUSTO TOTAL'), 'Contains total cost');
    assert.strictEqual(shareText.includes('QualP'), false, 'Should not contain QualP');
  });

  it('detects PRF police stations along highway corridor', () => {
    const route = calculateRoadTripRoute({
      origin: spOrigin,
      destination: rjDestination,
      vehicleCategoryId: 'car'
    });

    assert.ok(route.prfStations.length > 0, 'Should find PRF stations on Dutra');
    const hasArujaPrf = route.prfStations.some(p => p.name.includes('Arujá'));
    assert.ok(hasArujaPrf, 'Should include Posto PRF Arujá');
  });
});

import { parseCoordinatesInput, searchPlacesAndPoi } from '../data/placesAndPoiData';

describe('Smart Location Search: Coordinates, CEP, Landmarks & Cities', () => {
  it('parses valid geographic coordinates (lat, lng)', () => {
    const coords1 = parseCoordinatesInput('-23.5505, -46.6333');
    assert.ok(coords1 !== null);
    assert.strictEqual(coords1?.lat, -23.5505);
    assert.strictEqual(coords1?.lng, -46.6333);

    const coords2 = parseCoordinatesInput('-8.0476 -34.8770');
    assert.ok(coords2 !== null);
    assert.strictEqual(coords2?.lat, -8.0476);
    assert.strictEqual(coords2?.lng, -34.8770);
  });

  it('rejects invalid coordinates', () => {
    assert.strictEqual(parseCoordinatesInput('not a coordinate'), null);
    assert.strictEqual(parseCoordinatesInput('-95.0, 200.0'), null);
  });

  it('finds CEP with address and coordinates', () => {
    const results = searchPlacesAndPoi('01310-100');
    assert.ok(results.length > 0);
    assert.strictEqual(results[0].category, 'cep');
    assert.ok(results[0].name.includes('01310-100'));
    assert.ok(results[0].subtitle.includes('Paulista'));
  });

  it('finds famous landmarks such as Rodoviaria Tiete', () => {
    const results = searchPlacesAndPoi('Rodoviaria tiete');
    assert.ok(results.length > 0);
    assert.ok(results.some(r => r.name.includes('Tietê')));
  });

  it('finds cities such as Recife and Natal', () => {
    const recifeResults = searchPlacesAndPoi('recife');
    assert.ok(recifeResults.length > 0);
    assert.ok(recifeResults.some(r => r.name.toLowerCase().includes('recife')));

    const natalResults = searchPlacesAndPoi('Natal');
    assert.ok(natalResults.length > 0);
    assert.ok(natalResults.some(r => r.name.toLowerCase().includes('natal')));
  });

  it('identifies small municipalities such as Urupes, Cunha, Brotas, and Paraty', () => {
    const urupesResults = searchPlacesAndPoi('Urupes');
    assert.ok(urupesResults.length > 0, 'Should find Urupês');
    assert.ok(urupesResults.some(r => r.name.includes('Urupês')));

    const cunhaResults = searchPlacesAndPoi('Cunha');
    assert.ok(cunhaResults.length > 0, 'Should find Cunha');
    assert.ok(cunhaResults.some(r => r.name.includes('Cunha')));

    const brotasResults = searchPlacesAndPoi('Brotas');
    assert.ok(brotasResults.length > 0, 'Should find Brotas');
    assert.ok(brotasResults.some(r => r.name.includes('Brotas')));

    const paratyResults = searchPlacesAndPoi('Paraty');
    assert.ok(paratyResults.length > 0, 'Should find Paraty');
    assert.ok(paratyResults.some(r => r.name.includes('Paraty')));
  });

  it('identifies prefeituras and paços municipais', () => {
    const prefSP = searchPlacesAndPoi('Prefeitura de Sao Paulo');
    assert.ok(prefSP.length > 0, 'Should find Prefeitura de São Paulo');
    assert.ok(prefSP.some(r => r.category === 'prefeitura'));

    const prefCuritiba = searchPlacesAndPoi('Prefeitura Curitiba');
    assert.ok(prefCuritiba.length > 0, 'Should find Prefeitura de Curitiba');
    assert.ok(prefCuritiba.some(r => r.category === 'prefeitura'));

    const prefUrupes = searchPlacesAndPoi('Prefeitura Urupes');
    assert.ok(prefUrupes.length > 0, 'Should find Prefeitura de Urupês');
    assert.ok(prefUrupes.some(r => r.name.includes('Urupês')));
  });

  it('identifies shopping centers across Brazil', () => {
    const morumbi = searchPlacesAndPoi('Morumbi Shopping');
    assert.ok(morumbi.length > 0, 'Should find Morumbi Shopping');
    assert.ok(morumbi.some(r => r.category === 'shopping'));

    const barra = searchPlacesAndPoi('BarraShopping');
    assert.ok(barra.length > 0, 'Should find BarraShopping');
    assert.ok(barra.some(r => r.name.includes('BarraShopping')));

    const recifeShop = searchPlacesAndPoi('Shopping Recife');
    assert.ok(recifeShop.length > 0, 'Should find Shopping Recife');
    assert.ok(recifeShop.some(r => r.category === 'shopping'));

    const midway = searchPlacesAndPoi('Midway Mall');
    assert.ok(midway.length > 0, 'Should find Shopping Midway Mall');
    assert.ok(midway.some(r => r.category === 'shopping'));
  });

  it('provides reactive suggestion down to the last letter typed', () => {
    const pResults = searchPlacesAndPoi('p');
    assert.ok(pResults.length > 0, 'Should return results for single letter p');

    const shResults = searchPlacesAndPoi('sh');
    assert.ok(shResults.length > 0, 'Should return results for sh');
    assert.ok(shResults.some(r => r.category === 'shopping'), 'Should include shoppings for sh');

    const prefResults = searchPlacesAndPoi('pref');
    assert.ok(prefResults.length > 0, 'Should return results for pref');
    assert.ok(prefResults.some(r => r.category === 'prefeitura'), 'Should include prefeituras for pref');

    const uruResults = searchPlacesAndPoi('uru');
    assert.ok(uruResults.length > 0, 'Should return Urupês for uru prefix');
    assert.ok(uruResults.some(r => r.name.includes('Urupês')));
  });
});

