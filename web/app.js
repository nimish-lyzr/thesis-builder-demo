/* Thesis Builder — guided product demo.

   One persistent app shell; fifteen screens swap inside its canvas. A tour is
   a list of steps, each anchored to a real element on a real screen: a card
   with readable text sits next to the element, a scrim with a cutout keeps
   the rest of the product legible, and narration — if it is on at all — is an
   extra, never the carrier. Nothing plays until the reader presses Start. */

(function () {
'use strict';

/* ============================ tiny renderer ============================ */

function get(vals, path) {
  var parts = path.split('.'), v = vals;
  for (var i = 0; i < parts.length && v != null; i++) v = v[parts[i]];
  return v;
}

function each(root, sel, fn) {
  if (root.matches && root.matches(sel)) fn(root);
  var list = root.querySelectorAll(sel);
  for (var i = 0; i < list.length; i++) {
    var owner = list[i].parentElement, skip = false;
    while (owner && owner !== root) {
      if (owner.hasAttribute('data-list')) { skip = true; break; }
      owner = owner.parentElement;
    }
    if (!skip) fn(list[i]);
  }
}

function paint(root, vals) {
  each(root, '[data-bind]', function (el) {
    var v = get(vals, el.getAttribute('data-bind'));
    var txt = v == null ? '' : String(v);
    if (el.textContent !== txt) el.textContent = txt;
  });
  each(root, '[data-cond]', function (el) { el.hidden = !get(vals, el.getAttribute('data-cond')); });
  each(root, '[data-style-tpl]', function (el) {
    var css = el.getAttribute('data-style-tpl').replace(/\[\[([\w.]+)\]\]/g, function (_, p) {
      var x = get(vals, p); return x == null ? '' : String(x);
    });
    if (el.style.cssText !== css) el.style.cssText = css;
  });
  each(root, '[data-attr-onclick], [data-attr-onchange], [data-attr-class], [data-attr-d], [data-attr-value], [data-attr-disabled], [data-attr-aria-pressed]', function (el) {
    for (var a = 0; a < el.attributes.length; a++) {
      var name = el.attributes[a].name;
      if (name.indexOf('data-attr-') !== 0) continue;
      var target = name.slice(10), val = get(vals, el.attributes[a].value);
      if (target.indexOf('on') === 0) {
        var evt = target.slice(2);
        el['_fn_' + evt] = val;
        if (!el['_on_' + evt]) {
          el['_on_' + evt] = 1;
          (function (node, type) {
            node.addEventListener(type, function (e) { var fn = node['_fn_' + type]; if (typeof fn === 'function') fn(e); });
          })(el, evt);
        }
      } else if (target === 'disabled') el.disabled = !!val;
      else if (target === 'value') { if (document.activeElement !== el && el.value !== val) el.value = val == null ? '' : val; }
      else el.setAttribute(target, val == null ? '' : val);
    }
  });
  each(root, '[data-list]', function (el) {
    var items = get(vals, el.getAttribute('data-list')) || [];
    var alias = el.getAttribute('data-as') || 'item';
    if (el._tpl === undefined) { el._tpl = el.innerHTML.trim(); el.innerHTML = ''; }
    while (el.children.length > items.length) el.removeChild(el.lastChild);
    while (el.children.length < items.length) {
      var holder = document.createElement('div'); holder.innerHTML = el._tpl;
      el.appendChild(holder.firstElementChild || holder);
    }
    for (var j = 0; j < items.length; j++) {
      var scope = Object.create(vals); scope[alias] = items[j];
      paint(el.children[j], scope);
    }
  });
}

function $(id) { return document.getElementById(id); }

/* ============================ screens & personas ============================ */

var SCREENS = [
  { id: 'start',       n: 0,  title: 'Pick a walkthrough', shell: false },
  { id: 'onboarding',  n: 1,  title: 'Onboarding', shell: false, audio: '01-onboarding' },
  { id: 'team',        n: 2,  title: 'Your research team', shell: false, audio: '02-team' },
  { id: 'question',    n: 3,  title: 'Your first thesis', shell: false, audio: '03-question' },
  { id: 'globe',       n: 4,  title: 'Home · Researching', shell: true, nav: 'globelive', audio: '04-globe' },
  { id: 'market',      n: 5,  title: 'AI Infrastructure · Overview', shell: true, nav: 'market', audio: '05-market' },
  { id: 'whitespace',  n: 6,  title: 'AI Infrastructure · Market map', shell: true, nav: 'market', audio: '06-whitespace' },
  { id: 'companies',   n: 7,  title: 'AI Infrastructure · Companies', shell: true, nav: 'companies', audio: '07-companies' },
  { id: 'company',     n: 8,  title: 'Companies · Company B', shell: true, nav: 'companies', audio: '08-company' },
  { id: 'thesis',      n: 9,  title: 'AI Infrastructure · Thesis', shell: true, nav: 'market', audio: '09-thesis' },
  { id: 'collaborate', n: 10, title: 'AI Infrastructure · Review', shell: true, nav: 'market', audio: '10-collaborate' },
  { id: 'fastforward', n: 11, title: 'Home · 30 days later', shell: true, nav: 'globelive', audio: '11-fastforward' },
  { id: 'signal',      n: 12, title: 'Signals · Thesis-affecting', shell: true, nav: 'signal', audio: '12-signal' },
  { id: 'evolution',   n: 13, title: 'Signals · Proposed update', shell: true, nav: 'signal', audio: '13-evolution' },
  { id: 'globelive',   n: 14, title: 'Home', shell: true, nav: 'globelive', audio: '14-globelive' }
];
var byId = {};
SCREENS.forEach(function (s) { byId[s.id] = s; });

var PERSONAS = {
  practice: {
    label: 'Head of AI & Data Practice',
    short: 'Practice lead',
    order: ['whitespace', 'companies', 'company', 'thesis', 'collaborate', 'fastforward', 'signal', 'evolution', 'globelive'],
    h: 'The market map your team can argue with',
    lede: 'You start on the market map: eight segments placed by how contested they are, the gap nobody has built into, and the thread where your practice lead changes the thesis.',
    q: '“Where is the opportunity our clients keep describing, and does the thesis reflect what we already know?”',
    stats: [['Segments mapped', '8, by competitive density'], ['Whitespace gaps', '4 · one of them unserved'], ['Relevant to Accenture', '23 of 126 companies']],
    intro: '00-persona-practice-lead'
  },
  ventures: {
    label: 'Ventures / Investment Lead',
    short: 'Ventures lead',
    order: ['companies', 'company', 'whitespace', 'market', 'thesis', 'fastforward', 'signal', 'evolution', 'globelive'],
    h: '126 companies, scored against your thesis',
    lede: 'You start on the company universe: fit scores, stage, the latest signal on each one — and a column you can point at the whole list in plain English.',
    q: '“Which of these companies are worth a first conversation this quarter?”',
    stats: [['Companies scored', '126 · sorted by fit'], ['Top thesis fit', '91 / 100'], ['Asked of all 126', 'Who has Fortune 500 customers']],
    intro: '00-persona-ventures'
  },
  client: {
    label: 'Client Account Lead',
    short: 'Account lead',
    order: ['thesis', 'collaborate', 'whitespace', 'companies', 'fastforward', 'signal', 'evolution', 'globelive'],
    h: 'Something you can put in front of a client on Monday',
    lede: 'You start on the finished thesis: six sections, eighteen slides in Accenture’s template, and every claim with the source it came from attached.',
    q: '“Can I stand behind this in a client room, and will it still be true next month?”',
    stats: [['Slides generated', '18, action-titled'], ['Sources cited', '142 · all linked'], ['Time to build', '4 min 12 s']],
    intro: '00-persona-client-partner'
  },
  full: {
    label: 'The whole story',
    short: 'Full tour',
    order: ['onboarding', 'team', 'question', 'globe', 'market', 'whitespace', 'companies', 'company', 'thesis', 'collaborate', 'fastforward', 'signal', 'evolution', 'globelive'],
    h: 'From one question to a thesis that updates itself',
    lede: 'Onboarding, the five agents, the globe as they research, the market, the gap, the companies, the finished thesis, a colleague’s comment — then thirty days pass and the thesis proposes its own update.',
    q: '“Where should Accenture be investing or focusing within AI infrastructure over the next three to five years?”',
    stats: [['Screens', '14'], ['Agents at work', '5'], ['Ends on', 'Your live globe']],
    intro: '00-persona-full-tour'
  }
};

/* ============================ state ============================ */

var current = null;           // SCREENS entry
var controllers = {};
var persona = null;           // key into PERSONAS
var tour = {
  steps: [], i: -1, running: false, paused: false, hiddenByNav: false,
  muted: false, blocked: false
};
try { tour.muted = localStorage.getItem('tb-muted') === '1'; } catch (e) {}

/* ============================ router & shell ============================ */

function show(id, opts) {
  opts = opts || {};
  var screen = byId[id];
  if (!screen) return;
  if (current && controllers[current.id] && controllers[current.id].leave) controllers[current.id].leave();
  var views = document.querySelectorAll('.view');
  for (var i = 0; i < views.length; i++) views[i].hidden = views[i].id !== 'v-' + id;
  current = screen;
  if (history.replaceState) history.replaceState(null, '', '#' + id);

  $('side').hidden = !screen.shell;
  $('persona-menu').hidden = id === 'start';
  $('replay-tour').hidden = id === 'start';
  $('reset-demo').hidden = id === 'start';
  $('hdr-ctx').textContent = id === 'start' ? 'Thesis Builder' : screen.title;
  var navs = document.querySelectorAll('[data-nav]');
  for (var n = 0; n < navs.length; n++) navs[n].classList.toggle('on', navs[n].getAttribute('data-nav') === screen.nav);

  var el = $('v-' + id);
  el.scrollTop = 0;
  restartAnimations(el);
  if (controllers[id] && controllers[id].enter) controllers[id].enter(el);

  // the reader steering away from the step's screen pauses the tour, quietly
  if (tour.running && !opts.byTour) {
    var step = tour.steps[tour.i];
    if (step && step.screen !== id) hideTourForNav();
  }
}

function restartAnimations(el) {
  if (!el.getAnimations) return;
  var anims = el.getAnimations({ subtree: true });
  for (var i = 0; i < anims.length; i++) { try { anims[i].cancel(); anims[i].play(); } catch (e) {} }
}

document.addEventListener('click', function (e) {
  var a = e.target.closest ? e.target.closest('[data-go]') : null;
  if (!a) return;
  e.preventDefault();
  show(a.getAttribute('data-go'));
});

window.addEventListener('hashchange', function () {
  var id = (location.hash || '').replace('#', '');
  if (byId[id] && (!current || current.id !== id)) show(id);
});

/* -- persona menu ------------------------------------------------------- */
function renderPersonaMenu() {
  $('persona-label').textContent = persona ? PERSONAS[persona].short : '—';
  var pop = $('persona-pop'); pop.innerHTML = '';
  Object.keys(PERSONAS).forEach(function (key) {
    var p = PERSONAS[key];
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'option');
    b.className = key === persona ? 'on' : '';
    b.innerHTML = '<span class="chk">' + (key === persona ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12.5 5.2 5.2L20 7"></path></svg>' : '') + '</span><span><b></b><small></small></span>';
    b.querySelector('b').textContent = p.label;
    b.querySelector('small').textContent = 'Starts on ' + shortTitle(byId[p.order[0]]) + ' · ' + stepsFor(key).length + ' steps';
    b.onclick = function () { closePersonaMenu(); choosePersona(key); };
    pop.appendChild(b);
  });
}
function shortTitle(screen) { var t = screen.title; var i = t.lastIndexOf('\u00b7'); return i > -1 ? t.slice(i + 1).trim() : t; }
function closePersonaMenu() { $('persona-pop').hidden = true; $('persona-btn').setAttribute('aria-expanded', 'false'); }
$('persona-btn').onclick = function () {
  var open = $('persona-pop').hidden;
  $('persona-pop').hidden = !open;
  $('persona-btn').setAttribute('aria-expanded', open ? 'true' : 'false');
};
document.addEventListener('click', function (e) { if (!$('persona-menu').contains(e.target)) closePersonaMenu(); });

/* -- persona banner ----------------------------------------------------- */
function showBanner() {
  var p = PERSONAS[persona];
  $('banner-persona').textContent = p.label;
  $('banner-h').textContent = p.h;
  $('banner-lede').textContent = p.lede;
  $('banner-q').textContent = p.q;
  var st = $('banner-stats'); st.innerHTML = '';
  p.stats.forEach(function (s) {
    var span = document.createElement('span');
    var small = document.createElement('small'); small.textContent = s[0];
    var b = document.createElement('b'); b.textContent = s[1];
    span.appendChild(small); span.appendChild(b); st.appendChild(span);
  });
  $('banner-note').textContent = stepsFor(persona).length + ' steps · narrated · about ' + Math.max(2, Math.round(stepsFor(persona).length * 0.2)) + ' minutes';
  $('banner').hidden = false;
}
function hideBanner() { $('banner').hidden = true; }
$('banner-dismiss').onclick = hideBanner;
$('banner-x').onclick = hideBanner;
$('banner-start').onclick = function () { hideBanner(); startTour(); };

function choosePersona(key) {
  persona = key;
  endTour(true);
  renderPersonaMenu();
  show(PERSONAS[key].order[0]);
  showBanner();
}

$('replay-tour').onclick = function () {
  if (!persona) persona = 'full';
  hideBanner();
  startTour();
};
$('reset-demo').onclick = function () {
  endTour(true);
  persona = null;
  try { localStorage.removeItem('tb-muted'); } catch (e) {}
  location.hash = '';
  location.reload();
};

/* ============================ the tour ============================ */

/* Which per-step recordings exist. Written by tools/build_web.py from
   web/audio/steps/; a step without one falls back to its screen's recording. */
var STEP_AUDIO = {};
fetch('audio/steps.json').then(function (r) { return r.ok ? r.json() : []; })
  .then(function (list) { (list || []).forEach(function (f) { STEP_AUDIO[f] = 1; }); })
  .catch(function () {});

var audio = new Audio();
audio.preload = 'auto';
var readTimer = null, anchorRaf = 0, trackRaf = 0, anchorEl = null, audioMissing = false;

function stepsFor(key) {
  var out = [];
  PERSONAS[key].order.forEach(function (sid) {
    (STEPS[sid] || []).forEach(function (st, k) {
      out.push({ screen: sid, k: k + 1, title: st.t, body: st.b, sel: st.sel, up: st.up || 0,
                 audio: STEP_AUDIO[sid + '-' + (k + 1) + '.mp3'] ? 'audio/steps/' + sid + '-' + (k + 1) + '.mp3' : null,
                 fallback: k === 0 && byId[sid].audio ? 'audio/' + byId[sid].audio + '.mp3' : null });
    });
  });
  return out;
}

function startTour() {
  tour.steps = stepsFor(persona);
  tour.running = true; tour.paused = false; tour.hiddenByNav = false; tour.blocked = false;
  $('tour-resume').hidden = true;
  goStep(0);
}

function endTour(silent) {
  tour.running = false; tour.paused = false; tour.hiddenByNav = false;
  clearTimeout(readTimer); cancelAnimationFrame(anchorRaf); cancelAnimationFrame(trackRaf);
  audio.pause();
  $('tour').hidden = true;
  $('tour-resume').hidden = true;
  anchorEl = null;
  if (!silent && persona) {
    // finishing the tour leaves you on the live globe, exploring
    $('tour-resume').hidden = true;
  }
}

function hideTourForNav() {
  tour.hiddenByNav = true;
  clearTimeout(readTimer); cancelAnimationFrame(anchorRaf); cancelAnimationFrame(trackRaf);
  audio.pause();
  $('tour').hidden = true;
  var st = tour.steps[tour.i];
  $('tour-resume-step').textContent = 'step ' + (tour.i + 1) + ' of ' + tour.steps.length;
  $('tour-resume').hidden = false;
  void st;
}
$('tour-resume').onclick = function () {
  tour.hiddenByNav = false; tour.paused = false;
  $('tour-resume').hidden = true;
  goStep(tour.i);
};

function goStep(i) {
  if (i < 0) i = 0;
  if (i >= tour.steps.length) { endTour(); return; }
  clearTimeout(readTimer); cancelAnimationFrame(anchorRaf); cancelAnimationFrame(trackRaf);
  tour.i = i; tour.paused = false; tour.hiddenByNav = false;
  var step = tour.steps[i];
  $('tc-paused').hidden = true;
  if (!current || current.id !== step.screen) show(step.screen, { byTour: true });
  renderCard(step);
  $('tour').hidden = false;
  resolveAnchor(step);
  playStep(step);
}

function renderCard(step) {
  $('tc-count').textContent = pad(tour.i + 1) + ' / ' + pad(tour.steps.length);
  $('tc-title').textContent = step.title;
  $('tc-body').textContent = step.body;
  var dots = $('tc-dots'); dots.innerHTML = '';
  tour.steps.forEach(function (_, k) {
    var d = document.createElement('button'); d.type = 'button';
    d.setAttribute('aria-label', 'Step ' + (k + 1));
    d.className = k === tour.i ? 'on' : '';
    d.onclick = function () { goStep(k); };
    dots.appendChild(d);
  });
  $('tc-back').hidden = tour.i === 0;
  $('tc-next').textContent = tour.i === tour.steps.length - 1 ? 'Finish' : 'Next';
  renderMute();
}
function pad(n) { return (n < 10 ? '0' : '') + n; }

function renderMute() {
  var b = $('tc-mute'), label = $('tc-mute-label');
  b.classList.toggle('off', tour.muted);
  b.classList.toggle('blocked', !tour.muted && tour.blocked);
  b.querySelector('path').setAttribute('d', tour.muted || tour.blocked
    ? 'M11 5 6 9H3v6h3l5 4zM17 9.5l4.5 5M21.5 9.5l-4.5 5'
    : 'M11 5 6 9H3v6h3l5 4zM16 9.5a4 4 0 0 1 0 5M19 7a8 8 0 0 1 0 10');
  label.hidden = !(tour.blocked && !tour.muted);
  b.setAttribute('aria-label', tour.muted ? 'Play narration' : (tour.blocked ? 'Play narration' : 'Mute narration'));
}

/* -- anchors: find the live element, scroll it into view, follow it ------ */
function anchorFor(step) {
  if (!step.sel) return null;
  var view = $('v-' + step.screen);
  var el = view.querySelector(step.sel);
  for (var u = 0; el && u < step.up; u++) el = el.parentElement;
  return el && el !== view ? el : null;
}

function resolveAnchor(step) {
  anchorEl = null;
  placeCard(null);
  var started = performance.now(), scrolled = false, scrolledAt = 0;
  var tick = function (t) {
    var el = anchorFor(step);
    if (el) {
      anchorEl = el;
      if (!scrolled) { scrolled = true; scrolledAt = t; el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      placeCard(el.getBoundingClientRect());
      if (t - scrolledAt < 1600) anchorRaf = requestAnimationFrame(tick);
      return;
    }
    if (t - started < 4000) anchorRaf = requestAnimationFrame(tick);
  };
  anchorRaf = requestAnimationFrame(tick);
}
function refollow() { if (anchorEl && !$('tour').hidden) placeCard(anchorEl.getBoundingClientRect()); }
window.addEventListener('resize', refollow);
window.addEventListener('scroll', refollow, true);

function placeCard(r) {
  var scrim = $('tour-scrim'), ring = $('tour-ring'), card = $('tour-card');
  var vw = window.innerWidth, vh = window.innerHeight, W = 340, H = card.offsetHeight || 200;
  if (!r || !r.width) {
    scrim.style.clipPath = '';
    ring.classList.remove('on');
    card.style.top = Math.round(vh / 2 - H / 2) + 'px';
    card.style.left = Math.round(vw / 2 - W / 2) + 'px';
    return;
  }
  var b = { top: r.top - 8, left: r.left - 8, width: r.width + 16, height: r.height + 16 };
  scrim.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ' + b.top + 'px, ' + b.left + 'px ' + b.top + 'px, ' +
    b.left + 'px ' + (b.top + b.height) + 'px, ' + (b.left + b.width) + 'px ' + (b.top + b.height) + 'px, ' +
    (b.left + b.width) + 'px ' + b.top + 'px, 0 ' + b.top + 'px)';
  ring.style.top = b.top + 'px'; ring.style.left = b.left + 'px';
  ring.style.width = b.width + 'px'; ring.style.height = b.height + 'px';
  ring.classList.add('on');

  var clampY = function (y) { return Math.max(16, Math.min(vh - H - 16, y)); };
  var clampX = function (x) { return Math.max(16, Math.min(vw - W - 16, x)); };
  var below = b.top + b.height + 12, x, y;
  if (below + H + 16 <= vh)                  { y = below; x = clampX(b.left); }
  else if (b.top - 12 - H >= 16)             { y = b.top - 12 - H; x = clampX(b.left); }
  else if (b.left + b.width + 12 + W + 16 <= vw) { y = clampY(b.top); x = b.left + b.width + 12; }
  else if (b.left - 12 - W >= 16)            { y = clampY(b.top); x = b.left - 12 - W; }
  else                                       { y = clampY(b.top + b.height / 2 - H / 2); x = clampX(b.left); }
  card.style.top = Math.round(y) + 'px'; card.style.left = Math.round(x) + 'px';
}

/* -- audio: per-step file, falling back to the screen's recording -------- */
var playGen = 0;
function playStep(step) {
  audio.pause();
  audioMissing = false;
  if (tour.muted) { armReadTimer(step); renderMute(); return; }
  var tryPlay = function (src, onFail) {
    var gen = ++playGen;
    var failed = false;
    var fail = function () { if (gen !== playGen || failed) return; failed = true; onFail(); };
    audio.onerror = fail;
    audio.src = src;
    audio.currentTime = 0;
    var p = audio.play();
    if (p && p.then) p.then(function () {
      if (gen !== playGen) return;
      tour.blocked = false; renderMute();
    }, function (err) {
      if (gen !== playGen) return;
      // a missing file rejects as well as erroring; anything else is the
      // browser asking for a gesture first
      if (audio.error || (err && err.name === 'NotSupportedError')) { fail(); return; }
      tour.blocked = true; renderMute(); armReadTimer(step);
    });
  };
  var noAudio = function () { audioMissing = true; armReadTimer(step); };
  if (step.audio) tryPlay(step.audio, function () { if (step.fallback) tryPlay(step.fallback, noAudio); else noAudio(); });
  else if (step.fallback) tryPlay(step.fallback, noAudio);
  else noAudio();
}
audio.addEventListener('ended', function () {
  if (!tour.running || tour.paused || tour.hiddenByNav) return;
  // a screen-level recording covers every step of its screen: hold, then move on
  var step = tour.steps[tour.i];
  if (step && (!step.audio || audio.src.indexOf(step.audio) === -1)) { armReadTimer(step, 1200); return; }
  goStep(tour.i + 1);
});

/* Without audio the card still paces itself: reading time, never less than
   six seconds, and Next always wins. */
function armReadTimer(step, minMs) {
  clearTimeout(readTimer);
  var words = (step.title + ' ' + step.body).split(/\s+/).length;
  var ms = Math.max(minMs || 6000, words * 400 + 1800);
  readTimer = setTimeout(function () {
    if (tour.running && !tour.paused && !tour.hiddenByNav) goStep(tour.i + 1);
  }, ms);
}

/* anything the reader does in the product pauses auto-advance */
$('canvas').addEventListener('click', function (e) {
  if (!tour.running || $('tour').hidden) return;
  if (e.target.closest && e.target.closest('#banner')) return;
  tour.paused = true;
  clearTimeout(readTimer);
  $('tc-paused').hidden = false;
});

$('tc-next').onclick = function () { goStep(tour.i + 1); };
$('tc-back').onclick = function () { goStep(tour.i - 1); };
$('tc-skip').onclick = function () { endTour(); };
$('tour-scrim').onclick = function () { endTour(); };
$('tc-mute').onclick = function () {
  if (tour.blocked && !tour.muted) { tour.blocked = false; playStep(tour.steps[tour.i]); return; }
  tour.muted = !tour.muted;
  try { localStorage.setItem('tb-muted', tour.muted ? '1' : '0'); } catch (e) {}
  if (tour.muted) { audio.pause(); armReadTimer(tour.steps[tour.i]); }
  else playStep(tour.steps[tour.i]);
  renderMute();
};
window.addEventListener('keydown', function (e) {
  if (!tour.running || $('tour').hidden) return;
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
  if (e.key === 'Escape') endTour();
  if (e.key === 'ArrowRight') goStep(tour.i + 1);
  if (e.key === 'ArrowLeft') goStep(tour.i - 1);
});

/* ============================ steps ============================ */
/* t = card title, b = card body (what is also spoken), sel/up = the anchor:
   a selector inside the screen, then `up` parents to climb to the block. */

var STEPS = {
  onboarding: [
    { t: 'It starts with you, not the market', b: 'Thesis Builder asks who you are before it asks what you want to know. Company, what you do, your priorities and geography — everything the agents find later is scored against this.', sel: '#co', up: 3 },
    { t: 'Priorities become the scoring model', b: 'These four chips are not tags. They are the weights the Strategy Agent uses to decide what “relevant to Accenture” means on every screen that follows.', sel: '.chip', up: 2 },
    { t: 'Invest, partner, acquire — or just watch', b: 'Track Market is selected, so the agents keep researching after the thesis is written. Pick Invest and the same run produces a pipeline instead.', sel: '.pick', up: 1 }
  ],
  team: [
    { t: 'Five agents, one brief', b: 'Each agent does one job: read the market, find gaps, research companies, connect it to Accenture, keep watching. They already know your priorities from the last screen.', sel: '.agent', up: 1 },
    { t: 'The one that never stops', b: 'The Signal Agent is the reason this is a system and not a report. It keeps monitoring after the thesis ships, and only speaks when something changes a decision.', sel: '.agent:nth-of-type(5)', up: 0 }
  ],
  question: [
    { t: 'One question is the whole brief', b: 'No forms. The question you would put to a strategy team is the input. The agents turn it into a research plan, a market map and a company universe.', sel: '.caret', up: 2 },
    { t: 'What matters most weights the answer', b: 'Tick what you care about and the scoring follows. Strategic relevance is weighted highest; investment opportunities is off, because this seat is tracking the market, not deploying capital.', sel: '.matter', up: 1 }
  ],
  globe: [
    { t: 'The agents are reading the market', b: 'Every node is a place where something relevant to AI infrastructure is happening right now. The camera follows each new finding as it lands.', sel: 'canvas', up: 0 },
    { t: 'Live activity, as the sweep travels', b: 'What you read here and what you see on the globe are the same event at the same moment — sources read, companies found, gaps forming.', sel: '[data-list="feed"]', up: 1 },
    { t: 'Four minutes. 142 sources. 41 countries.', b: 'You can leave. The run finishes on its own and the thesis appears in your workspace.', sel: '.stat', up: 1 }
  ],
  market: [
    { t: 'What the market looks like today', b: 'A hundred and twenty-six relevant companies across eight segments. Twenty-three matter to Accenture specifically. Four places where nobody has built what enterprises are asking for.', sel: '.kpi', up: 1 },
    { t: 'Eight segments, four measures each', b: 'Maturity, competitive density, investment activity and relevance. The relevance bar is the one that is yours — it comes straight from what you said at onboarding.', sel: '.cat', up: 1 }
  ],
  whitespace: [
    { t: 'Segments placed by how contested they are', b: 'Crowded on the left, genuinely open on the right. This is the answer to “so what”: where a point of view is still worth having.', sel: '.col', up: 1 },
    { t: 'Named need, no credible supply', b: 'Agent Identity & Access. Three companies, none past Series A, while fourteen enterprise programmes in your knowledge base name it as a blocker.', sel: '.col:last-child', up: 0 },
    { t: 'Demand ninety-two, supply fourteen', b: 'The Whitespace Agent cites thirty-one sources for this. Two hyperscalers have shipped adjacent identity primitives — which is why monitoring is already armed on this gap.', sel: '.gap', up: 2 }
  ],
  companies: [
    { t: 'Who is building in this market', b: 'A hundred and twenty-six companies scored against your thesis, sorted by fit — with stage, strategic relevance and the latest signal on each.', sel: '.hd', up: 2 },
    { t: 'Ask the whole universe a question', b: 'Add AI Column. The prompt is already filled in: which of these companies have Fortune 500 customers? The Company Intelligence Agent answers per company, with sources. Try it.', sel: '.addcol', up: 0 },
    { t: 'Every row opens up', b: 'Company B: AI security, Series C, fit eighty-eight. Open it to see exactly what earned the score.', sel: '[data-go="company"].btn-p', up: 0 }
  ],
  company: [
    { t: 'Why this company matters to the thesis', b: 'Eighty-eight out of a hundred, ranked second of a hundred and twenty-six. The ring is not a feeling — every contribution beneath it is weighted and cited.', sel: 'svg[viewBox="0 0 132 132"]', up: 1 },
    { t: 'What earned it, what drags it down', b: 'Four positives and one drag, each with a weight: strong positioning, enterprise traction, alignment with the security whitespace, a hyperscaler partnership — against rising competition and a stretched valuation.', sel: '.why', up: 1 },
    { t: 'Nothing is inferred without a source', b: 'Every claim links to the document the agent read: a press release, a filing, a customer case study, an internal delivery note.', sel: '.cite', up: 1 },
    { t: 'Watch it, and the Signal Agent takes over', b: 'Add to Watchlist keeps this company under observation. You are told when something here changes the thesis — not every time there is news.', sel: '[data-go="thesis"].btn-p', up: 0 }
  ],
  thesis: [
    { t: 'The thesis is ready', b: 'Six sections answering the question you asked: where the market is moving, how it is structured, where Accenture should pay attention, where the gaps are, who is building, and what to do next.', sel: '.sec', up: 1 },
    { t: 'Eighteen slides, in your template', b: 'Action titles, the market map, the gap and the shortlist — generated, not exported. Invite collaborators before you publish.', sel: '.slide', up: 2 },
    { t: 'Monitoring was armed before you finished reading', b: 'The Signal Agent now watches all a hundred and twenty-six companies and both gaps. This is the moment the thesis stops being a document.', sel: 'div[style*="#cfead9"]', up: 0 }
  ],
  collaborate: [
    { t: 'Institutional knowledge enters here', b: 'A comment is anchored to the exact sentence it is about. A practice lead has already left one: agent governance is what several enterprise clients are asking for.', sel: '.anchor', up: 1 },
    { t: 'A real thread, not a sticky note', b: 'Aditi commented. Ravi replied with an @mention. Everyone on this thesis sees it — and so do the agents.', sel: '.msg', up: 2 },
    { t: 'Reply — go on, type something', b: 'The composer is live. Post the reply and watch the Strategy Agent read the thread and propose a change to the thesis. Accept it, and the version bumps.', sel: '.composer', up: 0 }
  ],
  fastforward: [
    { t: 'Thirty days pass. You did nothing.', b: 'Your agents read several thousand articles and kept the seven that moved something — ranked by how much each one moves the thesis, not by how loud it was.', sel: '.chg', up: 1 },
    { t: 'One of them changes the thesis', b: 'The amber node in Seattle: a hyperscaler shipped enterprise identity for autonomous agents. That lands directly on your largest whitespace. Open it.', sel: '.cta', up: 0 }
  ],
  signal: [
    { t: 'Something changed in your thesis', b: 'Detected two days ago and confirmed across six sources: Microsoft launched enterprise identity capabilities for autonomous AI agents.', sel: 'h1', up: 0 },
    { t: 'Previous view, current view', b: 'Large whitespace becomes whitespace narrowing. A platform default now exists for the identity layer itself.', sel: '.state', up: 1 },
    { t: 'Ninety-two to seventy-eight', b: 'Opportunity attractiveness, re-scored. Three companies affected, two sections to update, confidence high. Nothing in the thesis has changed yet — the agents propose, you decide.', sel: '[data-bind="score"]', up: 2 },
    { t: 'But the agents found something else', b: 'Cross-Agent Governance and Auditability: not who the agent is, but who approved what it did, and whether a regulator could follow it afterwards. Demand rose while supply did not.', sel: 'h2', up: 1 }
  ],
  evolution: [
    { t: 'The old paragraph and the proposed one', b: 'One paragraph in Market Gaps. Everything downstream of it follows automatically.', sel: '.dcard', up: 1 },
    { t: 'What else moves if you accept', b: 'Agent Identity drops from rank one to rank three. Cross-Agent Governance becomes a named gap. Three companies re-scored, two added, four slides regenerated.', sel: '.chg', up: 1 },
    { t: 'Accept, and it becomes version three', b: 'Every version is kept. You can read what the thesis said on any date, and why it changed. Go ahead.', sel: '[data-attr-onclick="accept"]', up: 0 }
  ],
  globelive: [
    { t: 'Your intelligence, at a glance', b: 'Four theses running. A hundred and thirty-seven companies under watch. Eighteen signals this week, two new gaps this month.', sel: '.istat', up: 2 },
    { t: 'Each thesis reports for itself', b: 'AI Infrastructure updated three minutes ago with a new gap. Physical AI is mid-research with thirty-eight new companies. Robotics and Sovereign Cloud: nothing material — which is also worth knowing.', sel: '.tcard', up: 1 },
    { t: 'Your agents keep working even when you are not', b: 'You started with one question. You now have a team of agents continuously watching that market for you. Create another thesis whenever you are ready.', sel: 'canvas', up: 0 }
  ]
};

/* ============================ screen controllers ============================ */

function reg(id, ctrl) { controllers[id] = ctrl; }
function vals(el, v) { paint(el, v); }

reg('start', (function () {
  var tab = 'persona', el;
  function render() {
    vals(el, {
      byPersona: tab === 'persona', byStory: tab === 'story',
      showPersona: function () { tab = 'persona'; render(); },
      showStory: function () { tab = 'story'; render(); },
      startPractice: function (e) { e.preventDefault(); choosePersona('practice'); },
      startVentures: function (e) { e.preventDefault(); choosePersona('ventures'); },
      startClient: function (e) { e.preventDefault(); choosePersona('client'); },
      startTour: function (e) { e.preventDefault(); choosePersona('full'); },
      startSilent: function (e) { e.preventDefault(); persona = 'full'; renderPersonaMenu(); hideBanner(); show('onboarding'); }
    });
  }
  return { enter: function (node) { el = node; render(); } };
})());

reg('question', (function () {
  var full = 'Where should Accenture be investing or focusing within AI infrastructure over the next 3–5 years?';
  var t, el;
  return {
    enter: function (node) {
      el = node; var n = 0; clearInterval(t);
      t = setInterval(function () { n += 1; vals(el, { typed: full.slice(0, n) }); if (n >= full.length) clearInterval(t); }, 26);
    },
    leave: function () { clearInterval(t); }
  };
})());

reg('market', (function () {
  var t, el;
  return {
    enter: function (node) {
      el = node; var s = 0; clearInterval(t);
      t = setInterval(function () {
        s += 1; var e = 1 - Math.pow(1 - Math.min(1, s / 42), 3);
        vals(el, { c1: Math.round(126 * e), c2: Math.round(8 * e), c3: Math.round(4 * e), c4: Math.round(23 * e) });
        if (s >= 42) clearInterval(t);
      }, 20);
    },
    leave: function () { clearInterval(t); }
  };
})());

reg('signal', (function () {
  var t, d, el;
  return {
    enter: function (node) {
      el = node; var s = 0; vals(el, { score: 92 }); clearTimeout(d); clearInterval(t);
      d = setTimeout(function () {
        t = setInterval(function () {
          s += 1; var e = 1 - Math.pow(1 - Math.min(1, s / 28), 3);
          vals(el, { score: Math.round(92 - 14 * e) }); if (s >= 28) clearInterval(t);
        }, 34);
      }, 700);
    },
    leave: function () { clearTimeout(d); clearInterval(t); }
  };
})());

reg('companies', (function () {
  var DATA = [
    ['CA','Company A','Agent Infrastructure',91,'Series B','High','Launched an enterprise agent runtime','Yes · 6 named',1],
    ['CB','Company B','AI Security',88,'Series C','High','Partnership with a major cloud provider','Yes · 11 named',1],
    ['CC','Company C','AI Observability',82,'Series A','Medium','Raised $35M','Yes · 3 named',1],
    ['CD','Company D','Model Optimization',79,'Growth','High','Expanded into Europe','No evidence found',0],
    ['CE','Company E','Agent Identity & Access',77,'Seed','High','First enterprise design partner','Yes · 1 named',1],
    ['CF','Company F','Vector & Data Infra',71,'Series B','Medium','Shipped managed retrieval tier','Yes · 8 named',1],
    ['CG','Company G','AI Compute',68,'Series D','Medium','Added capacity in Europe','Yes · 14 named',1],
    ['CH','Company H','Cross-Agent Governance',64,'Pre-seed','Medium','Emerged from stealth','No evidence found',0]
  ];
  var TONES = [['#f1edfb','#6d28d9'],['#eff6ff','#1d4ed8'],['#e9f7ee','#15803d'],['#fff7ed','#c2410c'],['#f1edfb','#6d28d9'],['#eff6ff','#1d4ed8'],['#f4f4f5','#525252'],['#fdf2f8','#9d174d']];
  var COLS = '220px 190px 128px 104px 168px minmax(0, 1fr) 196px';
  var st, el, t;
  function render() {
    var rows = DATA.map(function (d, i) {
      return { initials: d[0], name: d[1], segment: d[2], fit: d[3], stage: d[4], rel: d[5], signal: d[6], cols: COLS,
        avatarBg: TONES[i][0], avatarFg: TONES[i][1],
        relBg: d[5] === 'High' ? '#e9f7ee' : '#f4f4f5', relFg: d[5] === 'High' ? '#15803d' : '#525252',
        pending: st.running && i >= st.filled, ready: st.filled > i, ai: d[7], aiFg: d[8] ? '#15803d' : '#a3a3a3' };
    });
    vals(el, {
      rows: rows, cols: COLS,
      showAdd: !st.running && !st.finished, hasCol: st.running || st.finished,
      promptOpen: st.promptOpen, running: st.running, finished: st.finished,
      idle: !st.running && !st.finished, done: st.done,
      openPrompt: function () { st.promptOpen = true; render(); },
      closePrompt: function () { st.promptOpen = false; render(); },
      runColumn: function () {
        st.promptOpen = false; st.running = true; st.filled = 0; st.done = 0; render();
        var tick = 0; clearInterval(t);
        t = setInterval(function () {
          tick += 1; st.filled = Math.min(DATA.length, Math.floor(tick / 3)); st.done = Math.min(126, Math.round(tick * 5.6));
          if (tick >= 24) { clearInterval(t); st.filled = DATA.length; st.done = 126; st.running = false; st.finished = true; }
          render();
        }, 90);
      }
    });
  }
  return {
    enter: function (node) { el = node; st = { promptOpen: false, running: false, filled: 0, done: 0, finished: false }; render(); },
    leave: function () { clearInterval(t); }
  };
})());

reg('collaborate', (function () {
  var SEED = 'Agreed — and it is the audit trail they ask about, not the identity. Let us treat governance as its own gap rather than a footnote under identity.';
  var st, el, t;
  function render() {
    var seen = st.phase !== 'thread', done = st.phase === 'updated';
    vals(el, {
      posted: seen, postedText: st.posted || SEED, proposed: st.phase === 'proposed', working: st.phase === 'working', updated: done,
      canReply: !seen, draft: st.draft, cannotPost: st.draft.trim().length === 0,
      version: done ? 'Version 2' : 'Version 1', verFg: done ? '#15803d' : '#525252', verBg: done ? '#e9f7ee' : '#ffffff', verLine: done ? '#cfead9' : '#e5e5e5',
      flashAnim: done ? 'flash 1.4s ease-out both' : 'none', pinLabel: done ? '✓' : '1',
      threadLine: st.phase === 'proposed' ? '#d8c8f5' : '#e5e5e5',
      openLabel: done ? 'All resolved' : '1 open', openFg: done ? '#15803d' : '#525252', openBg: done ? '#e9f7ee' : '#f4f4f5',
      docMeta: done ? 'Reviewed by 3 people · updated just now by Strategy Agent' : 'Reviewed by 3 people · last edit 2 minutes ago',
      onDraft: function (e) { st.draft = e.target.value; },
      post: function () {
        var text = st.draft.trim(); if (!text) return;
        st.phase = 'posted'; st.posted = text; render(); clearTimeout(t);
        t = setTimeout(function () { st.phase = 'proposed'; render(); }, 1400);
      },
      accept: function () { st.phase = 'working'; render(); clearTimeout(t); t = setTimeout(function () { st.phase = 'updated'; render(); }, 1700); }
    });
  }
  return {
    enter: function (node) {
      el = node; st = { phase: 'thread', draft: SEED }; render();
      var ta = el.querySelector('textarea');
      if (ta && !ta._wired) { ta._wired = 1; ta.addEventListener('input', function (e) { st.draft = e.target.value; render(); }); }
    },
    leave: function () { clearTimeout(t); }
  };
})());

reg('evolution', (function () {
  var st, el, t;
  function render() {
    var done = st.phase === 'done';
    vals(el, {
      idle: st.phase === 'idle', working: st.phase === 'working', done: done, notDone: !done,
      propTitle: done ? 'Applied — v3' : 'Proposed update — v3', propLine: done ? '#cfead9' : '#c4b5fd',
      propStyle: done ? 'solid' : 'dashed', propBg: done ? '#f6fcf8' : '#fdfcff', propInk: done ? '#15803d' : '#7e22ce',
      accept: function () { st.phase = 'working'; render(); clearTimeout(t); t = setTimeout(function () { st.phase = 'done'; render(); }, 1600); }
    });
  }
  return { enter: function (node) { el = node; st = { phase: 'idle' }; render(); }, leave: function () { clearTimeout(t); } };
})());

/* -- the three globe screens: the canvas fills whatever the stage gives it -- */
var HALOS = { discovered: 'rgba(29,78,216,.6)', positive: 'rgba(22,163,74,.6)', impacted: 'rgba(217,119,6,.7)', negative: 'rgba(220,38,38,.6)', neutral: 'rgba(161,161,170,.55)' };
var LINES = { impacted: '#f5e3ab', positive: '#d6ecdd', discovered: '#d5e4fd', negative: '#f8d4d4', neutral: '#e7e3f0' };

function globeScreen(opts) {
  var g, raf, el, t0, canvas, area, offX = 0, offY = 0;
  function layout() {
    var w = area.clientWidth, h = area.clientHeight;
    if (!w || !h) return;
    var size = Math.max(320, Math.min(h - 16, w - 60));
    offX = Math.round((w - size) / 2); offY = Math.round((h - size) / 2);
    canvas.style.left = offX + 'px'; canvas.style.top = offY + 'px';
    canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
    g.setSize(size);
  }
  function frame(t) {
    var now = t - t0;
    g.step(now);
    var markers = g.place(opts.nodes, now, offX, offY);
    for (var i = 0; i < markers.length; i++) {
      markers[i].halo = HALOS[markers[i].kind] || HALOS.neutral;
      markers[i].cardLine = LINES[markers[i].kind] || LINES.neutral;
    }
    vals(el, opts.vals ? opts.vals(markers, now) : { markers: markers });
    raf = requestAnimationFrame(frame);
  }
  return {
    enter: function (node) {
      el = node; canvas = el.querySelector('canvas'); area = canvas.parentElement;
      g = new Globe(canvas, opts.globe);
      layout();
      t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    },
    leave: function () { cancelAnimationFrame(raf); },
    resize: function () { if (g) layout(); }
  };
}
window.addEventListener('resize', function () { if (current && controllers[current.id] && controllers[current.id].resize) controllers[current.id].resize(); });

var ICONS = {
  research:  ['M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0M20 20l-3.5-3.5', '#f1edfb', '#7e22ce', '#e6dcfa'],
  company:   ['M3 21V8l6-4 6 4v13M15 21V11l6 3v7', '#eff6ff', '#1d4ed8', '#d5e4fd'],
  whitespace:['M3 3h7v7H3zM14 14h7v7h-7zM14 3h7v7h-7z', '#fff7ed', '#c2410c', '#fde3c8'],
  strategy:  ['M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0', '#f5f3ff', '#6d28d9', '#e2dafb'],
  signal:    ['M2 12h4l2.5-7 4 14 2.5-7h5', '#f0fdf4', '#15803d', '#d3f0dd']
};
var EVENTS = [
  [200,'research','Sweeping ','41 countries',' for AI infrastructure activity.','Market Research Agent','Sweeping the market'],
  [900,'company','San Francisco — ','17 companies',' found in the Bay Area cluster.','Company Intelligence Agent','Reading the Americas'],
  [1900,'research','Read ','38 sources',': filings, funding data, enterprise press.','Market Research Agent','Reading the Americas'],
  [2900,'company','Seattle — hyperscaler capacity announcements ','increasing','.','Company Intelligence Agent','Reading the Americas'],
  [4000,'whitespace','First gap forming: agent runtimes shipping with ','no identity layer','.','Whitespace Agent','Testing for gaps'],
  [5100,'strategy','Scoring ','24 companies'," against Accenture's four priorities.",'Strategy Agent','Scoring relevance'],
  [6600,'company','London — enterprise AI ','governance',' ecosystem emerging.','Company Intelligence Agent','Reading Europe'],
  [7700,'research','Now at ','142 sources',' across 41 countries.','Market Research Agent','Reading Europe'],
  [8800,'company','Paris — open-source model activity ','accelerating','.','Company Intelligence Agent','Reading Europe'],
  [9900,'whitespace','Identified ','6 emerging categories',' with demand but thin supply.','Whitespace Agent','Testing for gaps'],
  [11400,'company','Tel Aviv — AI ','security',' infrastructure cluster identified.','Company Intelligence Agent','Reading the Middle East'],
  [12500,'strategy','Rated ','23 companies',' high relevance to Accenture.','Strategy Agent','Scoring relevance'],
  [14200,'company','Bengaluru — startup cluster expanding. ','87 companies',' in total.','Company Intelligence Agent','Reading South Asia'],
  [15400,'signal','Monitoring armed on ','126 companies',' and 8 segments.','Signal Agent','Arming monitoring'],
  [16500,'strategy','Comparing every finding against your stated priorities.','','','Strategy Agent · running','Synthesising thesis']
];
function feedAt(now) {
  var rows = [], seen = 0;
  for (var i = 0; i < EVENTS.length; i++) {
    var e = EVENTS[i]; if (now < e[0]) break; seen++;
    var ease = 1 - Math.pow(1 - Math.min(1, (now - e[0]) / 440), 3), icon = ICONS[e[1]];
    rows.push({ d: icon[0], bg: icon[1], fg: icon[2], line: icon[3], pre: e[2], strong: e[3], post: e[4], meta: e[5],
      h: Math.round(74 * ease), op: Math.round(ease * 100) / 100, tx: Math.round(-12 * (1 - ease)), fresh: now - e[0] < 2600 });
  }
  rows.reverse();
  return { feed: rows.slice(0, 8), count: seen, stage: seen ? EVENTS[seen - 1][6] : 'Briefing the agents' };
}
function ramp(target, ms, now) { return Math.round(target * Math.min(1, now / ms)); }

reg('globe', globeScreen({
  globe: { size: 820, radius: 300, lat0: 26, spin0: -104, speed: 0.012, scan: true,
    tour: [{at:0,lon:-112,lat:30},{at:2400,lon:-104,lat:34},{at:6200,lon:-34,lat:40},{at:8400,lon:-6,lat:42},{at:11000,lon:22,lat:34},{at:13800,lon:62,lat:22}],
    arcs: [{from:[-122.4,37.8],to:[-122.3,47.6],at:2800},{from:[-122.4,37.8],to:[-0.13,51.5],at:6600},{from:[-0.13,51.5],to:[2.35,48.86],at:8800},{from:[-0.13,51.5],to:[34.78,32.08],at:11400},{from:[34.78,32.08],to:[77.59,12.97],at:14200}] },
  nodes: [
    {lon:-122.4,lat:37.8,label:'San Francisco',note:'17 AI infrastructure companies discovered',kind:'discovered',pulse:1,at:300},
    {lon:-122.3,lat:47.6,label:'Seattle',note:'Hyperscaler activity increasing',kind:'positive',pulse:1,at:2600},
    {lon:-0.13,lat:51.5,label:'London',note:'Enterprise AI governance ecosystem emerging',kind:'discovered',pulse:1,at:6400},
    {lon:2.35,lat:48.86,label:'Paris',note:'Open-source model activity accelerating',kind:'positive',pulse:0,at:8600},
    {lon:34.78,lat:32.08,label:'Tel Aviv',note:'AI security infrastructure cluster identified',kind:'impacted',pulse:1,at:11200},
    {lon:77.59,lat:12.97,label:'Bengaluru',note:'AI infrastructure startup cluster expanding',kind:'discovered',pulse:1,at:14000}
  ],
  vals: function (markers, now) {
    var s = feedAt(now);
    return { markers: markers, feed: s.feed, count: s.count, stage: s.stage,
      sources: ramp(142, 7000, now), companies: ramp(87, 9000, now), categories: ramp(6, 12000, now), countries: ramp(41, 10000, now),
      pct: Math.min(96, Math.round(96 * Math.min(1, now / 16500))) };
  }
}));

reg('fastforward', globeScreen({
  globe: { size: 820, radius: 300, lat0: 34, spin0: -150, speed: 0.01, scan: true,
    tour: [{at:0,lon:-128,lat:38},{at:6000,lon:-96,lat:40},{at:12000,lon:-40,lat:42}],
    arcs: [{from:[-122.3,47.6],to:[-74.0,40.7],at:3200},{from:[-74.0,40.7],to:[4.35,50.85],at:6800}] },
  nodes: [
    {lon:-122.3,lat:47.6,label:'Seattle',note:'Enterprise agent identity shipped by a hyperscaler',kind:'impacted',pulse:1,big:1,at:2300},
    {lon:-122.4,lat:37.8,label:'San Francisco',note:'11 new companies in Agent Infrastructure',kind:'discovered',pulse:1,at:2600},
    {lon:-74.0,lat:40.7,label:'New York',note:'Company B closed a Fortune 100 bank',kind:'positive',pulse:1,at:2800},
    {lon:4.35,lat:50.85,label:'Brussels',note:'Draft guidance on agent accountability',kind:'positive',pulse:0,at:3000},
    {lon:-0.13,lat:51.5,label:'London',note:'Two vector database companies merged',kind:'negative',pulse:0,at:3200},
    {lon:77.59,lat:12.97,label:'Bengaluru',note:'Optimization funding slowed again',kind:'neutral',pulse:0,at:3400},
    {lon:34.78,lat:32.08,label:'Tel Aviv',note:'Two watchlist leadership changes',kind:'neutral',pulse:0,at:3600}
  ]
}));

reg('globelive', globeScreen({
  globe: { size: 800, radius: 292, lat0: 32, spin0: -96, speed: 0.014, scan: true,
    tour: [{at:0,lon:-92,lat:36},{at:7000,lon:-30,lat:42},{at:14000,lon:26,lat:34},{at:21000,lon:96,lat:24},{at:30000,lon:-92,lat:36}],
    arcs: [{from:[-122.4,37.8],to:[-74.0,40.7],at:1400},{from:[-74.0,40.7],to:[-0.13,51.5],at:5200},{from:[-0.13,51.5],to:[13.4,52.5],at:9000},{from:[13.4,52.5],to:[34.78,32.08],at:13000},{from:[34.78,32.08],to:[77.59,12.97],at:17000},{from:[77.59,12.97],to:[139.7,35.7],at:21000}] },
  nodes: [
    {lon:-122.4,lat:37.8,label:'San Francisco',note:'38 new companies · Physical AI',kind:'discovered',pulse:1,at:200},
    {lon:-122.3,lat:47.6,label:'Seattle',note:'Agent identity consolidating',kind:'impacted',pulse:1,at:600},
    {lon:-74.0,lat:40.7,label:'New York',note:'Watchlist company closed a bank',kind:'positive',pulse:0,at:3000},
    {lon:-0.13,lat:51.5,label:'London',note:'Governance ecosystem forming',kind:'positive',pulse:1,at:6000},
    {lon:13.4,lat:52.5,label:'Berlin',note:'Sovereign cloud activity',kind:'neutral',pulse:0,at:9500},
    {lon:34.78,lat:32.08,label:'Tel Aviv',note:'AI security cluster, 2 new',kind:'discovered',pulse:1,at:13000},
    {lon:77.59,lat:12.97,label:'Bengaluru',note:'Infrastructure cluster expanding',kind:'discovered',pulse:0,at:17000},
    {lon:139.7,lat:35.7,label:'Tokyo',note:'Enterprise robotics, quiet month',kind:'neutral',pulse:0,at:21000}
  ]
}));

/* ============================ boot ============================ */

document.addEventListener('DOMContentLoaded', function () {
  renderPersonaMenu();
  var hash = (location.hash || '').replace('#', '');
  if (byId[hash] && hash !== 'start') { persona = 'full'; renderPersonaMenu(); show(hash); }
  else show('start');
});

})();
