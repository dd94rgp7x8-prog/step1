import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => axios.post(`${API_URL}/token/`, credentials),
  register: (userData) => axios.post(`${API_URL}/register/`, userData),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};

export const playersAPI = {
  getAll: () => api.get('/players/'),
  getATP: () => api.get('/players/atp/'),
  getWTA: () => api.get('/players/wta/'),
  getTopPlayers: () => api.get('/players/top_players/'),
  getById: (id) => api.get(`/players/${id}/`),
  searchATP: (query) => api.get(`/players/?gender=ATP&search=${query}`), // Исправлен endpoint
  searchWTA: (query) => api.get(`/players/?gender=WTA&search=${query}`), // Исправлен endpoint
};

export const newsAPI = {
  getAll: () => api.get('/news/'),
  getFeatured: () => api.get('/news/featured/'),
  getById: (id) => api.get(`/news/${id}/`),
  incrementViews: (id) => api.post(`/news/${id}/increment_views/`),
  search: (query) => api.get(`/news/?search=${query}`), // Исправлен endpoint
};

export const tournamentsAPI = {
  getAll: () => api.get('/tournaments/'),
  getById: (id) => api.get(`/tournaments/${id}/`),
};

export const chatAPI = {
  sendMessage: (message) => api.post('/chat/', { message }),
  getHistory: () => api.get('/chat/'),
};

// Добавлены API для админ панели
export const adminAPI = {
  // Управление пользователями
  getAllUsers: () => api.get('/admin/users/'),
  getUserById: (id) => api.get(`/admin/users/${id}/`),
  updateUser: (id, data) => api.patch(`/admin/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}/`),
  
  // Управление игроками (админ версия)
  createPlayer: (data) => api.post('/players/', data),
  updatePlayer: (id, data) => api.put(`/players/${id}/`, data),
  deletePlayer: (id) => api.delete(`/players/${id}/`),
  
  // Управление новостями (админ версия)
  createNews: (data) => api.post('/news/', data),
  updateNews: (id, data) => api.put(`/news/${id}/`, data),
  deleteNews: (id) => api.delete(`/news/${id}/`),
  
  // Управление турнирами (админ версия)
  createTournament: (data) => api.post('/tournaments/', data),
  updateTournament: (id, data) => api.put(`/tournaments/${id}/`, data),
  deleteTournament: (id) => api.delete(`/tournaments/${id}/`),
  
  // Статистика
  getStats: () => api.get('/admin/stats/'),
  
  // Экспорт данных
  exportData: (type) => api.get(`/admin/export/${type}/`),
};

// Профиль пользователя
export const profileAPI = {
  getProfile: () => api.get('/profile/'),
  updateProfile: (data) => api.put('/profile/', data),
  updateUserProfile: (data) => api.put('/profile/', data), // alias
};

// Матчи
export const matchesAPI = {
  getAll: () => api.get('/matches/'),
  getRecent: () => api.get('/matches/recent_matches/'),
  getPlayerMatches: (playerId) => api.get(`/matches/player_matches/?player_id=${playerId}`),
  getById: (id) => api.get(`/matches/${id}/`),
  create: (data) => api.post('/matches/', data),
  update: (id, data) => api.put(`/matches/${id}/`, data),
  delete: (id) => api.delete(`/matches/${id}/`),
};

// Head-to-Head статистика
export const h2hAPI = {
  getH2H: (player1Id, player2Id) => api.get(`/head-to-head/get_h2h/?player1_id=${player1Id}&player2_id=${player2Id}`),
  getAll: () => api.get('/head-to-head/'),
  create: (data) => api.post('/head-to-head/', data),
  update: (id, data) => api.put(`/head-to-head/${id}/`, data),
};

export default api;