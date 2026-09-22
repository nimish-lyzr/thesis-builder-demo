/* Thesis Builder — interactive demo.

   One page, fifteen views, a narrated walkthrough on top. The screens are the
   Design-canvas artboards ported verbatim; what is new here is the transport:
   one audio element whose `ended` event advances the tour, a spotlight that
   measures a live element rather than drawing a box over a guess, and the
   per-screen behaviour that used to live in each artboard's own logic class. */

(function () {
'use strict';

/* ============================ tiny renderer ============================ */

function get(vals, path) {
  var parts = path.split('.'), v = vals;
  for (var i = 0; i < parts.length && v != null; i++) v = v[parts[i]];
  return v;
}

/* Walk root AND its descendants, but leave anything owned by a nested
   repeater to the list pass — that content is painted with its own scope. */
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

  each(root, '[data-cond]', function (el) {
    el.hidden = !get(vals, el.getAttribute('data-cond'));
  });

  each(root, '[data-style-tpl]', function (el) {
    var css = el.getAttribute('data-style-tpl').replace(/\[\[([\w.]+)\]\]/g, function (_, p) {
      var x = get(vals, p);
      return x == null ? '' : String(x);
    });
    if (el.style.cssText !== css) el.style.cssText = css;
  });

  each(root, '[data-attrs], [data-attr-onclick], [data-attr-onchange], [data-attr-class], [data-attr-d], [data-attr-value], [data-attr-disabled], [data-attr-aria-pressed]', function (el) {
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
            node.addEventListener(type, function (e) {
              var fn = node['_fn_' + type];
              if (typeof fn === 'function') fn(e);
            });
          })(el, evt);
        }
      } else if (target === 'disabled') {
        el.disabled = !!val;
      } else if (target === 'value') {
        if (document.activeElement !== el && el.value !== val) el.value = val == null ? '' : val;
      } else {
        el.setAttribute(target, val == null ? '' : val);
      }
    }
  });

  each(root, '[data-list]', function (el) {
    var items = get(vals, el.getAttribute('data-list')) || [];
    var alias = el.getAttribute('data-as') || 'item';
    if (el._tpl === undefined) { el._tpl = el.innerHTML.trim(); el.innerHTML = ''; }
    while (el.children.length > items.length) el.removeChild(el.lastChild);
    while (el.children.length < items.length) {
      var holder = document.createElement('div');
      holder.innerHTML = el._tpl;
      el.appendChild(holder.firstElementChild || holder);
    }
    for (var j = 0; j < items.length; j++) {
      var scope = Object.create(vals);
      scope[alias] = items[j];
      paint(el.children[j], scope);
    }
  });
}

/* ============================ stage scaling ============================ */

var STAGE_W = 1440, STAGE_H = 900, stageScale = 1;

function fitStage() {
  var stage = document.getElementById('stage');
  var sizer = document.getElementById('sizer');
  /* The screens are a fixed 1440x900 frame — the same one they were designed
     in — scaled to fit the window. The sizer carries the scaled footprint so
     the page centres and scrolls around it correctly. */
  stageScale = Math.min((window.innerWidth - 32) / STAGE_W, (window.innerHeight - 130) / STAGE_H);
  stageScale = Math.max(0.28, Math.min(1.3, stageScale));
  stage.style.transform = 'scale(' + stageScale + ')';
  sizer.style.width = (STAGE_W * stageScale) + 'px';
  sizer.style.height = (STAGE_H * stageScale) + 'px';
  if (current && current.ctrl && current.ctrl.resize) current.ctrl.resize(stageScale);
  moveSpot();
}

/* ============================ the walkthrough ============================ */

