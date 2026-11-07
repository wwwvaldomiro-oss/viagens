import { useState } from 'react';
import { Copy, Check, Code, Layers, Sparkles, Box, ShieldCheck, Terminal } from 'lucide-react';

export function IntegrationDocs() {
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleSnippet = `// 1. Instalação / Importação no seu projeto
import { ViagensModule } from './viagens-module/ViagensModule';
import type { Ticket } from './viagens-module/types';

export function MeuAplicativo() {
  const handleBooking = (ticket: Ticket, bookingDetails: any) => {
    console.log('Passagem selecionada:', ticket);
    console.log('Detalhes da reserva:', bookingDetails);
    // Ex: debita saldo da carteira ou abre checkout próprio
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <ViagensModule
        defaultTransport="all" // 'all' | 'flight' | 'bus'
        onBookTicket={handleBooking}
        hostAppInfo={{
          appName: 'Meu Banco / SuperApp',
          userName: 'Carlos Silva',
          userBalance: 4850.00
        }}
      />
    </div>
  );
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* Overview header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
          <Box className="w-4 h-4 text-sky-600" />
          <span>Arquitetura Plug & Play do Módulo VIAGENS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Como Integrar o Módulo "VIAGENS" no seu Aplicativo
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          O módulo <b>VIAGENS</b> foi desenvolvido para ser entregue em outro aplicativo de forma desacoplada e modular. Ele funciona como uma tela completa, uma aba em um SuperApp corporativo/bancário ou via WebView responsiva.
        </p>
      </div>

      {/* Code Snippet Box */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Exemplo de Código: Incorporando no seu App React / Next.js</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copiado!' : 'Copiar Código'}</span>
          </button>
        </div>
        <div className="p-5 overflow-x-auto text-xs font-mono text-emerald-400 leading-relaxed bg-slate-950/60">
          <pre>{sampleSnippet}</pre>
        </div>
      </div>

      {/* Props Specification Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600" />
          <span>Tabela de Propriedades (Props do Componente)</span>
        </h3>

        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Propriedade</th>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5">Padrão</th>
                <th className="p-3.5">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="p-3.5 font-mono text-sky-700 font-semibold">defaultTransport</td>
                <td className="p-3.5 font-mono text-slate-500">'all' | 'flight' | 'bus'</td>
                <td className="p-3.5 font-mono">'all'</td>
                <td className="p-3.5">Define o modal inicial pré-selecionado (voos, ônibus ou ambos).</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-sky-700 font-semibold">initialOrigin</td>
                <td className="p-3.5 font-mono text-slate-500">Location</td>
                <td className="p-3.5 font-mono">São Paulo (SAO)</td>
                <td className="p-3.5">Origem pré-definida ao abrir o módulo (ex: detectado por GPS).</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-sky-700 font-semibold">initialDestination</td>
                <td className="p-3.5 font-mono text-slate-500">Location</td>
                <td className="p-3.5 font-mono">Rio de Janeiro (RIO)</td>
                <td className="p-3.5">Destino padrão ou rota promovida.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-sky-700 font-semibold">onBookTicket</td>
                <td className="p-3.5 font-mono text-slate-500">(ticket, details) =&gt; void</td>
                <td className="p-3.5 font-mono">undefined</td>
                <td className="p-3.5">Callback acionado quando o usuário conclui uma reserva no módulo.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-sky-700 font-semibold">hostAppInfo</td>
                <td className="p-3.5 font-mono text-slate-500">&#123; appName, userBalance, userName &#125;</td>
                <td className="p-3.5 font-mono">undefined</td>
                <td className="p-3.5">Permite ao módulo debitar do saldo da carteira do aplicativo pai.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-sky-700 font-semibold">embedMode</td>
                <td className="p-3.5 font-mono text-slate-500">'full' | 'compact' | 'widget'</td>
                <td className="p-3.5 font-mono">'full'</td>
                <td className="p-3.5">Layout responsivo para telas dedicadas ou caixas em dashboards.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Roadmap & Next Releases */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Próximas Atualizações do Módulo VIAGENS (Roadmap)</span>
        </h3>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li><b>Fase 1 (Atual):</b> Busca, comparação de voos e ônibus estilo Skyscanner, matriz de dias mais baratos, filtros avançados e emissão com mapa de assentos.</li>
          <li><b>Fase 2 (Próxima):</b> Integração de reservas de Hotéis e Hospedagens econômicas.</li>
          <li><b>Fase 3:</b> Aluguel de Carros e Transfer rodoviário direto aeroporto ➔ hotel.</li>
          <li><b>Fase 4:</b> Programa de milhas e pontos integrável com o programa de fidelidade do aplicativo pai.</li>
        </ul>
      </div>
    </div>
  );
}
