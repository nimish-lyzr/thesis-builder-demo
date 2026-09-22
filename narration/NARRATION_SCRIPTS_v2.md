# Thesis Builder — per-step narration scripts (v2)

One recording per tour step. Spoken text is the card body, word for word — the card title is
visual only and is **not** read. Drop finished files into `web/audio/steps/` using the exact
filenames below, run `python3 tools/build_web.py`, and the tour picks them up; any step without
a recording falls back to the screen-level file from v1.

Voice direction, settings and pronunciation are unchanged from v1
(`NARRATION_SCRIPTS.md`): British English, measured, ~150 wpm, numbers as written.

The four persona lines (`00-persona-*.mp3`) are already recorded and still used.


---

## Onboarding  `onboarding`

### `onboarding-1.mp3` — It starts with you, not the market  *(~13s)*

> Thesis Builder asks who you are before it asks what you want to know. Company, what you do, your priorities and geography — everything the agents find later is scored against this.

### `onboarding-2.mp3` — Priorities become the scoring model  *(~10s)*

> These four chips are not tags. They are the weights the Strategy Agent uses to decide what “relevant to Accenture” means on every screen that follows.

### `onboarding-3.mp3` — Invest, partner, acquire — or just watch  *(~10s)*

> Track Market is selected, so the agents keep researching after the thesis is written. Pick Invest and the same run produces a pipeline instead.


---

## Your research team  `team`

### `team-1.mp3` — Five agents, one brief  *(~11s)*

> Each agent does one job: read the market, find gaps, research companies, connect it to Accenture, keep watching. They already know your priorities from the last screen.

### `team-2.mp3` — The one that never stops  *(~12s)*

> The Signal Agent is the reason this is a system and not a report. It keeps monitoring after the thesis ships, and only speaks when something changes a decision.


---

## Your first thesis  `question`

### `question-1.mp3` — One question is the whole brief  *(~12s)*

> No forms. The question you would put to a strategy team is the input. The agents turn it into a research plan, a market map and a company universe.

### `question-2.mp3` — What matters most weights the answer  *(~11s)*

> Tick what you care about and the scoring follows. Strategic relevance is weighted highest; investment opportunities is off, because this seat is tracking the market, not deploying capital.


---

## Home · Researching  `globe`

### `globe-1.mp3` — The agents are reading the market  *(~10s)*

> Every node is a place where something relevant to AI infrastructure is happening right now. The camera follows each new finding as it lands.

### `globe-2.mp3` — Live activity, as the sweep travels  *(~10s)*

> What you read here and what you see on the globe are the same event at the same moment — sources read, companies found, gaps forming.

### `globe-3.mp3` — Four minutes. 142 sources. 41 countries.  *(~6s)*

> You can leave. The run finishes on its own and the thesis appears in your workspace.


---

## AI Infrastructure · Overview  `market`

### `market-1.mp3` — What the market looks like today  *(~10s)*

> A hundred and twenty-six relevant companies across eight segments. Twenty-three matter to Accenture specifically. Four places where nobody has built what enterprises are asking for.

### `market-2.mp3` — Eight segments, four measures each  *(~10s)*

> Maturity, competitive density, investment activity and relevance. The relevance bar is the one that is yours — it comes straight from what you said at onboarding.


---

## AI Infrastructure · Market map  `whitespace`

### `whitespace-1.mp3` — Segments placed by how contested they are  *(~10s)*

> Crowded on the left, genuinely open on the right. This is the answer to “so what”: where a point of view is still worth having.

### `whitespace-2.mp3` — Named need, no credible supply  *(~9s)*

> Agent Identity & Access. Three companies, none past Series A, while fourteen enterprise programmes in your knowledge base name it as a blocker.

### `whitespace-3.mp3` — Demand ninety-two, supply fourteen  *(~10s)*

> The Whitespace Agent cites thirty-one sources for this. Two hyperscalers have shipped adjacent identity primitives — which is why monitoring is already armed on this gap.


---

## AI Infrastructure · Companies  `companies`

### `companies-1.mp3` — Who is building in this market  *(~9s)*

> A hundred and twenty-six companies scored against your thesis, sorted by fit — with stage, strategic relevance and the latest signal on each.

### `companies-2.mp3` — Ask the whole universe a question  *(~11s)*

> Add AI Column. The prompt is already filled in: which of these companies have Fortune 500 customers? The Company Intelligence Agent answers per company, with sources. Try it.

### `companies-3.mp3` — Every row opens up  *(~7s)*

> Company B: AI security, Series C, fit eighty-eight. Open it to see exactly what earned the score.


---

## Companies · Company B  `company`

### `company-1.mp3` — Why this company matters to the thesis  *(~11s)*

