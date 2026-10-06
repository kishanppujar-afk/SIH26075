// Raw source-of-truth data
export const departmentsRaw = [
  { id: "labour-statistics", name: "Labour Statistics" },
  { id: "price-statistics", name: "Price Statistics" },
  { id: "national-accounts", name: "National Accounts" },
  { id: "survey-design", name: "Survey Design" },
];

export const managers = [
  { id: "MGR001", name: "John Doe", username: "john.doe", password: "pass123",
    departmentId: "labour-statistics",
    skillGaps: { technical: 18, communication: 12, problemSolving: 14, leadership: 10 } },

  { id: "MGR002", name: "Sarah Smith", username: "sarah.smith", password: "pass123",
    departmentId: "price-statistics",
    skillGaps: { technical: 25, communication: 20, problemSolving: 22, leadership: 15 } },

  { id: "MGR003", name: "Mike Johnson", username: "mike.johnson", password: "pass123",
    departmentId: "price-statistics",
    skillGaps: { technical: 22, communication: 26, problemSolving: 24, leadership: 34 } },

  { id: "MGR004", name: "Anita Kumar", username: "anita.kumar", password: "pass123",
    departmentId: "national-accounts",
    skillGaps: { technical: 40, communication: 35, problemSolving: 38, leadership: 30 } },

  { id: "MGR005", name: "Ravi Shah", username: "ravi.shah", password: "pass123",
    departmentId: "survey-design",
    skillGaps: { technical: 20, communication: 18, problemSolving: 16, leadership: 12 } },
];

export const employees = [
  // Labour Statistics — under John Doe (4 employees)
  { id: "EMP001", name: "Ananya Rao", managerId: "MGR001", departmentId: "labour-statistics",
    skillGaps: { technical: 48, communication: 30, problemSolving: 35, leadership: 25 } },
  { id: "EMP002", name: "Rohan Mehta", managerId: "MGR001", departmentId: "labour-statistics",
    skillGaps: { technical: 30, communication: 35, problemSolving: 32, leadership: 52 } },
  { id: "EMP003", name: "Priya Nair", managerId: "MGR001", departmentId: "labour-statistics",
    skillGaps: { technical: 18, communication: 15, problemSolving: 12, leadership: 10 } },
  { id: "EMP004", name: "Karan Singh", managerId: "MGR001", departmentId: "labour-statistics",
    skillGaps: { technical: 35, communication: 28, problemSolving: 30, leadership: 22 } },

  // Price Statistics — Sarah Smith (2 employees)
  { id: "EMP005", name: "Vikram Joshi", managerId: "MGR002", departmentId: "price-statistics",
    skillGaps: { technical: 42, communication: 30, problemSolving: 33, leadership: 20 } },
  { id: "EMP006", name: "Meera Iyer", managerId: "MGR002", departmentId: "price-statistics",
    skillGaps: { technical: 18, communication: 34, problemSolving: 20, leadership: 15 } },

  // Price Statistics — Mike Johnson (3 employees)
  { id: "EMP007", name: "Arjun Kapoor", managerId: "MGR003", departmentId: "price-statistics",
    skillGaps: { technical: 55, communication: 48, problemSolving: 50, leadership: 40 } },
  { id: "EMP008", name: "Sneha Pillai", managerId: "MGR003", departmentId: "price-statistics",
    skillGaps: { technical: 30, communication: 25, problemSolving: 28, leadership: 20 } },
  { id: "EMP009", name: "Farhan Ali", managerId: "MGR003", departmentId: "price-statistics",
    skillGaps: { technical: 38, communication: 32, problemSolving: 35, leadership: 25 } },

  // National Accounts — Anita Kumar (3 employees)
  { id: "EMP010", name: "Divya Menon", managerId: "MGR004", departmentId: "national-accounts",
    skillGaps: { technical: 60, communication: 55, problemSolving: 58, leadership: 45 } },
  { id: "EMP011", name: "Karthik Reddy", managerId: "MGR004", departmentId: "national-accounts",
    skillGaps: { technical: 30, communication: 32, problemSolving: 48, leadership: 28 } },
  { id: "EMP012", name: "Neha Bhatt", managerId: "MGR004", departmentId: "national-accounts",
    skillGaps: { technical: 50, communication: 46, problemSolving: 48, leadership: 38 } },

  // Survey Design — Ravi Shah (2 employees — this is the correct count)
  { id: "EMP013", name: "Ishaan Verma", managerId: "MGR005", departmentId: "survey-design",
    skillGaps: { technical: 25, communication: 20, problemSolving: 22, leadership: 15 } },
  { id: "EMP014", name: "Tanya Sharma", managerId: "MGR005", departmentId: "survey-design",
    skillGaps: { technical: 15, communication: 12, problemSolving: 10, leadership: 8 } },
];

// ---- Derived helper functions (single source of truth for all counts/stats) ----

export function overallGap(person) {
  if (!person) return 0;
  if (typeof person.overallGap === 'number') return Math.round(person.overallGap);
  if (person.domain_gaps) {
    const vals = Object.values(person.domain_gaps);
    if (vals.length) return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }
  const g = person.skillGaps;
  if (!g) return 0;
  const vals = Object.values(g);
  if (vals.length) return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  return 0;
}

export function avgGapForGroup(people) {
  if (!people.length) return 0;
  const total = people.reduce((sum, p) => sum + overallGap(p), 0);
  return Math.round(total / people.length);
}

export function getManagersByDepartment(departmentId) {
  return managers.filter((m) => m.departmentId === departmentId);
}

export function getEmployeesByManager(managerId) {
  return employees.filter((e) => e.managerId === managerId);
}

export function getEmployeesByDepartment(departmentId) {
  return employees.filter((e) => e.departmentId === departmentId);
}

export function getDepartments() {
  return departmentsRaw.map((dept) => {
    const deptEmployees = getEmployeesByDepartment(dept.id);
    const deptManagers = getManagersByDepartment(dept.id);
    const everyone = [...deptEmployees, ...deptManagers];
    return {
      ...dept,
      employeeCount: deptEmployees.length,
      managerCount: deptManagers.length,
      avgSkillGap: avgGapForGroup(everyone),
    };
  });
}

export function getDepartmentById(departmentId) {
  return getDepartments().find((d) => d.id === departmentId);
}

export function getEmployeeById(employeeId) {
  return employees.find((e) => e.id === employeeId);
}

export function getManagerById(managerId) {
  return managers.find((m) => m.id === managerId);
}

export function getOrgStats() {
  return {
    totalEmployees: employees.length,
    totalManagers: managers.length,
    totalDepartments: departmentsRaw.length,
  };
}

export function skillGapBreakdown(person) {
  return [
    { skill: "Technical", gapPercent: person.skillGaps.technical },
    { skill: "Communication", gapPercent: person.skillGaps.communication },
    { skill: "Problem Solving", gapPercent: person.skillGaps.problemSolving },
    { skill: "Leadership", gapPercent: person.skillGaps.leadership },
  ];
}
export function getOrgAvgGap() {
  const everyone = [...employees, ...managers];
  return avgGapForGroup(everyone);
}