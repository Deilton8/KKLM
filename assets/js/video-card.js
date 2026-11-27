/* Cartão de vídeo minimalista. O clique abre o vídeo num diálogo cinematográfico (inspirado no Hero Video Dialog, 21st.dev):
   fecha com ESC, clique fora ou botão. Sem <dialog>, o vídeo toca no próprio cartão. */
(() => {
  const boxes = document.querySelectorAll('[data-vid]');
  if (!boxes.length) return;
  const en = document.documentElement.lang === 'en';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canDialog = typeof HTMLDialogElement === 'function';
  let dlg, wrap, vid, last;

  const build = () => {
    dlg = document.createElement('dialog');
    dlg.className = 'vid-dialog';
    dlg.setAttribute('aria-label', en ? 'Video player' : 'Leitor de vídeo');
    dlg.innerHTML = '<div class="vid-dialog__box"><div class="vid-dialog__wrap"><video controls playsinline></video></div>' +
      '<button type="button" class="vid-dialog__x" aria-label="' + (en ? 'Close' : 'Fechar') + '"><i class="fa-solid fa-xmark"></i></button></div>';
    document.body.appendChild(dlg);
    wrap = dlg.querySelector('.vid-dialog__wrap');
    vid = dlg.querySelector('video');
    const shut = () => {
      dlg.classList.remove('is-open');
      vid.pause();
      setTimeout(() => { dlg.close(); vid.removeAttribute('src'); vid.load(); if (last) last.focus(); }, reduce ? 0 : 260);
    };
    dlg.querySelector('.vid-dialog__x').addEventListener('click', shut);
    dlg.addEventListener('cancel', e => { e.preventDefault(); shut(); });
    dlg.addEventListener('click', e => { if (e.target === dlg || e.target.classList.contains('vid-dialog__box')) shut(); });
  };

  const open = (box, trigger) => {
    const v = box.querySelector('video'), s = v.querySelector('source');
    if (!dlg) build();
    last = trigger;
    const w = +v.getAttribute('width') || 16, h = +v.getAttribute('height') || 9;
    wrap.style.setProperty('--arn', w / h);
    vid.style.aspectRatio = w + ' / ' + h;
    vid.poster = v.poster;
    vid.src = s.src;
    dlg.showModal();
    requestAnimationFrame(() => requestAnimationFrame(() => dlg.classList.add('is-open')));
    vid.play().catch(() => {});
  };

  boxes.forEach(box => {
    const btn = box.querySelector('.vid__play'), v = box.querySelector('video');
    if (!btn || !v) return;
    btn.addEventListener('click', () => {
      if (canDialog) return open(box, btn);
      box.classList.add('is-on'); v.controls = true; v.play().catch(() => {});
    });
    v.addEventListener('ended', () => { box.classList.remove('is-on'); v.controls = false; v.load(); });
  });
})();
