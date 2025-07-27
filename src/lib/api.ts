// API service layer for connecting to Supabase Edge Functions
const SUPABASE_URL = "https://lrvgennjbmmbtpywloem.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxydmdlbm5qYm1tYnRweXdsb2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTU4NDMsImV4cCI6MjA2ODg3MTg0M30.2OeaLWWKu38gS4smXpDIpYMkNrRTAO3m_P4BMEEWt40";

// Base API configuration
const API_BASE_URL = `${SUPABASE_URL}/functions/v1`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('supabase.auth.token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'apikey': SUPABASE_ANON_KEY,
  };
};

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}/${endpoint}`;
  const headers = getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Donations API
export const donationsAPI = {
  // Get all donations with optional filters
  getDonations: async (params?: {
    status?: string;
    category?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.lat) searchParams.append('lat', params.lat.toString());
    if (params?.lng) searchParams.append('lng', params.lng.toString());
    if (params?.radius) searchParams.append('radius', params.radius.toString());

    return apiRequest(`donations-api?${searchParams.toString()}`);
  },

  // Get specific donation by ID
  getDonation: async (id: string) => {
    return apiRequest(`donations-api/${id}`);
  },

  // Create new donation
  createDonation: async (donation: {
    title: string;
    description?: string;
    food_category: string;
    quantity: string;
    expiry_date?: string;
    pickup_time_start: string;
    pickup_time_end: string;
    pickup_address: string;
    latitude: number;
    longitude: number;
    images?: string[];
    dietary_info?: any;
    allergen_info?: string[];
    special_instructions?: string;
    estimated_meals?: number;
  }) => {
    return apiRequest('donations-api', {
      method: 'POST',
      body: JSON.stringify(donation),
    });
  },

  // Update donation
  updateDonation: async (id: string, updates: {
    title?: string;
    description?: string;
    quantity?: string;
    pickup_time_start?: string;
    pickup_time_end?: string;
    status?: string;
    special_instructions?: string;
  }) => {
    return apiRequest(`donations-api/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Claim donation
  claimDonation: async (id: string) => {
    return apiRequest(`donations-api/${id}/claim`, {
      method: 'POST',
    });
  },

  // Delete donation
  deleteDonation: async (id: string) => {
    return apiRequest(`donations-api/${id}`, {
      method: 'DELETE',
    });
  },
};

// Volunteer API
export const volunteerAPI = {
  // Get available tasks
  getTasks: async (params?: {
    lat?: number;
    lng?: number;
    radius?: number;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.lat) searchParams.append('lat', params.lat.toString());
    if (params?.lng) searchParams.append('lng', params.lng.toString());
    if (params?.radius) searchParams.append('radius', params.radius.toString());
    if (params?.status) searchParams.append('status', params.status);

    return apiRequest(`volunteer-api/tasks?${searchParams.toString()}`);
  },

  // Get volunteer's tasks
  getMyTasks: async () => {
    return apiRequest('volunteer-api/my-tasks');
  },

  // Accept a task
  acceptTask: async (taskId: string) => {
    return apiRequest('volunteer-api/accept-task', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId }),
    });
  },

  // Update task status
  updateTask: async (taskId: string, updates: {
    status?: string;
    actual_start_time?: string;
    actual_end_time?: string;
    completion_notes?: string;
  }) => {
    return apiRequest(`volunteer-api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Get leaderboard
  getLeaderboard: async () => {
    return apiRequest('volunteer-api/leaderboard');
  },

  // Get volunteer statistics
  getStats: async (volunteerId: string) => {
    return apiRequest(`volunteer-api/stats/${volunteerId}`);
  },
};

// Matching Engine API
export const matchingAPI = {
  // Get optimized routes
  getOptimizedRoutes: async (params: {
    volunteer_id: string;
    max_distance?: number;
    max_tasks?: number;
  }) => {
    return apiRequest('matching-engine/optimize-routes', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Get nearby donations
  getNearbyDonations: async (params: {
    lat: number;
    lng: number;
    radius?: number;
    category?: string;
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.append('lat', params.lat.toString());
    searchParams.append('lng', params.lng.toString());
    if (params.radius) searchParams.append('radius', params.radius.toString());
    if (params.category) searchParams.append('category', params.category);

    return apiRequest(`matching-engine/nearby?${searchParams.toString()}`);
  },
};

// Notifications API
export const notificationsAPI = {
  // Send notification
  sendNotification: async (notification: {
    recipient_id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }) => {
    return apiRequest('notifications/send', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },

  // Get user notifications
  getNotifications: async (userId: string) => {
    return apiRequest(`notifications/${userId}`);
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    return apiRequest(`notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },
};

// Analytics API
export const analyticsAPI = {
  // Get donation analytics
  getDonationAnalytics: async (params?: {
    start_date?: string;
    end_date?: string;
    category?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.category) searchParams.append('category', params.category);

    return apiRequest(`analytics/donations?${searchParams.toString()}`);
  },

  // Get volunteer analytics
  getVolunteerAnalytics: async (params?: {
    start_date?: string;
    end_date?: string;
    volunteer_id?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.volunteer_id) searchParams.append('volunteer_id', params.volunteer_id);

    return apiRequest(`analytics/volunteers?${searchParams.toString()}`);
  },

  // Get impact statistics
  getImpactStats: async () => {
    return apiRequest('analytics/impact');
  },
};

// Error handling utility
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Response wrapper for consistent error handling
export const handleAPIResponse = async <T>(apiCall: Promise<T>): Promise<T> => {
  try {
    return await apiCall;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500
    );
  }
}; 