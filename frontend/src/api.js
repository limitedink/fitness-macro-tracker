import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDailyTargets = () => api.get('/daily-targets');
export const updateDailyTargets = (data) => api.post('/daily-targets', data);
export const getMeals = () => api.get('/meals');
export const addMeal = (data) => api.post('/meals', data);
export const deleteMeal = (id) => api.delete(`/meals/${id}`);
export const resetProgress = () => api.post('/daily-targets/reset');

export default api; 