var SCREENS = [
  { id: 'start',       n: '0',  title: 'Pick a walkthrough' },
  { id: 'onboarding',  n: '1',  title: 'Welcome / company onboarding', audio: '01-onboarding' },
  { id: 'team',        n: '2',  title: 'Your AI research team is ready', audio: '02-team' },
  { id: 'question',    n: '3',  title: 'Create the first thesis', audio: '03-question' },
  { id: 'globe',       n: '4',  title: 'The globe comes alive', audio: '04-globe' },
  { id: 'market',      n: '5',  title: 'Current market status', audio: '05-market', spot: '.kpi:nth-child(3)' },
  { id: 'whitespace',  n: '6',  title: 'Market map / whitespace', audio: '06-whitespace', spot: '.col:last-child' },
  { id: 'companies',   n: '7',  title: 'Company universe', audio: '07-companies', spot: '.addcol' },
  { id: 'company',     n: '8',  title: 'Why this company?', audio: '08-company' },
  { id: 'thesis',      n: '9',  title: 'The thesis', audio: '09-thesis' },
  { id: 'collaborate', n: '10', title: 'Collaborate', audio: '10-collaborate', spot: '.composer' },
  { id: 'fastforward', n: '11', title: '30 days later', audio: '11-fastforward' },
  { id: 'signal',      n: '12', title: 'New market signal', audio: '12-signal' },
  { id: 'evolution',   n: '13', title: 'Thesis evolution', audio: '13-evolution' },
  { id: 'globelive',   n: '14', title: 'Return to the globe', audio: '14-globelive' }
];

var byId = {};
SCREENS.forEach(function (s, i) { s.index = i; byId[s.id] = s; });

var audio = new Audio();
audio.preload = 'auto';
var tour = { playing: false, muted: false, blocked: false };
var current = null, holdTimer = null;

try { tour.muted = localStorage.getItem('tb-muted') === '1'; } catch (e) {}

function audioSrc(slug) { return 'audio/' + slug + '.mp3'; }

function playFor(screen) {
  clearTimeout(holdTimer);
  audio.pause();
  if (!tour.playing || tour.muted) { transport(); return; }
  if (!screen.audio) {
    // no recording for this one yet — hold, then move on
    holdTimer = setTimeout(next, screen.hold || 14000);
    transport();
    return;
  }
  audio.src = audioSrc(screen.audio);
  audio.currentTime = 0;
  var p = audio.play();
  if (p && p.then) {
    p.then(function () { tour.blocked = false; transport(); },
           function () { tour.blocked = true; transport(); });
  }
  transport();
}

audio.addEventListener('ended', function () { if (tour.playing) next(); });
audio.addEventListener('timeupdate', function () {
  var bar = document.getElementById('tp-progress');
  if (bar && audio.duration) bar.style.width = (100 * audio.currentTime / audio.duration) + '%';
});

function next() {
  var i = current ? current.index : 0;
  if (i < SCREENS.length - 1) show(SCREENS[i + 1].id);
  else { tour.playing = false; transport(); }
}
function prev() {
  var i = current ? current.index : 0;
  if (i > 0) show(SCREENS[i - 1].id);
}

/* ============================ spotlight ============================ */

var spotTarget = null, spotRaf = 0, spotUntil = 0;

function moveSpot() {
  var box = document.getElementById('spot');
  if (!spotTarget || !document.body.contains(spotTarget)) { box.style.opacity = 0; return; }
  var r = spotTarget.getBoundingClientRect();
  if (!r.width) { box.style.opacity = 0; return; }
  var pad = 10 * stageScale;
  box.style.opacity = 1;
  box.style.transform = 'translate(' + (r.left - pad) + 'px,' + (r.top - pad) + 'px)';
  box.style.width = (r.width + pad * 2) + 'px';
  box.style.height = (r.height + pad * 2) + 'px';
}

function spotlight(screen, el) {
  cancelAnimationFrame(spotRaf);
  spotTarget = null;
  document.getElementById('spot').style.opacity = 0;
  if (!screen.spot || !tour.playing) return;
  setTimeout(function () {
    if (!current || current.id !== screen.id) return;
    spotTarget = el.querySelector(screen.spot);
    if (!spotTarget) return;
    spotUntil = performance.now() + 2200;
    var follow = function (t) {
      moveSpot();
      if (t < spotUntil) spotRaf = requestAnimationFrame(follow);
    };
    spotRaf = requestAnimationFrame(follow);
    setTimeout(function () {
      if (spotTarget === (el.querySelector(screen.spot))) {
        spotTarget = null;
        document.getElementById('spot').style.opacity = 0;
      }
    }, 6000);
  }, 1800);
}

/* ============================ router ============================ */

var controllers = {};

/* Views are hidden and shown rather than rebuilt, so a screen's entrance
   animations — the staggered rises, the "30 days later" curtain — would only
   ever play on the first visit. Rewind them on every entry. */
