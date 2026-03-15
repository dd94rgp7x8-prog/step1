import React, { useState, useEffect } from 'react';
import {
  Container, Paper, TextField, Button,
  Typography, Box, Alert, Link, Grid,
  FormControl, InputLabel, Select, MenuItem,
  Fade, Grow, InputAdornment,
  CircularProgress, IconButton, useTheme,
  LinearProgress, Snackbar
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  SportsTennis as TennisIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon,
  Language as LanguageIcon,
  Check,
  Close,
  Warning
} from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';

const AlertComponent = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Register = ({ darkMode }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    language: localStorage.getItem('language') || 'en'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    criteria: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      specialChar: false
    }
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Валидация сложности пароля
  const checkPasswordStrength = (password) => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(criteria).filter(Boolean).length;
    
    setPasswordStrength({
      score,
      criteria
    });

    return criteria;
  };

  useEffect(() => {
    if (formData.password) {
      checkPasswordStrength(formData.password);
    } else {
      setPasswordStrength({
        score: 0,
        criteria: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          specialChar: false
        }
      });
    }
  }, [formData.password]);

  // Полная валидация формы
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('first_name_required');
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('last_name_required');
    }
    
    if (!formData.username.trim()) {
      newErrors.username = t('username_required');
    } else if (formData.username.length < 3) {
      newErrors.username = t('username_min_length');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = t('username_invalid_chars');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t('email_required');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('invalid_email');
    }
    
    if (!formData.password) {
      newErrors.password = t('password_required');
    } else if (passwordStrength.score < 3) {
      newErrors.password = t('password_weak');
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('confirm_password_required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwords_mismatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showSnackbar('Please fix all errors before submitting', 'error');
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName
      });

      if (result.success) {
        showSnackbar(t('registration_successful'), 'success');
        
        // Сбрасываем форму
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          language: localStorage.getItem('language') || 'en'
        });

        // Автоматический логин после успешной регистрации
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        // Обработка ошибок от сервера
        const serverErrors = result.error || {};
        const fieldErrors = {};
        
        if (serverErrors.username) {
          fieldErrors.username = Array.isArray(serverErrors.username) 
            ? serverErrors.username[0] 
            : serverErrors.username;
        }
        if (serverErrors.email) {
          fieldErrors.email = Array.isArray(serverErrors.email) 
            ? serverErrors.email[0] 
            : serverErrors.email;
        }
        if (serverErrors.detail) {
          showSnackbar(serverErrors.detail, 'error');
          setErrors({ general: serverErrors.detail });
        } else {
          setErrors(fieldErrors);
          if (fieldErrors.username || fieldErrors.email) {
            showSnackbar(t('registration_failed_check_fields'), 'error');
          }
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      showSnackbar(t('registration_error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Фон и цвета в зависимости от темы
  const getColors = () => {
    if (darkMode) {
      return {
        main: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        overlay: 'rgba(255, 255, 255, 0.05)',
        card: 'rgba(30, 30, 46, 0.95)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        strength: {
          weak: '#f44336',
          medium: '#ff9800',
          strong: '#4caf50',
          veryStrong: '#2e7d32'
        }
      };
    }
    return {
      main: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overlay: 'rgba(255, 255, 255, 0.1)',
      card: 'rgba(255, 255, 255, 0.95)',
      textPrimary: 'white',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      strength: {
        weak: '#f44336',
        medium: '#ff9800',
        strong: '#4caf50',
        veryStrong: '#2e7d32'
      }
    };
  };

  const colors = getColors();

  // Стили для полей ввода в зависимости от темы
  const getInputStyles = () => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : undefined,
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: darkMode 
          ? '0 0 0 2px rgba(102, 126, 234, 0.4)'
          : '0 0 0 2px rgba(102, 126, 234, 0.2)',
        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : undefined,
      },
      '&.Mui-focused': {
        boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.4)',
      }
    },
    '& .MuiInputLabel-root': {
      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined,
    },
    '& .MuiOutlinedInput-input': {
      color: darkMode ? '#ffffff' : undefined,
    },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined,
    }
  });

  // Получить цвет и текст для индикатора сложности пароля
  const getPasswordStrengthInfo = () => {
    const { score } = passwordStrength;
    let strength = 'Very Weak';
    let color = colors.strength.weak;
    let percent = 0;

    if (score === 0) {
      strength = 'Very Weak';
      color = colors.strength.weak;
      percent = 20;
    } else if (score === 1 || score === 2) {
      strength = 'Weak';
      color = colors.strength.weak;
      percent = 40;
    } else if (score === 3) {
      strength = 'Fair';
      color = colors.strength.medium;
      percent = 60;
    } else if (score === 4) {
      strength = 'Strong';
      color = colors.strength.strong;
      percent = 80;
    } else if (score === 5) {
      strength = 'Very Strong';
      color = colors.strength.veryStrong;
      percent = 100;
    }

    return { strength, color, percent };
  };

  const strengthInfo = getPasswordStrengthInfo();

  return (
    <>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <AlertComponent
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            fontSize: '1rem',
            alignItems: 'center',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {snackbarMessage}
        </AlertComponent>
      </Snackbar>

      <Box
        sx={{
          minHeight: '100vh',
          background: colors.main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          position: 'relative',
          overflow: 'hidden',
          transition: 'background 0.3s ease'
        }}
      >
        {/* Анимированный фон */}
        <Box
          sx={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `radial-gradient(circle, ${colors.overlay} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'backgroundMove 20s linear infinite',
          }}
        />

        <Container maxWidth="md">
          <Grow in={true} timeout={800}>
            <Box>
              {/* Заголовок */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <TennisIcon
                  sx={{
                    fontSize: 60,
                    color: colors.textPrimary,
                    mb: 2,
                    animation: 'float 3s ease-in-out infinite'
                  }}
                />
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    color: colors.textPrimary,
                    mb: 1,
                    background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {t('create_account')}
                </Typography>
                <Typography variant="h6" sx={{ color: colors.textSecondary }}>
                  {t('welcome_register')}
                </Typography>
              </Box>

              {/* Форма регистрации */}
              <Paper
                elevation={10}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  backdropFilter: 'blur(10px)',
                  background: colors.card,
                  border: colors.border,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Декоративные элементы */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 100,
                    height: 100,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    borderRadius: '0 0 0 100px'
                  }}
                />

                {errors.general && (
                  <Fade in={!!errors.general}>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3,
                        borderRadius: 2,
                        backgroundColor: darkMode ? 'rgba(244, 67, 54, 0.2)' : undefined,
                        color: darkMode ? '#ff5252' : undefined,
                        '& .MuiAlert-icon': {
                          fontSize: '1.5rem'
                        }
                      }}
                      icon={<ErrorIcon />}
                    >
                      {errors.general}
                    </Alert>
                  </Fade>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    {/* Имя и Фамилия */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="firstName"
                        label={t('first_name')}
                        name="firstName"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={loading}
                        variant="outlined"
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={getInputStyles()}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="lastName"
                        label={t('last_name')}
                        name="lastName"
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={loading}
                        variant="outlined"
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={getInputStyles()}
                      />
                    </Grid>

                    {/* Имя пользователя */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="username"
                        label={t('username')}
                        name="username"
                        autoComplete="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={loading}
                        variant="outlined"
                        error={!!errors.username}
                        helperText={errors.username || t('username_helper')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={getInputStyles()}
                      />
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="email"
                        label={t('email_address')}
                        name="email"
                        autoComplete="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        variant="outlined"
                        error={!!errors.email}
                        helperText={errors.email}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={getInputStyles()}
                      />
                    </Grid>

                    {/* Пароль */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="password"
                        label={t('password')}
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        variant="outlined"
                        error={!!errors.password}
                        helperText={errors.password || t('password_helper')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                edge="end"
                                sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={getInputStyles()}
                      />

                      {/* Индикатор сложности пароля */}
                      {formData.password && (
                        <Fade in={!!formData.password}>
                          <Box sx={{ mt: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" sx={{ 
                                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                fontWeight: 600
                              }}>
                                Password Strength:
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: strengthInfo.color,
                                fontWeight: 700
                              }}>
                                {strengthInfo.strength}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={strengthInfo.percent}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: strengthInfo.color,
                                  borderRadius: 4,
                                }
                              }}
                            />

                            {/* Критерии пароля */}
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="caption" sx={{ 
                                display: 'block', 
                                mb: 1,
                                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                fontWeight: 600
                              }}>
                                Password must contain:
                              </Typography>
                              <Grid container spacing={1}>
                                {Object.entries(passwordStrength.criteria).map(([key, value]) => {
                                  const labels = {
                                    length: 'At least 8 characters',
                                    uppercase: 'Uppercase letter (A-Z)',
                                    lowercase: 'Lowercase letter (a-z)',
                                    number: 'Number (0-9)',
                                    specialChar: 'Special character (!@#$%^&*)'
                                  };
                                  
                                  return (
                                    <Grid item xs={12} sm={6} key={key}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        {value ? (
                                          <Check sx={{ fontSize: 16, color: '#4caf50', mr: 1 }} />
                                        ) : (
                                          <Close sx={{ fontSize: 16, color: '#f44336', mr: 1 }} />
                                        )}
                                        <Typography variant="caption" sx={{ 
                                          color: value 
                                            ? (darkMode ? '#4caf50' : '#2e7d32') 
                                            : (darkMode ? 'rgba(255, 255, 255, 0.5)' : 'text.disabled'),
                                          fontSize: '0.75rem'
                                        }}>
                                          {labels[key]}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  );
                                })}
                              </Grid>
                            </Box>
                          </Box>
                        </Fade>
                      )}
                    </Grid>

                    {/* Подтверждение пароля */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="confirmPassword"
                        label={t('confirm_password')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                        variant="outlined"
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle confirm password visibility"
                                onClick={handleClickShowConfirmPassword}
                                edge="end"
                                sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined }}
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={getInputStyles()}
                      />
                    </Grid>

                    {/* Язык */}
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined" error={!!errors.language}>
                        <InputLabel id="language-label" sx={{ 
                          color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined
                        }}>
                          <LanguageIcon sx={{ mr: 1, fontSize: 20 }} />
                          {t('preferred_language')}
                        </InputLabel>
                        <Select
                          labelId="language-label"
                          id="language"
                          name="language"
                          value={formData.language}
                          onChange={handleChange}
                          disabled={loading}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LanguageIcon sx={{ mr: 1, fontSize: 20 }} />
                              {t('preferred_language')}
                            </Box>
                          }
                          sx={{
                            borderRadius: 2,
                            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : undefined,
                            '& .MuiOutlinedInput-input': {
                              color: darkMode ? '#ffffff' : undefined,
                            },
                            '& .MuiSelect-icon': {
                              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined,
                            }
                          }}
                        >
                          <MenuItem value="en">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <span role="img" aria-label="English" style={{ marginRight: 8 }}>🇺🇸</span>
                              {t('language_en')}
                          </Box>
                          </MenuItem>
                          <MenuItem value="ru">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <span role="img" aria-label="Russian" style={{ marginRight: 8 }}>🇷🇺</span>
                              {t('language_ru')}
                            </Box>
                          </MenuItem>
                          <MenuItem value="kz">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <span role="img" aria-label="Kazakh" style={{ marginRight: 8 }}>🇰🇿</span>
                              {t('language_kz')}
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* Кнопка регистрации */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                      mt: 4, 
                      mb: 2,
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: darkMode 
                          ? '0 10px 25px rgba(102, 126, 234, 0.6)'
                          : '0 10px 25px rgba(102, 126, 234, 0.4)',
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      },
                      '&.Mui-disabled': {
                        background: darkMode 
                          ? 'linear-gradient(135deg, #555 0%, #333 100%)'
                          : 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                      }
                    }}
                    disabled={loading || passwordStrength.score < 3}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {loading ? t('creating_account') : t('register')}
                    {passwordStrength.score < 3 && !loading && (
                      <Warning sx={{ ml: 1, fontSize: 20 }} />
                    )}
                  </Button>

                  {/* Подсказка если пароль слабый */}
                  {passwordStrength.score < 3 && formData.password && (
                    <Alert 
                      severity="warning" 
                      sx={{ 
                        mt: 2,
                        mb: 2,
                        borderRadius: 2,
                        backgroundColor: darkMode ? 'rgba(255, 152, 0, 0.2)' : undefined,
                        '& .MuiAlert-icon': {
                          fontSize: '1.2rem'
                        }
                      }}
                      icon={<Warning />}
                    >
                      Password is too weak. Please meet at least 3 criteria to register.
                    </Alert>
                  )}

                  {/* Ссылка на вход */}
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body1" sx={{ 
                      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                    }}>
                      {t('have_account')}{' '}
                      <Link
                        component={RouterLink}
                        to="/login"
                        sx={{
                          color: darkMode ? '#90caf9' : 'primary.main',
                          textDecoration: 'none',
                          fontWeight: 600,
                          position: 'relative',
                          '&:after': {
                            content: '""',
                            position: 'absolute',
                            width: '100%',
                            height: '2px',
                            bottom: -2,
                            left: 0,
                            backgroundColor: darkMode ? '#90caf9' : 'primary.main',
                            transform: 'scaleX(0)',
                            transformOrigin: 'right',
                            transition: 'transform 0.3s ease'
                          },
                          '&:hover:after': {
                            transform: 'scaleX(1)',
                            transformOrigin: 'left'
                          }
                        }}
                      >
                        {t('sign_in')}
                      </Link>
                    </Typography>
                  </Box>
                </form>

                {/* Условия использования */}
                <Box sx={{ 
                  mt: 4, 
                  pt: 3, 
                  borderTop: '1px solid',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider',
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" sx={{ 
                    color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                  }}>
                    {t('terms_conditions')}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    display: 'block', 
                    mt: 1,
                    color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'text.disabled'
                  }}>
                    © 2025 TennisPro. All rights reserved.
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grow>
        </Container>
      </Box>
    </>
  );
};

export default Register;