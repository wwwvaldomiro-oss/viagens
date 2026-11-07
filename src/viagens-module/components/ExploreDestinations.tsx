import { MapPin, Plane, Bus, ArrowRight, Sparkles } from 'lucide-react';
import { Location } from '../types';
import { POPULAR_LOCATIONS } from '../data/locations';

interface ExploreDestinationsProps {
  onSelectDestination: (dest: Location) => void;
  currentOrigin: Location;
}

export function ExploreDestinations({ onSelectDestination, currentOrigin }: ExploreDestinationsProps) {
  const destinations = [
    {
      id: 'rio-all',
      code: 'RIO',
      city: 'Rio de Janeiro',
      state: 'RJ',
      subtitle: 'Praias de Copacabana, Pão de Açúcar e Cristo Redentor',
      image: '/src/assets/images/dest_rio_de_janeiro_1793843062337.jpg',
      busStartingPrice: 89,
      flightStartingPrice: 219,
      distanceLabel: 'Ponte aérea diária ou ônibus confortável'
    },
    {
      id: 'cwb',
      code: 'CWB',
      city: 'Curitiba',
      state: 'PR',
      subtitle: 'Jardim Botânico, clima serrano e parques ecológicos',
      image: '/src/assets/images/dest_curitiba_jardim_1793843061724.jpg',
      busStartingPrice: 75,
      flightStartingPrice: 195,
      distanceLabel: 'Ótima rota para leito-cama noturno'
    },
    {
      id: 'ssa',
      code: 'SSA',
      city: 'Salvador',
      state: 'BA',
      subtitle: 'Pelourinho histórico, praias tropicais e cultura viva',
      image: '/src/assets/images/dest_salvador_bahia_1793843062450.jpg',
      busStartingPrice: 169,
      flightStartingPrice: 389,
      distanceLabel: 'Voos diretos e promoções relâmpago'
    }
  ];

  const handlePick = (code: string) => {
    const loc = POPULAR_LOCATIONS.find(l => l.code === code) || POPULAR_LOCATIONS[1];
    onSelectDestination(loc);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Explorar Qualquer Destino
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            Destinos Mais Populares e Baratos saindo de {currentOrigin.city}
          </h3>
        </div>
        <span className="text-xs text-slate-500">
          Valores promocionais encontrados hoje
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            {/* Image banner with overlay */}
            <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src={dest.image}
                alt={dest.city}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-extrabold text-white">{dest.city}</h4>
                  <span className="text-xs font-mono-numbers bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded font-bold">
                    {dest.code}
                  </span>
                </div>
                <p className="text-xs text-slate-200 line-clamp-1 mt-0.5">{dest.subtitle}</p>
              </div>
            </div>

            {/* Price pills & CTA */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Bus option */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1 text-[11px] text-blue-700 font-semibold mb-0.5">
                    <Bus className="w-3 h-3" />
                    <span>Ônibus a partir</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 font-mono-numbers">
                    R$ {dest.busStartingPrice}
                  </span>
                </div>

                {/* Flight option */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1 text-[11px] text-sky-700 font-semibold mb-0.5">
                    <Plane className="w-3 h-3" />
                    <span>Voo a partir</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 font-mono-numbers">
                    R$ {dest.flightStartingPrice}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handlePick(dest.code)}
                className="w-full py-2 px-3 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Ver Passagens para {dest.city}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
