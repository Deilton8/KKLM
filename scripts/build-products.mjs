// Página de Dispensadores de água e ligações com o resto do site. Corre antes de build-pages (npm run build).
//  - produto-dispensadores.html: descrição, vídeo e cartão que leva à loja
//  - servicos.html / index.html: imagens nos cards de serviços
//  - sobre-nos, serviços e eventos: heróis com carrossel automático
// As versões EN saem de build-en.mjs; as traduções novas são registadas em i18n/en.json a partir dos ficheiros de dados.
import fs from 'node:fs';
import { PRODUCTS, UI, SERVICES } from './products-data.mjs';
import { HEROES } from './hero-data.mjs';
const R = (pt, en) => ({ pt, en });

const read = f => fs.readFileSync(f, 'utf8'), write = (f, s) => fs.writeFileSync(f, s);
const norm = s => s.replace(/\s+/g, ' ').trim();
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const DICT = JSON.parse(read('i18n/en.json'));
const reg = (pt, en) => { DICT[norm(pt)] ??= en; };
const T = r => (reg(esc(r.pt), esc(r.en)), esc(r.pt));                    // texto visível
const A = r => (reg(r.pt, r.en), r.pt.replace(/"/g, '&quot;'));          // atributo (alt, content)
const tr = r => DICT[norm(esc(r.pt))] ?? esc(r.en);
const ICON = '<i class="fa-solid fa-arrow-right text-xs"></i>';
const btn = (cls, href, r) => { reg(esc(r.pt) + ' <i></i>', esc(r.en) + ' <i></i>'); return `<a class="${cls}" href="${href}">${esc(r.pt)} ${ICON}</a>`; };
const file = p => `produto-${p.id}`;

// Bloco entre marcadores: atualiza se existir, senão insere junto da âncora (before/after).
const marked = (h, id, block, anchor, where = 'before') => {
  const re = new RegExp(`<!--@${id}-->[\\s\\S]*?<!--/@${id}-->`), w = `<!--@${id}-->${block}<!--/@${id}-->`;
  if (re.test(h)) return h.replace(re, () => w);
  if (!anchor.test(h)) throw new Error('âncora não encontrada para ' + id);
  return h.replace(anchor, m => (where === 'before' ? w + '\n' + m : m + w));
};

// ---------- páginas de produto ----------
const skel = read('sobre-nos.html');
const mainOpen = skel.match(/<main[^>]*>/)[0];

// card de produto premium (páginas de produto e página inicial)
const gcard = ({ i, img, alt, plate, cap, photo, pill, name, desc, label, value, href, aria }) => {
  const art = img
    ? `<img src="assets/img/${img}" width="560" height="560" alt="${A(alt)}" loading="lazy" decoding="async" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500">`
    : `<span class="gl-mark">${T(plate)}</span><span class="gl-cap">${T(cap)}</span>`;
  return `<article class="gl-card group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col${photo ? ' gl-card--photo' : ''}">
<div class="gl-top relative"><figure class="gl-plate${img ? '' : ' gl-plate--type'} relative overflow-hidden">${art}${pill ? `<span class="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-full border border-gray-100">${T(pill)}</span>` : ''}<span class="gl-n">${String(i + 1).padStart(2, '0')}</span></figure>
<span class="gl-go w-10 h-10 rounded-full bg-white border border-gray-100 shadow-md text-brand-dark group-hover:bg-brand-dark group-hover:text-white group-hover:border-brand-dark transition-all flex items-center justify-center" aria-hidden="true">${ICON}</span></div>
<div class="gl-body p-6 pt-8 flex-1 flex flex-col justify-between"><div><h3 class="gl-name text-lg font-bold font-heading text-brand-dark">${T(name)}</h3>${desc ? `<p class="gl-desc">${T(desc)}</p>` : ''}</div>
<div class="gl-foot mt-6 pt-4 border-t border-gray-100"><span class="text-[11px] uppercase tracking-wider text-gray-400 font-medium block">${T(label)}</span><span class="gl-val text-brand-dark">${T(value)}</span></div></div>
<a href="${href}" class="gl-hit" aria-label="${A(aria)}"></a></article>`;
};

// ---------- heróis com carrossel automático ----------
const heroFig = (key, ar, firstImg) => {
  const extra = HEROES[key] || [];
  const rest = extra.map(([f, al]) => `<img class="hc__s" src="assets/img/${f}" alt="${A(al)}" loading="lazy" decoding="async" aria-hidden="true">`);
  return `<figure class="pg-hero__img${extra.length ? ' hc' : ''}" style="aspect-ratio:${ar}"${extra.length ? ' data-hc' : ''}>${[firstImg, ...rest].join('')}</figure>`;
};
const FIG = /<figure class="pg-hero__img[^"]*"[^>]*>[\s\S]*?<\/figure>/;
const heroPatch = (h, key) => {
  const f = h.match(FIG)[0], ar = f.match(/aspect-ratio:([^";]+)/)[1];
  const img = f.match(/<img\b[^>]*>/)[0].replace(/\sclass="[^"]*"/, '').replace('<img', '<img class="hc__s is-on"');
  return h.replace(FIG, () => heroFig(key, ar, img));
};
const withScript = (h, src) => h.includes(src) ? h : h.replace(/<\/body>/, () => `<script src="${src}" defer></script>\n</body>`);

const PILL = 'inline-flex items-center gap-2 border border-gray-300 bg-white px-5 py-2.5 rounded-full text-xs font-semibold text-brand-dark hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-all self-start shrink-0';
// cartão de vídeo premium (poster + botão de reprodução; o JS ativa os controlos ao clicar)
const vidCard = (v, cls, label) => `<figure class="vid ${cls}" data-vid>
<div class="vid__frame"><video preload="none" playsinline poster="assets/video/${v.poster}" width="${v.w}" height="${v.h}" aria-label="${A(label)}"><source src="assets/video/${v.src}" type="video/mp4"></video>
<button type="button" class="vid__play" aria-label="${A(UI.play)}"><span class="vid__btn" aria-hidden="true"><i class="fa-solid fa-play"></i></span><span class="vid__meta">${v.dur}</span></button></div></figure>`;

const page = p => {
  const title = `${p.name.pt} | ${UI.suffix.pt}`;
  reg(title, `${tr(p.name)} | ${UI.suffix.en}`);
  const left = `<h2>${T(UI.about)}</h2>${p.desc.map(d => `<p>${T(d)}</p>`).join('')}`;
  const right = `<h3>${T(UI.glance)}</h3><ul class="pd-list">${p.feats.map(f => `<li>${T(f)}</li>`).join('')}</ul>`;
  const about = `<section class="pd pd--solo"><div class="pd-card pd-card--split"><div>${left}</div><div>${right}</div></div></section>`;
  const video = `<section class="vd-sec" aria-labelledby="vd-t"><div><span class="vd-eyebrow">${T(UI.video)}</span><h2 id="vd-t">${T(p.video.title)}</h2><p>${T(p.video.text)}</p>${btn('btn btn--gold', 'contactos.html#contact', R('Solicitar proposta', 'Request a proposal'))}</div>
${vidCard(p.video, 'vid--h', p.video.title)}</section>`;
  const sh = p.shop;
  const card = !sh ? '' : gcard({ i: 0, img: sh.img, alt: sh.alt, photo: sh.photo, pill: p.tag, name: sh.name, desc: sh.desc, label: UI.inStore, value: UI.askQuote, href: sh.href,
    aria: { pt: `${UI.viewStore.pt}: ${sh.name.pt}`, en: `${UI.viewStore.en}: ${tr(sh.name)}` } });
  const glass = !sh ? '' : `<section class="gl-sec hero-panel rounded-4xl p-8 sm:p-12 border border-white shadow-sm" aria-labelledby="gl-t">
<div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"><div><span class="text-xs font-semibold uppercase tracking-widest text-gold-dark block mb-2">${T(p.cat.tag)}</span>
<h2 id="gl-t" class="text-2xl sm:text-3xl font-bold font-heading text-brand-dark">${T(p.cat.title)}</h2><p class="mt-3 max-w-xl text-sm text-gray-500 leading-relaxed">${T(p.cat.note)}</p></div>
${btn(PILL, 'loja/index.html', UI.shop)}</div>
<div class="gl-grid" data-n="1" style="--n:1">${card}</div></section>`;
  const main = `${mainOpen}
<!--@hero--><section class="pg-hero"><div><nav class="crumb" aria-label="Migalhas"><a href="index.html">${T(UI.home)}</a><span>/</span><span>${T(p.name)}</span></nav>
<h1>${T(p.name)}</h1><p>${T(p.lead)}</p>${btn('btn', 'contactos.html#contact', R('Solicitar proposta', 'Request a proposal'))}</div>
${heroFig(p.id, p.ar, `<img class="hc__s is-on" src="assets/img/${p.img}" width="${p.w}" height="${p.h}" alt="${A(p.alt)}" fetchpriority="high" decoding="async">`)}</section><!--/@hero-->
${about}
${video}
${glass}
</main>`;
  return skel
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${title}</title>`)
    .replace(/(<meta name="description"\s+content=")[^"]*(")/, (_, a, b) => a + A(p.lead) + b)
    .replace(/(<meta property="og:title"\s+content=")[^"]*(")/, (_, a, b) => a + title + b)
    .replace(/(<meta property="og:description"\s+content=")[^"]*(")/, (_, a, b) => a + A(p.lead) + b)
    .replace(/<main[\s\S]*<\/main>/, () => main)
    .replace(/<\/body>/, () => '<script src="assets/js/video-card.js" defer></script>\n<script src="assets/js/hero-carousel.js" defer></script>\n</body>');
};

for (const p of PRODUCTS) write(file(p) + '.html', page(p));



for (const [key, f] of [['sobre-nos', 'sobre-nos.html'], ['servicos', 'servicos.html'], ['eventos', 'eventos.html']]) {
  write(f, withScript(heroPatch(read(f), key), 'assets/js/hero-carousel.js'));
}

// ---------- cards de serviços (imagem) e de produtos (ligação) ----------
for (const f of ['servicos.html']) {  // a home já não tem os cards de serviços (agora: indústrias)
  let h = read(f);
  for (const s of SERVICES) {
    const fig = `<figure class="svc-img"><img src="assets/img/${s.img}" width="${s.w}" height="${s.h}" alt="${A(s.alt)}" loading="lazy" decoding="async"></figure>`;
    h = marked(h, 'svc-' + s.id, fig, new RegExp(`<div id="${s.id}"[^>]*>\\s*<div>`), 'after');
  }
  write(f, h);
}

write('i18n/en.json', JSON.stringify(DICT, null, 1) + '\n');
console.log('produtos:', PRODUCTS.length, 'páginas +', SERVICES.length, 'imagens de serviço');
