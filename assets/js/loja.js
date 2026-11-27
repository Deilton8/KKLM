/* Loja de EPI: lista de cotação (WhatsApp / e-mail), listagem com filtros e pesquisa, página de produto. Sem dependências. */
(() => {
  'use strict';
  const BASE = document.documentElement.getAttribute('data-base') || '';
  const CFG = window.LOJA || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KEY = 'kklm_lista_v1';
  const PLUS = '<i class="fa-solid fa-plus"></i>', CHECK = '<i class="fa-solid fa-check"></i>';

  /* ---------- lista de cotação ---------- */
  let S = { items: [], who: {} };
  try { S = Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { /* sem armazenamento */ }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignora */ } };
  const total = () => S.items.reduce((a, i) => a + i.q, 0);
  const keyOf = i => [i.id, i.v || '', i.size || '', i.note || ''].join('|');
  const badge = () => $$('[data-cart-count]').forEach(b => { const n = total(); b.textContent = n; b.hidden = !n; });

  let drawer, ov, last, toastEl, toastT;
  const message = () => {
    const L = ['Olá ' + (CFG.empresa || 'KKLM') + ', gostaria de pedir cotação dos seguintes produtos:', ''];
    S.items.forEach((i, n) => L.push((n + 1) + '. ' + i.name + (i.v ? ' — ' + i.v : '') + (i.size ? ' (' + i.size + ')' : '') + ' × ' + i.q + (i.note ? ' — ' + i.note : '')));
    const w = S.who || {}; L.push('');
    if (w.n) L.push('Nome: ' + w.n); if (w.e) L.push('Empresa: ' + w.e); if (w.t) L.push('Contacto: ' + w.t);
    return L.join('\n').trim();
  };
  const itemHTML = (i, n) => `<div class="lj-it" data-n="${n}">${i.img ? `<img src="${BASE}assets/loja/img/${esc(i.img)}" alt="">` : '<span class="lj-ph"><i class="fa-regular fa-image"></i></span>'}<div><b><a href="${BASE}loja/p/${esc(i.slug)}.html">${esc(i.name)}</a></b>${i.v || i.size ? `<small>${esc([i.v, i.size].filter(Boolean).join(' · '))}</small>` : ''}<input class="lj-note" data-note value="${esc(i.note || '')}" placeholder="Tamanho / observações" maxlength="140" aria-label="Observações"><div class="lj-it__row"><div class="lj-qty"><button type="button" data-q="-1" aria-label="Menos">−</button><input type="number" data-qty value="${i.q}" min="1" max="9999" aria-label="Quantidade"><button type="button" data-q="1" aria-label="Mais">+</button></div><button type="button" class="lj-rm" data-rm>Remover</button></div></div></div>`;
  const paint = () => {
    badge();
    if (!drawer) return;
    const n = total();
    $('[data-d-sub]', drawer).textContent = n ? n + (n === 1 ? ' unidade' : ' unidades') + ' · ' + S.items.length + (S.items.length === 1 ? ' produto' : ' produtos') : 'Sem produtos';
    $('[data-d-body]', drawer).innerHTML = S.items.length ? S.items.map(itemHTML).join('') : '<p class="lj-d__empty">A sua lista está vazia.<br>Adicione produtos e peça cotação por WhatsApp ou e-mail.</p>';
    const w = S.who || {};
    $('[data-d-foot]', drawer).innerHTML = S.items.length ? `<div class="lj-who"><input data-who="n" value="${esc(w.n || '')}" placeholder="O seu nome" autocomplete="name" aria-label="Nome"><input data-who="e" value="${esc(w.e || '')}" placeholder="Empresa" autocomplete="organization" aria-label="Empresa"><input data-who="t" value="${esc(w.t || '')}" placeholder="Telefone ou e-mail" autocomplete="tel" aria-label="Contacto"></div><a class="lj-btn lj-btn--primary" data-wa href="#" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Enviar pedido por WhatsApp</a><a class="lj-btn lj-btn--ghost" data-mail href="#"><i class="fa-regular fa-envelope"></i> Enviar por e-mail</a><div class="lj-d__links"><button type="button" data-copy>Copiar lista</button><button type="button" data-empty>Esvaziar lista</button></div>` : '';
  };
  const build = () => {
    ov = document.createElement('div'); ov.className = 'lj-ov';
    drawer = document.createElement('aside'); drawer.className = 'lj-drawer'; drawer.tabIndex = -1;
    drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true'); drawer.setAttribute('aria-label', 'Lista de cotação');
    drawer.innerHTML = '<div class="lj-d__head"><div><h2>Lista de cotação</h2><small data-d-sub></small></div><button type="button" class="lj-x" data-close aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button></div><div class="lj-d__body" data-d-body></div><div class="lj-d__foot" data-d-foot></div>';
    document.body.append(ov, drawer);
    ov.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) close(); });
    drawer.addEventListener('click', e => {
      const t = e.target;
      if (t.closest('[data-close]')) return close();
      const row = t.closest('.lj-it'), it = row && S.items[+row.dataset.n];
      if (t.closest('[data-rm]') && it) { S.items.splice(+row.dataset.n, 1); persist(); return paint(); }
      const q = t.closest('[data-q]');
      if (q && it) { it.q = Math.max(1, Math.min(9999, it.q + +q.dataset.q)); persist(); paint(); return; }
      if (t.closest('[data-empty]')) { S.items = []; persist(); return paint(); }
      if (t.closest('[data-copy]')) { (navigator.clipboard ? navigator.clipboard.writeText(message()) : Promise.reject()).then(() => toast('Lista copiada'), () => toast('Não foi possível copiar')); return; }
      const wa = t.closest('[data-wa]'), ml = t.closest('[data-mail]');
      if (wa) wa.href = 'https://wa.me/' + CFG.wa + '?text=' + encodeURIComponent(message());
      if (ml) ml.href = 'mailto:' + CFG.mail + '?subject=' + encodeURIComponent('Pedido de cotação') + '&body=' + encodeURIComponent(message());
    });
    drawer.addEventListener('input', e => {
      const t = e.target, row = t.closest('.lj-it'), it = row && S.items[+row.dataset.n];
      if (t.matches('[data-who]')) { S.who[t.dataset.who] = t.value; persist(); }
      else if (t.matches('[data-note]') && it) { it.note = t.value; persist(); }
      else if (t.matches('[data-qty]') && it) { it.q = Math.max(1, Math.min(9999, parseInt(t.value, 10) || 1)); persist(); badge(); }
    });
  };
  const open = () => { if (!drawer) build(); paint(); last = document.activeElement; ov.classList.add('is-open'); drawer.classList.add('is-open'); drawer.focus(); };
  const close = () => { ov.classList.remove('is-open'); drawer.classList.remove('is-open'); if (last && last.focus) last.focus(); };
  const toast = msg => {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'lj-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.innerHTML = '<span>' + msg + '</span><button type="button">Ver lista</button>';
    toastEl.firstChild.nextSibling.onclick = () => { toastEl.classList.remove('is-on'); open(); };
    toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3400);
  };
  const add = it => {
    it.q = Math.max(1, Math.min(9999, parseInt(it.q, 10) || 1));
    const f = S.items.find(x => keyOf(x) === keyOf(it));
    if (f) f.q = Math.min(9999, f.q + it.q); else S.items.push(it);
    persist(); paint(); toast('Adicionado à lista de cotação');
  };
  const flash = (b, html) => { b.classList.add('is-ok'); b.innerHTML = CHECK; setTimeout(() => { b.classList.remove('is-ok'); b.innerHTML = html; }, 1400); };

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]');
    if (a) { const c = a.closest('.lj-card'); add({ id: c.dataset.id, name: c.dataset.title, slug: c.dataset.slug, img: c.dataset.img, v: c.dataset.v || '', q: 1 }); flash(a, PLUS); return; }
    if (e.target.closest('[data-cart-open]')) open();
  });
  badge();

  /* ---------- pesquisa com sugestões ---------- */
  let IDX = null;
  const loadIdx = () => IDX ? Promise.resolve(IDX) : fetch(BASE + 'assets/loja/index.json').then(r => r.json()).then(j => (IDX = j));
  $$('.lj-search input').forEach(inp => {
    const box = inp.parentElement.querySelector('.lj-sugg'); let sel = -1;
    const hide = () => { box.hidden = true; sel = -1; };
    const show = () => {
      const q = norm(inp.value).split(/\s+/).filter(Boolean);
      if (!q.length) return hide();
      loadIdx().then(ix => {
        const r = ix.filter(x => q.every(t => x[7].includes(t))).sort((a, b) => (norm(b[2]).startsWith(q[0]) ? 1 : 0) - (norm(a[2]).startsWith(q[0]) ? 1 : 0)).slice(0, 6);
        if (!r.length) return hide();
        box.innerHTML = r.map(x => `<a href="${BASE}loja/p/${x[1]}.html">${x[5] ? `<img src="${BASE}assets/loja/img/${x[5]}" alt="">` : ''}<span>${esc(x[2])}<small>${esc(x[3])}${x[4] ? ' · ' + esc(x[4].split(' ')[0]) : ''}</small></span></a>`).join('');
        box.hidden = false; sel = -1;
      }).catch(hide);
    };
    inp.addEventListener('input', show); inp.addEventListener('focus', show);
    inp.addEventListener('keydown', e => {
      const as = $$('a', box);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { if (box.hidden || !as.length) return; e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + as.length) % as.length; as.forEach((a, i) => a.classList.toggle('is-on', i === sel)); }
      else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); location.href = as[sel].href; }
      else if (e.key === 'Escape') hide();
    });
    document.addEventListener('click', e => { if (!inp.parentElement.contains(e.target)) hide(); });
  });

  /* ---------- listagem: pesquisa, filtros, ordenação e «mostrar mais» ---------- */
  const grid = $('.lj-grid[data-page]');
  if (grid) {
    const orig = $$('.lj-card', grid), PAGE = +grid.dataset.page || 24;
    const input = $('.lj-search input'), sort = $('.lj-sort'), more = $('.lj-more'), count = $('.lj-count'), empty = $('.lj-empty'), clear = $('[data-clear]');
    const st = { q: '', brand: new Set(), std: new Set(), sort: 'cat', shown: PAGE };
    const u = new URLSearchParams(location.search);
    st.q = u.get('q') || ''; st.sort = u.get('ordem') || 'cat';
    (u.get('marca') || '').split('|').filter(Boolean).forEach(v => st.brand.add(v));
    (u.get('norma') || '').split('|').filter(Boolean).forEach(v => st.std.add(v));
    if (input) input.value = st.q;
    if (sort) sort.value = st.sort;
    $$('input[data-f]').forEach(c => { c.checked = (c.dataset.f === 'brand' ? st.brand : st.std).has(c.value); });
    const apply = reset => {
      if (reset) st.shown = PAGE;
      const q = norm(st.q).split(/\s+/).filter(Boolean);
      let list = orig.filter(c => (!q.length || q.every(t => c.dataset.s.includes(t))) && (!st.brand.size || st.brand.has(c.dataset.brand)) && (!st.std.size || c.dataset.std.split('|').some(s => st.std.has(s))));
      if (st.sort !== 'cat') list = list.slice().sort((a, b) => a.dataset.name.localeCompare(b.dataset.name, 'pt') * (st.sort === 'za' ? -1 : 1));
      const set = new Set(list);
      (st.sort === 'cat' ? orig : list.concat(orig.filter(c => !set.has(c)))).forEach(c => grid.appendChild(c));
      orig.forEach(c => { c.hidden = !set.has(c); });
      list.forEach((c, i) => { c.hidden = i >= st.shown; });
      if (count) count.textContent = list.length + (list.length === 1 ? ' produto' : ' produtos');
      if (empty) empty.hidden = list.length > 0;
      if (more) more.hidden = list.length <= st.shown;
      if (clear) clear.hidden = !(st.q || st.brand.size || st.std.size);
      const p = new URLSearchParams();
      if (st.q) p.set('q', st.q); if (st.brand.size) p.set('marca', [...st.brand].join('|')); if (st.std.size) p.set('norma', [...st.std].join('|')); if (st.sort !== 'cat') p.set('ordem', st.sort);
      history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
    };
    if (input) {
      input.addEventListener('input', () => { st.q = input.value; apply(true); });
      input.form.addEventListener('submit', e => { e.preventDefault(); st.q = input.value; apply(true); const s = input.parentElement.querySelector('.lj-sugg'); if (s) s.hidden = true; });
    }
    if (sort) sort.addEventListener('change', () => { st.sort = sort.value; apply(true); });
    if (more) more.addEventListener('click', () => { st.shown += PAGE; apply(false); });
    $$('input[data-f]').forEach(c => c.addEventListener('change', () => { const s = c.dataset.f === 'brand' ? st.brand : st.std; c.checked ? s.add(c.value) : s.delete(c.value); apply(true); }));
    if (clear) clear.addEventListener('click', () => { st.q = ''; st.brand.clear(); st.std.clear(); if (input) input.value = ''; $$('input[data-f]').forEach(c => { c.checked = false; }); apply(true); });
    const fl = $('#ljFilters'), scrim = $('.lj-scrim');
    const fopen = on => { if (fl) fl.classList.toggle('is-open', on); if (scrim) scrim.hidden = !on; };
    $$('[data-filters-open]').forEach(b => b.addEventListener('click', () => fopen(true)));
    $$('[data-filters-close]').forEach(b => b.addEventListener('click', () => fopen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fopen(false); });
    apply(true);
  }

  /* ---------- página de produto ---------- */
  const pd = $('.lj-pd');
  if (pd) {
    const base = () => ({ id: pd.dataset.id, name: pd.dataset.name, slug: pd.dataset.slug, img: pd.dataset.img });
    $$('.lj-gal__thumbs button', pd).forEach(b => b.addEventListener('click', () => {
      $('#ljMain').src = b.dataset.src;
      $$('.lj-gal__thumbs button', pd).forEach(x => x.classList.toggle('is-on', x === b));
    }));
    $$('.lj-var button', pd).forEach(b => b.addEventListener('click', () => {
      $$('.lj-var button', pd).forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-checked', String(x === b)); });
    }));
    const qi = $('.lj-qtyi', pd);
    $$('.lj-qty [data-q]', pd).forEach(b => b.addEventListener('click', () => { qi.value = Math.max(1, (parseInt(qi.value, 10) || 1) + +b.dataset.q); }));
    const addBtn = $('[data-add-pd]', pd);
    if (addBtn) addBtn.addEventListener('click', () => {
      const v = $('.lj-var .is-on', pd), note = $('.lj-note', pd);
      add(Object.assign(base(), { v: v ? v.dataset.v : (pd.dataset.v || ''), note: note ? note.value.trim() : '', q: qi ? qi.value : 1 }));
    });
    $$('[data-add-v]', pd).forEach(b => b.addEventListener('click', () => {
      const sz = $('.lj-size', pd);
      add(Object.assign(base(), { v: b.dataset.addV, size: sz ? sz.value : '', q: 1 })); flash(b, PLUS);
    }));
  }
})();
