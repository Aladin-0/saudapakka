import axios from 'axios';
import Cookies from 'js-cookie';

// Point to your Docker Backend
const api = axios.create({
  baseURL: 'http://localhost:8000', 
});

// Automatically add the Token to every request if it exists
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;