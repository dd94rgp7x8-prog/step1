import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Box, Grid, Card, CardContent,
  Avatar, Button, TextField, Switch, FormControlLabel,
  Chip, Divider, List, ListItem, ListItemText, Alert,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import axios from 'axios';


const Profile = ({ darkMode, toggleDarkMode }) => {
  const { user, setUser, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    language: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchChatHistory();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile/');
      if (response.data.length > 0) {
        const profileData = response.data[0];
        setProfile(profileData);
        setFormData({
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          language: profileData.language || 'en'
        });
      } else {
        // Если профиля нет, создаем с дефолтными значениями
        setFormData({
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          language: 'en'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // В случае ошибки все равно устанавливаем данные из user
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        language: 'en'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await api.get('/chat/');
      setChatHistory(response.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      // В случае ошибки показываем заглушки
      setChatHistory([]);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Save changes
      handleSaveProfile();
    } else {
      setEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
      language: profile?.language || 'en'
    });
  };

const handleSaveProfile = async () => {
  try {
    // Обновляем данные пользователя через PUT запрос к конкретному профилю
    const profileResponse = await api.put('/profile/', {
      language: formData.language,
      notifications_enabled: profile?.notifications_enabled || true
    });

    // Обновляем данные пользователя отдельно
    if (formData.firstName !== user.first_name || 
        formData.lastName !== user.last_name || 
        formData.email !== user.email) {
      
      const userUpdateResponse = await axios.put(
        'http://localhost:8000/api/profile/',
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      
      // Обновляем данные пользователя в локальном состоянии
      setUser(prev => ({
        ...prev,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email
      }));
      
      // Обновляем в localStorage
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    // Обновляем язык в i18n
    i18n.changeLanguage(formData.language);
    localStorage.setItem('language', formData.language);

    setEditMode(false);
    setSaveStatus('success');
    
    // Обновляем профиль в состоянии
    setProfile(prev => ({
      ...prev,
      language: formData.language
    }));
    
    // Скрываем сообщение об успехе через 3 секунды
    setTimeout(() => setSaveStatus(null), 3000);
  } catch (error) {
    console.error('Error saving profile:', error);
    setSaveStatus('error');
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSwitchChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.checked
    });
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Функция для форматирования даты
  const formatMemberSince = () => {
    if (!user?.date_joined) return t('date_not_available');
    
    try {
      const date = new Date(user.date_joined);
      if (isNaN(date.getTime())) {
        return t('date_not_available');
      }
      
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return date.toLocaleDateString(i18n.language, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return t('date_not_available');
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>{t('loading')}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Profile Header */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: 48
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" sx={{ mr: 2 }}>
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user.username
                  }
                </Typography>
                <Chip label={user.username} color="primary" />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant={editMode ? "contained" : "outlined"}
                  startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                  onClick={handleEditToggle}
                >
                  {editMode ? t('save_changes') : t('edit_profile')}
                </Button>
                {editMode && (
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                  >
                    {t('cancel')}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={toggleDarkMode}
                  startIcon={darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                >
                  {darkMode ? t('light_mode') : t('dark_mode')}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                >
                  {t('logout')}
                </Button>
              </Box>
            </Grid>
          </Grid>

          {saveStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {t('profile_updated')}
            </Alert>
          )}
          {saveStatus === 'error' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {t('error_updating_profile')}
            </Alert>
          )}
        </Paper>

        {/* Tabs */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab icon={<SettingsIcon />} label={t('settings')} />
            <Tab icon={<HistoryIcon />} label={t('activity')} />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Profile Information */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('personal_information')}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('first_name')}
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('last_name')}
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('email')}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('username')}
                      value={user.username}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label={t('preferred_language')}
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      disabled={!editMode}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="en">{t('language_en')}</option>
                      <option value="ru">{t('language_ru')}</option>
                      <option value="kz">{t('language_kz')}</option>
                    </TextField>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Preferences */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('preferences')}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary={t('email_notifications')}
                      secondary={t('notifications_description')}
                    />
                    <Switch
                      edge="end"
                      name="notifications_enabled"
                      checked={profile?.notifications_enabled || false}
                      onChange={handleSwitchChange}
                      disabled={!editMode}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={t('dark_mode')}
                      secondary={t('dark_mode_description')}
                    />
                    <Switch 
                      edge="end" 
                      checked={darkMode}
                      onChange={toggleDarkMode}
                    />
                  </ListItem>
                  <Divider />
                </List>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    {t('account_statistics')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {user.id ? user.id.toString().substring(0, 4) : '0000'}
                          </Typography>
                          <Typography variant="body2">
                            {t('user_id')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {chatHistory.length}
                          </Typography>
                          <Typography variant="body2">
                            {t('ai_conversations')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('recent_activity')}
            </Typography>
            
            {chatHistory.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                {t('no_activity')}
              </Typography>
            ) : (
              <List>
                {chatHistory.map((chat, index) => (
                  <React.Fragment key={chat.id || index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="textSecondary">
                              {new Date(chat.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              sx={{ display: 'block', mb: 1 }}
                            >
                              <strong>{t('you')}:</strong> {chat.message && chat.message.length > 100 
                                ? `${chat.message.substring(0, 100)}...`
                                : chat.message || t('no_message')
                              }
                            </Typography>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              <strong>{t('ai')}:</strong> {chat.response && chat.response.length > 150 
                                ? `${chat.response.substring(0, 150)}...`
                                : chat.response || t('no_response')
                              }
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < chatHistory.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={fetchChatHistory}
              >
                {t('load_more')}
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Profile;