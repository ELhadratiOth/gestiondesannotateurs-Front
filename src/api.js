import axios from 'axios';
import { redirectToUnauthorizedRoute } from './utils/redirect-to-unauthorized-route'; 

const API = axios.create({
  baseURL: 'http://localhost:8080',
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 403) {
      redirectToUnauthorizedRoute();
    }
    return Promise.reject(error);
  },
);

export default API;
