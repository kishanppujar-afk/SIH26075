# Architecture

## The competency framework

Every person in the system (employee or manager) is scored on **4 skill domains**:

| Domain | What it represents |
|---|---|
| **Technical** | Core statistical/technical skills for the job |
| **Communication** | Ability to explain findings, write reports, present to stakeholders |
| **Problem Solving** | Diagnosing issues, handling ambiguity, fixing process problems |
| **Leadership** | Managing people, delegation, mentoring (more relevant for managers) |

Each domain has a **"gap percentage"** — the higher the number, the bigger the shortfall. The whole UI exists to visualize these 4 numbers at every level: individual employee, manager, department, and whole organisation.

---

## Data model — the single source of truth

Everything reads from one file: **`src/data/orgData.js`**.

### Raw data (mock — will eventually come from Person 1's backend)

- **`departmentsRaw`** — 4 departments: Labour Statistics, Price Statistics, National Accounts, Survey Design
- **`managers`** — 5 managers, each with their own `skillGaps` object
- **`employees`** — 14 employees, each belongs to one manager, each has their own `skillGaps` object

### Derived functions

Nothing is hardcoded — every number is computed live:

| Function | Purpose |
|---|---|
| `overallGap(person)` | Averages a person's 4 skill-domain gaps into one number |
| `avgGapForGroup(people)` | Averages a whole group's overall gaps |
| `getEmployeesByDepartment(id)` | Relationship filter |
| `getEmployeesByManager(id)` | Relationship filter |
| `getDepartments()` | Builds the full department list with live-calculated counts and averages |
| `getOrgStats()` | Org-wide totals |
| `getOrgAvgGap()` | Average gap across everyone |
| `skillGapBreakdown(person)` | Turns one person's numbers into chart-ready data |

**Why this matters:** early on, "Survey Design" once showed 22 employees when it should have shown 2, because a number was hardcoded. Rebuilding everything to flow through these functions fixed that permanently and can't regress.

---

## Routes

### Admin side — organisation-wide view (no login required)

| Route | Description |
|---|---|
| `/admin` | Organisation Overview — skyline hero, stat cards, spotlight callout, department tile grid (sorted worst-gap-first) |
| `/admin/department/:id` | Department Detail — 4-bar skill breakdown, insight sentence, Critical badge if ≥40%, recommendation card, then branches to a manager list (multi-manager depts) or straight to the manager's stats (single-manager depts) |
| `/admin/manager/:id` | Manager Detail — same insight/badge/recommendation treatment, at the manager level |
| `/admin/manager/:id/employees` | That manager's team, searchable if more than 5 people |
| `/admin/employee/:id` | Individual Employee Detail — radar chart of their 4 skill domains, insight sentence, critical badge, recommendation card |
| `/admin/compare` | Department Comparison — pick any number of departments (up to all 4), grouped bar chart across all 4 skill categories |

### Manager side — self-service view (login required)

A manager logs in and sees **only their own department and their own team** — role-based access, never org-wide data.

| Route | Description |
|---|---|
| `/login` | Username/password form. 5 valid manager logins exist, one per manager |
| `/manager` | The logged-in manager's own dashboard, same stats treatment as the admin-side manager view |
| `/manager/employees` | Their team, searchable |
| `/manager/employee/:id` | One of their employees, same detail view as the admin side, but the breadcrumb trail leads back to the manager's own pages |

---

## Navigation — breadcrumbs

Every drill-down page shows a **context-aware breadcrumb trail** at the top (e.g. `Admin > Price Statistics > Sarah Smith > Employees > Vikram Joshi`), fully clickable. A logged-in manager sees a shorter trail (`Your stats / My employees / [name]`) instead of the full admin chain — the app knows which "side" it was entered from.

---

## Auth

`src/context/AuthContext.jsx` holds manager login state as plain React state — client-side only. This is a deliberate hackathon simplification; the real system would rely on Person 1's backend for both authentication and source-of-truth data. See [DEMO_NOTES.md](./DEMO_NOTES.md) for the full list of simplifications.