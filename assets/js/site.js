/* Idioma da página (<html lang>): PT na raiz do site, EN na pasta /en/.
   BASE corrige os caminhos dos recursos no JavaScript das páginas EN; TX tem os textos que o JavaScript escreve. */
var SB = document.documentElement.getAttribute('data-base') || '', LANG = document.documentElement.lang === 'en' ? 'en' : 'pt', BASE = LANG === 'en' ? '../' : '', TX = {
    pt: {
        contact: 'contactos.html#contact', carousel: 'carrossel', menuLabel: 'Menu principal', sections: 'Secções', close: 'Fechar', cta: 'Solicitar proposta',
        step: 'Passo', of: 'de', prev: 'Anterior', next: 'Seguinte', subject: 'Contacto', openMail: 'abrir o e-mail',
        preparedH: 'Mensagem preparada', preparedP: 'Ainda não foi enviada. Falta só enviar: ', sentH: 'Mensagem enviada', sentP: 'Recebemos o seu pedido e responderemos em breve.',
        failH: 'Não foi possível enviar', failP: 'Tente novamente ou ', reply: 'Respondemos o mais breve possível.',
        menu: [['Início', 'index.html'], ['Sobre nós', 'sobre-nos.html'], ['Serviços', 'servicos.html'], ['PureK', 'purek.html'], ['Dispensadores', 'produto-dispensadores.html'], ['Loja', 'loja/index.html'], ['Eventos', 'eventos.html'], ['Contactos', 'contactos.html']]
    },
    en: {
        contact: 'contact.html#contact', carousel: 'carousel', menuLabel: 'Main menu', sections: 'Sections', close: 'Close', cta: 'Request a proposal',
        step: 'Step', of: 'of', prev: 'Previous', next: 'Next', subject: 'Contact', openMail: 'open the email',
        preparedH: 'Message prepared', preparedP: 'It has not been sent yet. All that\u2019s left is to send it: ', sentH: 'Message sent', sentP: 'We have received your request and will reply shortly.',
        failH: 'Unable to send', failP: 'Please try again or ', reply: 'We reply as soon as possible.',
        menu: [['Home', 'index.html'], ['About us', 'about-us.html'], ['Services', 'services.html'], ['PureK', 'purek.html'], ['Dispensers', 'product-dispensadores.html'], ['Shop', '../loja/index.html'], ['Events', 'events.html'], ['Contact', 'contact.html']]
    }
}[LANG];
/* Traduz títulos/legendas de eventos: a tabela inglesa está em assets/js/data.js (KKLM.en); sem entrada, fica o texto original. */
function tr(s) { var m = LANG === 'en' && window.KKLM && window.KKLM.en; return (m && m[s]) || s }
function goContact() { var c = document.getElementById('contact'); if (!c) { location.href = SB + TX.contact; return } c.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); setTimeout(function () { var f = c.querySelector('input'); if (f) f.focus({ preventScroll: true }) }, 700) }
const items = [{ "t": "FACIM 2025", "s": "Presença institucional", "img": "assets/img/55-645629.jpg" }, { "t": "Seminário KKLM", "s": "Clientes e parceiros", "img": "assets/img/56-44dac0.jpg" }, { "t": "FACIM 2025", "s": "Presença institucional", "img": "assets/img/57-2a6712.jpg" }, { "t": "Seminário KKLM", "s": "Clientes e parceiros", "img": "assets/img/58-550f08.jpg" }, { "t": "FACIM 2025", "s": "Presença institucional", "img": "assets/img/59-e35647.jpg" }, { "t": "Seminário KKLM", "s": "Clientes e parceiros", "img": "assets/img/60-9cf6f6.jpg" }, { "t": "FACIM 2025", "s": "Presença institucional", "img": "assets/img/61-3e7372.jpg" }, { "t": "Seminário KKLM", "s": "Clientes e parceiros", "img": "assets/img/62-358ead.jpg" }, { "t": "Seminário KKLM", "s": "Clientes e parceiros", "img": "assets/img/63-e7b051.jpg" }, { "t": "Seminário KKLM", "s": "Clientes e parceiros", "img": "assets/img/64-0cfe35.jpg" }, { "t": "Seminário KKLM", "s": "Clientes e parceiros", "img": "assets/img/65-75bc7b.jpg" }, { "t": "Seminário KKLM", "s": "Clientes e parceiros", "img": "assets/img/66-4bd8d0.jpg" }]; let cur = 0;
var scrollCatalog = (function () {
    var c = document.getElementById('catalog-container'); if (!c) return function () { };
    var n = items.length, pv = 1, i = 0, tm = 0, hov = 0, vis = 1, x0 = null, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    c.className = 'ev-v mb-8'; c.setAttribute('aria-roledescription', TX.carousel);
    c.innerHTML = '<div class="ev-t">' + items.concat(items.slice(0, 4)).map(function (it) { return '<div class="ev-s"><div class="group relative rounded-3xl overflow-hidden h-80 bg-gray-200 shadow-sm border border-white/60"><img src="' + BASE + it.img + '" alt="' + tr(it.t) + '" draggable="false" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"><div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div><div class="absolute bottom-4 left-4 right-4 bg-brand-card-dark/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-white/10"><p class="text-xs font-semibold">' + tr(it.t) + '</p><p class="text-[11px] text-gray-300 mt-0.5">' + tr(it.s) + '</p></div></div></div>' }).join('') + '</div>';
    var t = c.firstChild;
    function set(k, a) { t.style.transition = a ? '' : 'none'; t.style.transform = 'translate3d(' + (-k * c.clientWidth / pv).toFixed(1) + 'px,0,0)' }
    function size() { pv = parseInt(getComputedStyle(c).getPropertyValue('--pv')) || 1; set(i, 0) }
    function mv(d) { if (d < 0 && !i) { set(n, 0); void t.offsetWidth; i = n } i += d; set(i, 1) }
    function play() { clearInterval(tm); if (!RM) tm = setInterval(function () { if (!hov && vis && !document.hidden) mv(1) }, 3500) }
    t.addEventListener('transitionend', function (e) { if (e.target === t && i >= n) { i = 0; set(0, 0) } });
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) { c.addEventListener('mouseenter', function () { hov = 1 }); c.addEventListener('mouseleave', function () { hov = 0 }) }
    c.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX }, { passive: true });
    c.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) { mv(dx < 0 ? 1 : -1); play() } });
    addEventListener('resize', size); if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting }).observe(c);
    size(); play(); return function (d) { mv(d); play() }
})();
(function () { var t = document.querySelector(".marquee-track"); if (t && t.firstElementChild) { var c = t.firstElementChild.cloneNode(true); c.setAttribute("aria-hidden", "true"); t.appendChild(c) } })();
var toastT; function handleLead(e) {
    e.preventDefault(); var f = e.target, K = window.KKLM || {}, t = document.getElementById('toast');
    if (!f.checkValidity()) { f.reportValidity(); return } if (f.website && f.website.value) return;
    var d = new FormData(f); d.delete('website'); var b = Array.from(d.entries()).map(function (p) { return p[0] + ': ' + p[1] }).join('\n'), u = 'mailto:info@kklm.co.mz?subject=' + encodeURIComponent(f.dataset.subject || TX.subject) + '&body=' + encodeURIComponent(b);
    function say(h, p) { document.getElementById('toastH').textContent = h; document.getElementById('toastP').innerHTML = p; t.classList.remove('hidden'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.add('hidden') }, 10000) }
    var mail = '<a href="' + u + '" class="underline font-semibold">' + TX.openMail + '</a>';
    if (!K.formEndpoint) { say(TX.preparedH, TX.preparedP + mail + '.'); try { window.open(u, '_blank') } catch (_) { } return }
    var s = f.querySelector('button[type=submit]'); s.disabled = true;
    fetch(K.formEndpoint, { method: 'POST', body: d, headers: { Accept: 'application/json' } }).then(function (r) { if (!r.ok) throw 0; f.reset(); say(TX.sentH, TX.sentP) }).catch(function () { say(TX.failH, TX.failP + mail + '.') }).then(function () { s.disabled = false })
}
(function () {
    var r = document.getElementById('cgal'); if (!r) return; var it = [].slice.call(r.querySelectorAll('.cg-item')), n = it.length, gap = 26, W = 0, Hh = 0, iw = 0, st = 0, tot = 0, B = 0, cur = 0, tgt = 0, dr = 0, sx = 0, s0 = 0, hv = 0, vis = 1, run = 0, last = 0, red = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function draw() {
        var R = (Hh * Hh + B * B) / (2 * B); for (var i = 0; i < n; i++) {
            var x = ((i * st - cur) % tot + tot) % tot; if (x > tot / 2) x -= tot; var ex = Math.min(Math.abs(x), Hh), arc = R - Math.sqrt(R * R - ex * ex), rot = (x < 0 ? -1 : 1) * Math.asin(ex / R);
            it[i].style.transform = 'translate3d(' + (W / 2 - iw / 2 + x).toFixed(1) + 'px,' + arc.toFixed(1) + 'px,0) rotate(' + rot.toFixed(4) + 'rad)'
        }
    }
    function size() { W = r.clientWidth; Hh = W / 2; iw = Math.round(Math.min(290, Math.max(200, W * .26))); st = iw + gap; tot = st * n; B = W * .09; it.forEach(function (e) { e.style.width = iw + 'px' }); r.style.height = Math.round(24 + iw * 9 / 7 + 48 + B + 30) + 'px'; draw() }
    function frame(t) { if (!vis) { run = 0; return } var dt = Math.min(.05, (t - last) / 1000 || 0); last = t; if (!dr && !hv && !red) tgt += 55 * dt; cur += (tgt - cur) * Math.min(1, dt * 7); draw(); requestAnimationFrame(frame) }
    function go() { if (!run) { run = 1; last = performance.now(); requestAnimationFrame(frame) } }
    r.classList.add('cg-on'); size();
    r.addEventListener('pointerdown', function (e) { dr = 1; sx = e.clientX; s0 = tgt; r.classList.add('cg-grab'); try { r.setPointerCapture(e.pointerId) } catch (_) { } });
    r.addEventListener('pointermove', function (e) { if (dr) tgt = s0 - (e.clientX - sx) * 1.15 });
    ['pointerup', 'pointercancel'].forEach(function (k) { r.addEventListener(k, function () { dr = 0; r.classList.remove('cg-grab') }) });
    r.addEventListener('mouseenter', function () { hv = 1 }); r.addEventListener('mouseleave', function () { hv = 0 });
    r.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); tgt += e.deltaX } }, { passive: false });
    if (window.ResizeObserver) new ResizeObserver(size).observe(r.parentNode); else window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting ? 1 : 0; if (vis) go() }).observe(r); else go();
})();
(function () { var v = document.getElementById('purekVid'); if (!v || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return; v.muted = true; function on() { if (!v.getAttribute('src')) v.src = v.getAttribute('data-src'); v.play().catch(function () { }) } if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting) on(); else v.pause() }, { threshold: .35 }).observe(v); else on() })();
(function () {
    var c = document.getElementById('heroCar'); if (!c) return; var s = [].slice.call(c.querySelectorAll('.hs')), d = [].slice.call(document.querySelectorAll('#heroDots .hd')), L = document.getElementById('hcL'), T = document.getElementById('hcT'), p = c.parentNode, k = 0, t, x0 = null, red = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function show(n) { k = (n + s.length) % s.length; s.forEach(function (e, i) { e.classList.toggle('on', i === k) }); d.forEach(function (e, i) { e.classList.toggle('on', i === k) }); if (L) L.textContent = s[k].getAttribute('data-l'); if (T) T.textContent = s[k].getAttribute('data-t') }
    function stop() { clearInterval(t) } function play() { stop(); if (!red) t = setInterval(function () { show(k + 1) }, 5000) }
    d.forEach(function (e, i) { e.onclick = function () { show(i); play() } }); p.addEventListener('mouseenter', stop); p.addEventListener('mouseleave', play);
    p.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX }, { passive: true }); p.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { show(k + (dx < 0 ? 1 : -1)); play() } x0 = null });
    play();
})();
(function () {
    var $ = function (s, r) { return (r || document).querySelector(s) }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)) }, RM = matchMedia('(prefers-reduced-motion: reduce)').matches, EO = 'cubic-bezier(.23,1,.32,1)', cl = function (v, a, b) { return Math.max(a, Math.min(b, v)) };
    function when(el, fn, th) { if (!('IntersectionObserver' in window)) return fn(); var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn() } }) }, { threshold: th || .15, rootMargin: '0px 0px -6% 0px' }); io.observe(el) }
    /* Staggered Menu (React Bits) */
    var M = TX.menu, btn = $('#menuBtn');
    if (btn) {
        var sm = document.createElement('div'); sm.className = 'sm'; sm.setAttribute('role', 'dialog'); sm.setAttribute('aria-modal', 'true'); sm.setAttribute('aria-label', TX.menuLabel);
        sm.innerHTML = '<div class="sm-bd"></div><div class="sm-l sm-l1"></div><div class="sm-l sm-l2"></div><aside class="sm-p"><div class="sm-t"><img class="sm-lg" alt="KKLM Enterprise LDA"><button type="button" class="sm-x">' + TX.close + ' &times;</button></div><nav class="sm-n" aria-label="' + TX.sections + '">' + M.map(function (m, i) { return '<div class="sm-it"><a class="sm-a" href="' + SB + m[1] + '" style="--i:' + i + '"><span><b>0' + (i + 1) + '</b>' + m[0] + '</span></a></div>' }).join('') + '</nav><div class="sm-f"><span>+258 85 3034 000 &middot; info@kklm.co.mz</span><button type="button" class="sm-c">' + TX.cta + '</button></div></aside>';
        document.body.appendChild(sm); var fl = $('.ft-lg'); if (fl) $('.sm-lg', sm).src = fl.src;
        function setM(o) { sm.classList.toggle('open', o); document.body.style.overflow = o ? 'hidden' : ''; btn.setAttribute('aria-expanded', o); if (o) setTimeout(function () { $('.sm-x', sm).focus() }, 150); else btn.focus() }
        btn.addEventListener('click', function () { setM(true) }); $('.sm-x', sm).addEventListener('click', function () { setM(false) }); $('.sm-bd', sm).addEventListener('click', function () { setM(false) });
        $$('.sm-a', sm).forEach(function (a) { a.addEventListener('click', function (e) { if (a.getAttribute('href').charAt(0) !== '#') return; e.preventDefault(); setM(false); var t = $(a.getAttribute('href')); setTimeout(function () { if (t) t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }) }, 350) }) });
        $('.sm-c', sm).addEventListener('click', function () { setM(false); setTimeout(goContact, 380) });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sm.classList.contains('open')) setM(false) })
    }
    /* Stepper (React Bits) */
    var st = $('#steps'); if (st && $('.grid', st)) {
        var g = $('.grid', st), S = $$(':scope > div', g).map(function (d) { return [$('h3', d).textContent, $('p', d).textContent] }), n = S.length, k = 0, w = document.createElement('div'); w.className = 'stp';
        w.innerHTML = '<ol class="stp-h">' + S.map(function (s, i) { return '<li class="stp-i"><button type="button" class="stp-d" aria-label="' + TX.step + ' ' + (i + 1) + ': ' + s[0] + '"></button>' + (i < n - 1 ? '<span class="stp-k"><i></i></span>' : '') + '</li>' }).join('') + '</ol><div class="stp-v" aria-live="polite">' + S.map(function (s, i) { return '<div class="stp-c"><p class="text-xs font-semibold uppercase tracking-widest text-gold-dark mb-2">' + TX.step + ' ' + (i + 1) + ' ' + TX.of + ' ' + n + '</p><h3 class="font-bold font-heading text-2xl text-brand-dark mb-3">' + s[0] + '</h3><p class="text-sm text-gray-500 leading-relaxed max-w-lg">' + s[1] + '</p></div>' }).join('') + '</div><div class="stp-f"><button type="button" class="stp-b stp-bk">' + TX.prev + '</button><button type="button" class="stp-b stp-nx"></button></div>';
        g.replaceWith(w); var bk = $('.stp-bk', w), nx = $('.stp-nx', w);
        function go(i) { k = cl(i, 0, n - 1); $$('.stp-i', w).forEach(function (e, j) { e.classList.toggle('on', j === k); e.classList.toggle('dn', j < k); var b = $('.stp-d', e); b.innerHTML = j < k ? '&#10003;' : j + 1; if (j === k) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current') }); $$('.stp-c', w).forEach(function (e, j) { e.classList.toggle('on', j === k); e.style.setProperty('--x', (j < k ? -28 : 28) + 'px') }); bk.disabled = !k; nx.textContent = k === n - 1 ? TX.cta : TX.next }
        $$('.stp-d', w).forEach(function (b, j) { b.addEventListener('click', function () { go(j) }) }); bk.addEventListener('click', function () { go(k - 1) }); nx.addEventListener('click', function () { k === n - 1 ? goContact() : go(k + 1) });
        w.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') go(k + 1); if (e.key === 'ArrowLeft') go(k - 1) }); go(0)
    }
    if (RM) return;
    /* Texto: SplitText/BlurText, ShinyText, CountUp */
    function split(el) { var u = [];[].slice.call(el.childNodes).forEach(function (c) { if (c.nodeType === 3) { var f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(function (t) { if (!t) return; if (/^\s+$/.test(t)) f.appendChild(document.createTextNode(t)); else { var s = document.createElement('span'); s.className = 'sw'; s.textContent = t; f.appendChild(s); u.push(s) } }); el.replaceChild(f, c) } else if (c.nodeName !== 'BR') { c.classList.add('sw'); u.push(c) } }); return u }
    $$('main h1,main h2').forEach(function (h) { var u = split(h); u.forEach(function (x) { x.style.opacity = 0 }); when(h, function () { u.forEach(function (x, i) { x.animate([{ opacity: 0, filter: 'blur(10px)', transform: 'translateY(.5em)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: 650, delay: i * 55, easing: EO, fill: 'backwards' }).onfinish = function () { x.style.opacity = '' } }) }, .3) });
    var bd = $('main section span.inline-block'); if (bd) bd.classList.add('shiny');
    $$('main section:first-child .text-2xl.font-bold').forEach(function (el) { var v = parseInt(el.textContent, 10); if (!(v > 0)) return; el.textContent = '0'; when(el, function () { var t0 = performance.now(); (function f(t) { var p = cl((t - t0) / 1400, 0, 1); el.textContent = Math.round(v * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f) })(t0) }, .5) });
    /* Conteúdo animado (AnimatedContent/FadeContent) com scroll-trigger */
    function rev(el, d) { el.style.opacity = 0; when(el, function () { el.animate([{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: d || 0, easing: EO, fill: 'backwards' }).onfinish = function () { el.style.opacity = '' } }, .12) }
    var C = '[class*="rounded-3xl"],[class*="rounded-2xl"]', seen = new Map();
    $$('main section ' + C).filter(function (e) { return !e.closest('#cgal,#catalog-container,#heroCar,.stp') && !(e.parentElement && e.parentElement.closest(C)) }).forEach(function (e) { var p = e.parentElement, i = seen.get(p) || 0; seen.set(p, i + 1); rev(e, Math.min(i, 5) * 80) });
    $$('main section h2 + p,main section .tracking-widest,.ct-f,.ct-d').forEach(function (e) { rev(e, 120) }); var sp = $('.stp'); if (sp) rev(sp);
})();
(function () {
    var nb = document.getElementById('navPill'), pr = document.getElementById('navProg'); if (!nb) return;
    function f() { var y = window.scrollY || 0, h = document.documentElement.scrollHeight - innerHeight; nb.classList.toggle('nb-s', y > 12); pr.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')' } addEventListener('scroll', f, { passive: true }); f();
    var L = [].slice.call(document.querySelectorAll('.nav-l')), map = {}; L.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a });
    if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { L.forEach(function (a) { a.classList.remove('on') }); var a = map[e.target.id]; if (a) a.classList.add('on') } }) }, { rootMargin: '-35% 0px -60% 0px' }); Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s) }) }
})();
/* Botão voltar ao topo */
(function () {
    var b = document.getElementById('toTop'); if (!b) return;
    var on = false, tk = 0, rm = matchMedia('(prefers-reduced-motion: reduce)');
    function f() { tk = 0; var s = (window.scrollY || 0) > Math.max(400, innerHeight * .6); if (s !== on) { on = s; b.classList.toggle('show', s) } }
    addEventListener('scroll', function () { if (!tk) { tk = 1; requestAnimationFrame(f) } }, { passive: true }); addEventListener('resize', f); f();
    b.addEventListener('click', function () { try { scrollTo({ top: 0, behavior: rm.matches ? 'instant' : 'smooth' }) } catch (_) { scrollTo(0, 0) } var h = document.querySelector('header a'); if (h) h.focus({ preventScroll: true }) })
})();

/* Eventos (dados em assets/js/data.js) e nota dos formulários */
(function () {
    var K = window.KKLM || {}, g = document.getElementById('eventGrid');
    if (g) g.innerHTML = (K.events || []).map(function (e) { return '<article class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"><img src="' + BASE + e.imgs[0] + '" alt="' + tr(e.t) + '" class="w-full h-64 object-cover"><div class="p-6"><h3 class="font-bold font-heading text-lg text-brand-dark">' + tr(e.t) + '</h3><p class="text-xs text-gray-500 mt-1">' + tr(e.s) + (e.date ? ' · ' + e.date : '') + (e.place ? ' · ' + e.place : '') + '</p>' + (e.d ? '<p class="text-sm text-gray-600 mt-3 leading-relaxed">' + e.d + '</p>' : '') + '<div class="grid grid-cols-4 gap-2 mt-4">' + e.imgs.slice(1, 9).map(function (s) { return '<img src="' + BASE + s + '" alt="' + tr(e.t) + '" class="rounded-xl h-16 w-full object-cover">' }).join('') + '</div></div></article>' }).join('');
    if (K.formEndpoint) [].forEach.call(document.querySelectorAll('.ct-s p'), function (p) { p.textContent = TX.reply })
})();
