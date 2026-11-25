// ------------------------------------------------------------------
// EDIT YOUR PROJECTS HERE. Each one is a stop on the line, in order.
//   picture and link are optional: leave them '' to hide the link
//   or show the blank picture frame.
// ------------------------------------------------------------------
const PROJECTS = [
  { name: 'Project One',   about: 'A short description of this project goes here.', tools: 'Tools and skills used', picture: '', link: '' },
  { name: 'Project Two',   about: 'A short description of this project goes here.', tools: 'Tools and skills used', picture: '', link: '' },
  { name: 'Project Three', about: 'A short description of this project goes here.', tools: 'Tools and skills used', picture: '', link: '' },
  { name: 'Project Four',  about: 'A short description of this project goes here.', tools: 'Tools and skills used', picture: '', link: '' },
  { name: 'Project Five',  about: 'A short description of this project goes here.', tools: 'Tools and skills used', picture: '', link: '' },
  { name: 'Project Six',   about: 'A short description of this project goes here.', tools: 'Tools and skills used', picture: '', link: '' },
];

(() => {
  // Two versions of the map. Points trace the painted red line;
  // each stop is [x, y, side the label sits on].
  const MAPS = {
    wide: { w: 1600, h: 900,
      line: [[150,690],[450,690],[650,490],[650,330],[750,230],[1010,230],[1190,410],[1190,560],[1310,680],[1470,680]],
      stops: [[210,690,'below'],[550,590,'right'],[650,380,'left'],[880,230,'above'],[1190,490,'right'],[1420,680,'below']] },
    tall: { w: 800, h: 1500,
      line: [[110,330],[380,330],[560,510],[560,620],[300,880],[300,1010],[480,1190],[480,1420]],
      stops: [[180,330,'below'],[470,420,'right'],[560,590,'left'],[400,780,'right'],[300,960,'left'],[480,1360,'right']] },
  };
  const $ = s => document.querySelector(s);
  const poster = $('.poster'), list = $('.stops'), sign = $('.sign');
  const svg = $('.line'), mask = svg.querySelector('path'), art = svg.querySelector('image');
  const tall = matchMedia('(max-aspect-ratio: 1/1)');
  let map, at = -1;          // at = the chosen stop, none to begin with

  const rounded = (pts, r) => {
    const toward = (p, q) => {
      const l = Math.hypot(q[0] - p[0], q[1] - p[1]), k = Math.min(r, l / 2) / l;
      return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
    };
    let d = `M${pts[0]}`;
    for (let i = 1; i < pts.length - 1; i++)
      d += ` L${toward(pts[i], pts[i - 1])} Q${pts[i]} ${toward(pts[i], pts[i + 1])}`;
    return `${d} L${pts.at(-1)}`;
  };

  const mark = i => {
    at = i;
    list.querySelectorAll('button').forEach((b, n) => b.classList.toggle('on', n === i));
  };

  const build = () => {
    const kind = tall.matches ? 'tall' : 'wide';
    map = MAPS[kind];
    poster.className = `poster ${kind}`;
    svg.setAttribute('viewBox', `0 0 ${map.w} ${map.h}`);
    mask.setAttribute('d', rounded(map.line, 60));
    art.setAttribute('href', `assets/map-${kind}-line.webp`);
    for (const el of [art, mask.parentNode]) {
      el.setAttribute('width', map.w);
      el.setAttribute('height', map.h);
    }
    list.replaceChildren(...PROJECTS.slice(0, map.stops.length).map((p, i) => {
      const [x, y, side] = map.stops[i];
      const li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button';
      b.className = `stop ${side}`;
      b.style.cssText = `left:${x / map.w * 100}%;top:${y / map.h * 100}%;--i:${i}`;
      const label = document.createElement('span');
      label.textContent = p.name;
      b.append(label);
      b.addEventListener('click', () => goTo(i));
      li.append(b);
      return li;
    }));
    mark(at);
  };

  const open = i => {
    const p = PROJECTS[i];
    $('.sign-stop').textContent = i + 1;
    $('#sign-title').textContent = p.name;
    $('.sign-about').textContent = p.about;
    $('.sign-tools').textContent = p.tools;
    const pic = $('.sign-pic');
    pic.replaceChildren();
    if (p.picture) {
      const im = new Image();
      im.src = p.picture;
      im.alt = p.name;
      pic.append(im);
    } else pic.textContent = 'Picture coming soon';
    const link = $('.sign-link');
    link.hidden = !p.link;
    if (p.link) link.href = p.link;
    $('[data-step="-1"]').disabled = i === 0;
    $('[data-step="1"]').disabled = i === list.children.length - 1;
    if (!sign.open) sign.showModal();
  };

  const goTo = i => { mark(i); open(i); };

  sign.addEventListener('click', e => {
    const step = e.target.closest('[data-step]');
    if (step) { const next = at + Number(step.dataset.step); goTo(next); return; }
    if (e.target === sign || e.target.closest('.sign-close')) sign.close();
  });
  sign.addEventListener('close', () => list.querySelectorAll('button')[at]?.focus({ preventScroll: true }));
  tall.addEventListener('change', build);
  build();
})();
