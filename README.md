# KKLM Enterprise: site estático (versão premium, fase 2)

- Produção: enviar para o Apache só `*.html`, `en/` (versão inglesa), `assets/`, `.htaccess`, `robots.txt` e `sitemap.xml` (não enviar `partials/`, `scripts/`, `src/`, `i18n/`, `package.json`, `tailwind.config.js`).
- SEO: o domínio está na constante `SITE` de `scripts/site-config.mjs` (assumido: https://kklm.co.mz). Se for outro, alterar e correr `npm run build`: atualiza canonical, og:url, og:image, hreflang, robots.txt, sitemap.xml e 404.html. Imagem de partilha: `assets/img/og-kklm.jpg` (1200×630).
- Desenvolvimento: `npm i` e `npm run build` (injeta `partials/` nas 6 páginas, gera a versão inglesa em `en/` e compila o Tailwind para `assets/css/tailwind.css`).
- Design: tokens e componentes em `assets/css/premium.css` (serifa Newsreader nos títulos, Inter no corpo, navy/dourado). Cabeçalho, rodapé e CTA vivem em `partials/`: editar lá, não nas páginas.
- Eventos continuam a vir de `assets/js/data.js`.
- Por fazer: encurtar a home, grelha estática de parceiros, WebP/AVIF e sprite SVG de ícones, relatório Lighthouse.

- Responsividade: bloco final de `assets/css/premium.css` (ecrãs pequenos, toque, ecrãs baixos). O Tailwind gera `hover:` só em dispositivos com rato (`future.hoverOnlyWhenSupported`); correr `npm run css` após alterar classes.

## Versão em inglês (`/en/`)

- Páginas: `en/index.html`, `about-us.html`, `services.html`, `products.html`, `events.html`, `contact.html` (URLs `/en/`, `/en/services`, ...). São **geradas** por `scripts/build-en.mjs` a partir das páginas portuguesas: não editar à mão; alterar a página PT (ou `partials/`) e correr `npm run build`.
- Traduções: `i18n/en.json`. A chave é o texto português da página (espaços normalizados, com as etiquetas inline `<strong>`, `<br>`, `<i>`, `<span>`, `<a>` sem atributos) e o valor é o texto inglês, com as **mesmas etiquetas pela mesma ordem**. Cobre também `alt`, `title`, `aria-label`, `<title>` e meta tags.
- Se mudar um texto em português, a chave deixa de existir: `npm run en` avisa que o texto ficou sem tradução (a página EN mostra o português nesse sítio). `node scripts/build-en.mjs --extract` imprime em JSON o que falta; `--strict` falha o build se faltar alguma tradução.
- Selector PT | EN: no cabeçalho (`partials/header.html`, marcador `{{LANG}}`; estilo `.lang` em `premium.css`). Cada página liga à sua equivalente na outra língua; `hreflang` e `sitemap.xml` já incluem as duas versões.
- JavaScript: os textos que o JS escreve (menu móvel, passos, mensagens do formulário) estão no objeto `TX` em `assets/js/site.js`; a tradução dos títulos de eventos está em `KKLM.en` de `assets/js/data.js` (chave = texto PT).
- Formulário EN: o e-mail chega com os campos e valores em português (para ficar igual ao do site PT); o assunto vai em inglês ("Commercial proposal request").
- `404.html` é bilingue (o servidor não sabe a língua do visitante).


## Loja de EPI (catálogos)
- `data/loja/products.json`: 591 produtos (590 extraídos dos 14 catálogos mais os dispensadores de água) (nome, categoria, marca, códigos, características, normas e imagens). Para corrigir um texto, editar aqui.
- `data/loja/config.json`: número de WhatsApp e e-mail para onde seguem os pedidos de cotação.
- `npm run build` gera `loja/index.html`, `loja/c/*.html` (categorias), `loja/p/*.html` (produtos), `assets/loja/index.json` (pesquisa) e junta as URLs ao `sitemap.xml`.
- Imagens em `assets/loja/img` (WebP). A lista de cotação fica no navegador (localStorage) e é enviada por WhatsApp ou e-mail.
- Estilos em `assets/css/loja.css`; comportamento (lista, filtros, pesquisa) em `assets/js/loja.js`.
