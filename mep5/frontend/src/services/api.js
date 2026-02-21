import axios from 'axios';

// Configure base URL - update this with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for adding auth tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const api = {
  // PCOS Prediction
  predictPCOS: async (data) => {
    try {
      const response = await apiClient.post('/predict/pcos', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Thyroid Prediction
  predictThyroid: async (data) => {
    try {
      const response = await apiClient.post('/predict/thyroid', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Breast Cancer Prediction
  predictBreastCancer: async (data) => {
    try {
      const response = await apiClient.post('/predict/breast-cancer', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get User History (for dashboard)
  getUserHistory: async () => {
    try {
      const response = await apiClient.get('/history');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Save prediction result
  savePrediction: async (type, data) => {
    try {
      const response = await apiClient.post(`/save/${type}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
