/**
 * SkillStat AI - Manager/Admin UI API Client
 * Centralizes API calls, base URL resolution, and Bearer token injection.
 * Defaults base URL to http://127.0.0.1:8000 via VITE_API_BASE_URL.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('skillstat_admin_token') || localStorage.getItem('skillstat_token')
    : null;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const defaultHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.detail || `API request failed with status ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return await response.json();
  } catch (err) {
    console.error(`[SkillStat Admin API] Error on ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (email_or_id, password) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email_or_id, password }),
    }),
  getAuthMe: () => apiFetch('/api/auth/me'),

  // Capacity Connect CMS & Approvals (PS 26075)
  getPendingUsers: () => apiFetch('/api/admin/pending-users'),
  approveUser: (userId) => 
    apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/approve`, { method: 'POST' }),
  rejectUser: (userId) => 
    apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/reject`, { method: 'POST' }),
  matchTrainers: (subject) => 
    apiFetch('/api/competency/match-trainers', {
      method: 'POST',
      body: JSON.stringify({ subject }),
    }),
  publishAnnouncement: (data) =>
    apiFetch('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCapacityDashboards: () => apiFetch('/api/admin/capacity-dashboards'),
  uploadTrainerLibrary: (data) =>
    apiFetch('/api/trainer/library/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getTrainerLibrary: () => apiFetch('/api/trainer/library'),
  updateTrainerLibraryItem: (id, data) =>
    apiFetch(`/api/trainer/library/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTrainerLibraryItem: (id) =>
    apiFetch(`/api/trainer/library/${id}`, {
      method: 'DELETE',
    }),
  createManualQuiz: (data) =>
    apiFetch('/api/materials/manual-quiz', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createQuestionnaire: (data) =>
    apiFetch('/api/trainer/questionnaires', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getTraineeTelemetry: () => apiFetch('/api/trainer/trainee-telemetry'),
  approveEnrollment: (enrId) => apiFetch(`/api/trainer/enrollments/${enrId}/approve`, { method: 'POST' }),
  updateProfile: (data) =>
    apiFetch('/api/trainee/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Admin Endpoints
  getOrgSummary: () => apiFetch('/api/admin/organization-competency-summary'),
  getDepartmentCompetency: (departmentId) =>
    apiFetch(`/api/admin/department-competency/${encodeURIComponent(departmentId)}`),
  compareDepartments: (departmentIds = []) => {
    let query = '';
    if (departmentIds && departmentIds.length > 0) {
      const params = departmentIds.map((id) => `department_ids=${encodeURIComponent(id)}`).join('&');
      query = `?${params}`;
    }
    return apiFetch(`/api/admin/departments/compare${query}`);
  },
  getEmployeeCompetencyProfile: (employeeId) =>
    apiFetch(`/api/admin/employees/${encodeURIComponent(employeeId)}/competency-profile`),
  getManagerTeam: (managerId) =>
    apiFetch(`/api/admin/managers/${encodeURIComponent(managerId)}/team`),
  getSkillGapDistribution: () => apiFetch('/api/admin/skill-gap-distribution'),
  getTrainingParticipation: () => apiFetch('/api/admin/training-participation'),
  getTrainingEffectiveness: () => apiFetch('/api/admin/training-effectiveness'),

  // Manager Endpoints
  getMyTeam: () => apiFetch('/api/manager/my-team'),
  getMyTeamCompetency: () => apiFetch('/api/manager/team-competency'),

  // Materials & RAG Quiz Endpoints (Admin-only)
  uploadMaterial: (formData) =>
    apiFetch('/api/materials/upload', {
      method: 'POST',
      body: formData,
    }),
  listMaterials: () => apiFetch('/api/materials'),
  getMaterial: (materialId) => apiFetch(`/api/materials/${encodeURIComponent(materialId)}`),
  getMaterialChunks: (materialId) =>
    apiFetch(`/api/materials/${encodeURIComponent(materialId)}/chunks`),
  generateQuiz: (materialId, numQuestions = 5, title = null, deadline = null) =>
    apiFetch(`/api/materials/${encodeURIComponent(materialId)}/generate-quiz`, {
      method: 'POST',
      body: JSON.stringify({ num_questions: numQuestions, title, deadline }),
    }),
  getQuiz: (quizId) => apiFetch(`/api/quizzes/${encodeURIComponent(quizId)}`),
  publishQuiz: (quizId, isPublished = true) =>
    apiFetch(`/api/quizzes/${encodeURIComponent(quizId)}/publish`, {
      method: 'POST',
      body: JSON.stringify({ is_published: isPublished }),
    }),
  deleteMaterial: (materialId) =>
    apiFetch(`/api/materials/${encodeURIComponent(materialId)}`, {
      method: 'DELETE',
    }),
};

export default api;


