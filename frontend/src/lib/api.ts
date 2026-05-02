import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AnalyzeProfileRequest {
  text?: string;
  resume_text?: string;
  linkedin_profile_text?: string;
  targetRole?: string;
}

export interface AnalyzeProfileResponse {
  message: string;
  data: {
    atsScore: number;
    skillMatchPercent: number;
    predictedRoles: string[];
    missingKeywords: string[];
    smartSuggestions: string[];
    linkedinSuggestions: {
      headline?: string;
      about?: string;
      experience?: string[];
    };
    targetRole?: string;
    createdAt: string;
  };
}

export const analyzeProfile = async (payload: AnalyzeProfileRequest): Promise<AnalyzeProfileResponse> => {
  const response = await apiClient.post('/analyze-profile', payload);
  return response.data;
};

export const uploadResume = async (file: File, targetRole?: string): Promise<{ message: string, text: string }> => {
  const formData = new FormData();
  formData.append('resume', file);
  if (targetRole) {
    formData.append('targetRole', targetRole);
  }

  const response = await apiClient.post('/upload-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const extractTextFromImage = async (file: File): Promise<{ message: string, text: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post('/extract-text', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Auth API
export const signup = async (data: any) => {
  const response = await apiClient.post('/auth/signup', data);
  return response.data;
};

export const login = async (data: any) => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const updateMe = async (data: any) => {
  const response = await apiClient.patch('/auth/updateMe', data);
  return response.data;
};

export const updatePassword = async (data: any) => {
  const response = await apiClient.patch('/auth/updatePassword', data);
  return response.data;
};

export const deleteAccount = async () => {
  const response = await apiClient.delete('/auth/deleteMe');
  return response.data;
};

export const getAnalysisHistory = async () => {
  const response = await apiClient.get('/analysis');
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await apiClient.get('/stats');
  return response.data;
};

export const generateSuggestions = async () => {
  const response = await apiClient.post('/generate-suggestions');
  return response.data;
};

export const getProfileDetail = async (id: string) => {
  const response = await apiClient.get(`/analysis/${id}`);
  return response.data;
};

export const deleteAnalysis = async (id: string) => {
  const response = await apiClient.delete(`/analysis/${id}`);
  return response.data;
};

