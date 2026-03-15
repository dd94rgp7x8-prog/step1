import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box,
  IconButton, Menu, MenuItem, Avatar, TextField,
  Container, Slide, useTheme, Popper, Paper,
  List, ListItem, ListItemText, ListItemAvatar,
  Avatar as MuiAvatar, Divider, Fade,
  Badge, CircularProgress // Добавим CircularProgress для отладки
} from '@mui/material';
import {
  SportsTennis as TennisIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Logout as LogoutIcon,
  Language as LanguageIcon,
  AccountCircle as AccountCircleIcon,
  Article as ArticleIcon,
  Person as PersonIcon2,
  EmojiEvents as TournamentIcon,
  AdminPanelSettings as AdminIcon,
  Sports as SportsIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api'; // Используем api напрямую
import debounce from 'lodash/debounce';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const theme = useTheme();
  const { user, logout, loading: authLoading } = useAuth(); // Добавили authLoading
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState({
    news: [],
    atpPlayers: [],
    wtaPlayers: []
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchAnchor, setSearchAnchor] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [adminData, setAdminData] = useState(null); // Для отладки

  // Проверяем, является ли пользователь админом (с отладкой)
  const isAdmin = React.useMemo(() => {
    console.log('User data in Navbar:', user); // Отладка
    if (!user) return false;
    
    // Проверяем разные варианты, как может храниться is_admin
    const adminStatus = 
      user.userprofile?.is_admin || 
      user.is_admin || 
      user.isAdmin || 
      (user.userprofile && user.userprofile.is_admin === true);
    
    console.log('Admin status:', adminStatus, 'Type:', typeof adminStatus);
    return Boolean(adminStatus);
  }, [user]);

  // Для отладки - загружаем профиль при загрузке компонента
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user && user.id) {
        try {
          const response = await api.get('/profile/');
          console.log('Profile API response:', response.data);
          setAdminData(response.data);
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    };
    
    loadUserProfile();
  }, [user]);

  const navItems = [
    { label: t('home'), path: '/' },
    { label: 'ATP', path: '/atp' },
    { label: 'WTA', path: '/wta' },
    { label: t('rankings'), path: '/rankings' },
    { label: t('tournaments'), path: '/tournaments' },
    { label: t('news'), path: '/news' },
    { label: t('ai'), path: '/ai', icon: <ChatIcon /> },
  ];

  // Добавляем админ панель в навигацию если пользователь админ
  const adminNavItems = isAdmin ? [
    ...navItems,
    { 
      label: 'Admin', 
      path: '/admin', 
      icon: <AdminIcon sx={{ fontSize: 18, mr: 0.5 }} />,
      badge: true 
    }
  ] : navItems;

  console.log('isAdmin:', isAdmin, 'adminNavItems length:', adminNavItems.length); // Отладка

  // Debounced search function
  const debouncedSearch = debounce(async (query) => {
    if (!query.trim()) {
      setSearchResults({ news: [], atpPlayers: [], wtaPlayers: [] });
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      // Search in parallel
      const [newsResults, atpResults, wtaResults] = await Promise.allSettled([
        api.get(`/news/?search=${query}`),
        api.get(`/players/?gender=ATP&search=${query}`),
        api.get(`/players/?gender=WTA&search=${query}`)
      ]);

      const results = {
        news: newsResults.status === 'fulfilled' ? 
          (newsResults.value.data.results || newsResults.value.data || []).slice(0, 3) : [],
        atpPlayers: atpResults.status === 'fulfilled' ? 
          (atpResults.value.data.results || atpResults.value.data || []).slice(0, 3) : [],
        wtaPlayers: wtaResults.status === 'fulfilled' ? 
          (wtaResults.value.data.results || wtaResults.value.data || []).slice(0, 3) : []
      };

      setSearchResults(results);
      
      // Show results if any section has results
      if (results.news.length > 0 || results.atpPlayers.length > 0 || results.wtaPlayers.length > 0) {
        setShowSearchResults(true);
      } else {
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  }, 300);

  useEffect(() => {
    if (searchText.trim()) {
      debouncedSearch(searchText);
    } else {
      setSearchResults({ news: [], atpPlayers: [], wtaPlayers: [] });
      setShowSearchResults(false);
    }
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchText]);

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleLanguageClick = (event) => {
    setLanguageAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
    setLanguageAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleLanguageClose = (lang) => {
    setLanguageAnchor(null);
    if (lang) {
      i18n.changeLanguage(lang);
      localStorage.setItem('language', lang);
    }
  };

  const handleSearchInput = (e) => {
    setSearchText(e.target.value);
    if (e.target.value.trim()) {
      setSearchAnchor(e.currentTarget);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchText)}`);
      setSearchText('');
      setShowSearchResults(false);
    }
  };

  const handleSearchItemClick = (type, id) => {
    switch(type) {
      case 'news':
        navigate(`/news/${id}`);
        break;
      case 'atp':
      case 'wta':
        navigate(`/players/${id}`);
        break;
    }
    setSearchText('');
    setShowSearchResults(false);
  };

  const handleSearchClose = () => {
    setShowSearchResults(false);
  };

  const handleViewAllResults = () => {
    navigate(`/search?q=${encodeURIComponent(searchText)}`);
    setSearchText('');
    setShowSearchResults(false);
  };

  const isActive = (path) => location.pathname === path;

  const getNavbarStyles = () => {
    if (theme.palette.mode === 'dark') {
      return {
        background: 'rgba(30, 30, 30, 0.95)',
        borderColor: '#333',
        textPrimary: '#ffffff',
        textSecondary: '#b0b0b0',
      };
    }
    return {
      background: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'divider',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
    };
  };

  const navbarStyles = getNavbarStyles();

  const totalResults = searchResults.news.length + 
                      searchResults.atpPlayers.length + 
                      searchResults.wtaPlayers.length;

  // Если идет загрузка аутентификации
  if (authLoading) {
    return (
      <Box sx={{ 
        height: 64, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: navbarStyles.background,
        borderBottom: '1px solid',
        borderColor: navbarStyles.borderColor,
      }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Slide in direction="down">
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: navbarStyles.background,
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: navbarStyles.borderColor,
          py: 1,
          transition: 'all 0.3s ease',
          zIndex: 1300
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <SportsIcon color="primary" />
              <Typography fontWeight={700} color="success.main">ATP</Typography>
              <Typography fontWeight={700} color={navbarStyles.textPrimary}>-</Typography>
              <Typography 
                color="primary.main" 
                fontWeight={700}
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate('/wta')}
              >
                WTA
              </Typography>
              <Typography 
                ml={2} 
                sx={{ 
                  cursor: 'pointer',
                  color: navbarStyles.textPrimary
                }}
                onClick={() => navigate('/news')}
              >
                Tennis News
              </Typography>
            </Box>

            {/* Center Section - Navigation */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' },
              gap: 3
            }}>
              {adminNavItems.map((item) => (
                <Box key={item.label} position="relative">
                  <Typography 
                    onClick={() => navigate(item.path)}
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: isActive(item.path) ? 600 : 400,
                      color: isActive(item.path) 
                        ? (item.path === '/admin' ? theme.palette.warning.main : theme.palette.primary.main)
                        : navbarStyles.textPrimary,
                      '&:hover': {
                        color: item.path === '/admin' 
                          ? theme.palette.warning.main 
                          : theme.palette.primary.main,
                      },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      position: 'relative'
                    }}
                  >
                    {item.icon && item.icon}
                    {item.label}
                    {item.badge && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -5,
                          right: -5,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: theme.palette.warning.main,
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                            '100%': { opacity: 1 },
                          }
                        }}
                      />
                    )}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Right Section - Search & Auth */}
            <Box display="flex" alignItems="center" gap={2} position="relative">
              {/* Search Field */}
              <Box position="relative">
                <form onSubmit={handleSearchSubmit}>
                  <TextField
                    size="small"
                    placeholder={t('search_tennis_news_players') || "Search news, players..."}
                    sx={{ 
                      width: 280,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.background.paper
                      }
                    }}
                    value={searchText}
                    onChange={handleSearchInput}
                    onFocus={(e) => {
                      if (searchText.trim() && totalResults > 0) {
                        setSearchAnchor(e.currentTarget);
                        setShowSearchResults(true);
                      }
                    }}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                  />
                </form>

                {/* Search Results Dropdown */}
                <Popper
                  open={showSearchResults && totalResults > 0}
                  anchorEl={searchAnchor}
                  placement="bottom-start"
                  transition
                  style={{ zIndex: 1400 }}
                >
                  {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={200}>
                      <Paper
                        sx={{
                          width: 400,
                          maxHeight: 500,
                          overflow: 'auto',
                          mt: 1,
                          boxShadow: 3,
                          borderRadius: 2
                        }}
                        onMouseLeave={handleSearchClose}
                      >
                        <List dense>
                          {/* News Results */}
                          {searchResults.news.length > 0 && (
                            <>
                              <ListItem>
                                <ListItemText
                                  primary="News"
                                  primaryTypographyProps={{
                                    fontWeight: 'bold',
                                    color: 'primary.main'
                                  }}
                                />
                              </ListItem>
                              {searchResults.news.map((item) => (
                                <ListItem
                                  key={`news-${item.id}`}
                                  button
                                  onClick={() => handleSearchItemClick('news', item.id)}
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: 'action.hover'
                                    }
                                  }}
                                >
                                  <ListItemAvatar>
                                    <MuiAvatar>
                                      <ArticleIcon />
                                    </MuiAvatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={item.title}
                                    secondary={`${item.category} • ${new Date(item.published_date).toLocaleDateString()}`}
                                    secondaryTypographyProps={{
                                      variant: 'caption'
                                    }}
                                  />
                                </ListItem>
                              ))}
                              <Divider />
                            </>
                          )}

                          {/* ATP Players Results */}
                          {searchResults.atpPlayers.length > 0 && (
                            <>
                              <ListItem>
                                <ListItemText
                                  primary="ATP Players"
                                  primaryTypographyProps={{
                                    fontWeight: 'bold',
                                    color: 'success.main'
                                  }}
                                />
                              </ListItem>
                              {searchResults.atpPlayers.map((player) => (
                                <ListItem
                                  key={`atp-${player.id}`}
                                  button
                                  onClick={() => handleSearchItemClick('atp', player.id)}
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: 'action.hover'
                                    }
                                  }}
                                >
                                  <ListItemAvatar>
                                    <MuiAvatar
                                      src={player.image_url}
                                      alt={player.name}
                                    >
                                      <PersonIcon2 />
                                    </MuiAvatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={player.name}
                                    secondary={`Rank: #${player.rank} • ${player.country}`}
                                    secondaryTypographyProps={{
                                      variant: 'caption'
                                    }}
                                  />
                                </ListItem>
                              ))}
                              <Divider />
                            </>
                          )}

                          {/* WTA Players Results */}
                          {searchResults.wtaPlayers.length > 0 && (
                            <>
                              <ListItem>
                                <ListItemText
                                  primary="WTA Players"
                                  primaryTypographyProps={{
                                    fontWeight: 'bold',
                                    color: 'secondary.main'
                                  }}
                                />
                              </ListItem>
                              {searchResults.wtaPlayers.map((player) => (
                                <ListItem
                                  key={`wta-${player.id}`}
                                  button
                                  onClick={() => handleSearchItemClick('wta', player.id)}
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: 'action.hover'
                                    }
                                  }}
                                >
                                  <ListItemAvatar>
                                    <MuiAvatar
                                      src={player.image_url}
                                      alt={player.name}
                                    >
                                      <PersonIcon2 />
                                    </MuiAvatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={player.name}
                                    secondary={`Rank: #${player.rank} • ${player.country}`}
                                    secondaryTypographyProps={{
                                      variant: 'caption'
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </>
                          )}

                          {/* View All Results */}
                          {totalResults > 0 && (
                            <ListItem 
                              button 
                              onClick={handleViewAllResults}
                              sx={{
                                backgroundColor: 'primary.light',
                                '&:hover': {
                                  backgroundColor: 'primary.main',
                                  color: 'white'
                                }
                              }}
                            >
                              <ListItemText
                                primary={`View all ${totalResults} results`}
                                primaryTypographyProps={{
                                  align: 'center',
                                  fontWeight: 'bold'
                                }}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Paper>
                    </Fade>
                  )}
                </Popper>
              </Box>

              {/* Language Selector */}
              <IconButton 
                color="inherit" 
                onClick={handleLanguageClick} 
                size="small"
                sx={{ color: navbarStyles.textPrimary }}
              >
                <LanguageIcon />
              </IconButton>
              <Menu
                anchorEl={languageAnchor}
                open={Boolean(languageAnchor)}
                onClose={() => handleLanguageClose(null)}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper
                  }
                }}
              >
                <MenuItem onClick={() => handleLanguageClose('en')}>English</MenuItem>
                <MenuItem onClick={() => handleLanguageClose('ru')}>Русский</MenuItem>
                <MenuItem onClick={() => handleLanguageClose('kz')}>Қазақша</MenuItem>
              </Menu>

              {/* Dark Mode Toggle */}
              <IconButton
                onClick={toggleDarkMode}
                size="small"
                sx={{ color: navbarStyles.textPrimary }}
              >
                {darkMode ? '☀️' : '🌙'}
              </IconButton>

              {/* User Authentication */}
              {user ? (
                <>
                  {/* Debug badge - показываем статус админа */}
                  {isAdmin && (
                    <Badge
                      badgeContent="ADMIN"
                      color="warning"
                      sx={{ 
                        display: { xs: 'flex', md: 'none' },
                        '& .MuiBadge-badge': {
                          fontSize: '0.6rem',
                          height: 16,
                          borderRadius: 1,
                          fontWeight: 'bold'
                        }
                      }}
                    />
                  )}

                  <IconButton
                    onClick={handleProfileMenu}
                    sx={{
                      ml: 1,
                      '&:hover': {
                        transform: 'scale(1.05)',
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: isAdmin ? 'warning.main' : 'primary.main',
                        border: '2px solid',
                        borderColor: isAdmin ? 'warning.light' : 'primary.light',
                        position: 'relative',
                        fontWeight: 'bold'
                      }}
                    >
                      {user.username?.charAt(0).toUpperCase() || <AccountCircleIcon />}
                      {isAdmin && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            backgroundColor: 'warning.dark',
                            border: '2px solid',
                            borderColor: 'background.paper',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: 8, color: 'white' }}>
                            A
                          </Typography>
                        </Box>
                      )}
                    </Avatar>
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        minWidth: 220,
                        borderRadius: 2,
                        overflow: 'visible',
                        backgroundColor: theme.palette.background.paper,
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: theme.palette.background.paper,
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        }
                      }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem onClick={() => {
                      navigate('/profile');
                      handleClose();
                    }}>
                      <PersonIcon sx={{ mr: 2 }} />
                      {t('profile')}
                      {adminData && adminData.is_admin && (
                        <Typography variant="caption" color="warning.main" sx={{ ml: 'auto' }}>
                          Admin
                        </Typography>
                      )}
                    </MenuItem>
                    
                    {/* Пункт Админ панель в выпадающем меню */}
                    {isAdmin && (
                      <MenuItem 
                        onClick={() => {
                          navigate('/admin');
                          handleClose();
                        }}
                        sx={{
                          backgroundColor: 'warning.light',
                          '&:hover': {
                            backgroundColor: 'warning.main',
                            color: 'warning.contrastText',
                            '& .MuiSvgIcon-root': {
                              color: 'warning.contrastText'
                            }
                          },
                          mt: 0.5,
                          mb: 0.5
                        }}
                      >
                        <AdminIcon sx={{ mr: 2 }} />
                        <Typography fontWeight="bold">Админ панель</Typography>
                        <Box
                          sx={{
                            ml: 'auto',
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: 'warning.dark',
                            animation: 'pulse 1.5s infinite',
                            '@keyframes pulse': {
                              '0%': { opacity: 1 },
                              '50%': { opacity: 0.5 },
                              '100%': { opacity: 1 },
                            }
                          }}
                        />
                      </MenuItem>
                    )}
                    
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 2 }} />
                      {t('logout')}
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button 
                  variant="contained" 
                  color="success"
                  component={Link}
                  to="/login"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3
                  }}
                >
                  {t('sign_in')}
                </Button>
              )}

              {/* Mobile Menu Button */}
              <IconButton
                sx={{ 
                  display: { xs: 'flex', md: 'none' },
                  color: navbarStyles.textPrimary
                }}
                onClick={handleMobileMenu}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleClose}
            sx={{
              display: { xs: 'block', md: 'none' },
            }}
            PaperProps={{
              sx: {
                backgroundColor: theme.palette.background.paper,
                minWidth: 220
              }
            }}
          >
            {adminNavItems.map((item) => (
              <MenuItem
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  handleClose();
                }}
                selected={isActive(item.path)}
                sx={{
                  color: item.path === '/admin' ? 'warning.main' : 'inherit',
                  fontWeight: item.path === '/admin' ? 'bold' : 'normal',
                  borderLeft: item.path === '/admin' ? '3px solid' : 'none',
                  borderColor: 'warning.main',
                  pl: item.path === '/admin' ? 2 : 3,
                  backgroundColor: item.path === '/admin' ? 'warning.light' : 'transparent',
                  '&:hover': {
                    backgroundColor: item.path === '/admin' ? 'warning.main' : 'action.hover',
                    color: item.path === '/admin' ? 'warning.contrastText' : 'inherit'
                  }
                }}
              >
                {item.icon && <Box sx={{ mr: 2 }}>{item.icon}</Box>}
                {item.label}
                {item.badge && (
                  <Box
                    sx={{
                      ml: 'auto',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'warning.dark',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 },
                      }
                    }}
                  />
                )}
              </MenuItem>
            ))}
            
            {/* Dark mode toggle in mobile menu */}
            <MenuItem onClick={() => {
              toggleDarkMode();
              handleClose();
            }}>
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </MenuItem>
            
            {/* Auth options in mobile menu */}
            {!user && (
              <>
                <MenuItem onClick={() => {
                  navigate('/login');
                  handleClose();
                }}>
                  {t('login')}
                </MenuItem>
                <MenuItem onClick={() => {
                  navigate('/register');
                  handleClose();
                }}>
                  {t('register')}
                </MenuItem>
              </>
            )}
          </Menu>
        </Container>
      </AppBar>
    </Slide>
  );
};

export default Navbar;
