// A watercolor subway train passes between pages. The old page sends it in,
// the new page picks it up mid-pass and lets it leave.
(() => {
  const KEY = 'train';
  const PASS = 1400;                       // ms for the whole train to go by
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const track = document.createElement('div');
  track.className = 'track';
  track.setAttribute('aria-hidden', 'true');
  // Extra middle cars are added only if the window is too wide for one to cover it.
  // Widths are for images 814px tall: front/back 1204, middle 1259; the nose slopes for 480.
  const scale = (innerHeight - 56) / 814;
  const middles = Math.max(1, Math.ceil((innerWidth / scale * 1.15 - 2 * (1204 - 480)) / 1259));
  const car = (n, w) => `<img src="assets/subway-${n}.webp" width="${w}" height="814" alt="">`;
  track.innerHTML = '<div class="train">' +
    car('front', 1204) + car('middle', 1259).repeat(middles) + car('back', 1204) + '</div>';
  document.body.append(track);
  const train = track.firstChild;
  const ready = Promise.race([
    Promise.all([...train.children].map(i => i.decode())).catch(() => {}),
    new Promise(r => setTimeout(r, 1500)),
  ]);

  const width = () => train.offsetWidth;
  const speed = () => (3667 * scale + innerWidth) / PASS;   // px per ms
  let anim;
  const run = (from, to) => {
    track.classList.add('running');
    anim?.cancel();
    anim = train.animate(
      [{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }],
      { duration: Math.abs(to - from) / speed(), easing: 'linear', fill: 'forwards' });
    return anim;
  };
  const reset = () => { anim?.cancel(); anim = null; track.classList.remove('running'); };

  let saved = null;
  try { saved = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch {}
  if (saved !== null && root.classList.contains('arriving')) {
    ready.then(() => {
      // saved = how much of the train had gone past the left edge (0 to 1)
      const a = run(-saved * width(), -width());
      root.classList.remove('arriving');
      a.onfinish = reset;
    });
  } else {
    root.classList.remove('arriving');
  }

  let leaving = false;
  // Back/forward can restore a page frozen mid-pass
  addEventListener('pageshow', e => { if (e.persisted) { reset(); leaving = false; } });

  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-page]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (leaving || a.getAttribute('aria-current')) return;
    leaving = true;
    ready.then(() => {
      // Swap pages once the sloped nose (40% of the front car) is fully past the left edge
      const covered = -0.4 * train.firstChild.offsetWidth;
      run(innerWidth, covered).onfinish = () => {
        try { sessionStorage.setItem(KEY, String(-covered / width())); } catch {}
        location.href = a.href;
      };
    });
  });
})();
