/* Carrossel automático dos heróis: troca suave de imagens, barras de progresso clicáveis e botão de pausa.
   Pausa com o cursor ou o foco em cima, com o separador oculto e (começa pausado) com «reduzir movimento». */
(() => {
  const figs = document.querySelectorAll('[data-hc]');
  if (!figs.length) return;
  const en = document.documentElement.lang === 'en';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  figs.forEach(fig => {
    const slides = [...fig.querySelectorAll('.hc__s')];
    if (slides.length < 2) return;
    let cur = 0, userPause = reduce, hov = false, foc = false;

    const nav = document.createElement('div');
    nav.className = 'hc__bars';
    const bars = slides.map((_, k) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'hc__bar'; b.innerHTML = '<i></i>';
      b.setAttribute('aria-label', (en ? 'Image ' : 'Imagem ') + (k + 1) + (en ? ' of ' : ' de ') + slides.length);
      b.addEventListener('click', () => show(k));
      b.firstChild.addEventListener('animationend', () => show(cur + 1));
      nav.appendChild(b);
      return b;
    });
    const pause = document.createElement('button');
    pause.type = 'button'; pause.className = 'hc__pause';
    fig.append(nav, pause);

    const sync = () => {
      fig.classList.toggle('is-paused', userPause || hov || foc || document.hidden);
      pause.setAttribute('aria-label', userPause ? (en ? 'Resume slideshow' : 'Retomar apresentação') : (en ? 'Pause slideshow' : 'Pausar apresentação'));
      pause.innerHTML = '<i class="fa-solid fa-' + (userPause ? 'play' : 'pause') + '"></i>';
    };
    const show = k => {
      slides[cur].classList.remove('is-on'); slides[cur].setAttribute('aria-hidden', 'true');
      cur = (k + slides.length) % slides.length;
      slides[cur].classList.add('is-on'); slides[cur].removeAttribute('aria-hidden');
      bars.forEach((b, j) => { b.classList.remove('is-on'); b.classList.toggle('is-done', j < cur); });
      void fig.offsetWidth;                       // reinicia a animação da barra ativa
      bars[cur].classList.add('is-on');
    };

    pause.addEventListener('click', () => { userPause = !userPause; sync(); });
    fig.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hov = true; sync(); } });
    fig.addEventListener('pointerleave', () => { hov = false; sync(); });
    fig.addEventListener('focusin', () => { foc = true; sync(); });
    fig.addEventListener('focusout', () => { foc = false; sync(); });
    document.addEventListener('visibilitychange', sync);
    show(0); sync();
  });
})();
