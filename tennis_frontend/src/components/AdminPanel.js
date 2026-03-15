import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Switch,
  IconButton,
  TextField,
  InputAdornment,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Проверяем, является ли пользователь админом
  const isAdmin = user?.userprofile?.is_admin || user?.is_admin;

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users/');
      console.log('Users data:', response.data); // Добавьте это для отладки
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Вспомогательные функции для безопасного доступа к данным
  const getUsername = (userProfile) => {
    // Проверяем разные возможные структуры данных
    if (userProfile?.user?.username) return userProfile.user.username;
    if (userProfile?.username) return userProfile.username;
    if (userProfile?.email) return userProfile.email.split('@')[0];
    return 'N/A';
  };

  const getEmail = (userProfile) => {
    if (userProfile?.user?.email) return userProfile.user.email;
    if (userProfile?.email) return userProfile.email;
    return 'N/A';
  };

  const getUserFullName = (userProfile) => {
    if (userProfile?.user?.first_name || userProfile?.user?.last_name) {
      return `${userProfile.user.first_name || ''} ${userProfile.user.last_name || ''}`.trim();
    }
    if (userProfile?.first_name || userProfile?.last_name) {
      return `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
    }
    return null;
  };

  const toggleAdminStatus = async (userProfileId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userProfileId}/`, {
        is_admin: !currentStatus
      });
      fetchUsers(); // Обновляем список
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    try {
      await api.patch(`/admin/users/${selectedUser.id}/`, {
        language: selectedUser.language,
        notifications_enabled: selectedUser.notifications_enabled,
      });
      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      console.error('Ошибка при обновлении пользователя:', err);
    }
  };

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = users.filter(userProfile => {
    const searchLower = searchTerm.toLowerCase();
    const username = getUsername(userProfile).toLowerCase();
    const email = getEmail(userProfile).toLowerCase();
    return username.includes(searchLower) || email.includes(searchLower);
  });

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          У вас нет прав для доступа к панели администратора
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            <AdminIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Панель администратора
          </Typography>
          <Button variant="contained" onClick={fetchUsers}>
            Обновить
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          placeholder="Поиск пользователей..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Пользователь</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell>Язык</TableCell>
                <TableCell>Уведомления</TableCell>
                <TableCell>Администратор</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((userProfile) => {
                const username = getUsername(userProfile);
                const email = getEmail(userProfile);
                const fullName = getUserFullName(userProfile);
                const dateJoined = userProfile.date_joined || userProfile.created_at || userProfile.user?.date_joined;

                return (
                  <TableRow key={userProfile.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body1">
                            {username}
                          </Typography>
                          {fullName && (
                            <Typography variant="body2" color="text.secondary">
                              {fullName}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{email}</TableCell>
                    <TableCell>
                      {dateJoined ? new Date(dateJoined).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={(userProfile.language?.toUpperCase() || 'EN')} 
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={userProfile.notifications_enabled || false}
                        disabled
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={userProfile.is_admin || false}
                        onChange={() => toggleAdminStatus(userProfile.id, userProfile.is_admin)}
                        color="success"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditUser(userProfile)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredUsers.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              Пользователи не найдены
            </Typography>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Всего пользователей: {users.length}
        </Typography>
      </Paper>

      {/* Диалог редактирования пользователя */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Редактирование пользователя</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2, minWidth: 400 }}>
              <TextField
                fullWidth
                label="Имя пользователя"
                value={getUsername(selectedUser)}
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                value={getEmail(selectedUser)}
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                select
                fullWidth
                label="Язык"
                value={selectedUser.language || 'en'}
                onChange={(e) => setSelectedUser({
                  ...selectedUser,
                  language: e.target.value
                })}
                sx={{ mb: 2 }}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="en">English</option>
                <option value="ru">Русский</option>
                <option value="kk">Казакша</option>
              </TextField>
              <Box display="flex" alignItems="center">
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Уведомления:
                </Typography>
                <Switch
                  checked={selectedUser.notifications_enabled || false}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    notifications_enabled: e.target.checked
                  })}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSaveUser} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;