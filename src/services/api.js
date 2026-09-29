/**
 * RoleWise AI Centralized API Client
 *
 * Communicates with backend REST API at /api, with automatic JWT token attachment,
 * standardized error handling, and support for JSON and multipart/form-data.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const getToken = () => localStorage.getItem('rolewise_token');
export const setToken = (token) => localStorage.setItem('rolewise_token', token);
export const removeToken = () => localStorage.removeItem('rolewise_token');

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set JSON content type unless body is FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error || `HTTP ${response.status}: ${response.statusText}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.code = data?.code || 'API_ERROR';
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    // If backend is unavailable, rethrow with clear network code
    if (!err.status) {
      err.code = 'NETWORK_ERROR';
      err.isOffline = true;
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// 1. AUTHENTICATION APIS
// ---------------------------------------------------------------------------
export const authApi = {
  login: async (identifier, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  getMe: async () => {
    return apiFetch('/auth/me');
  },

  logout: async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      removeToken();
    }
  },
};

// ---------------------------------------------------------------------------
// 2. FEES & PAYMENTS APIS
// ---------------------------------------------------------------------------
export const feeApi = {
  getMyFee: async () => {
    return apiFetch('/fees/my-fee');
  },

  payFee: async ({ amount = 185000, paymentMethod, simulateFailure = false } = {}) => {
    return apiFetch('/fees/pay', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod, simulateFailure }),
    });
  },

  getRecords: async ({ search = '', filter = 'All' } = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filter && filter !== 'All') params.append('filter', filter);
    return apiFetch(`/fees/records?${params.toString()}`);
  },

  settleRecord: async (studentId) => {
    return apiFetch(`/fees/records/${studentId}/settle`, { method: 'POST' });
  },
};

// ---------------------------------------------------------------------------
// 3. ATTENDANCE APIS
// ---------------------------------------------------------------------------
export const attendanceApi = {
  getMyAttendance: async () => {
    return apiFetch('/attendance/my-attendance');
  },

  getCourseRoster: async (courseCode) => {
    return apiFetch(`/attendance/course-roster/${courseCode}`);
  },

  markAttendance: async ({ course, courseName, date, session, roster, isUpdate = false }) => {
    return apiFetch('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ course, courseName, date, session, roster, isUpdate }),
    });
  },

  getRecords: async ({ course = 'All', status = 'All' } = {}) => {
    const params = new URLSearchParams();
    if (course && course !== 'All') params.append('course', course);
    if (status && status !== 'All') params.append('status', status);
    return apiFetch(`/attendance/records?${params.toString()}`);
  },

  uploadAttendanceFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/attendance/upload', {
      method: 'POST',
      body: formData,
    });
  },
};

// ---------------------------------------------------------------------------
// 4. ADMISSIONS APIS
// ---------------------------------------------------------------------------
export const admissionApi = {
  getMyAdmission: async () => {
    return apiFetch('/admissions/my-admission');
  },

  getAdmissions: async ({ search = '', filter = 'All' } = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filter && filter !== 'All') params.append('filter', filter);
    return apiFetch(`/admissions?${params.toString()}`);
  },

  updateStatus: async (id, status) => {
    return apiFetch(`/admissions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  rollbackStatus: async (id) => {
    return apiFetch(`/admissions/${id}/rollback`, { method: 'POST' });
  },
};

// ---------------------------------------------------------------------------
// 5. CERTIFICATES APIS
// ---------------------------------------------------------------------------
export const certificateApi = {
  getMyCertificates: async () => {
    return apiFetch('/certificates/my-certificates');
  },

  getCertificates: async () => {
    return apiFetch('/certificates');
  },

  generateCertificate: async ({ studentId, studentName, certificateType }) => {
    return apiFetch('/certificates/generate', {
      method: 'POST',
      body: JSON.stringify({ studentId, studentName, certificateType }),
    });
  },
};

// ---------------------------------------------------------------------------
// 6. RECOMMENDATIONS & ASSISTANT APIS
// ---------------------------------------------------------------------------
export const recommendationApi = {
  evaluateQuery: async (query) => {
    return apiFetch('/recommendations/evaluate', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  submitFeedback: async (eventId, feedback) => {
    return apiFetch(`/recommendations/${eventId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  },

  getHistory: async () => {
    return apiFetch('/recommendations/history');
  },

  submitOverride: async ({ recommendationId, query, taskGoal, recommendedFeatureId, selectedFeatureId, reason, notes }) => {
    return apiFetch('/recommendations/override', {
      method: 'POST',
      body: JSON.stringify({ recommendationId, query, taskGoal, recommendedFeatureId, selectedFeatureId, reason, notes }),
    });
  },
};

// ---------------------------------------------------------------------------
// 7. AUDIT TRAIL APIS
// ---------------------------------------------------------------------------
export const auditApi = {
  getLogs: async ({ role = 'all', action = 'all', status = 'all', search = '', page = 1, limit = 25 } = {}) => {
    const params = new URLSearchParams();
    if (role && role !== 'all') params.append('role', role);
    if (action && action !== 'all') params.append('action', action);
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('limit', limit);
    return apiFetch(`/audit-logs?${params.toString()}`);
  },

  logEvent: async (eventData) => {
    return apiFetch('/audit-logs', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  verifyChain: async () => {
    return apiFetch('/audit-logs/verify');
  },

  simulateTamper: async (id) => {
    return apiFetch('/audit-logs/simulate-tamper', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },

  repairChain: async () => {
    return apiFetch('/audit-logs/repair-chain', {
      method: 'POST',
    });
  },
};

// ---------------------------------------------------------------------------
// 8. CHANGE HISTORY & ROLLBACK APIS
// ---------------------------------------------------------------------------
export const historyApi = {
  getHistory: async () => {
    return apiFetch('/change-history');
  },

  rollback: async (changeId, reason = '') => {
    return apiFetch(`/change-history/${changeId}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// ---------------------------------------------------------------------------
// 9. OVERRIDES APIS
// ---------------------------------------------------------------------------
export const overrideApi = {
  getOverrides: async () => {
    return apiFetch('/overrides');
  },

  createOverride: async ({ featureId, action, reason, notes }) => {
    return apiFetch('/overrides', {
      method: 'POST',
      body: JSON.stringify({ featureId, action, reason, notes }),
    });
  },
};

// ---------------------------------------------------------------------------
// 10. ANALYTICS & EXPERIMENT APIS
// ---------------------------------------------------------------------------
export const analyticsApi = {
  getAnalytics: async () => {
    return apiFetch('/analytics');
  },

  getExperiment: async () => {
    return apiFetch('/analytics/experiment');
  },

  getUnderusedFeatures: async () => {
    return apiFetch('/analytics/underused-features');
  },

  getErrors: async () => {
    return apiFetch('/analytics/errors');
  },

  resetDemo: async () => {
    return apiFetch('/analytics/reset-demo', { method: 'POST' });
  },
};

// ---------------------------------------------------------------------------
// 11. TELEMETRY EVENT INGESTION APIS
// ---------------------------------------------------------------------------
export const eventsApi = {
  logFeatureUsage: async (eventData) => {
    return apiFetch('/events/feature-usage', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  logTaskGoal: async (goalData) => {
    return apiFetch('/events/task-goal', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  },

  logHelpSearch: async (queryData) => {
    return apiFetch('/events/help-search', {
      method: 'POST',
      body: JSON.stringify(queryData),
    });
  },
};

// ---------------------------------------------------------------------------
// 12. GOVERNANCE & VALIDATION APIS
// ---------------------------------------------------------------------------
export const governanceApi = {
  getValidation: async () => {
    return apiFetch('/validation');
  },

  submitValidation: async (data) => {
    return apiFetch('/validation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getRisks: async () => {
    return apiFetch('/risks');
  },

  updateRisk: async (id, data) => {
    return apiFetch(`/risks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Aliases for convenient domain grouping
export const experimentApi = analyticsApi;
export const riskApi = {
  getRisks: governanceApi.getRisks,
  updateRisk: governanceApi.updateRisk,
};
export const validationApi = {
  getValidation: governanceApi.getValidation,
  submitValidation: governanceApi.submitValidation,
};

