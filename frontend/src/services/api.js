import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('synergionco_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const predictSynergy = async (drugA, drugB, cellLine, model = 'xgboost') => {
  const response = await api.post(`/predict?model_name=${model}`, {
    drug_a: drugA,
    drug_b: drugB,
    cell_line: cellLine,
  });
  return response.data;
};

export const getRecommendations = async (cancerType = '', cellLine = '', topN = 15) => {
  const params = new URLSearchParams();
  if (cancerType) params.append('cancer_type', cancerType);
  if (cellLine) params.append('cell_line', cellLine);
  params.append('top_n', topN.toString());
  const response = await api.get(`/recommend?${params.toString()}`);
  return response.data;
};

export const evaluateCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/evaluate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getDrugs = async () => {
  const response = await api.get('/drugs');
  return response.data;
};

export const getCellLines = async () => {
  const response = await api.get('/cell-lines');
  return response.data;
};

export const getCancerTypes = async () => {
  const response = await api.get('/cancer-types');
  return response.data;
};

export const getModelMetrics = async () => {
  const response = await api.get('/model-comparison');
  return response.data;
};

// Hybrid Single Drug & Medicine Suggestions (Legacy feature)
export const getHybridOptions = async () => {
  const response = await api.get('/hybrid/options');
  return response.data;
};

export const predictHybrid = async (test, cancerType, drugs) => {
  const response = await api.post('/hybrid/predict', {
    test,
    cancer_type: cancerType,
    drugs,
  });
  return response.data;
};

// SynergyFinder 3D Dose-Response & Surface Visualization
export const getDoseResponseData = async (drugA, drugB, cellLine = 'A375', method = 'Bliss') => {
  const params = new URLSearchParams({
    drug_a: drugA,
    drug_b: drugB,
    cell_line: cellLine,
    method: method,
  });
  const response = await api.get(`/synergy-finder/dose-response?${params.toString()}`);
  return response.data;
};

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Auth
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signupUser = async (name, email, password) => {
  const response = await api.post('/auth/signup', { name, email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Molecular Structure & MoA Viewer
export const getPairMolecularData = async (drugA, drugB) => {
  const params = new URLSearchParams({ drug_a: drugA, drug_b: drugB });
  const response = await api.get(`/drugs/pair-molecular?${params.toString()}`);
  return response.data;
};

export const getDrugMolecularData = async (drugName) => {
  const response = await api.get(`/drugs/${encodeURIComponent(drugName)}/molecular`);
  return response.data;
};

export default api;

