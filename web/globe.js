/* The Spotlight globe, ported from the always-on-v0 canvas renderer.

   Orthographic, drawn as a field of dots rather than filled outlines. The land
   mask is a 240x120 bitmap rasterised offline from the 110m country atlas and
   carried here as base64: no atlas fetch, no network, ~4.8 KB. */

var MASK = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//8////44AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPx/n////+AAAA/AAYAAAAfAAAAAAAAAAAAAAAAEO3v4f////+AAAPgAAAAAAAAcAAAAAAAAAAAAAADAAAfgP////+AAAHAAAAAAAAAMAAAAAAAAAAAAAAA9jjCAAP///+AAAAAAAAHgAAP/8AAPAAAAAAAAAAcAAAAAAD///8AAAAAAAAYAAD//gAAAAAAAAAAAAAe6zs/AAB///4AAAAAAABgDA/////wGAAAAwAEAAAI/wM//AAf//4AAAAAAABwHf/////z/+AABAB//wPI/+sEP4A///wAAAAf8AACHf////////8B8wH/////ww3mB4Af/8AAAAD//xjf7v///////////7A////////+B/g//gAAAAH//4///f///////////GH////////0P5Af4AH4AAPx+H///////////////AAf///////Ng+AP4ADAAA/n////////////////+AD///////8COMAHwAAAAD/P///////////////v8AD/7/////4APwABgAAAAH/P//////////////wfAAA+AH////4APzAAAAAAAD/D/////////////JhgAAAHAAf///8AH/gAAAAAIAOD////////////4AHAAAAQAAP////wH/gAAAAAMBuP////////////wAPgAACAAAH////+f/8AAAAAWAhf////////////AAPAAAAAAAT////+f/+AAAAA3H//////////////+AOAAAAAAAB/////f/8AAAAAHn//////////////+AIAAAAAAAB//////8wAAAAAMf//////////////9AAAAAAAAAA//////2HAAAAAF///////////////4AAAAAAAAAAf/////+AgAAAAD///////////////4AAAAAAAAAAf//////wAAAAAB///yfx/////////wAAAAAAAAAAf/////yAAAAAAB/z/gPj/////////jAAAAAAAAAAf/////gAAAAAA/wY/gDx////////8HAAAAAAAAAAf/////AAAAAAA/gGfnn4////////wAAAAAAAAAAAf////+AAAAAAA/ACY//4///////1gGAAAAAAAAAAP////8AAAAAAA/ACM//4///////hwEAAAAAAAAAAH////4AAAAAAAOLgA//////////4wcAAAAAAAAAAH////4AAAAAAAN/gDC/////////wz8AAAAAAAAAAB////wAAAAAAAf/gAA/////////wDgAAAAAAAAAAA////AAAAAAAA//8YB/////////4EAAAAAAAAAAAAX///AAAAAAAA///f//////////4AAAAAAAAAAAAAX/5BAAAAAAAB//////z///////4AAAAAAAAAAAAAb/gBAAAAAAAH////8/5///////4AAAAAAAAAAAAAF/gBoAAAAAAP////+/4f//////wAAAAAAAAAAAAAE/gAAAAAAAAP////+f8wH/////gAAAAAAAAAAAAAAfgAAAAAAAAf/////P/4D/////IAAAAAAAAAAAAAAPgAQAAAAAAf/////v/8D/+f/4AAAAAAAAAAAAAAAPgwOAAAAAAf/////n/4Af8P+AAAAAAAAAAAAAAAAHxwAwAAAAAf/////n/wAfwH+wAAAAAAAAAAAAAAAB/gAAAAAAAf/////z/gAfgH+AMAAAAAAAAAAAAAAAT8AAAAAAAf/////z+AAfAF/AIAAAAAAAAAAAAAAAB+AAAAAAAf/////94AAOAB/gIAAAAAAAAAAAAAAAAMAAAAAAAf//////AAAOAA/gCAAAAAAAAAAAAAAAAEBQAAAAAP/////+MAAGAAHAFAAAAAAAAAAAAAAAACDfgAAAAH//////8AAGAACAAAAAAAAAAAAAAAAAABP/wAAAAH//////4AABABgADAAAAAAAAAAAAAAAAAP/4AAAAD//////4AABAAQABAAAAAAAAAAAAAAAAAP//gAAAA/H////wAAAACYBgAAAAAAAAAAAAAAAAAH//wAAAAAA////wAAAADYDAAAAAAAAAAAAAAAAAAP//wAAAAAA////gAAAABoPgAAAAAAAAAAAAAAAAAf//4AAAAAA///+AAAAAA4fuQAAAAAAAAAAAAAAAA///+AAAAAA///8AAAAAAYfASAAAAAAAAAAAAAAAA////AAAAAA///4AAAAAAcfYBYAAAAAAAAAAAAAAA////8AAAAAf//4AAAAAAOCEh/AAAAAAAAAAAAAAA/////AAAAAP//wAAAAAAGAAAPgAAAAAAAAAAAAAA/////gAAAAP//wAAAAAADIABPwIAAAAAAAAAAAAAf////gAAAAH//wAAAAAAAOAAPYCAAAAAAAAAAAAAP////AAAAAH//4AAAAAAAACAAMAAAAAAAAAAAAAAP///+AAAAAH//4AAAAAAAAAAAAAAAAAAAAAAAAAAH///+AAAAAH//4AAAAAAAAAHhAAAAAAAAAAAAAAAH///8AAAAAP//4IAAAAAAAAvjAAAAAAAAAAAAAAAD///8AAAAAP//4cAAAAAAAB/jgAAAAAAAAAAAAAAA///8AAAAAP//h4AAAAAAAD/7gAAAAAAAAAAAAAAAf//8AAAAAP//B4AAAAAAAH//wAAAAAAAAAAAAAAAf//4AAAAAH/+AwAAAAAAAf//4AQAAAAAAAAAAAAAf//4AAAAAH//BwAAAAAAB///8AIAAAAAAAAAAAAAf//gAAAAAD//BwAAAAAAD///+AAAAAAAAAAAAAAAf/8AAAAAAD/+BgAAAAAAD////AAAAAAAAAAAAAAAf/8AAAAAAD/8AAAAAAAAD////AAAAAAAAAAAAAAAf/8AAAAAAD/8AAAAAAAAD////AAAAAAAAAAAAAAA//4AAAAAAB/4AAAAAAAAB////AAAAAAAAAAAAAAA//wAAAAAAA/wAAAAAAAAB////AAAAAAAAAAAAAAA//gAAAAAAA/gAAAAAAAAB/h//AAAAAAAAAAAAAAA//AAAAAAAA+AAAAAAAAAB+Av+AAAAAAAAAAAAAAA/8AAAAAAAAAAAAAAAAAAAAAP8AAQAAAAAAAAAAAB/8AAAAAAAAAAAAAAAAAAAAAH8AAIAAAAAAAAAAAB/4AAAAAAAAAAAAAAAAAAAAADQAAOAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAB+AAAAAAAAAAAAAAAAAAAAAAAYAAIAAAAAAAAAAAB+AAAAAAAAAAAAAAAAAAAAAAAYAAwAAAAAAAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAAAAAAAAADwAACAefH/gAAAAAAAAAAAAAAAAEAAAAAAAAAAAB//8B///////4AAAAAAAAAAAAAAA/AAAAAAAAAAH///8P////////8AAAAAAAAAAAAAB3gAAAAATf//////8//////////+AAAAAAAAAAAgAHgAAAAH////////////////////AAAAAAAB4B////gAAAAP///////////////////4AAAAD////////4AAAAD////////////////////gAAALP///////8AAAAD/////////////////////gAABj////////wAAHg//////////////////////4AAAAD///////8AQ/AB////////////////////+AAAAB//////////AGP//////////////////////AAAAA///////////////////////////////////8A/8AAf///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////';
var MW = 240, MH = 120, MSTEP = 1.5;

