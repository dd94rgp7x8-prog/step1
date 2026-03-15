import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api'; // Используем api напрямую

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Функция для загрузки профиля пользователя
  const loadUserProfile = async () => {
    try {
      const response = await api.get('/profile/');
      console.log('Profile API response:', response.data); // Для отладки
      
      // Проверяем формат ответа - может быть объект или массив
      const profileData = Array.isArray(response.data) ? response.data[0] : response.data;
      
      if (profileData) {
        const userData = {
          ...profileData.user,
          userprofile: profileData,
          is_admin: profileData.is_admin // Добавляем is_admin в корень для удобства
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Если ошибка 401, делаем logout
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Дополнительно загружаем свежие данные профиля
      loadUserProfile();
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const loginResponse = await api.post('/token/', credentials);
      const { access, refresh } = loginResponse.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Загружаем профиль пользователя
      await loadUserProfile();
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 
               error.response?.data?.non_field_errors?.[0] || 
               error.response?.data || 
               'Login failed. Please check your credentials.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/register/', userData);
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // После регистрации загружаем профиль
      await loadUserProfile();
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 
               error.response?.data || 
               'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Функция для обновления пользовательских данных
  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Функция для принудительного обновления профиля
  const refreshProfile = async () => {
    await loadUserProfile();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      register, 
      logout, 
      loading,
      updateUser,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