> Eighty-eight out of a hundred, ranked second of a hundred and twenty-six. The ring is not a feeling — every contribution beneath it is weighted and cited.

### `company-2.mp3` — What earned it, what drags it down  *(~12s)*

> Four positives and one drag, each with a weight: strong positioning, enterprise traction, alignment with the security whitespace, a hyperscaler partnership — against rising competition and a stretched valuation.

### `company-3.mp3` — Nothing is inferred without a source  *(~9s)*

> Every claim links to the document the agent read: a press release, a filing, a customer case study, an internal delivery note.

### `company-4.mp3` — Watch it, and the Signal Agent takes over  *(~10s)*

> Add to Watchlist keeps this company under observation. You are told when something here changes the thesis — not every time there is news.


---

## AI Infrastructure · Thesis  `thesis`

### `thesis-1.mp3` — The thesis is ready  *(~13s)*

> Six sections answering the question you asked: where the market is moving, how it is structured, where Accenture should pay attention, where the gaps are, who is building, and what to do next.

### `thesis-2.mp3` — Eighteen slides, in your template  *(~8s)*

> Action titles, the market map, the gap and the shortlist — generated, not exported. Invite collaborators before you publish.

### `thesis-3.mp3` — Monitoring was armed before you finished reading  *(~10s)*

> The Signal Agent now watches all a hundred and twenty-six companies and both gaps. This is the moment the thesis stops being a document.


---

## AI Infrastructure · Review  `collaborate`

### `collaborate-1.mp3` — Institutional knowledge enters here  *(~11s)*

> A comment is anchored to the exact sentence it is about. A practice lead has already left one: agent governance is what several enterprise clients are asking for.

### `collaborate-2.mp3` — A real thread, not a sticky note  *(~8s)*

> Aditi commented. Ravi replied with an @mention. Everyone on this thesis sees it — and so do the agents.

### `collaborate-3.mp3` — Reply — go on, type something  *(~11s)*

> The composer is live. Post the reply and watch the Strategy Agent read the thread and propose a change to the thesis. Accept it, and the version bumps.


---

## Home · 30 days later  `fastforward`

### `fastforward-1.mp3` — Thirty days pass. You did nothing.  *(~12s)*

> Your agents read several thousand articles and kept the seven that moved something — ranked by how much each one moves the thesis, not by how loud it was.

### `fastforward-2.mp3` — One of them changes the thesis  *(~9s)*

> The amber node in Seattle: a hyperscaler shipped enterprise identity for autonomous agents. That lands directly on your largest whitespace. Open it.


---

## Signals · Thesis-affecting  `signal`

### `signal-1.mp3` — Something changed in your thesis  *(~7s)*

> Detected two days ago and confirmed across six sources: Microsoft launched enterprise identity capabilities for autonomous AI agents.

### `signal-2.mp3` — Previous view, current view  *(~6s)*

> Large whitespace becomes whitespace narrowing. A platform default now exists for the identity layer itself.

### `signal-3.mp3` — Ninety-two to seventy-eight  *(~10s)*

> Opportunity attractiveness, re-scored. Three companies affected, two sections to update, confidence high. Nothing in the thesis has changed yet — the agents propose, you decide.

### `signal-4.mp3` — But the agents found something else  *(~12s)*

> Cross-Agent Governance and Auditability: not who the agent is, but who approved what it did, and whether a regulator could follow it afterwards. Demand rose while supply did not.


---

## Signals · Proposed update  `evolution`

### `evolution-1.mp3` — The old paragraph and the proposed one  *(~4s)*

> One paragraph in Market Gaps. Everything downstream of it follows automatically.

### `evolution-2.mp3` — What else moves if you accept  *(~9s)*

> Agent Identity drops from rank one to rank three. Cross-Agent Governance becomes a named gap. Three companies re-scored, two added, four slides regenerated.

### `evolution-3.mp3` — Accept, and it becomes version three  *(~8s)*

> Every version is kept. You can read what the thesis said on any date, and why it changed. Go ahead.


---

## Home  `globelive`

### `globelive-1.mp3` — Your intelligence, at a glance  *(~8s)*

> Four theses running. A hundred and thirty-seven companies under watch. Eighteen signals this week, two new gaps this month.

### `globelive-2.mp3` — Each thesis reports for itself  *(~12s)*

> AI Infrastructure updated three minutes ago with a new gap. Physical AI is mid-research with thirty-eight new companies. Robotics and Sovereign Cloud: nothing material — which is also worth knowing.

### `globelive-3.mp3` — Your agents keep working even when you are not  *(~10s)*

> You started with one question. You now have a team of agents continuously watching that market for you. Create another thesis whenever you are ready.


---

40 files · about 7 minutes of audio in total.
