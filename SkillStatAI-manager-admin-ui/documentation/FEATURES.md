# Feature Overview

Five capabilities turn the raw competency data into an active, opinionated dashboard rather than a passive report. All are implemented in `src/data/insights.js`, reading from the same underlying records as the rest of the application.

## Insight Summaries

Each department, manager, and employee page includes a generated summary sentence explaining the figure shown — how it compares to the organisational average, and which competency is the primary driver of the gap.

> "Price Statistics has an overall gap of 29%, close to the organisation average of 30%, driven primarily by Technical skills (35%)."

## Severity Flagging

Any individual or group with an overall gap of 40% or higher is marked with a "Critical" indicator. Below that threshold, no badge is shown, keeping attention focused on genuine priorities rather than distributed evenly across every page.

## Recommendation Engine

Each page suggests a relevant training action based on the person's weakest competency area. Each competency category offers three distinct course options, selected deterministically per individual — the same person sees a consistent recommendation across visits, while different individuals in the same category are not all shown identical text.

Recommendations include a review step: an admin can approve a suggestion or request an alternative before it is considered final.

## Organisational Spotlight

The admin overview automatically surfaces the department with the widest skill gap in the organisation, presented as a prominent, clickable summary rather than requiring the admin to locate it manually.

## Skyline Summary

A compact chart at the top of the admin overview shows every department's gap at a glance, giving an immediate sense of organisational health before any detailed data is opened.

## Query Interface

A natural-language input on the admin overview interprets a defined set of question patterns and responds with relevant information or navigates directly to the relevant view.

| Category | Recognised phrasing |
|---|---|
| Worst-performing department | "worst", "widest gap", "struggling", "needs attention" |
| Best-performing department | "best", "healthiest", "lowest gap" |
| Critical departments | "critical", "urgent", "over 40%" |
| Relative to average | "above average", "below average" |
| Comparison | "compare departments" |
| Organisational totals | "how many employees", "overall gap" |
| Direct lookup | any department name |

Suggested queries are shown alongside the input so a user can select one directly rather than typing, which also serves as a reliable fallback during live demonstrations.

## Summary

Together, these features complete the loop the platform is built around: a gap is identified, explained, flagged where urgent, matched to a recommended action, and reviewed by a person before being acted on.