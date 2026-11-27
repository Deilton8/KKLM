// Loja de EPI: gera loja/index.html, loja/c/<categoria>.html, loja/p/<produto>.html, o índice de pesquisa e as entradas do sitemap.
// Dados: data/loja/products.json (extraídos dos catálogos) e data/loja/config.json (WhatsApp/e-mail).
// Corre depois de build-pages (usa sobre-nos.html já processado como esqueleto) e antes de build-en.
import fs from 'node:fs';
import path from 'node:path';
import { SITE } from './site-config.mjs';

const read = f => fs.readFileSync(f, 'utf8');
const write = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const slug = s => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
fs.rmSync('loja', { recursive: true, force: true });   // páginas antigas não ficam para trás
const CFG = JSON.parse(read('data/loja/config.json'));
const P = JSON.parse(read('data/loja/products.json'));
const IMG = f => `assets/loja/img/${f}`;

// ---------- categorias ----------
const CAT_INFO = {
  'proteccao-ocular': ['Protecção ocular', 'Óculos de protecção de lente única e dupla, para soldadura e uso geral.'],
  'proteccao-auditiva': ['Protecção auditiva', 'Tampões e abafadores para ambientes com ruído.'],
  'vestuario-repelente-a-insectos': ['Vestuário repelente a insectos', 'Vestuário de trabalho com protecção contra insectos.'],
  'vestuario-de-alta-visibilidade': ['Vestuário de alta visibilidade', 'Coletes, camisas e vestuário reflector para ser visto em qualquer condição.'],
  'vestuario-de-proteccao': ['Vestuário de protecção', 'Fatos, calças, casacos e vestuário de trabalho e de protecção.'],
  'proteccao-geral': ['Protecção geral', 'Capacetes, viseiras, bonés de protecção e acessórios.'],
  'seguranca-de-alturas': ['Segurança de alturas', 'Arneses, linhas de vida e equipamento para trabalho em altura.'],
  'vestuario-impermeavel': ['Vestuário impermeável', 'Capas e casacos impermeáveis para trabalho com chuva.'],
  'luvas-de-proteccao': ['Luvas de protecção', 'Luvas de PVC, nitrilo, couro e outras, para protecção mecânica e química.'],
  'proteccao-respiratoria': ['Protecção respiratória', 'Máscaras, respiradores, filtros e acessórios.'],
  'calcado-de-seguranca': ['Calçado de segurança', 'Botas e sapatos de segurança.'],
  'controle-de-derrame': ['Controle de derrame', 'Kits e absorventes para controlo de derrames.'],
  'sinalizacao': ['Sinalização', 'Sinais simbólicos, cones, barreiras e sinalização rodoviária.'],
  'bafometros-e-seguranca': ['Bafómetros e segurança', 'Bafómetros e equipamento de segurança.']
};
const CATS = Object.entries(CAT_INFO).map(([s, [name, desc]]) => ({ slug: s, name, desc, items: P.filter(p => p.cat_slug === s) }));
for (const c of CATS) c.img = (c.items.find(p => p.images[0] && p.images.length > 1) || c.items.find(p => p.images[0]) || {}).images?.[0];
const catOf = p => CATS.find(c => c.slug === p.cat_slug);

