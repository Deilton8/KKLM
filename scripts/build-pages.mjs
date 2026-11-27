// Ferramenta de desenvolvimento (não vai para produção): injeta cabeçalho, rodapé e CTA
// partilhados e normaliza o <head> das 6 páginas. O resultado continua a ser HTML estático.
// Uso: node scripts/build-pages.mjs  (idempotente)  e depois: npm run css
import fs from 'node:fs';
import { SITE, PAGES, URLS, EN, EN_URLS, NAV_OF, alternates, langSwitch } from './site-config.mjs';
const read = f => fs.readFileSync(f, 'utf8');
const part = n => read(`partials/${n}.html`).trim();
const img = n => fs.readdirSync('assets/img').find(x => x.startsWith(n + '-'));
// SITE, PAGES, URLS e EN_URLS (domínio, páginas e URLs PT/EN) vêm de scripts/site-config.mjs.
const OG = { file: 'assets/img/og-kklm.jpg', w: 1200, h: 630, alt: 'KKLM Enterprise LDA: Uma empresa, todas as soluções' };
const seo = p => {
  const u = SITE + URLS[p], im = `${SITE}/${OG.file}`;
  return `<link rel="canonical" href="${u}">\n<meta property="og:url" content="${u}">\n<meta property="og:site_name" content="KKLM Enterprise LDA">\n` +
    `<meta property="og:image" content="${im}">\n<meta property="og:image:width" content="${OG.w}">\n<meta property="og:image:height" content="${OG.h}">\n` +
    `<meta property="og:image:alt" content="${OG.alt}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="${im}">\n` +
    `<meta property="og:locale:alternate" content="en_GB">\n${alternates(p)}`;
};
// Hero por página: [imagem, largura, altura, alt, aspect-ratio, object-position]
const HERO = {
  'sobre-nos': [img('06'), 1284, 847, 'Fotografia de grupo no Montebelo Indy Maputo Congress Hotel', '3/2'],
  servicos: [img('12'), 1200, 1600, 'Equipa com equipamento de proteção em campo aberto', '5/4', '50% 35%'],
  eventos: [img('08'), 1284, 852, 'Plateia durante um evento institucional', '3/2'],
  contactos: null,
};
const swap = (h, n, html, re, keep = '') => {
  const w = `<!--@${n}-->${html}<!--/@${n}-->`, m = new RegExp(`<!--@${n}-->[\\s\\S]*?<!--/@${n}-->`);
  return m.test(h) ? h.replace(m, () => w) : h.replace(re, () => w + keep);
};
const head = h => {
  h = h.replace(/<script src="https:\/\/cdn\.tailwindcss\.com[^"]*"><\/script>\s*/, '')
    .replace(/<script>\s*tailwind\.config\s*=[\s\S]*?<\/script>\s*/, '')
    .replace(/<link[^>]*(?:fonts\.googleapis|fonts\.gstatic)[^>]*>\s*/g, '')
    .replace(/<script[^>]*font-?awesome[^>]*><\/script>\s*/gi, '');
  if (!h.includes('premium.css')) h = h.replace(/<link rel="stylesheet" href="assets\/css\/site\.css[^"]*">/, m =>
    '<link rel="preload" href="assets/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>\n' +
    '<link rel="preload" href="assets/fonts/newsreader-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>\n' +
    '<link rel="stylesheet" href="assets/css/fonts.css">\n<link rel="stylesheet" href="assets/css/tailwind.css">\n' +
    '<link rel="stylesheet" href="assets/fa/css/all.min.css">\n' + m + '\n<link rel="stylesheet" href="assets/css/premium.css">');
  return h.replace(/Montserrat,\s*sans-serif/g, 'var(--fd)');
};
const hero = (eb, t, lead, i, cta) => `<!--@hero--><section class="pg-hero${i ? '' : ' pg-hero--solo'}"><div>` +
  `<nav class="crumb" aria-label="Migalhas"><a href="index.html">Início</a><span>/</span><span>${eb}</span></nav>` +
  `<h1>${t}</h1><p>${lead}</p>` +
  (cta ? '<a class="btn" href="contactos.html#contact">Solicitar proposta <i class="fa-solid fa-arrow-right text-xs"></i></a>' : '') +
  `</div>${i ? `<figure class="pg-hero__img" style="aspect-ratio:${i[4]}"><img src="assets/img/${i[0]}" width="${i[1]}" height="${i[2]}" alt="${i[3]}" style="object-position:${i[5] || '50% 50%'}" fetchpriority="high" decoding="async"></figure>` : ''}</section><!--/@hero-->`;

