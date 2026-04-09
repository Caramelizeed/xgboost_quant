import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 30000,
});

API.interceptors.request.use((config) => {
  config._t = Date.now();
  return config;
});

API.interceptors.response.use((response) => {
  response._latency = Date.now() - response.config._t;
  return response;
});

export const runSimulation = async (params) => {
  const response = await API.post('/simulate', params);
  return { ...response.data, _latency: response._latency };
};

export const getAssets = () => API.get('/assets');
export const getFeatures = () => API.get('/features');
