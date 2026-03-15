import React, { useState } from 'react';
import {
  Container, Paper, TextField, Button,
  Typography, Box, Alert, Link,
  Fade, Grow, useTheme
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';

const Login = ({ darkMode }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(credentials);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error?.detail || t('login_failed'));
      }
    } catch (err) {
      setError(t('error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  // Фон в зависимости от темы
  const getBackground = () => {
    if (darkMode) {
      return {
        main: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        overlay: 'rgba(255, 255, 255, 0.05)',
        card: 'rgba(30, 30, 46, 0.95)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.8)'
      };
    }
    return {
      main: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overlay: 'rgba(255, 255, 255, 0.1)',
      card: 'rgba(255, 255, 255, 0.95)',
      textPrimary: 'white',
      textSecondary: 'rgba(255, 255, 255, 0.8)'
    };
  };

  const background = getBackground();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: background.main,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s ease'
      }}
    >
      {/* Анимированные элементы фона */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 20% 50%, ${background.overlay} 0%, transparent 50%)`,
          animation: 'backgroundMove 20s linear infinite',
        }}
      />

      <Container maxWidth="sm">
        <Grow in={true} timeout={800}>
          <Box>
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <SportsTennisIcon
                sx={{
                  fontSize: 60,
                  color: background.textPrimary,
                  mb: 2,
                  animation: 'float 3s ease-in-out infinite'
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: background.textPrimary,
                  mb: 1,
                  background: darkMode 
                    ? 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.9) 100%)'
                    : 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                TennisPro
              </Typography>
              <Typography variant="h6" sx={{ color: background.textSecondary }}>
                {t('login_to_portal')}
              </Typography>
            </Box>

            <Paper
              elevation={10}
              sx={{
                p: 4,
                borderRadius: 4,
                backdropFilter: 'blur(10px)',
                background: background.card,
                border: darkMode 
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
            >
              {error && (
                <Fade in={!!error}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      backgroundColor: darkMode ? 'rgba(244, 67, 54, 0.2)' : undefined,
                      color: darkMode ? '#ff5252' : undefined
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label={t('username')}
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={credentials.username}
                  onChange={handleChange}
                  disabled={loading}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : undefined,
                      '&.Mui-focused fieldset': {
                        borderWidth: 2,
                      },
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : undefined,
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: darkMode ? '#ffffff' : undefined,
                    }
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label={t('password')}
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : undefined,
                      '&.Mui-focused fieldset': {
                        borderWidth: 2,
                      },
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : undefined,
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: darkMode ? '#ffffff' : undefined,
                    }
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: darkMode 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: darkMode 
                        ? '0 10px 25px rgba(102, 126, 234, 0.6)'
                        : '0 10px 25px rgba(102, 126, 234, 0.4)',
                      background: darkMode 
                        ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                        : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    },
                    '&:disabled': {
                      background: darkMode 
                        ? 'linear-gradient(135deg, #555 0%, #333 100%)'
                        : 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? t('logging_in') : t('login')}
                </Button>
                
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" sx={{ 
                    color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                  }}>
                    {t('dont_have_account')}{' '}
                    <Link
                      component={RouterLink}
                      to="/register"
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
                      {t('register_here')}
                    </Link>
                  </Typography>
                </Box>
              </form>
            </Paper>
          </Box>
        </Grow>
      </Container>
    </Box>
  );
};

export default Login;