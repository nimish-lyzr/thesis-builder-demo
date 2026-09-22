# Thesis Builder — narrated product demo

A clickable, narrated demo of **Spotlight Thesis Builder** for Accenture: one question goes in,
five agents research the market, a thesis comes out — and then keeps itself current.

Fifteen screens, a persona picker, and a recorded voiceover that paces the walkthrough.

> Representative data. Nothing here connects to a live account, and company names in the
> universe are deliberately anonymised (`Company A`…`Company H`) so no invented funding or
> partnership claim attaches to a real business.

---

## What is in here

| Path | What it is |
|---|---|
| `web/` | The demo people actually open. Plain HTML/CSS/JS, no build step, no dependencies. |
| `web/audio/` | The narration, one mp3 per screen (ElevenLabs). |
| `design-canvas/` | The design source: fifteen `.dc.html` artboards + `canvas.json`, as authored in the Claude Design canvas. |
| `narration/` | The scripts the voiceover was recorded from, with voice direction and pronunciation notes. |
| `tools/build_web.py` | Regenerates `web/screens.css` and the view sections of `web/index.html` from `design-canvas/`. |
| `tools/make-landmask.mjs` | Rasterises a country atlas into the base64 land bitmap the globe draws from. |

## Running it

No build, no server dependencies:

```bash
cd web && python3 -m http.server 4599
```

Then open <http://localhost:4599>. It must be served over HTTP — opening `index.html` from the
filesystem will not play audio.

## How it works

**One page, fifteen views.** `web/app.js` hides and shows `<section class="view">` elements and
keeps the URL hash in sync. Each screen's behaviour — the typewriter, the counters, the AI column,
the comment thread, the thesis diff — is a small controller registered with `reg(id, …)`.

**The narration paces the walkthrough.** One reused `<audio>` element; when a file ends, the tour
advances itself. There are no hardcoded step timings. Browsers refuse to play audio before a user
gesture and do not say so, so `play()`'s rejection flips the transport bar to *Tap to play
narration* instead of pretending to be on. Picking a persona is that gesture.

**The spotlight is measured, not drawn.** On screens that name a `spot` selector, the tour finds
the live element, scrolls it to centre and tracks its bounding box for a couple of seconds, so the
highlight stays glued to real layout rather than to a guess.

**The globe is real.** `web/globe.js` draws an orthographic dot-stipple globe on canvas: ~9,500
land dots re-projected every frame, alpha quantised into six buckets so `fillStyle` is set six
times a frame rather than nine thousand, plus a graticule, travelling-dash great-circle arcs and a
camera that eases toward each new finding. The land mask is a 240×120 bitmap carried inline as
~4.8 KB of base64 — no atlas fetch, no network.

**Screens are a fixed 1440×900 frame scaled to fit the window.** That keeps the demo pixel-identical
to the approved design on any screen, which is why the markup can be lifted from the artboards
unchanged.

## Editing

Change copy or layout in `design-canvas/*.dc.html`, then:

```bash
python3 tools/build_web.py
```

That rewrites `web/screens.css` and the views inside `web/index.html`. Everything else in
`web/index.html` — the shell, the spotlight, the transport bar — is hand-written and is left alone.

The design system behind the visuals is Accenture Spotlight: Inter throughout, near-black primary
actions (`#171717`), purple action text (`#9333ea`), the Accenture chevron in `#a100ff`, hairline
borders at `#e5e5e5`, and the data-viz violet `rgb(168 110 214)` for the globe.

## Re-recording the narration

`narration/NARRATION_SCRIPTS.md` holds every line with its target duration. Files are named for the
screen they belong to (`01-onboarding.mp3` … `14-globelive.mp3`, plus the four `00-persona-*` lines)
and the screen list in `web/app.js` points at those names.
