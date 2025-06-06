import axios from 'axios';

const API = axios.create({
  baseURL: '/api', // Proxy in vite.config.js leitet dies an http://localhost:5000 weiter
  withCredentials: true,
});

// Interceptor, um den Token zu jedem Request hinzuzufügen, falls vorhanden
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (data) => API.post('/auth/login', data); // Pfad an Backend angepasst
export const register = (data) => API.post('/auth/register', data); // Pfad an Backend angepasst
export const getProfile = () => API.get('/auth/profile'); // Neuer Endpunkt für Profilabruf

// Die Backend-Logout-Route existiert aktuell nicht in auth_routes.py.
// JWT-Logout ist primär clientseitig (Token entfernen).
// export const logout = () => API.post('/auth/logout'); 

export const getReservations = () => API.get('/reservations');
export const createReservation = (data) => API.post('/reservations', data);

export default API;
