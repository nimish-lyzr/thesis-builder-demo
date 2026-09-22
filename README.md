# Thesis Builder — guided product demo

A clickable, narrated demo of **Spotlight Thesis Builder** for Accenture: one question goes in,
five agents research the market, a thesis comes out — and then keeps itself current.

One product shell, fourteen screens, a persona picker, and a guided tour that sits *beside* the
product rather than replacing it: every step is a readable card anchored to a real element, and
narration is optional.

> Representative data. Nothing here connects to a live account, and company names in the
> universe are deliberately anonymised (`Company A`…`Company H`) so no invented funding or
> partnership claim attaches to a real business.

---

## What is in here

| Path | What it is |
|---|---|
| `web/` | The demo people open. Plain HTML/CSS/JS, no build step, no dependencies. |
| `web/audio/` | Screen-level narration from v1 (one mp3 per screen) and the four persona lines. |
| `web/audio/steps/` | Per-step recordings. Drop files in here — see *Recording* below. |
| `design-canvas/` | The design source: fifteen `.dc.html` artboards + `canvas.json`, as authored in the Claude Design canvas. |
| `narration/NARRATION_SCRIPTS_v2.md` | **The per-step scripts to record from** — generated from the tour definitions, so they cannot drift. |
| `narration/NARRATION_SCRIPTS.md` | v1 screen-level scripts, kept for voice direction and settings. |
| `tools/build_web.py` | Regenerates `web/screens.css`, the view sections of `web/index.html`, and the recordings manifest. |
| `tools/export_scripts.mjs` | Regenerates the v2 scripts from `web/app.js`. |
| `tools/make-landmask.mjs` | Rasterises a country atlas into the base64 land bitmap the globe draws from. |

## Running it

```bash
cd web && python3 -m http.server 4599
```

Then open <http://localhost:4599>. It must be served over HTTP; opening `index.html` from the
filesystem will not play audio. It is a desktop console and asks for at least 1,100px of width.

## How it works

**A persistent shell.** `web/index.html` holds one header (brand, current screen, *Viewing as*
persona menu, *Replay tour*, *Reset demo*), one sidebar, and a canvas the fourteen screens swap
inside. Screens render at native size and scroll if they need to — nothing is scaled.

**Personas choose a route, not a slideshow.** Picking a seat on the launcher opens the console on
the screen that seat cares about, with a dismissable banner explaining what they will see and a
**Start the tour** button. Nothing plays before that button.

**The tour is coach marks, not a transport bar.** A tour is a list of steps; each names a screen
and an anchor selector. Showing a step switches the screen if needed, polls for the anchored
element for up to four seconds, scrolls it to centre and tracks its bounding box; a 340px card is
placed below → above → right → left → centred, clamped to the viewport, and the scrim is cut out
around the element so the product stays legible. Back, Next, clickable dots, `←`/`→`, `Esc`,
clicking the scrim, *Skip tour*, and *Replay tour* all work. Navigating away in the product hides
the card and offers *Resume tour*.

**Audio is subordinate.** Each step plays `web/audio/steps/<screen>-<n>.mp3` if the manifest lists
it, otherwise the screen-level v1 recording on the screen's first step, otherwise nothing. When a
file ends the tour advances; without audio a reading-time timer does the same; anything the reader
clicks in the product pauses auto-advance until they press Next. A blocked `play()` is shown as
*Play narration* on the card rather than silently failing.

**The globe is real.** `web/globe.js` draws an orthographic dot-stipple globe on canvas from an
inline base64 land bitmap, with a camera that eases toward each new finding. It sizes itself to
whatever the screen gives it.

## Editing

Change copy or layout in `design-canvas/*.dc.html`, then:

```bash
python3 tools/build_web.py
```

That rewrites `web/screens.css`, the views inside `web/index.html` (between the
`<!-- views:start -->` / `<!-- views:end -->` markers), and `web/audio/steps.json`. The shell, the
tour and the step definitions live in `web/index.html`, `web/app.css` and `web/app.js` and are
hand-written.

Tour steps are the `STEPS` object in `web/app.js`: `t` title, `b` body (also the spoken line),
`sel` a selector inside the screen, `up` how many parents to climb to the block to highlight.
After changing them, regenerate the scripts:

```bash
node tools/export_scripts.mjs
```

## Recording

1. Record each step from `narration/NARRATION_SCRIPTS_v2.md` — the card body, word for word.
2. Name each file exactly as listed (`whitespace-2.mp3`, `signal-4.mp3` …) and put it in `web/audio/steps/`.
3. Run `python3 tools/build_web.py` so the manifest lists it.

Steps without a recording keep working; they just fall back to the v1 screen recording.

## Design system

Accenture Spotlight throughout: Inter, near-black primary actions (`#171717`), purple action text
(`#9333ea`), the Accenture chevron in `#a100ff`, hairline borders at `#e5e5e5`, and the data-viz
violet `rgb(168 110 214)` for the globe.
