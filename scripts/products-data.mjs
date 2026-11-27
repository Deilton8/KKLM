// Página de Dispensadores de água (a única página de produto; os restantes produtos estão na loja).
const R = (pt, en) => ({ pt, en });
const GEN = R('Envie-nos o seu pedido: analisamos os requisitos, identificamos a solução e apresentamos a proposta comercial.',
  'Send us your request: we analyse the requirements, identify the solution and present the commercial proposal.');
export const UI = {
  home: R('Início', 'Home'), about: R('Sobre o produto', 'About the product'), glance: R('Em resumo', 'At a glance'),
  shop: R('Ver a loja', 'Visit the shop'), inStore: R('Disponível na loja', 'Available in the shop'), askQuote: R('Pedir cotação', 'Request a quote'),
  viewStore: R('Ver na loja', 'View in the shop'), video: R('Vídeo', 'Video'), play: R('Reproduzir vídeo', 'Play video'),
  suffix: R('KKLM Enterprise LDA', 'KKLM Enterprise LDA')
};

export const PRODUCTS = [
  {
    id: 'dispensadores', tag: R('Distribuição', 'Distribution'), name: R('Dispensadores de água', 'Water dispensers'),
    img: '20-6fe08d.jpg', w: 800, h: 602, ar: '4/3', alt: R('Dispensadores de água', 'Water dispensers'),
    lead: R('Fornecimento e distribuição de dispensadores de água, incluindo ações de distribuição no terreno.',
      'Supply and distribution of water dispensers, including distribution activities in the field.'),
    desc: [R('A KKLM fornece e distribui dispensadores de água, incluindo ações de distribuição no terreno.', 'KKLM supplies and distributes water dispensers, including distribution activities in the field.'),
      R('As condições e as quantidades são definidas em proposta comercial.', 'Terms and quantities are defined in a commercial proposal.'), GEN],
    feats: [R('Fornecimento e distribuição de dispensadores de água', 'Supply and distribution of water dispensers'),
      R('Ações de distribuição no terreno', 'Distribution activities in the field'),
      R('Condições e quantidades definidas em proposta comercial', 'Terms and quantities defined in a commercial proposal')],
    video: { src: 'dispensadores.mp4', poster: 'dispensadores-poster.jpg', w: 848, h: 480, dur: '3:37', title: R('Dispensadores no terreno', 'Dispensers in the field'), text: R('Veja a distribuição de dispensadores de água junto das comunidades.', 'See water dispensers being distributed in communities.') },
  }
];

// Imagens dos cards de serviços (servicos.html e index.html): id do card -> imagem
export const SERVICES = [
  { id: 'procurement', img: 'svc-procurement.jpg', w: 736, h: 460, alt: R('Porto de contentores ao pôr do sol, com guindastes e contentores empilhados', 'Container port at sunset, with cranes and stacked containers') },
  { id: 'engineering', img: 'svc-engineering.jpg', w: 1100, h: 687, alt: R('Desenho técnico de uma peça mecânica, com um lápis laranja sobre a folha', 'Technical drawing of a mechanical part, with an orange pencil on the sheet') },
  { id: 'sst', img: 'svc-sst.jpg', w: 659, h: 412, alt: R('Equipamentos de proteção individual: capacetes, óculos, luvas, máscaras e coletes', 'Personal protective equipment: helmets, goggles, gloves, masks and vests') },
  { id: 'consulting', img: 'svc-consulting.jpg', w: 600, h: 375, alt: R('Equipa a analisar gráficos e relatórios de negócio numa reunião', 'Team reviewing business charts and reports in a meeting') }
];
