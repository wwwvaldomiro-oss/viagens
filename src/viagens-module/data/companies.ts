import { Company } from '../types';

export const AIRLINES: Company[] = [
  {
    id: 'latam',
    name: 'LATAM Airlines',
    type: 'flight',
    logoText: 'LATAM',
    code: 'LA',
    rating: 4.6,
    color: 'from-indigo-900 to-red-600'
  },
  {
    id: 'gol',
    name: 'GOL Linhas Aéreas',
    type: 'flight',
    logoText: 'GOL',
    code: 'G3',
    rating: 4.4,
    color: 'from-orange-500 to-amber-600'
  },
  {
    id: 'azul',
    name: 'Azul Linhas Aéreas',
    type: 'flight',
    logoText: 'AZUL',
    code: 'AD',
    rating: 4.8,
    color: 'from-sky-700 to-blue-900'
  },
  {
    id: 'voepass',
    name: 'Voepass Linhas Aéreas',
    type: 'flight',
    logoText: 'VOEPASS',
    code: '2Z',
    rating: 4.1,
    color: 'from-emerald-700 to-teal-800'
  },
  {
    id: 'tap',
    name: 'TAP Air Portugal',
    type: 'flight',
    logoText: 'TAP',
    code: 'TP',
    rating: 4.7,
    color: 'from-emerald-800 to-red-700'
  },
  {
    id: 'american',
    name: 'American Airlines',
    type: 'flight',
    logoText: 'AA',
    code: 'AA',
    rating: 4.5,
    color: 'from-blue-700 to-red-600'
  },
  {
    id: 'airfrance',
    name: 'Air France',
    type: 'flight',
    logoText: 'AF',
    code: 'AF',
    rating: 4.8,
    color: 'from-blue-900 to-sky-600'
  },
  {
    id: 'iberia',
    name: 'Iberia Líneas Aéreas',
    type: 'flight',
    logoText: 'IBERIA',
    code: 'IB',
    rating: 4.5,
    color: 'from-red-700 to-amber-600'
  },
  {
    id: 'united',
    name: 'United Airlines',
    type: 'flight',
    logoText: 'UNITED',
    code: 'UA',
    rating: 4.4,
    color: 'from-blue-950 to-blue-700'
  },
  {
    id: 'british',
    name: 'British Airways',
    type: 'flight',
    logoText: 'BA',
    code: 'BA',
    rating: 4.7,
    color: 'from-blue-800 to-red-700'
  },
  {
    id: 'emirates',
    name: 'Emirates Airline',
    type: 'flight',
    logoText: 'EK',
    code: 'EK',
    rating: 4.9,
    color: 'from-red-800 to-amber-600'
  },
  {
    id: 'aerolineas',
    name: 'Aerolíneas Argentinas',
    type: 'flight',
    logoText: 'AR',
    code: 'AR',
    rating: 4.3,
    color: 'from-sky-600 to-sky-400'
  }
];

export const BUS_COMPANIES: Company[] = [
  {
    id: 'cometa',
    name: 'Viação Cometa',
    type: 'bus',
    logoText: 'COMETA',
    code: 'VCM',
    rating: 4.7,
    color: 'from-blue-700 to-sky-600'
  },
  {
    id: '1001',
    name: 'Auto Viação 1001',
    type: 'bus',
    logoText: '1001',
    code: 'V1001',
    rating: 4.6,
    color: 'from-red-700 to-red-500'
  },
  {
    id: 'buser',
    name: 'Buser Express',
    type: 'bus',
    logoText: 'BUSER',
    code: 'BSR',
    rating: 4.5,
    color: 'from-pink-600 to-rose-500'
  },
  {
    id: 'catarinense',
    name: 'Viação Catarinense',
    type: 'bus',
    logoText: 'CATARINENSE',
    code: 'VCT',
    rating: 4.8,
    color: 'from-emerald-800 to-teal-700'
  },
  {
    id: 'aguia-branca',
    name: 'Viação Águia Branca',
    type: 'bus',
    logoText: 'ÁGUIA BRANCA',
    code: 'VAB',
    rating: 4.7,
    color: 'from-blue-900 to-slate-800'
  },
  {
    id: 'gontijo',
    name: 'Empresa Gontijo de Transportes',
    type: 'bus',
    logoText: 'GONTIJO',
    code: 'GON',
    rating: 4.4,
    color: 'from-yellow-600 to-amber-700'
  },
  {
    id: 'guanabara',
    name: 'Expresso Guanabara',
    type: 'bus',
    logoText: 'GUANABARA',
    code: 'GNB',
    rating: 4.5,
    color: 'from-blue-600 to-indigo-700'
  }
];

export const ALL_COMPANIES: Company[] = [...AIRLINES, ...BUS_COMPANIES];
