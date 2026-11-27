// Imagens extra dos carrosséis dos heróis (a 1.ª imagem é a que já está na página/produto).
// [ficheiro em assets/img, texto alternativo PT/EN]. Para mudar um carrossel, editar esta lista e correr `npm run build`.
const R = (pt, en) => ({ pt, en });
const ALT = {
  facim: R('Cumprimento institucional na FACIM 2025', 'Institutional handshake at FACIM 2025'),
  stand: R('Visitantes no stand da KKLM na FACIM 2025', 'Visitors at the KKLM stand at FACIM 2025'),
  apres: R('Apresentação durante o seminário', 'Presentation during the seminar'),
  orador: R('Orador no seminário KKLM', 'Speaker at the KKLM seminar'),
  campo: R('Equipa em trabalho de campo com equipamento de proteção', 'Team in the field with protective equipment'),
  entrega: R('Entrega de dispensadores de água à comunidade', 'Delivery of water dispensers to the community'),
  ar_livre: R('Distribuição de dispensadores de água ao ar livre', 'Outdoor distribution of water dispensers'),
  disp: R('Dispensadores de água', 'Water dispensers'),
  disp_marca: R('Dispensadores de água com o fundo da marca KKLM', 'Water dispensers with the KKLM brand backdrop'),
  disp_campo: R('Apresentação de um dispensador de água no terreno', 'Presentation of a water dispenser in the field'),
  epi: R('Equipamentos de proteção individual e coletiva', 'Personal and collective protective equipment'),
  masc: R('Máscaras respiratórias e filtros', 'Respirator masks and filters'),
  conj: R('Conjunto de equipamentos de proteção', 'Set of protective equipment'),
  sst: R('Capacetes, óculos, luvas, máscaras e coletes', 'Helmets, goggles, gloves, masks and vests'),
  porto: R('Porto de contentores ao pôr do sol', 'Container port at sunset'),
  eng: R('Desenho técnico de engenharia', 'Engineering technical drawing'),
  agua: R('Infraestrutura de água no terreno', 'Water infrastructure in the field'),
  cons: R('Equipa a analisar gráficos de negócio', 'Team reviewing business charts'),
  grupo: R('Fotografia de grupo no Montebelo Indy Maputo Hotel', 'Group photo at the Montebelo Indy Maputo Hotel')
};
export const HEROES = {
  'sobre-nos': [['04-adf9f4.jpg', ALT.facim], ['13-82330c.jpg', ALT.apres], ['12-eb6778.jpg', ALT.campo], ['29-618250.jpg', ALT.entrega]],
  servicos: [['svc-procurement.jpg', ALT.porto], ['svc-engineering.jpg', ALT.eng], ['15-a87b39.jpg', ALT.agua], ['svc-sst.jpg', ALT.sst], ['svc-consulting.jpg', ALT.cons]],
  eventos: [['04-adf9f4.jpg', ALT.facim], ['11-e05772.jpg', ALT.orador], ['26-0b7bca.jpg', ALT.ar_livre], ['06-c93e1b.jpg', ALT.grupo]],
  dispensadores: [['25-0ae0b0.jpg', ALT.disp_marca], ['26-0b7bca.jpg', ALT.ar_livre], ['29-618250.jpg', ALT.entrega], ['31-dbaa53.jpg', ALT.disp_campo]],
};
