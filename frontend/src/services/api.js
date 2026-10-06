const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Token and User session storage helpers
 */
export const authStorage = {
  getToken: () => localStorage.getItem('complaintintel_token'),
  setToken: (token) => {
    if (token) localStorage.setItem('complaintintel_token', token);
    else localStorage.removeItem('complaintintel_token');
  },
  getUser: () => {
    try {
      const u = localStorage.getItem('complaintintel_user');
      if (!u || u === 'undefined' || u === 'null') return null;
      return JSON.parse(u);
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    if (user) localStorage.setItem('complaintintel_user', JSON.stringify(user));
    else localStorage.removeItem('complaintintel_user');
  },
  clear: () => {
    localStorage.removeItem('complaintintel_token');
    localStorage.removeItem('complaintintel_user');
  }
};

/**
 * Helper to execute fetch requests with structured error reporting and Bearer auth
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = authStorage.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errorDetail = `Request failed with status ${response.status}`;
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || errJson.message || errorDetail;
      } catch (e) {
        // fallback
      }
      throw new Error(errorDetail);
    }
    return await response.json();
  } catch (err) {
    console.error(`API Error on ${url}:`, err);
    throw err;
  }
}

export const complaintApi = {
  auth: authStorage,

  // Authentication endpoints
  registerCustomer: async (data) => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.access_token) {
      authStorage.setToken(res.access_token);
      authStorage.setUser(res.user);
    }
    return res;
  },

  loginCustomer: async (email, password) => {
    const res = await request('/auth/customer-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.access_token) {
      authStorage.setToken(res.access_token);
      authStorage.setUser(res.user);
    }
    return res;
  },

  loginAdmin: async (email, password) => {
    const res = await request('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.access_token) {
      authStorage.setToken(res.access_token);
      authStorage.setUser(res.user);
    }
    return res;
  },

  getMe: async () => {
    return request('/auth/me');
  },

  logout: () => {
    authStorage.clear();
  },

  // Get list of complaints with search & filters (scaped by role on backend)
  getComplaints: async ({ search, category, priority, status, sentiment, skip = 0, limit = 100 } = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    if (priority && priority !== 'All') params.append('priority', priority);
    if (status && status !== 'All') params.append('status', status);
    if (sentiment && sentiment !== 'All') params.append('sentiment', sentiment);
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());

    const qs = params.toString();
    return request(`/complaints${qs ? `?${qs}` : ''}`);
  },

  // Get single complaint details
  getComplaintById: async (id) => {
    return request(`/complaints/${id}`);
  },

  // Submit a new complaint
  createComplaint: async (complaintData) => {
    return request('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  },

  // Update status (Pending, In Progress, Resolved) - Admin only
  updateStatus: async (id, status) => {
    return request(`/complaints/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Generate AI reply tailored for this complaint - Admin only
  generateReply: async (id, customInstruction = '') => {
    return request(`/complaints/${id}/generate-reply`, {
      method: 'POST',
      body: JSON.stringify({ custom_instruction: customInstruction }),
    });
  },

  // Seed sample demo data
  seedDemoData: async () => {
    return request('/complaints/seed/demo-data', {
      method: 'POST',
    });
  },

  // Dashboard Overview Stats (returns customer or admin stats based on JWT role)
  getDashboardStats: async () => {
    return request('/dashboard/stats');
  },

  // Dashboard Visual Analytics (Admin only)
  getDashboardAnalytics: async () => {
    return request('/dashboard/analytics');
  },

  // Backend Health and Groq config status
  getHealth: async () => {
    return request('/health');
  },
};

export default complaintApi;