function restartAnimations(el) {
  if (!el.getAnimations) return;
  var anims = el.getAnimations({ subtree: true });
  for (var i = 0; i < anims.length; i++) {
    try { anims[i].cancel(); anims[i].play(); } catch (e) {}
  }
}

function show(id) {
  var screen = byId[id];
  if (!screen) return;
  if (current && controllers[current.id] && controllers[current.id].leave) controllers[current.id].leave();
  var views = document.querySelectorAll('.view');
  for (var i = 0; i < views.length; i++) views[i].hidden = views[i].id !== 'v-' + id;
  current = screen;
  current.ctrl = controllers[id];
  if (history.replaceState) history.replaceState(null, '', '#' + id);
  var el = document.getElementById('v-' + id);
  el.scrollTop = 0;
  restartAnimations(el);
  if (controllers[id] && controllers[id].enter) controllers[id].enter(el);
  playFor(screen);
  spotlight(screen, el);
  transport();
}

document.addEventListener('click', function (e) {
  var a = e.target.closest ? e.target.closest('[data-go]') : null;
  if (!a) return;
  e.preventDefault();
  show(a.getAttribute('data-go'));
});

/* ============================ transport bar ============================ */

function transport() {
  var wrap = document.getElementById('transport');
  if (!current) return;
  wrap.hidden = current.id === 'start';
  document.getElementById('tp-title').textContent = current.n + ' · ' + current.title;
  document.getElementById('tp-step').textContent = current.index + ' of 14';
  document.getElementById('tp-play').setAttribute('aria-label', tour.playing ? 'Pause the walkthrough' : 'Play the walkthrough');
  document.getElementById('tp-play-icon').setAttribute('d', tour.playing
    ? 'M9 5v14M15 5v14'
    : 'M7 4.5v15l13-7.5z');
  document.getElementById('tp-mute-icon').setAttribute('d', tour.muted || tour.blocked
    ? 'M11 5 6 9H3v6h3l5 4zM17 9.5l4.5 5M21.5 9.5l-4.5 5'
    : 'M11 5 6 9H3v6h3l5 4zM16 9.5a4 4 0 0 1 0 5M19 7a8 8 0 0 1 0 10');
  var note = document.getElementById('tp-note');
  note.textContent = tour.blocked ? 'Tap to play narration' : (tour.muted ? 'Muted' : '');
  note.hidden = !note.textContent;
  if (!audio.duration || tour.muted) document.getElementById('tp-progress').style.width = '0%';
}

function wireTransport() {
  document.getElementById('tp-prev').onclick = prev;
  document.getElementById('tp-next').onclick = function () { tour.playing = true; next(); };
  document.getElementById('tp-play').onclick = function () {
    tour.playing = !tour.playing;
    if (tour.playing) { tour.blocked = false; playFor(current); }
    else { audio.pause(); clearTimeout(holdTimer); }
    transport();
  };
  document.getElementById('tp-mute').onclick = function () {
    if (tour.blocked) { tour.blocked = false; tour.muted = false; playFor(current); return; }
    tour.muted = !tour.muted;
    try { localStorage.setItem('tb-muted', tour.muted ? '1' : '0'); } catch (e) {}
    if (tour.muted) audio.pause(); else playFor(current);
    transport();
  };
  document.getElementById('tp-exit').onclick = function () {
    tour.playing = false; audio.pause(); clearTimeout(holdTimer);
    spotTarget = null; document.getElementById('spot').style.opacity = 0;
    transport();
  };
}

/* ============================ screens ============================ */

function reg(id, ctrl) { controllers[id] = ctrl; }
function vals(el, v) { window.__vals = v; paint(el, v); }

