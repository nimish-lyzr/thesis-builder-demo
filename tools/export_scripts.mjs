#!/usr/bin/env node
/* Write narration/NARRATION_SCRIPTS_v2.md from the step definitions in web/app.js.
   The card body IS the spoken line, so the scripts cannot drift from the tour.
   Run from the repo root:  node tools/export_scripts.mjs */
import fs from 'node:fs';
import vm from 'node:vm';

const src = fs.readFileSync(new URL('../web/app.js', import.meta.url), 'utf8');
const pick = (name) => {
  const m = src.match(new RegExp('var ' + name + ' = \\{[\\s\\S]*?\\n\\};'));
  if (!m) throw new Error(name + ' not found');
  return vm.runInNewContext('(' + m[0].slice(('var ' + name + ' = ').length, -1) + ')');
};
const STEPS = pick('STEPS');
const SCREENS = vm.runInNewContext('(' + src.match(/var SCREENS = \[[\s\S]*?\n\];/)[0].slice(14, -1) + ')');
const title = Object.fromEntries(SCREENS.map(s => [s.id, s.title]));

const words = (t) => t.trim().split(/\s+/).length;
const secs = (t) => Math.round(words(t) / 2.5);

let out = `# Thesis Builder — per-step narration scripts (v2)

One recording per tour step. Spoken text is the card body, word for word — the card title is
visual only and is **not** read. Drop finished files into \`web/audio/steps/\` using the exact
filenames below, run \`python3 tools/build_web.py\`, and the tour picks them up; any step without
a recording falls back to the screen-level file from v1.

Voice direction, settings and pronunciation are unchanged from v1
(\`NARRATION_SCRIPTS.md\`): British English, measured, ~150 wpm, numbers as written.

The four persona lines (\`00-persona-*.mp3\`) are already recorded and still used.

`;
let total = 0, totalSecs = 0;
for (const sid of Object.keys(STEPS)) {
  out += `\n---\n\n## ${title[sid]}  \`${sid}\`\n\n`;
  STEPS[sid].forEach((st, i) => {
    const file = `${sid}-${i + 1}.mp3`;
    total++; totalSecs += secs(st.b);
    out += `### \`${file}\` — ${st.t}  *(~${secs(st.b)}s)*\n\n> ${st.b}\n\n`;
  });
}
out += `\n---\n\n${total} files · about ${Math.round(totalSecs / 60)} minutes of audio in total.\n`;
fs.writeFileSync(new URL('../narration/NARRATION_SCRIPTS_v2.md', import.meta.url), out);
console.log(`wrote narration/NARRATION_SCRIPTS_v2.md — ${total} steps, ~${Math.round(totalSecs / 60)} min`);