function Globe(canvas, opts) {
  this.canvas = canvas;
  this.opts = opts;
  this.ctx = canvas.getContext('2d');
  this.buckets = [[], [], [], [], [], []];
  this.spin = opts.spin0 == null ? -40 : opts.spin0;
  this.lat0 = opts.lat0 == null ? 16 : opts.lat0;
  this.R = opts.radius;
  this.size = opts.size;
  this.dot = 1.15;
  this.arcs = opts.arcs || [];
  this.tour = opts.tour || null;
  this.scan = !!opts.scan;
  this.now = 0;
  this.buildField();
  this.resize(1);
}

Globe.prototype.buildField = function () {
  var bin = atob(MASK), lon = [], sin = [], cos = [];
  for (var j = 0; j < MH; j++) {
    var lat = 90 - (j + 0.5) * MSTEP;
    if (lat > 83 || lat < -83) continue;
    var r = lat * Math.PI / 180, s = Math.sin(r), c = Math.cos(r);
    for (var i = 0; i < MW; i++) {
      var idx = j * MW + i;
      if (!((bin.charCodeAt(idx >> 3) >> (7 - (idx & 7))) & 1)) continue;
      lon.push((-180 + (i + 0.5) * MSTEP) * Math.PI / 180);
      sin.push(s); cos.push(c);
    }
  }
  this.field = { lon: Float64Array.from(lon), sin: Float64Array.from(sin), cos: Float64Array.from(cos), n: lon.length };
};