// ---------- esqueleto (produtos.html processado) ----------
const sk = read('sobre-nos.html');
const prefix = (h, depth) => {
  const pre = '../'.repeat(depth);
  return h.replace(/\b(href|src|poster|action)="(?!https?:|mailto:|tel:|#|data:|javascript:|\/)(?=[^"])([^"]*)"/g, (m, a, v) => `${a}="${pre}${v}"`)
    .replace(/url\((['"]?)assets\//g, `url($1${pre}assets/`);
};
const CART_BTN = '<button type="button" class="lj-cartbtn" data-cart-open aria-label="Lista de cotação"><i class="fa-solid fa-bag-shopping"></i><span data-cart-count hidden>0</span></button>';
const shell = ({ file, depth, title, desc, canon, main, ld = '', image }) => {
  const og = image || 'assets/img/og-kklm.jpg';
  let h = sk
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description"\s+content=")[^"]*(")/, (_, a, b) => a + esc(desc) + b)
    .replace(/(<meta property="og:title"\s+content=")[^"]*(")/, (_, a, b) => a + esc(title) + b)
    .replace(/(<meta property="og:description"\s+content=")[^"]*(")/, (_, a, b) => a + esc(desc) + b)
    .replace(/<!--@seo-->[\s\S]*?<!--\/@seo-->/, () => `<!--@seo--><link rel="canonical" href="${SITE}${canon}"><meta property="og:url" content="${SITE}${canon}"><meta property="og:image" content="${SITE}/${og}"><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image"><!--/@seo-->`)
    .replace('</head>', () => `<link rel="stylesheet" href="assets/css/loja.css">${ld}</head>`)
    .replace(/ class="nav-l on" aria-current="page"/g, ' class="nav-l"')
    .replace(/(href="loja\/index\.html" class="nav-l)(")/, (_, a, b) => `${a} on" aria-current="page${b}`)
    .replace('<button id="menuBtn"', () => CART_BTN + '<button id="menuBtn"')
    .replace(/<script src="assets\/js\/hero-carousel\.js" defer><\/script>\r?\n?/, '')
    .replace(/<html /, () => `<html data-base="${'../'.repeat(depth)}" `)
    .replace(/<main[\s\S]*<\/main>/, () => `<main class="lj">${main}</main>`)
    .replace('</body>', () => `<script>window.LOJA=${JSON.stringify({ wa: CFG.whatsapp, mail: CFG.email, empresa: CFG.empresa })}</script><script src="assets/js/loja.js" defer></script>\n</body>`);
  write(file, prefix(h, depth));
};

// ---------- peças de HTML ----------
const crumb = items => `<nav class="crumb" aria-label="Migalhas">${items.map(([t, h], i) => (i ? '<span>/</span>' : '') + (h ? `<a href="${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`)).join('')}</nav>`;
const searchForm = `<form class="lj-search" role="search" action="loja/index.html" method="get"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input type="search" name="q" placeholder="Pesquisar por produto, código ou marca" autocomplete="off" aria-label="Pesquisar na loja"><div class="lj-sugg" hidden></div></form>`;
const url = p => `loja/p/${p.slug}.html`;
const short = c => c.split(/\s+-\s+/)[0].replace(/^[^:]+:\s*/, '');
const codesLine = p => { const c = p.codes.map(short); return c.length ? esc(c.slice(0, 2).join(' · ')) + (c.length > 2 ? ` <i>+${c.length - 2}</i>` : '') : ''; };
const multi = p => p.variants.length > 1;
const searchText = p => norm([p.name, p.brand || '', p.cat, p.codes.join(' '), p.bullets.slice(0, 4).join(' '), p.std.join(' ')].join(' '));
const card = p => {
  const plate = p.images[0]
    ? `<img src="${IMG(p.images[0])}" alt="${esc(p.name)}" loading="lazy" decoding="async" width="360" height="360">${p.images[1] ? `<img class="lj-card__alt" src="${IMG(p.images[1])}" alt="" loading="lazy" decoding="async" width="360" height="360">` : ''}`
    : '<span class="lj-ph"><i class="fa-regular fa-image"></i></span>';
  const add = multi(p) || p.kind !== 'product' && p.variants.length > 1
    ? `<a class="lj-card__add" href="${url(p)}" aria-label="Escolher opções: ${esc(p.name)}"><i class="fa-solid fa-arrow-right"></i></a>`
    : `<button type="button" class="lj-card__add" data-add="${p.id}" aria-label="Adicionar à lista de cotação: ${esc(p.name)}"><i class="fa-solid fa-plus"></i></button>`;
  return `<article class="lj-card" data-id="${p.id}" data-title="${esc(p.name)}" data-slug="${p.slug}" data-img="${p.images[0] || ''}" data-v="${esc(p.variants.length === 1 ? p.variants[0].code : '')}" data-cat="${p.cat_slug}" data-brand="${esc(p.brand || '')}" data-std="${esc(p.std.join('|'))}" data-name="${norm(p.name)}" data-s="${esc(searchText(p))}"><div class="lj-card__img"><a href="${url(p)}" tabindex="-1" aria-hidden="true">${plate}</a>${add}</div>
<div class="lj-card__body">${p.brand ? `<span class="lj-card__brand">${esc(p.brand)}</span>` : ''}<h3><a href="${url(p)}">${esc(p.name)}</a></h3>${codesLine(p) ? `<p class="lj-card__code">${codesLine(p)}</p>` : ''}</div></article>`;
};
const facets = items => {
  const cnt = (arr) => Object.entries(arr.reduce((m, k) => (k && (m[k] = (m[k] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return { brands: cnt(items.map(p => p.brand)), stds: cnt(items.flatMap(p => p.std)).filter(([, n]) => n >= 2).slice(0, 10) };
};
const filterBox = (items, cats, activeCat) => {
  const f = facets(items);
  return `<aside class="lj-filters" id="ljFilters" aria-label="Filtros"><div class="lj-filters__head"><b>Filtros</b><button type="button" class="lj-x" data-filters-close aria-label="Fechar filtros"><i class="fa-solid fa-xmark"></i></button></div>
<div class="lj-fg"><h4>Categorias</h4><ul class="lj-catlist"><li><a href="loja/index.html"${activeCat ? '' : ' class="is-on"'}>Todos os produtos<span>${P.length}</span></a></li>${cats.map(c => `<li><a href="loja/c/${c.slug}.html"${activeCat === c.slug ? ' class="is-on"' : ''}>${esc(c.name)}<span>${c.items.length}</span></a></li>`).join('')}</ul></div>
${f.brands.length ? `<div class="lj-fg"><h4>Marca</h4>${f.brands.map(([b, n]) => `<label class="lj-chk"><input type="checkbox" data-f="brand" value="${esc(b)}"><span>${esc(b)}</span><em>${n}</em></label>`).join('')}</div>` : ''}
${f.stds.length ? `<div class="lj-fg"><h4>Norma</h4>${f.stds.map(([b, n]) => `<label class="lj-chk"><input type="checkbox" data-f="std" value="${esc(b)}"><span>${esc(b)}</span><em>${n}</em></label>`).join('')}</div>` : ''}
<button type="button" class="lj-btn lj-btn--ghost lj-clear" data-clear hidden>Limpar filtros</button></aside>`;
};
const listing = (items, cats, activeCat) => `<div class="lj-layout">${filterBox(items, cats, activeCat)}<div class="lj-results">
<div class="lj-bar"><span class="lj-count" aria-live="polite">${items.length} produtos</span><div class="lj-ctl"><button type="button" class="lj-fbtn" data-filters-open><i class="fa-solid fa-sliders"></i> Filtros</button><label class="lj-sortl">Ordenar<select class="lj-sort"><option value="cat">Catálogo</option><option value="az">Nome (A–Z)</option><option value="za">Nome (Z–A)</option></select></label></div></div>
<div class="lj-grid" data-page="24">${items.map(card).join('\n')}</div>
<p class="lj-empty" hidden>Não encontrámos produtos com estes critérios. Tente outra pesquisa ou <a href="contactos.html#contact">fale com a nossa equipa</a>.</p>
<button type="button" class="lj-btn lj-btn--ghost lj-more" hidden>Mostrar mais</button></div></div><div class="lj-scrim" data-filters-close hidden></div>`;

// ---------- páginas ----------
const catTiles = `<section class="lj-tiles" aria-labelledby="ljCt"><div class="lj-sec__h"><h2 id="ljCt">Explorar por categoria</h2></div><div class="lj-tiles__grid">${CATS.map(c => `<a class="lj-tile" href="loja/c/${c.slug}.html"><span class="lj-tile__img">${c.img ? `<img src="${IMG(c.img)}" alt="" loading="lazy" decoding="async" width="240" height="240">` : ''}</span><span class="lj-tile__t"><b>${esc(c.name)}</b><em>${c.items.length} produtos</em></span></a>`).join('')}</div></section>`;
const head = (cr, h1, lead) => `<section class="lj-head">${crumb(cr)}<div class="lj-head__row"><div><h1>${esc(h1)}</h1><p>${esc(lead)}</p></div>${searchForm}</div></section>`;
const itemList = (items) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: items.slice(0, 40).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/loja/p/${p.slug}`, name: p.name })) })}</script>`;

// loja/index.html
shell({ file: 'loja/index.html', depth: 1, title: 'Loja de EPI e segurança | KKLM Enterprise LDA', canon: '/loja/', ld: itemList(P),
  desc: `Loja de equipamentos de protecção individual: ${P.length} produtos em ${CATS.length} categorias. Peça cotação diretamente pelo WhatsApp ou por e-mail.`,
  main: head([['Início', 'index.html'], ['Loja', null]], 'Loja de EPI e segurança', `${P.length} produtos em ${CATS.length} categorias. Monte a sua lista e peça cotação em poucos cliques.`) + catTiles + `<section class="lj-all" id="produtos" aria-labelledby="ljAll"><div class="lj-sec__h"><h2 id="ljAll">Todos os produtos</h2></div>${listing(P, CATS, null)}</section>` });
// loja/c/<categoria>.html
for (const c of CATS) {
  shell({ file: `loja/c/${c.slug}.html`, depth: 2, title: `${c.name} | Loja | KKLM Enterprise LDA`, canon: `/loja/c/${c.slug}`, desc: `${c.desc} ${c.items.length} produtos. Peça cotação diretamente.`, ld: itemList(c.items), image: c.img ? IMG(c.img) : undefined,
    main: head([['Início', 'index.html'], ['Loja', 'loja/index.html'], [c.name, null]], c.name, c.desc) + `<section class="lj-all" aria-label="Produtos">${listing(c.items, CATS, c.slug)}</section>` });
}

// loja/p/<produto>.html
const li = arr => arr.map(x => `<li>${esc(x)}</li>`).join('');
const related = p => {
  const same = P.filter(q => q.cat_slug === p.cat_slug && q.id !== p.id && q.images[0]);
  const i = same.findIndex(q => q.page >= p.page) ; const start = Math.max(0, Math.min(same.length - 4, i < 0 ? 0 : i));
  return same.slice(start, start + 4);
};
const SIZES_SIGN = ['150x150 mm', '190x190 mm', '290x290 mm', '440x440 mm'];
for (const p of P) {
  const c = catOf(p), imgs = p.images;
  const gallery = imgs.length
    ? `<div class="lj-gal"><div class="lj-gal__main"><img id="ljMain" src="${IMG(imgs[0])}" alt="${esc(p.name)}" width="720" height="720"></div>${imgs.length > 1 ? `<div class="lj-gal__thumbs">${imgs.map((f, i) => `<button type="button" class="${i ? '' : 'is-on'}" data-src="${IMG(f)}" aria-label="Imagem ${i + 1}"><img src="${IMG(f)}" alt="" loading="lazy" width="96" height="96"></button>`).join('')}</div>` : ''}</div>`
    : `<div class="lj-gal"><div class="lj-gal__main"><span class="lj-ph"><i class="fa-regular fa-image"></i></span></div></div>`;
  const isGrid = p.kind === 'signs' || (p.kind === 'variants' && p.variants.some(v => v.img));
  let buy = '';
  if (isGrid) {
    buy = `${p.kind === 'signs' ? `<label class="lj-field"><span>Tamanho</span><select class="lj-size">${SIZES_SIGN.map(s => `<option>${s}</option>`).join('')}</select></label>` : ''}
<div class="lj-vgrid" role="list">${p.variants.map(v => `<div class="lj-vcell" role="listitem">${v.img ? `<img src="${IMG(v.img)}" alt="" loading="lazy" width="120" height="120">` : '<span class="lj-ph"></span>'}<b>${esc(v.code)}</b>${v.name ? `<span>${esc(v.name)}</span>` : ''}<button type="button" class="lj-vadd" data-add-v="${esc(v.code)}" aria-label="Adicionar ${esc(v.code)}"><i class="fa-solid fa-plus"></i></button></div>`).join('')}</div>`;
  } else {
    const vs = p.variants.map(v => v.code);
    buy = `${vs.length > 1 ? `<div class="lj-field"><span>Código</span><div class="lj-var" role="radiogroup" aria-label="Código">${vs.map((v, i) => `<button type="button" role="radio" aria-checked="${i ? 'false' : 'true'}" class="${i ? '' : 'is-on'}" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>` : ''}
<label class="lj-field"><span>Tamanho / observações <em>(opcional)</em></span><input type="text" class="lj-note" placeholder="${p.sizes.length ? 'Ex.: ' + esc(p.sizes[0]).slice(0, 40) : 'Ex.: tamanho, cor, quantidade por tamanho'}" maxlength="140"></label>
<div class="lj-buyrow"><div class="lj-qty"><button type="button" data-q="-1" aria-label="Menos">−</button><input type="number" class="lj-qtyi" value="1" min="1" max="9999" aria-label="Quantidade"><button type="button" data-q="1" aria-label="Mais">+</button></div><button type="button" class="lj-btn lj-btn--primary" data-add-pd>Adicionar à lista de cotação</button></div>`;
  }
  const wa = `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(`Olá ${CFG.empresa}, gostaria de pedir cotação do produto: ${p.name}${p.codes[0] ? ' (' + p.codes[0] + ')' : ''}. ${SITE}/loja/p/${p.slug}`)}`;
  const lead = p.desc || p.bullets[0] || '';
  const specs = [];
  if (p.bullets.length) specs.push(['Características', `<ul class="lj-list">${li(p.bullets)}</ul>`]);
  if (p.heads.length || (p.desc && p.bullets[0] !== p.desc)) specs.push(['Informação', `${p.desc ? `<p>${esc(p.desc)}</p>` : ''}${p.heads.length ? `<ul class="lj-list">${li(p.heads)}</ul>` : ''}`]);
  if (p.std.length || p.sizes.length) specs.push(['Normas e tamanhos', `<div class="lj-chips">${p.std.map(s => `<span>${esc(s)}</span>`).join('')}${p.sizes.map(s => `<span>${esc(s)}</span>`).join('')}</div>`]);
  if (p.codes.length > 1 && !isGrid) specs.push(['Códigos disponíveis', `<div class="lj-chips">${p.codes.map(s => `<span>${esc(s)}</span>`).join('')}</div>`]);
  const rel = related(p);
  const ld = `<script type="application/ld+json">${JSON.stringify([
    { '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.codes[0] || p.id, ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}), category: c.name, description: (lead || p.name).slice(0, 300), image: imgs.map(f => `${SITE}/${IMG(f)}`), url: `${SITE}/loja/p/${p.slug}` },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Início', ''], ['Loja', 'loja/'], [c.name, `loja/c/${c.slug}`], [p.name, `loja/p/${p.slug}`]].map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: `${SITE}/${u}` })) }])}</script>`;
  const main = `<section class="lj-head lj-head--pd">${crumb([['Início', 'index.html'], ['Loja', 'loja/index.html'], [c.name, `loja/c/${c.slug}.html`], [p.name, null]])}</section>
<section class="lj-pd" data-id="${p.id}" data-name="${esc(p.name)}" data-slug="${p.slug}" data-img="${imgs[0] || ''}" data-v="${esc(p.variants.length === 1 ? p.variants[0].code : '')}" data-kind="${p.kind}">${gallery}<div class="lj-info"><p class="lj-eyebrow">${p.brand ? `<b>${esc(p.brand)}</b> · ` : ''}<a href="loja/c/${c.slug}.html">${esc(c.name)}</a></p><h1>${esc(p.name)}</h1>${p.codes.length ? `<p class="lj-codes">${p.codes.length > 1 && !isGrid ? 'Códigos' : 'Código'}: ${esc(p.codes.slice(0, isGrid ? 3 : 6).join(' · '))}${p.codes.length > (isGrid ? 3 : 6) ? ` e mais ${p.codes.length - (isGrid ? 3 : 6)}` : ''}</p>` : ''}
${lead ? `<p class="lj-lead">${esc(lead)}</p>` : ''}
<div class="lj-buy">${buy}${p.link ? `<a class="lj-btn lj-btn--ghost" href="${p.link.href}"><i class="fa-regular fa-circle-play"></i> ${esc(p.link.label)}</a>` : ''}<a class="lj-btn lj-btn--ghost lj-wa" href="${wa}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Pedir cotação por WhatsApp</a></div>
<ul class="lj-trust"><li><i class="fa-regular fa-clock"></i> Receba a cotação por WhatsApp ou e-mail</li><li><i class="fa-solid fa-list-check"></i> Junte vários produtos na mesma lista</li></ul></div></section>
${specs.length ? `<section class="lj-spec">${specs.map(([t, h], i) => `<details${i < 2 ? ' open' : ''}><summary>${t}</summary><div>${h}</div></details>`).join('')}</section>` : ''}
${rel.length ? `<section class="lj-rel"><div class="lj-sec__h"><h2>Também pode interessar</h2><a href="loja/c/${c.slug}.html">Ver categoria <i class="fa-solid fa-arrow-right"></i></a></div><div class="lj-grid lj-grid--4">${rel.map(card).join('')}</div></section>` : ''}`;
  shell({ file: `loja/p/${p.slug}.html`, depth: 2, title: `${p.name}${p.codes[0] ? ' ' + p.codes[0] : ''} | Loja | KKLM Enterprise LDA`, canon: `/loja/p/${p.slug}`, desc: `${p.name}${p.brand ? ' ' + p.brand : ''}. ${(lead || c.desc).slice(0, 120)} Peça cotação diretamente.`.replace(/\s+/g, ' '), ld, image: imgs[0] ? IMG(imgs[0]) : undefined, main });
}


// ---------- página inicial: cartões com categorias da loja ----------
const HOME_CATS = ['proteccao-ocular', 'luvas-de-proteccao', 'calcado-de-seguranca', 'proteccao-respiratoria', 'vestuario-de-alta-visibilidade', 'seguranca-de-alturas', 'vestuario-de-proteccao'];
const CAT_EN = {
  'proteccao-ocular': ['Eye protection', 'Single and dual lens safety glasses, for welding and general use.'],
  'proteccao-auditiva': ['Hearing protection', 'Earplugs and earmuffs for noisy environments.'],
  'vestuario-repelente-a-insectos': ['Insect-repellent clothing', 'Work clothing with insect protection.'],
  'vestuario-de-alta-visibilidade': ['High-visibility clothing', 'Vests, shirts and reflective clothing to be seen in any condition.'],
  'vestuario-de-proteccao': ['Protective clothing', 'Overalls, trousers, jackets and workwear.'],
  'proteccao-geral': ['General protection', 'Helmets, visors, protective caps and accessories.'],
  'seguranca-de-alturas': ['Work at height', 'Harnesses, lifelines and equipment for work at height.'],
  'vestuario-impermeavel': ['Waterproof clothing', 'Waterproof coats and rainwear for work in the rain.'],
  'luvas-de-proteccao': ['Protective gloves', 'PVC, nitrile, leather and other gloves for mechanical and chemical protection.'],
  'proteccao-respiratoria': ['Respiratory protection', 'Masks, respirators, filters and accessories.'],
  'calcado-de-seguranca': ['Safety footwear', 'Safety boots and shoes.'],
  'controle-de-derrame': ['Spill control', 'Kits and absorbents for spill control.'],
  'sinalizacao': ['Signage', 'Symbolic signs, cones, barriers and road signage.'],
  'bafometros-e-seguranca': ['Breathalysers and safety', 'Breathalysers and safety equipment.']
};
const EN_DICT = JSON.parse(read('i18n/en.json'));
const regEn = (pt, en) => { const k = String(pt).replace(/\s+/g, ' ').trim(); if (!(k in EN_DICT)) EN_DICT[k] = en; };
const homeCard = (c, i) => {
  const n = c.items.length, cnt = `${n} ${n === 1 ? 'produto' : 'produtos'}`, [en, enDesc] = CAT_EN[c.slug];
  regEn(c.name, en); regEn(c.desc, enDesc); regEn(cnt, `${n} ${n === 1 ? 'product' : 'products'}`); regEn(`Ver categoria: ${c.name}`, `View category: ${en}`);
  return `<article class="gl-card group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
<div class="gl-top relative"><figure class="gl-plate relative overflow-hidden">${c.img ? `<img src="${IMG(c.img)}" alt="" loading="lazy" decoding="async" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500">` : ''}<span class="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-full border border-gray-100">${cnt}</span><span class="gl-n">${String(i + 1).padStart(2, '0')}</span></figure>
<span class="gl-go w-10 h-10 rounded-full bg-white border border-gray-100 shadow-md text-brand-dark group-hover:bg-brand-dark group-hover:text-white group-hover:border-brand-dark transition-all flex items-center justify-center" aria-hidden="true"><i class="fa-solid fa-arrow-right text-xs"></i></span></div>
<div class="gl-body p-6 pt-8 flex-1 flex flex-col justify-between"><div><h3 class="gl-name text-lg font-bold font-heading text-brand-dark">${esc(c.name)}</h3><p class="gl-desc">${esc(c.desc)}</p></div></div>
<a href="loja/c/${c.slug}.html" class="gl-hit" aria-label="Ver categoria: ${esc(c.name)}"></a></article>`;
};
{
  const cards = HOME_CATS.map(sl => CATS.find(c => c.slug === sl)).map(homeCard).join('');
  const ix = read('index.html').replace(/<!--@home-products-->[\s\S]*?<!--\/@home-products-->/, () => `<!--@home-products--><div class="gl-grid" data-n="${HOME_CATS.length}" style="--n:${HOME_CATS.length}">${cards}</div><!--/@home-products-->`);
  write('index.html', ix);
  write('i18n/en.json', JSON.stringify(EN_DICT, null, 1) + '\n');
}

// ---------- índice de pesquisa e sitemap ----------
write('assets/loja/index.json', JSON.stringify(P.map(p => [p.id, p.slug, p.name, catOf(p).name, p.codes.join(' '), p.images[0] || '', p.brand || '', norm([p.name, p.brand || '', p.codes.join(' '), catOf(p).name].join(' '))])));
const urls = ['/loja/', ...CATS.map(c => `/loja/c/${c.slug}`), ...P.map(p => `/loja/p/${p.slug}`)];
let sm = read('sitemap.xml');
sm = sm.replace(/\s*<!--@loja-->[\s\S]*?<!--\/@loja-->/, '');
sm = sm.replace('</urlset>', `<!--@loja-->\n${urls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}\n<!--/@loja--></urlset>`);
write('sitemap.xml', sm);
console.log(`loja: ${P.length} produtos, ${CATS.length} categorias, ${urls.length} URLs`);