/* -- 0 · persona picker ------------------------------------------------- */
reg('start', (function () {
  var tab = 'persona', el;
  function begin(intro, target) {
    tour.playing = true;
    tour.muted = false;
    tour.blocked = false;
    try { localStorage.setItem('tb-muted', '0'); } catch (e) {}
    // the click is the gesture browsers want; the intro proves sound works,
    // and the screen we land on takes over when it ends
    audio.src = audioSrc(intro);
    var p = audio.play();
    var go = function () { show(target); };
    if (p && p.then) p.then(function () { setTimeout(go, 300); }, function () { tour.blocked = true; go(); });
    else go();
    audio.addEventListener('ended', go, { once: true });
  }
  function render() {
    vals(el, {
      byPersona: tab === 'persona', byStory: tab === 'story',
      showPersona: function () { tab = 'persona'; render(); },
      showStory: function () { tab = 'story'; render(); },
      startPractice: function (e) { e.preventDefault(); begin('00-persona-practice-lead', 'whitespace'); },
      startVentures: function (e) { e.preventDefault(); begin('00-persona-ventures', 'companies'); },
      startClient: function (e) { e.preventDefault(); begin('00-persona-client-partner', 'thesis'); },
      startTour: function (e) { e.preventDefault(); begin('00-persona-full-tour', 'onboarding'); },
      startSilent: function () { tour.playing = false; audio.pause(); }
    });
  }
  return { enter: function (node) { el = node; render(); } };
})());

/* -- 3 · the question typewriter ---------------------------------------- */
reg('question', (function () {
  var full = 'Where should Accenture be investing or focusing within AI infrastructure over the next 3–5 years?';
  var t, el;
  return {
    enter: function (node) {
      el = node; var n = 0;
      clearInterval(t);
      t = setInterval(function () {
        n += 1;
        vals(el, { typed: full.slice(0, n) });
        if (n >= full.length) clearInterval(t);
      }, 26);
    },
    leave: function () { clearInterval(t); }
  };
})());

/* -- 5 · market counters ------------------------------------------------ */
reg('market', (function () {
  var t, el;
  return {
    enter: function (node) {
      el = node; var s = 0;
      clearInterval(t);
      t = setInterval(function () {
        s += 1;
        var e = 1 - Math.pow(1 - Math.min(1, s / 42), 3);
        vals(el, { c1: Math.round(126 * e), c2: Math.round(8 * e), c3: Math.round(4 * e), c4: Math.round(23 * e) });
        if (s >= 42) clearInterval(t);
      }, 20);
    },
    leave: function () { clearInterval(t); }
  };
})());

/* -- 12 · the score falling -------------------------------------------- */
reg('signal', (function () {
  var t, d, el;
  return {
    enter: function (node) {
      el = node; var s = 0;
      vals(el, { score: 92 });
      clearTimeout(d); clearInterval(t);
      d = setTimeout(function () {
        t = setInterval(function () {
          s += 1;
          var e = 1 - Math.pow(1 - Math.min(1, s / 28), 3);
          vals(el, { score: Math.round(92 - 14 * e) });
          if (s >= 28) clearInterval(t);
        }, 34);
      }, 700);
    },
    leave: function () { clearTimeout(d); clearInterval(t); }
  };
})());

