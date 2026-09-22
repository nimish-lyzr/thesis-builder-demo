# Thesis Builder demo — narration scripts

For ElevenLabs. One file per screen of the clickable prototype
(https://claude.ai/artifact/NnWsorwE3HV3w4Sf11YTdx).

## Voice direction

- **Register:** a senior colleague walking a client through their own console. Analytical,
  unhurried, quietly confident. Never salesy, never hyped — the product is dense B2B tooling
  and the voice should match it.
- **Suggested voice:** British English, mid-to-low pitch, measured. Stability ~50, similarity ~75,
  style exaggeration low (0–15). Speed 0.95–1.0.
- **Pacing:** leave the pauses in. Each line is written to be read at roughly 150 words per
  minute; the em dashes and full stops are where the breaths go.
- **Pronunciation:** "Accenture" — ak-SEN-cher. "Bengaluru" — ben-ga-LOO-roo.
  "Lyzr" — LIE-zer. Read "3–5 years" as "three to five years", "p95" never appears here.
- **Numbers:** read as written — "a hundred and twenty-six", "eighty-eight out of a hundred".
  The scripts already spell these out where it matters.

---

## 0 · Persona picker — spoken on click

Three short lines, one per persona. These fire the moment someone picks a seat, so they are
deliberately brief — the screen they land on starts talking a beat later.

### `00-persona-practice-lead.mp3` (5s)
> Starting as Head of AI and Data Practice. Here's where your team's judgement enters the market map.

### `00-persona-ventures.mp3` (5s)
> Starting as Ventures Lead. Here's the company universe, scored against your thesis.

### `00-persona-client-partner.mp3` (5s)
> Starting as Client Account Lead. Here's what you can put in front of a client on Monday.

### `00-persona-full-tour.mp3` (6s)
> Starting from the beginning. One question, five agents, and a thesis that keeps itself current.

---

## 1 · Onboarding — `01-onboarding.mp3` (16s)

> Thesis Builder starts by learning how Accenture thinks. Your priorities, your geography, and
> what you're actually trying to do — invest, partner, acquire, or simply watch a market.
> Everything after this is shaped by what you put on this screen. Nothing it finds will be generic.

## 2 · Your research team — `02-team.mp3` (17s)

> Five specialist agents, already briefed on your priorities. One reads the market, one hunts for
> gaps, one researches companies, one connects everything back to Accenture — and the fifth never
> stops. It keeps watching long after the thesis is written.

## 3 · The question — `03-question.mp3` (14s)

> One question is enough. Where should Accenture be investing or focusing within AI infrastructure
> over the next three to five years? You tell it what matters, and the agents turn that into a
> research plan.

## 4 · The globe — `04-globe.mp3` (19s)

> Now they're reading the market. Every node is a place where something relevant to AI
> infrastructure is happening — San Francisco, Seattle, London, Tel Aviv, Bengaluru. The panel on
> the right is what they're finding as the sweep travels. A hundred and forty-two sources, across
> forty-one countries, in about four minutes.

## 5 · Market overview — `05-market.mp3` (17s)

> This is the market today. A hundred and twenty-six relevant companies across eight segments.
> Twenty-three of them matter to Accenture specifically — and four places where enterprises are
> asking for something nobody has built properly yet.

## 6 · Whitespace — `06-whitespace.mp3` (21s)

> This is the answer to "so what". Segments placed by how contested they are: crowded on the left,
> genuinely open on the right. And there it is — agent identity and access. As enterprises deploy
> hundreds of autonomous agents, controlling what each one is allowed to do is an unsolved
> problem. Demand ninety-two. Supply fourteen.

## 7 · Company universe — `07-companies.mp3` (19s)

> A market map is only useful if you can work it. A hundred and twenty-six companies, scored
> against your thesis. Add a column, ask a question in plain English — which of these already have
> Fortune 500 customers — and the agent answers it for every company, with sources.

## 8 · Company detail — `08-company.mp3` (17s)

> Every score opens up. Eighty-eight out of a hundred: what earned it, what drags it down, and the
> source behind each claim. Add it to your watchlist and the Signal Agent keeps this company under
> observation from here on.

## 9 · The thesis — `09-thesis.mp3` (18s)

> Six sections. Eighteen slides in Accenture's own template. Built from a hundred and forty-two
> sources, every one of them cited. And monitoring was armed before you'd even finished reading it.

## 10 · Collaboration — `10-collaborate.mp3` (20s)

> This is where your people's knowledge enters the thesis. A practice lead comments — we're seeing
> agent governance with several enterprise clients. You reply. The Strategy Agent proposes the
> change, re-scores the companies it affects, and waits. You decide. Version two.

## 11 · Thirty days later — `11-fastforward.mp3` (17s)

> Thirty days pass. You did nothing. Your agents read several thousand articles and kept the seven
> that moved something. One of them changes the thesis.

## 12 · The signal — `12-signal.mp3` (22s)

> Microsoft shipped enterprise identity for autonomous agents. That lands directly on your largest
> whitespace. It doesn't close the gap, but it sets the shape of it — attractiveness drops from
> ninety-two to seventy-eight. And while the agents were confirming that, they found the bigger
> question behind it: not who the agent is, but who approved what it did.

## 13 · Thesis evolution — `13-evolution.mp3` (19s)

> Nothing changes without you. The old paragraph, the proposed one, and everything downstream that
> moves if you accept — three companies re-scored, two newly discovered, four slides regenerated.
> Accept, and it becomes version three.

## 14 · Back to the globe — `14-globelive.mp3` (18s)

> You started with one question. Four theses now run continuously, a hundred and thirty-seven
> companies are under watch, and two new gaps opened this month. Your agents keep working even
> when you're not.

---

## Optional — a single sizzle read

If you want one continuous 60-second voiceover for a video cut rather than per-screen files:

### `sizzle-60s.mp3`

> Accenture asks one question: where should we be focusing in AI infrastructure over the next
> three to five years?
>
> Five agents go to work. They read a hundred and forty-two sources across forty-one countries,
> find a hundred and twenty-six companies, and map eight segments by how contested each one is.
>
> They surface a gap — agent identity and access — where enterprise demand is ninety-two and
> credible supply is fourteen.
>
> A practice lead adds what she's seeing with clients. The thesis updates. Version two.
>
> Thirty days later, a platform vendor ships into that gap. The agents notice, re-score the
> opportunity, and find the larger question behind it. Version three.
>
> One question in. A team of agents that never stops watching the market for you.

---

## Where the files go

The prototype currently narrates through the browser's own speech engine, which needs no files and
no sign-in — that stays as the fallback. To swap in these recordings I need to confirm whether the
Design canvas will accept audio uploads; its published asset types are images, fonts and text. Send
me one finished mp3 and I'll test it, and if audio is refused there are two routes:
export the recordings inside a silent mp4 (video assets are accepted), or run the demo from a
plain HTML artifact instead of the Design canvas, where audio is unrestricted.