/* The stage is scaled to fit the window, so the backing store is sized by the
   device ratio AND that scale — otherwise the dots soften as the page grows. */
Globe.prototype.resize = function (stageScale) {
  var dpr = Math.min(2.5, (window.devicePixelRatio || 1) * (stageScale || 1));
  this.canvas.width = Math.round(this.size * dpr);
  this.canvas.height = Math.round(this.size * dpr);
  this.ctx = this.canvas.getContext('2d');
  this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  this.cx = this.size / 2;
  this.cy = this.size / 2;
};

/* The stage is fluid now: the screen tells the globe how big it may be, and
   the radius keeps the proportion the design was drawn at (300 of 820). */
Globe.prototype.setSize = function (size, stageScale) {
  this.size = size;
  this.R = size * (300 / 820);
  this.resize(stageScale || 1);
};

Globe.prototype.project = function (lonDeg, latDeg, lift) {
  var d = Math.PI / 180;
  var lo = (lonDeg - this.spin) * d, la = latDeg * d;
  var c0 = this.cosLat0, s0 = this.sinLat0;
  var cl = Math.cos(la), sl = Math.sin(la), cd = Math.cos(lo), sd = Math.sin(lo);
  var z = s0 * sl + c0 * cl * cd;
  var k = this.R * (lift || 1);
  return { x: this.cx + k * cl * sd, y: this.cy - k * (c0 * sl - s0 * cl * cd), depth: z, visible: z > 0.04 };
};

Globe.prototype.polyline = function (pts, lift) {
  var ctx = this.ctx, open = false;
  for (var i = 0; i < pts.length; i++) {
    var p = this.project(pts[i][0], pts[i][1], lift);
    if (!p.visible) { open = false; continue; }
    if (!open) { ctx.moveTo(p.x, p.y); open = true; } else ctx.lineTo(p.x, p.y);
  }
};

