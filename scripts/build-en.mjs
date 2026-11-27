// Gera a versão inglesa do site (pasta /en/) a partir das páginas portuguesas e de i18n/en.json.
// O resultado continua a ser HTML estático (sem JavaScript para traduzir, bom para SEO).
//
// Uso:   node scripts/build-en.mjs [--strict] [--extract]
//   (sem opções)  gera /en/*.html e avisa se houver textos sem tradução
//   --strict      termina com erro se houver textos sem tradução
//   --extract     imprime em JSON os textos portugueses que faltam traduzir (colar em i18n/en.json)
//
// Corre depois de build-pages.mjs (npm run build faz as duas coisas). Para mudar um texto inglês,
// edite i18n/en.json: a chave é o texto português da página (com espaços normalizados) e o valor é a
// tradução. As etiquetas HTML dentro do texto (<strong>, <br>, <i>, <span>, <a>) têm de ser as
// mesmas, pela mesma ordem; os atributos (class, href, ...) são copiados da página portuguesa.
import fs from 'node:fs';
import * as cheerio from 'cheerio';
import { SITE, PAGES, EN, EN_URLS, langSwitch } from './site-config.mjs';

const STRICT = process.argv.includes('--strict'), EXTRACT = process.argv.includes('--extract');
const DICT = JSON.parse(fs.readFileSync('i18n/en.json', 'utf8'));

const INLINE = new Set(['a', 'strong', 'b', 'em', 'i', 'span', 'br', 'small', 'sup', 'sub', 'u', 'mark', 'abbr', 'time', 'code', 'label']);
const SKIP = new Set(['script', 'style', 'svg', 'noscript', 'iframe', 'video', 'audio', 'source', 'track', 'template', 'head']);
const ATTRS = ['alt', 'title', 'aria-label', 'placeholder', 'data-l', 'data-t', 'data-subject'];
const META = { name: ['description'], property: ['og:title', 'og:description', 'og:image:alt'] };

const norm = s => s.replace(/\s+/g, ' ').trim();
const letters = s => /[A-Za-zÀ-ÿ]/.test(s);
const plain = el => (el.children || []).map(c => c.type === 'text' ? c.data : c.type === 'tag' ? plain(c) : '').join('');
// Um nó é "de frase" se for texto, comentário, uma etiqueta inline ou um elemento sem texto (ícone, bolinha).
const phrasing = c => c.type === 'text' || c.type === 'comment' ||
  (c.type === 'tag' && (INLINE.has(c.name) || !plain(c).trim()) && (c.children || []).every(phrasing));
const bare = h => h.replace(/<(\/?)([a-z][a-z0-9]*)(?:\s[^>]*)?>/gi, '<$1$2>'); // tira os atributos das etiquetas
const tagSeq = s => (s.match(/<\/?[a-z][a-z0-9]*>/gi) || []).join('');

const missing = new Map(), broken = [], mixed = [];
const miss = (k, where) => (missing.get(k) || missing.set(k, new Set()).get(k)).add(where);
let nText = 0, nAttr = 0;

// Blocos de texto traduzíveis: o elemento mais externo que tem texto próprio e só filhos "de frase".
function units(root, page) {
  const out = [];
  (function walk(el) {
    if (el.type !== 'tag' || SKIP.has(el.name)) return;
    if (el.name === 'nav' && /\blang\b/.test(el.attribs.class || '')) return; // selector PT | EN: não se traduz
    const kids = el.children || [];
    if (kids.some(c => c.type === 'text' && c.data.trim())) {
      if (kids.every(phrasing)) { out.push(el); return; }
      mixed.push(`${page}: <${el.name}> ${norm(plain(el)).slice(0, 60)}`);
    }
    kids.forEach(walk);
  })(root);
  return out;
}

// Substitui o conteúdo de `el` pela tradução, devolvendo os atributos às etiquetas inline
// (a n-ésima <strong> da tradução recebe os atributos da n-ésima <strong> do original).
function setHtml($, el, en) {
  const frag = cheerio.load(en, null, false), pool = {}, used = {};
  $(el).find('*').each((_, o) => (pool[o.name] ||= []).push(o));
  frag('*').each((_, n) => {
    const i = used[n.name] = (used[n.name] || 0) + 1, o = (pool[n.name] || [])[i - 1];
    if (o) n.attribs = { ...o.attribs };
  });
  $(el).html(frag.html());
}

