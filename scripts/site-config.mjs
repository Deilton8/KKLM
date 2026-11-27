// Configuração partilhada pelos scripts de build (build-pages.mjs e build-en.mjs).
// Domínio de produção: única fonte para canonical, og:url, og:image, hreflang, robots.txt e sitemap.xml.
import { PRODUCTS } from './products-data.mjs';
export const SITE = 'https://kklm.co.mz';
export const PAGES = ['index', 'sobre-nos', 'servicos', 'eventos', 'contactos', 'purek', ...PRODUCTS.map(p => 'produto-' + p.id)];
// Versão portuguesa (raiz) e inglesa (pasta /en/). O .htaccess serve as duas sem extensão.
export const URLS = { index: '/', 'sobre-nos': '/sobre-nos', servicos: '/servicos', eventos: '/eventos', contactos: '/contactos', purek: '/purek', ...Object.fromEntries(PRODUCTS.map(p => ['produto-' + p.id, '/produto-' + p.id])) };
// Nome do ficheiro de cada página em inglês, dentro de /en/.
export const EN = { index: 'index', 'sobre-nos': 'about-us', servicos: 'services', eventos: 'events', contactos: 'contact', purek: 'purek', ...Object.fromEntries(PRODUCTS.map(p => ['produto-' + p.id, 'product-' + p.id])) };
export const EN_URLS = { index: '/en/', 'sobre-nos': '/en/about-us', servicos: '/en/services', eventos: '/en/events', contactos: '/en/contact', purek: '/en/purek', ...Object.fromEntries(PRODUCTS.map(p => ['produto-' + p.id, '/en/product-' + p.id])) };
// Páginas de produto (produto-*) ficam sob «Produtos» no menu.
export const NAV_OF = p => p;
// hreflang: liga cada página à sua versão noutra língua (PT é o x-default).
export const alternates = p =>
  `<link rel="alternate" hreflang="pt" href="${SITE + URLS[p]}">\n<link rel="alternate" hreflang="en" href="${SITE + EN_URLS[p]}">\n<link rel="alternate" hreflang="x-default" href="${SITE + URLS[p]}">`;
// Selector de idioma do cabeçalho. `lang` é a língua da página atual; o link aponta para a outra.
// Na versão PT os links são relativos à raiz; na EN (pasta /en/) voltam à raiz com "../".
export const langSwitch = (p, lang) => lang === 'pt'
  ? `<span class="lang-on" aria-current="true">PT</span><a href="en/${EN[p]}.html" hreflang="en" lang="en" aria-label="English">EN</a>`
  : `<a href="../${p}.html" hreflang="pt" lang="pt" aria-label="Português">PT</a><span class="lang-on" aria-current="true">EN</span>`;
