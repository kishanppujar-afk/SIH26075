# The "Smart" Features

These are the features where the AI-platform pitch comes alive. All of them read from the same skill-gap numbers already computed in `orgData.js` — nothing here needs new data, only new interpretation of it.

## Insight banner

**`generateInsight()`** in `src/data/insights.js`, rendered by `InsightBanner.jsx`

Auto-generates a one-line plain-English sentence for any department, manager, or employee, e.g.:

> *"Price Statistics has an overall gap of 29%, close to the organisation average of 30%, driven primarily by Technical skills (35%)."*

## Severity badge

**`getSeverity()`** in `src/data/insights.js`, rendered by `SeverityBadge.jsx`

A red **"Critical"** flag (with a spring-pop entrance animation) appears next to any name whose overall gap is **≥ 40%**. Below that threshold, nothing shows — this keeps the UI uncluttered and draws the eye only where intervention is urgent.

## Recommendation card

**`getRecommendation()`** in `src/data/insights.js`, rendered by `RecommendationCard.jsx`

For every department, manager, or employee, a card suggests a specific mock training course tied to their weakest skill domain. Each category has **3 different course variants**, and which one shows is picked by a deterministic hash of the person's ID — so the same person always sees the same recommendation on reload, but two people who share the same weak category won't necessarily see an identical card.

This was specifically fixed after testing showed every employee getting the literal same text, which looked templated.

An **admin can approve or request an alternative recommendation** — a human-in-the-loop step so the tool suggests rather than dictates.

## Spotlight callout

**`SpotlightCallout.jsx`**

Sits at the top of the Admin Overview. Automatically identifies the single worst-performing department org-wide and calls it out in a bold, clickable card, e.g.:

> *"National Accounts has the widest skill gap in the organisation — 43% (14% above the org average)."*

This is the dashboard actively telling the viewer where to look first, not just letting them find it themselves.

## Skyline hero

**`SkylineHero.jsx`**

A compact bar chart at the very top of the Admin Overview, one bar per department, height proportional to gap %, colour-matched to each department's tile colour, with a staggered rise-in animation on page load. Gives an instant, glanceable "shape" of the whole organisation's health before any numbers are even read.

## Natural-language query box

**`QueryBox.jsx`**

A text input on the Admin Overview that interprets plain-English questions and navigates straight to the answer — no dropdowns, no filters. It normalizes the input and pattern-matches against:

- **Direct department name mentions** → jumps straight to that department's detail page
- **"worst / widest / most critical / struggling"** → finds the department with the highest gap
- **"best / healthiest / strongest"** → finds the department with the lowest gap
- **"critical / urgent / above 40"** → lists all departments at or above the 40% threshold
- **"above average / below average"** → filters departments relative to the org mean
- **"compare / versus / side by side"** → opens the Department Comparison page

Each match both navigates and returns a short spoken-style answer (e.g. *"National Accounts has the widest gap in the organisation at 43%. Taking you there."*), so the box behaves like a lightweight assistant rather than a search bar.

## Supporting polish

- **`DashboardSkeleton.jsx`** — a loading-state placeholder (pulsing grey blocks matching the real layout) shown while a dashboard page's data is being prepared, so navigation never shows a blank flash
- **`LastUpdated.jsx`** — a small "Data last synced Xm ago" indicator, ticking upward every 30 seconds, reinforcing that the numbers reflect a live (eventually real) data source rather than a static export

---

## Why this all matters for the pitch

Together, these features close the loop the whole platform promises:

**identify the gap → explain it → flag urgency → recommend a specific fix → surface the worst case automatically → let a human ask follow-up questions in plain English.**

That's the actual value proposition of SkillStat AI, visible on every page of this module.