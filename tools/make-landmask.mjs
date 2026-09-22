import { readFileSync } from 'node:fs';
import { feature } from '/Users/nimish-medatwal/Downloads/repo-worktrees/fe-globe/node_modules/topojson-client/src/index.js';
import { geoContains } from '/Users/nimish-medatwal/Downloads/repo-worktrees/fe-globe/node_modules/d3-geo/src/index.js';

const topo = JSON.parse(readFileSync('/Users/nimish-medatwal/Downloads/repo-worktrees/fe-globe/public/geo/countries-110m.json','utf8'));
const key = Object.keys(topo.objects)[0];
const land = feature(topo, topo.objects[key]);
console.error('features', land.features.length);

const STEP = 1.5;
const W = Math.round(360/STEP), H = Math.round(180/STEP);
const bits = new Uint8Array(Math.ceil(W*H/8));
let count = 0;
for (let j = 0; j < H; j++) {
  const lat = 90 - (j + 0.5) * STEP;
  for (let i = 0; i < W; i++) {
    const lon = -180 + (i + 0.5) * STEP;
    let hit = false;
    for (const f of land.features) { if (geoContains(f, [lon, lat])) { hit = true; break; } }
    if (hit) { const idx = j*W+i; bits[idx>>3] |= (1 << (7-(idx&7))); count++; }
  }
}
console.error('W',W,'H',H,'land cells',count);
console.log(Buffer.from(bits).toString('base64'));
