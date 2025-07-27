// Configuration for the NourishSA application
export const config = {
  // Supabase Configuration
  supabase: {
    url: "https://lrvgennjbmmbtpywloem.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxydmdlbm5qYm1tYnRweXdsb2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTU4NDMsImV4cCI6MjA2ODg3MTg0M30.2OeaLWWKu38gS4smXpDIpYMkNrRTAO3m_P4BMEEWt40",
  },

  // API Endpoints
  api: {
    baseUrl: "https://lrvgennjbmmbtpywloem.supabase.co/functions/v1",
    endpoints: {
      donations: "donations-api",
      volunteer: "volunteer-api",
      matching: "matching-engine",
      notifications: "notifications",
      analytics: "analytics",
    },
  },

  // App Configuration
  app: {
    name: "NourishSA",
    version: "1.0.0",
    description: "Fighting food waste, feeding communities",
  },

  // Default coordinates for Johannesburg
  defaultLocation: {
    lat: -26.2041,
    lng: 28.0473,
  },

  // Refresh intervals (in milliseconds)
  refreshIntervals: {
    donations: 30000, // 30 seconds
    tasks: 30000, // 30 seconds
    notifications: 60000, // 1 minute
  },

  // Task categories
  taskCategories: [
    "Fresh Produce",
    "Bread & Bakery",
    "Dairy & Eggs",
    "Canned Goods",
    "Frozen Foods",
    "Snacks & Beverages",
    "Other",
  ],

  // Volunteer roles
  volunteerRoles: [
    {
      id: "pickup",
      name: "Food Pickup",
      description: "Collect food from donors and businesses",
      icon: "Package",
    },
    {
      id: "delivery",
      name: "Food Delivery",
      description: "Deliver food to community kitchens and recipients",
      icon: "Truck",
    },
  ],

  // Status options
  statuses: {
    donations: ["available", "claimed", "completed", "expired"],
    tasks: ["pending", "accepted", "in-progress", "completed", "cancelled"],
  },
};

// Helper function to get API URL
export const getApiUrl = (endpoint: string) => {
  return `${config.api.baseUrl}/${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('supabase.auth.token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'apikey': config.supabase.anonKey,
  };
};

// Environment check
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Feature flags
export const features = {
  realTimeUpdates: true,
  locationServices: true,
  pushNotifications: true,
  analytics: true,
}; 