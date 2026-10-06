# Demonstration Notes

## Design Decisions Worth Explaining

- **Authentication is handled client-side.** This is an intentional simplification for the current stage of the project. It is designed to be replaced with server-issued sessions once the authentication service is connected.
- **All data is mock data**, structured to match the shape a live API response would take, so integrating a real backend later is a data-source change rather than a UI rewrite.
- **Recommendations are generated from a structured rule set rather than a live model call.** This demonstrates the intended behaviour — a suggestion tied to the person's specific gap, reviewed by a human — without introducing a live network dependency during a demonstration.
- **The query interface uses pattern matching rather than a hosted language model,** for the same reason: consistent, fast, and does not depend on network conditions at demo time.

## Demo Login Credentials

| Username | Password |
|---|---|
| `john.doe` | `pass123` |
| `sarah.smith` | `pass123` |
| `mike.johnson` | `pass123` |
| `anita.kumar` | `pass123` |
| `ravi.shah` | `pass123` |

## Suggested Walkthrough

1. Open `/admin` and begin with the query interface, skyline summary, and spotlight callout
2. Run a sample query — "which department is worst?"
3. Open the flagged department and walk through the insight summary, severity indicator, and recommendation
4. Approve or request an alternative recommendation
5. Continue the drill-down to a manager, then an individual employee
6. Open `/admin/compare` and select multiple departments
7. Log in as a manager to demonstrate role-scoped access — the view shows only that manager's own team

## Summary Statement

This module is the oversight layer of the platform. It gives an admin an immediate, prioritised view of organisational skill gaps, supports a full drill-down from department to individual employee, and generates a specific, reviewable recommendation at every level — all built on data that is calculated live rather than fixed in place. Managers receive a scoped view limited to their own team, consistent with role-based access.