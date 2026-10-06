/**
 * SkillStat AI API Client
 * Centralizes API calls, base URL resolution, and error handling.
 * Defaults base URL to http://127.0.0.1:8000 via VITE_API_BASE_URL.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('skillstat_token') : null;

  const defaultHeaders = {
    'Content-Type': 'application/json',
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
      if (response.status === 401) {
        console.warn(`[SkillStat API] 401 Unauthorized for ${endpoint}. Using fallback demo state.`);
      }
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.detail || `API request failed with status ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      console.warn(`[SkillStat API] Backend unreachable at ${url}. Operating with offline fallback data.`);
    } else {
      console.warn(`[SkillStat API] Error fetching ${endpoint}:`, err.message);
    }
    throw err;
  }
}

export const api = {
  // Auth endpoints (Phase 3A/3B)
  login: (email_or_id, password) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email_or_id, password }),
    }),
  register: (data) =>
    apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAuthMe: () => apiFetch('/api/auth/me'),

  // 1. Employee data (consumed by Dashboard, Profile, KpiStatsRow, Sidebar)
  getEmployeeMe: () => apiFetch('/api/employees/me'),
  updateProfile: (data) => 
    apiFetch('/api/trainee/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Course Enrollment & Library (PS 26075)
  getMyCourses: () => apiFetch('/api/trainee/my-courses'),
  enrollCourse: (courseId) =>
    apiFetch(`/api/courses/${encodeURIComponent(courseId)}/enroll`, {
      method: 'POST',
    }),
  getTrainerLibrary: () => apiFetch('/api/trainee/library'),
  submitFeedback: (courseId, data) =>
    apiFetch(`/api/courses/${encodeURIComponent(courseId)}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAnnouncements: () => apiFetch('/api/admin/homepage/feed'),

  // 2. Growth stage (consumed by Sidebar, Profile, GrowthTreeWidget)
  getGrowthStage: () => apiFetch('/api/employees/me/growth-stage'),

  // 3. Skills catalog (consumed by SkillsView, Dashboard)
  getSkills: (category) => {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return apiFetch(`/api/skills${query}`);
  },

  // 4. Recommendations (consumed by CoursesView, Dashboard)
  getRecommendations: () => apiFetch('/api/recommendations'),

  // 5. Learning resources (consumed by CoursesView / Catalog)
  getLearningResources: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.set('query', params.query);
    if (params.source) queryParams.set('source', params.source);
    if (params.limit) queryParams.set('limit', params.limit);
    const qs = queryParams.toString();
    return apiFetch(`/api/learning-resources${qs ? `?${qs}` : ''}`);
  },

  // 6. Development path on-demand (consumed by DevelopmentPath)
  getDevelopmentPath: (skillId) => apiFetch(`/api/skills/${skillId}/development-path`),

  // 7. Assessments (consumed by AssessmentsView & AssessmentHub)
  getAssessments: () => apiFetch('/api/assessments'),
  getAssessment: (id) => apiFetch(`/api/assessments/${id}`),
  getAssessmentQuestions: (id) => apiFetch(`/api/assessments/${id}/questions`),
  startAssessmentAttempt: (id) =>
    apiFetch(`/api/assessments/${id}/attempts`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  autosaveAnswer: (attemptId, questionId, selectedOptionId) =>
    apiFetch(`/api/attempts/${attemptId}/answers`, {
      method: 'PATCH',
      body: JSON.stringify({
        question_id: questionId,
        selected_option_id: selectedOptionId,
      }),
    }),
  submitAssessmentAttempt: (attemptId) =>
    apiFetch(`/api/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // 8. AI Disha Chat (consumed by DishaChatWidget)
  sendChatMessage: (message, conversationHistory = []) =>
    apiFetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory,
      }),
    }),
};

export function mapAssessmentSubmissionResult(apiResult) {
  if (!apiResult) return null;
  return {
    attemptId: apiResult.attempt_id,
    overallScore: apiResult.overallScore,
    baselineLevel: apiResult.baselineLevel,
    capabilityList: apiResult.capabilityList || [],
    confidentCorrect: apiResult.confidentCorrect || [],
    growthOpportunities: (apiResult.growthOpportunities || []).map((opp) => ({
      id: opp.id,
      topic: opp.topic,
      competency: opp.competency,
      question: opp.question,
      reason: opp.reason || opp.rationale || 'Identified as a growth opportunity for your target role.',
      rationale: opp.rationale,
      resource: opp.resource || opp.growthResource,
      growthResource: opp.growthResource || opp.resource,
      isUncertain: opp.isUncertain,
    })),
  };
}

export default api;



