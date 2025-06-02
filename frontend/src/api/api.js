import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

export const login = (data) => API.post('/login', data);
export const logout = () => API.post('/logout');
export const register = (data) => API.post('/accounts', data);
export const getReservations = () => API.get('/reservations');
export const createReservation = (data) => API.post('/reservations', data);