Globe.prototype.draw = function (now) {
  var ctx = this.ctx, cx = this.cx, cy = this.cy, R = this.R;
  ctx.clearRect(0, 0, this.size, this.size);
  this.cosLat0 = Math.cos(this.lat0 * Math.PI / 180);
  this.sinLat0 = Math.sin(this.lat0 * Math.PI / 180);

  var g = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, R * 0.08, cx, cy, R * 1.02);
  g.addColorStop(0, 'rgba(253,250,255,0.99)');
  g.addColorStop(0.62, 'rgba(247,241,253,0.94)');
  g.addColorStop(1, 'rgba(236,225,248,0.80)');
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.28319); ctx.fillStyle = g; ctx.fill();

  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(140,90,190,0.11)';
  ctx.beginPath();
  for (var lo = -180; lo < 180; lo += 20) {
    var mer = []; for (var la = -80; la <= 80; la += 4) mer.push([lo, la]);
    this.polyline(mer);
  }
  for (var la2 = -60; la2 <= 60; la2 += 20) {
    var par = []; for (var lo2 = -180; lo2 <= 180; lo2 += 4) par.push([lo2, la2]);
    this.polyline(par);
  }
  ctx.stroke();

  /* Land, as a stipple. Alpha is quantised into six buckets so fillStyle is set
     six times a frame rather than nine thousand, and each dot is a fillRect
     rather than an arc — measured at several times the speed. */
  var f = this.field, spin = this.spin * Math.PI / 180;
  var c0 = this.cosLat0, s0 = this.sinLat0, DOT = this.dot, B = 6, buckets = this.buckets;
  for (var b = 0; b < B; b++) buckets[b].length = 0;
  for (var i = 0; i < f.n; i++) {
    var lo3 = f.lon[i] - spin;
    var cd = Math.cos(lo3), sd = Math.sin(lo3), cl = f.cos[i], sl = f.sin[i];
    var z = s0 * sl + c0 * cl * cd;
    if (z <= 0.035) continue;
    buckets[z >= 0.999 ? B - 1 : (z * B) | 0].push(cx + R * cl * sd, cy - R * (c0 * sl - s0 * cl * cd));
  }
  for (var b2 = 0; b2 < B; b2++) {
    var pts = buckets[b2]; if (!pts.length) continue;
    ctx.fillStyle = 'rgba(168,110,214,' + (0.26 + 0.52 * (b2 / (B - 1))).toFixed(3) + ')';
    for (var k = 0; k < pts.length; k += 2) ctx.fillRect(pts[k] - DOT, pts[k + 1] - DOT, DOT * 2, DOT * 2);
  }

  if (this.scan) {
    var head = ((now / 42) % 360) - 180;
    for (var t = 0; t < 5; t++) {
      var pts2 = []; for (var la3 = -82; la3 <= 82; la3 += 3) pts2.push([head - t * 5, la3]);
      ctx.beginPath(); this.polyline(pts2);
      ctx.lineWidth = t === 0 ? 1.8 : 1.2;
      ctx.strokeStyle = 'rgba(147,51,234,' + (0.30 - t * 0.055).toFixed(3) + ')';
      ctx.stroke();
    }
  }

  for (var a = 0; a < this.arcs.length; a++) {
    var A = this.arcs[a];
    if (now < A.at) continue;
    var age = Math.min(1, (now - A.at) / 900);
    var dl = ((A.to[0] - A.from[0] + 540) % 360) - 180;
    ctx.beginPath();
    var drawn = 0;
    for (var s2 = 0; s2 <= 30; s2++) {
      var u = (s2 / 30) * age;
      var p2 = this.project(A.from[0] + dl * u, A.from[1] + (A.to[1] - A.from[1]) * u, 1 + 0.16 * Math.sin(Math.PI * u));
      if (!p2.visible) { drawn = 0; continue; }
      if (!drawn) { ctx.moveTo(p2.x, p2.y); drawn = 1; } else ctx.lineTo(p2.x, p2.y);
    }
    ctx.setLineDash([5, 7]);
    ctx.lineDashOffset = -(now / 26) % 12;
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = 'rgba(147,51,234,0.42)';
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.28319);
  ctx.lineWidth = 1.25; ctx.strokeStyle = 'rgba(140,90,190,0.34)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, R + 9, 0, 6.28319);
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(140,90,190,0.10)'; ctx.stroke();
};

Globe.prototype.step = function (now) {
  this.now = now;
  if (this.tour) {
    var tgt = null;
    for (var q = 0; q < this.tour.length; q++) if (now >= this.tour[q].at) tgt = this.tour[q];
    if (tgt) {
      var dl = ((tgt.lon - this.spin + 540) % 360) - 180;
      this.spin += dl * 0.026;
      if (tgt.lat != null) this.lat0 += (tgt.lat - this.lat0) * 0.026;
    }
  }
  this.spin += this.opts.speed == null ? 0.055 : this.opts.speed;
  this.draw(now);
};

/* Markers live in the DOM, not on the canvas: there are only a handful and they
   need to be hoverable and readable. */
Globe.prototype.place = function (nodes, now, offX, offY) {
  var out = [];
  for (var i = 0; i < nodes.length; i++) {
    var m = nodes[i];
    var p = this.project(m.lon, m.lat);
    var born = now - (m.at || 0);
    var grow = born > 0 ? Math.min(1, born / 520) : 0;
    var vis = p.visible && p.depth > 0.14 && born > 0;
    out.push({
      label: m.label, note: m.note, kind: m.kind || 'discovered',
      dotClass: 'mk mk-' + (m.kind || 'discovered'),
      tf: 'translate(' + ((offX + p.x) | 0) + 'px,' + ((offY + p.y) | 0) + 'px) scale(' + (0.6 + 0.4 * grow).toFixed(2) + ')',
      op: vis ? ((0.22 + 0.78 * Math.min(1, (p.depth - 0.14) / 0.3)) * grow).toFixed(2) : 0,
      haloOp: m.pulse ? 1 : 0,
      big: !!m.big,
      z: vis ? 2 : -1
    });
  }
  return out;
};
