# Demo Notes

## Known simplifications

Say these out loud in the demo — it shows you understand the tradeoffs, rather than hiding them:

- **Auth is client-side only** (`AuthContext.jsx`, plain React state) — fine for a hackathon prototype; the real system would rely on Person 1's backend for both authentication and source-of-truth data
- **All data is mock** — nothing is connected to a real database or API yet, though it's structured to match the shape a real API would return
- **Recommendations are mocked, not AI-generated** — a lookup table with 3 variants per category, not a live LLM call or real iGOT Karmayogi integration. Fine for demonstrating the *concept*, worth being upfront about if asked directly
- **Person 2's Employee-Portal branch is still early-stage** — worth checking its current state before the demo in case it's moved on since this was last noted

## Suggested pitch paragraph

> *"This is the admin and manager side of SkillStat AI. The moment an admin opens the dashboard, a skyline chart and a spotlight callout immediately show which department needs attention first — not buried in a list, but called out automatically. From there they can drill from department, to manager, to individual employee, with every number calculated live from actual records rather than hardcoded. Each level auto-generates a plain-English explanation of the gap and a suggested training action tied to the person's weakest skill area — so it's not just reporting a problem, it's pointing at a fix. Managers get their own login and see only their own team — role-based, not everyone-sees-everything."*

## Demo talking points

- **"These numbers aren't hardcoded, they're computed live from actual records."** — use this when showing any stat card, chart, or department tile. It's the difference between a mockup and a real calculation layer.
- **The Survey Design bug story** is a good concrete example if asked about testing/debugging: it once showed 22 employees when it should have shown 2, because a number was hardcoded outside the derived-data functions. Rebuilding everything to flow through `orgData.js`'s functions fixed it permanently.
- **The recommendation-variant fix** is a good example of iterative polish: testing showed every employee with the same weak skill getting the literal same recommendation text, which looked templated — now a deterministic hash of the person's ID picks between 3 variants per category.

## Visual design history

The UI went through 3 full redesign passes:

1. **Dark neon-purple/glassmorphism** — rejected, too much
2. **Clean minimalist** (off-white, navy accent, Inter font) — accepted as a base, later felt "too basic"
3. **Current: bold flat-colour tiles + black pill buttons** (Plus Jakarta Sans headings, Inter body) — inspired by an e-commerce "Shopcart" UI kit's visual language, not its shopping functionality — colour-coded department tiles, rounded-2xl cards, black rounded-full buttons

This was partly hand-built and partly restyled via **Lovable** (an AI app builder) — the codebase was given to Lovable to restyle components while the underlying logic was verified to stay correct.

**A note on team-wide visual consistency:** Arjun's module (Person 4) uses a warm cream/brown palette with a mountain-climbing metaphor and serif headlines — quite different from this bold-tile system. Both are appropriate to their own job (his is a personal, narrative quiz experience; this is a scannable oversight tool), but it's worth a team conversation about whether a shared visual thread should tie all 4 modules together for the final demo.

## Git setup, in plain terms

- Repo: `https://github.com/icemanbrook/SkillStatAI`
- This work sits on its own branch, **`manager-admin-ui`**, separate from Arjun's `main` and Person 2's `Employee-Portal`
- A **commit** is a saved snapshot of the project at a point in time — creating one locally (`git commit`) doesn't share it with anyone; **pushing** (`git push`) uploads it to GitHub for the team to see
- Work has been pushed in stages, so the branch's history shows the progression: base drill-down build → insight/severity/recommendation features → skyline + spotlight + query box + micro-interactions
- When the whole team is ready, someone opens a **Pull Request** to merge `manager-admin-ui` into `main` — that's a team decision, not something to do solo