fs.mkdirSync('en', { recursive: true });
const PAGE_RE = new RegExp('^(' + PAGES.join('|') + ')\\.html(#.*)?$');

for (const p of PAGES) {
  const $ = cheerio.load(fs.readFileSync(p + '.html', 'utf8')), where = p + '.html';
  $('html').attr('lang', 'en');

  // O valor enviado pelo formulário fica em português (o e-mail chega sempre com os mesmos valores).
  $('option').each((_, o) => { if (o.attribs.value === undefined) o.attribs.value = norm($(o).text()); });

  // 1) blocos de texto
  for (const el of units($('body')[0], where)) {
    if (!letters(plain(el))) continue; // números, telefone, e-mail...
    const k = bare(norm($(el).html())), en = DICT[k];
    if (en === undefined) { miss(k, where); continue; }
    if (tagSeq(k) !== tagSeq(en)) { broken.push(`${where}: ${k.slice(0, 70)}`); continue; }
    setHtml($, el, en); nText++;
  }

  // 2) atributos de texto (alt, title, aria-label, ...) fora do selector de idioma
  $('body *').each((_, e) => {
    if ($(e).parents('.lang').length) return;
    for (const a of ATTRS) {
      const v = e.attribs[a];
      if (!v || !letters(v)) continue;
      const en = DICT[norm(v)];
      if (en === undefined) miss(norm(v), where); else { e.attribs[a] = en; nAttr++; }
    }
  });

  // 3) <title> e meta tags de SEO
  const t = $('title').text();
  if (DICT[norm(t)] === undefined) miss(norm(t), where); else $('title').text(DICT[norm(t)]);
  for (const [attr, names] of Object.entries(META)) for (const n of names) $(`meta[${attr}="${n}"]`).each((_, m) => {
    const v = m.attribs.content, en = DICT[norm(v || '')];
    if (en === undefined) miss(norm(v || ''), where); else m.attribs.content = en;
  });
  $('meta[property="og:locale"]').attr('content', 'en_GB');
  $('meta[property="og:locale:alternate"]').attr('content', 'pt_MZ');
  $('link[rel="canonical"]').attr('href', SITE + EN_URLS[p]);
  $('meta[property="og:url"]').attr('content', SITE + EN_URLS[p]);

  // 4) ligações entre páginas e caminhos dos recursos (as páginas EN vivem em /en/)
  $('a[href]').each((_, a) => {
    const m = PAGE_RE.exec(a.attribs.href);
    if (m) a.attribs.href = EN[m[1]] + '.html' + (m[2] || '');
  });
  $('*').each((_, e) => {
    for (const [k, v] of Object.entries(e.attribs || {})) {
      if (v.startsWith('assets/') || v.startsWith('loja/')) e.attribs[k] = '../' + v;
      else if (k === 'style' && v.includes('url(assets/')) e.attribs[k] = v.replace(/url\((['"]?)assets\//g, 'url($1../assets/');
    }
  });

  // 5) selector de idioma (PT | EN) com o EN ativo
  $('nav.lang').html(langSwitch(p, 'en'));

  fs.writeFileSync(`en/${EN[p]}.html`, $.html());
}

const list = [...missing.entries()];
if (EXTRACT) {
  console.log(JSON.stringify(Object.fromEntries(list.map(([k]) => [k, ''])), null, 2));
} else {
  console.log(`páginas EN: ${PAGES.length} em en/ (${nText} blocos de texto, ${nAttr} atributos traduzidos)`);
  if (mixed.length) console.warn(`aviso: ${mixed.length} bloco(s) com texto misturado com elementos de bloco (não traduzidos):\n  ` + mixed.join('\n  '));
  if (broken.length) console.error(`ERRO: ${broken.length} tradução(ões) com etiquetas HTML diferentes do original:\n  ` + broken.join('\n  '));
  if (list.length) console.warn(`aviso: ${list.length} texto(s) sem tradução em i18n/en.json (ficam em português):\n  ` + list.map(([k, w]) => `[${[...w].join(', ')}] ${k.slice(0, 90)}`).join('\n  ') + '\n  (use --extract para obter a lista em JSON)');
}
if (broken.length || (STRICT && (list.length || mixed.length))) process.exit(1);