for (const p of PAGES) {
  let h = head(read(p + '.html'));
  h = swap(h, 'header', part('header').replace('{{LANG}}', langSwitch(p, 'pt')).replace(`href="${NAV_OF(p)}.html" class="nav-l"`, `href="${NAV_OF(p)}.html" class="nav-l on" aria-current="page"`), /<header[\s\S]*?<\/header>/);
  h = swap(h, 'footer', part('footer'), /<footer[\s\S]*?<\/footer>/);
  h = swap(h, 'seo', seo(p), /<\/head>/, '</head>');
  if (p !== 'index' && p !== 'contactos') h = swap(h, 'cta', part('cta'), /<\/main>/, '</main>');
  if (!h.includes('<!--@hero-->') && p !== 'index') {
    const I = HERO[p];
    if (p === 'eventos') {
      const lead = (h.match(/<p class="ev-lead[^>]*>([\s\S]*?)<\/p>/) || [])[1] || 'Fóruns, feiras e ações no terreno onde a KKLM constrói relações comerciais e institucionais.';
      h = h.replace(/<h1[\s\S]*?<\/h1>/, '').replace(/<p class="ev-lead[^>]*>[\s\S]*?<\/p>/, '');
      h = h.replace(/<section class="ev-h"/, m => hero('Eventos', 'Eventos e networking', lead, I, true) + m);
    } else {
      const m = h.match(/<section class="hero-panel[^"]*"[^>]*>([\s\S]*?)<\/section>/);
      const eb = m[1].match(/<span[^>]*>([^<]*)<\/span>/)[1];
      const t = m[1].match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]+>/g, '').trim();
      const lead = m[1].match(/<p[^>]*>([\s\S]*?)<\/p>/)[1];
      h = h.replace(m[0], () => hero(eb, t, lead, I, p !== 'contactos'));
    }
  }
  fs.writeFileSync(p + '.html', h);
}
// robots.txt e sitemap.xml (gerados a partir de SITE e URLS)
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  PAGES.flatMap(p => [URLS[p], EN_URLS[p]].map(u => `  <url><loc>${SITE}${u}</loc>` +
    `<xhtml:link rel="alternate" hreflang="pt" href="${SITE}${URLS[p]}"/><xhtml:link rel="alternate" hreflang="en" href="${SITE}${EN_URLS[p]}"/></url>`)).join('\n') + '\n</urlset>\n');
// 404.html: derivada de contactos.html (mesmo head, cabeçalho, rodapé e scripts).
// <base href="/"> faz os caminhos relativos funcionarem em qualquer profundidade de URL.
const main404 = `<main class="space-y-8"><section class="pg-hero pg-hero--solo"><div>` +
  `<nav class="crumb" aria-label="Migalhas"><a href="index.html">Início</a><span>/</span><span>Erro 404</span></nav>` +
  `<h1>Página não encontrada</h1><p>A página que procura não existe ou foi movida. Volte ao início ou fale com a nossa equipa.</p>` +
  `<div class="flex flex-wrap gap-3"><a class="btn" href="index.html">Voltar ao início</a><a class="btn btn--gold" href="contactos.html#contact">Contactos</a></div>` +
  // O 404 serve as duas línguas (o servidor não sabe qual o visitante usava): bloco em inglês por baixo.
  `<p lang="en" class="mt-8 text-sm" style="color:var(--mut)"><strong>Page not found.</strong> The page you are looking for does not exist or has moved. ` +
  `<a class="underline" href="en/index.html">Back to the home page</a> or <a class="underline" href="en/contact.html#contact">contact our team</a>.</p></div></section></main>`;
fs.writeFileSync('404.html', read('contactos.html')
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Página não encontrada / Page not found | KKLM Enterprise LDA</title>')
  .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="A página que procura não existe ou foi movida.">')
  .replace(/<meta property="og:[a-z:]+"[^>]*>\s*/g, '')
  .replace(/<!--@seo-->[\s\S]*?<!--\/@seo-->/, '<meta name="robots" content="noindex">')
  .replace('<head>', '<head>\n<base href="/">')
  .replace(/<main[\s\S]*<\/main>/, () => main404)
  .replace(' class="nav-l on" aria-current="page"', ' class="nav-l"')
  .replace('href="en/contact.html" hreflang="en"', 'href="en/index.html" hreflang="en"'));
console.log('páginas atualizadas:', PAGES.length, '+ robots.txt, sitemap.xml, 404.html');
