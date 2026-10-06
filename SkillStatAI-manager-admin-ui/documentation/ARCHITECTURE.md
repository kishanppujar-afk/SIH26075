# Architecture

## Data Model

All application data flows through a single source of truth: `src/data/orgData.js`.

### Raw Data

- `departmentsRaw` — the organisation's 4 departments
- `managers` — 5 managers, each with a `skillGaps` object covering technical, communication, problem-solving, and leadership competencies
- `employees` — 14 employees, each linked to a manager and department, with their own `skillGaps` object

### Derived Functions

No value displayed in the UI is hardcoded. Every count, average, and chart is computed from the raw records at render time.

| Function | Purpose |
|---|---|
| `overallGap(person)` | Averages a person's four competency gaps into one score |
| `avgGapForGroup(people)` | Averages overall gap across a group |
| `getEmployeesByDepartment(id)` | Returns employees belonging to a department |
| `getEmployeesByManager(id)` | Returns employees reporting to a manager |
| `getManagersByDepartment(id)` | Returns managers within a department |
| `getDepartments()` | Builds the department list with live employee/manager counts and average gap |
| `getOrgStats()` | Organisation-wide totals |
| `getOrgAvgGap()` | Average gap across the entire organisation |
| `skillGapBreakdown(person)` | Converts a person's gaps into chart-ready data |

Deriving every figure this way removes an entire category of bugs — a count can never drift out of sync with the records it describes, since it is calculated from them directly rather than maintained separately.

## Routing

### Admin (no authentication required)

| Route | Component |
|---|---|
| `/admin` | `AdminDashboard.jsx` |
| `/admin/department/:departmentId` | `DepartmentDetails.jsx` |
| `/admin/manager/:managerId` | `ManagerDetails.jsx` |
| `/admin/manager/:managerId/employees` | `ManagerEmployees.jsx` |
| `/admin/employee/:employeeId` | `EmployeeDetails.jsx` |
| `/admin/compare` | `DepartmentComparison.jsx` |

### Manager (authentication required)

| Route | Component |
|---|---|
| `/login` | `Login.jsx` |
| `/manager` | `ManagerDashboard.jsx` |
| `/manager/employees` | `MyEmployees.jsx` |
| `/manager/employee/:employeeId` | `EmployeeDetails.jsx` |

## Navigation Behaviour

- **Department pages branch on manager count.** A department with multiple managers presents a selection list; a department with exactly one manager routes directly to that manager's view.
- **Breadcrumbs are context-aware.** The trail differs depending on whether a page was reached through the admin hierarchy or through a manager's own login session, so a logged-in manager never sees admin-only navigation.
- **Authentication is session-scoped in React state** (`AuthContext.jsx`), sufficient for this stage of the product and designed to be replaced by a server-issued session once a backend is connected.