/* -- 7 · company universe, and the AI column --------------------------- */
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
  var TONES = [['#f1edfb','#6d28d9'],['#eff6ff','#1d4ed8'],['#e9f7ee','#15803d'],['#fff7ed','#c2410c'],
               ['#f1edfb','#6d28d9'],['#eff6ff','#1d4ed8'],['#f4f4f5','#525252'],['#fdf2f8','#9d174d']];
  var COLS = '220px 190px 128px 104px 168px minmax(0, 1fr) 196px';
  var st, el, t;

  function render() {
    var rows = DATA.map(function (d, i) {
      return {
        initials: d[0], name: d[1], segment: d[2], fit: d[3], stage: d[4], rel: d[5], signal: d[6],
        cols: COLS, avatarBg: TONES[i][0], avatarFg: TONES[i][1],
        relBg: d[5] === 'High' ? '#e9f7ee' : '#f4f4f5',
        relFg: d[5] === 'High' ? '#15803d' : '#525252',
        pending: st.running && i >= st.filled,
        ready: st.filled > i,
        ai: d[7], aiFg: d[8] ? '#15803d' : '#a3a3a3'
      };
    });
    vals(el, {
      rows: rows, cols: COLS,
      showAdd: !st.running && !st.finished,
      hasCol: st.running || st.finished,
      promptOpen: st.promptOpen,
      running: st.running, finished: st.finished,
      idle: !st.running && !st.finished,
      done: st.done,
      openPrompt: function () { st.promptOpen = true; render(); },
      closePrompt: function () { st.promptOpen = false; render(); },
      runColumn: function () {
        st.promptOpen = false; st.running = true; st.filled = 0; st.done = 0;
        render();
        var tick = 0;
        clearInterval(t);
        t = setInterval(function () {
          tick += 1;
          st.filled = Math.min(DATA.length, Math.floor(tick / 3));
          st.done = Math.min(126, Math.round(tick * 5.6));
          if (tick >= 24) {
            clearInterval(t);
            st.filled = DATA.length; st.done = 126; st.running = false; st.finished = true;
          }
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

/* -- 10 · the comment thread ------------------------------------------- */
reg('collaborate', (function () {
  var SEED = 'Agreed — and it is the audit trail they ask about, not the identity. Let us treat governance as its own gap rather than a footnote under identity.';
  var st, el, t;
  function render() {
    var seen = st.phase !== 'thread';
    var done = st.phase === 'updated';
    vals(el, {
      posted: seen, postedText: st.posted || SEED,
      proposed: st.phase === 'proposed', working: st.phase === 'working', updated: done,
      canReply: !seen, draft: st.draft, cannotPost: st.draft.trim().length === 0,
      version: done ? 'Version 2' : 'Version 1',
      verFg: done ? '#15803d' : '#525252',
      verBg: done ? '#e9f7ee' : '#ffffff',
      verLine: done ? '#cfead9' : '#e5e5e5',
      flashAnim: done ? 'flash 1.4s ease-out both' : 'none',
      pinLabel: done ? '✓' : '1',
      threadLine: st.phase === 'proposed' ? '#d8c8f5' : '#e5e5e5',
      openLabel: done ? 'All resolved' : '1 open',
      openFg: done ? '#15803d' : '#525252',
      openBg: done ? '#e9f7ee' : '#f4f4f5',
      docMeta: done ? 'Reviewed by 3 people · updated just now by Strategy Agent' : 'Reviewed by 3 people · last edit 2 minutes ago',
      onDraft: function (e) { st.draft = e.target.value; },
      post: function () {
        var text = st.draft.trim(); if (!text) return;
        st.phase = 'posted'; st.posted = text; render();
        clearTimeout(t);
        t = setTimeout(function () { st.phase = 'proposed'; render(); }, 1400);
      },
      accept: function () {
        st.phase = 'working'; render();
        clearTimeout(t);
        t = setTimeout(function () { st.phase = 'updated'; render(); }, 1700);
      }
    });
  }
  return {
    enter: function (node) {
      el = node; st = { phase: 'thread', draft: SEED };
      render();
      var ta = el.querySelector('textarea');
      if (ta && !ta._wired) { ta._wired = 1; ta.addEventListener('input', function (e) { st.draft = e.target.value; render(); }); }
    },
    leave: function () { clearTimeout(t); }
  };
})());

/* -- 13 · accepting the update ----------------------------------------- */
reg('evolution', (function () {
  var st, el, t;
  function render() {
    var done = st.phase === 'done';
    vals(el, {
      idle: st.phase === 'idle', working: st.phase === 'working', done: done, notDone: !done,
      propTitle: done ? 'Applied — v3' : 'Proposed update — v3',
      propLine: done ? '#cfead9' : '#c4b5fd',
      propStyle: done ? 'solid' : 'dashed',
      propBg: done ? '#f6fcf8' : '#fdfcff',
      propInk: done ? '#15803d' : '#7e22ce',
      accept: function () {
        st.phase = 'working'; render();
        clearTimeout(t);
        t = setTimeout(function () { st.phase = 'done'; render(); }, 1600);
      }
    });
  }
  return {
    enter: function (node) { el = node; st = { phase: 'idle' }; render(); },
    leave: function () { clearTimeout(t); }
  };
})());

/* -- the three globe screens ------------------------------------------- */
var HALOS = { discovered: 'rgba(29,78,216,.6)', positive: 'rgba(22,163,74,.6)', impacted: 'rgba(217,119,6,.7)',
              negative: 'rgba(220,38,38,.6)', neutral: 'rgba(161,161,170,.55)' };
var LINES = { impacted: '#f5e3ab', positive: '#d6ecdd', discovered: '#d5e4fd', negative: '#f8d4d4', neutral: '#e7e3f0' };

function globeScreen(opts) {
  var g, raf, el, t0, nodes = opts.nodes;
  function frame(t) {
    var now = t - t0;
    g.step(now);
    var markers = g.place(nodes, now, opts.offX, opts.offY);
    for (var i = 0; i < markers.length; i++) {
      markers[i].halo = HALOS[markers[i].kind] || HALOS.neutral;
      markers[i].cardLine = LINES[markers[i].kind] || LINES.neutral;
    }
    vals(el, opts.vals ? opts.vals(markers, now) : { markers: markers });
    raf = requestAnimationFrame(frame);
  }
  return {
    enter: function (node) {
      el = node;
      var canvas = el.querySelector('canvas');
      g = new Globe(canvas, opts.globe);
      g.resize(stageScale);
      t0 = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    },
    leave: function () { cancelAnimationFrame(raf); },
    resize: function (s) { if (g) g.resize(s); }
  };
}

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
    var e = EVENTS[i];
    if (now < e[0]) break;
    seen++;
    var ease = 1 - Math.pow(1 - Math.min(1, (now - e[0]) / 440), 3);
    var icon = ICONS[e[1]];
    rows.push({ d: icon[0], bg: icon[1], fg: icon[2], line: icon[3],
      pre: e[2], strong: e[3], post: e[4], meta: e[5],
      h: Math.round(74 * ease), op: Math.round(ease * 100) / 100,
      tx: Math.round(-12 * (1 - ease)), fresh: now - e[0] < 2600 });
  }
  rows.reverse();
  return { feed: rows.slice(0, 8), count: seen, stage: seen ? EVENTS[seen - 1][6] : 'Briefing the agents' };
}

function ramp(target, ms, now) { return Math.round(target * Math.min(1, now / ms)); }

reg('globe', globeScreen({
  offX: 110, offY: 20,
  globe: { size: 820, radius: 300, lat0: 26, spin0: -104, speed: 0.012, scan: true,
    tour: [{at:0,lon:-112,lat:30},{at:2400,lon:-104,lat:34},{at:6200,lon:-34,lat:40},
           {at:8400,lon:-6,lat:42},{at:11000,lon:22,lat:34},{at:13800,lon:62,lat:22}],
    arcs: [{from:[-122.4,37.8],to:[-122.3,47.6],at:2800},{from:[-122.4,37.8],to:[-0.13,51.5],at:6600},
           {from:[-0.13,51.5],to:[2.35,48.86],at:8800},{from:[-0.13,51.5],to:[34.78,32.08],at:11400},
           {from:[34.78,32.08],to:[77.59,12.97],at:14200}] },
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
      sources: ramp(142, 7000, now), companies: ramp(87, 9000, now),
      categories: ramp(6, 12000, now), countries: ramp(41, 10000, now),
      pct: Math.min(96, Math.round(96 * Math.min(1, now / 16500))) };
  }
}));

reg('fastforward', globeScreen({
  offX: 110, offY: 20,
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
  offX: 110, offY: 10,
  globe: { size: 800, radius: 292, lat0: 32, spin0: -96, speed: 0.014, scan: true,
    tour: [{at:0,lon:-92,lat:36},{at:7000,lon:-30,lat:42},{at:14000,lon:26,lat:34},
           {at:21000,lon:96,lat:24},{at:30000,lon:-92,lat:36}],
    arcs: [{from:[-122.4,37.8],to:[-74.0,40.7],at:1400},{from:[-74.0,40.7],to:[-0.13,51.5],at:5200},
           {from:[-0.13,51.5],to:[13.4,52.5],at:9000},{from:[13.4,52.5],to:[34.78,32.08],at:13000},
           {from:[34.78,32.08],to:[77.59,12.97],at:17000},{from:[77.59,12.97],to:[139.7,35.7],at:21000}] },
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

window.addEventListener('resize', fitStage);
window.addEventListener('hashchange', function () {
  var id = (location.hash || '').replace('#', '');
  if (byId[id] && (!current || current.id !== id)) show(id);
});
document.addEventListener('DOMContentLoaded', function () {
  wireTransport();
  fitStage();
  var hash = (location.hash || '').replace('#', '');
  show(byId[hash] ? hash : 'start');
});

})();
