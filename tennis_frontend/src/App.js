import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { modernTheme } from './theme';
import './utils/i18n';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import News from './pages/News';
import Players from './pages/Players'; // Общая страница игроков (опционально)
import ATPPlayers from './pages/ATPPlayers'; // Новая страница ATP
import WTAPlayers from './pages/WTAPlayers'; // Новая страница WTA
import PlayerDetail from './pages/PlayerDetail';
import Tournaments from './pages/Tournaments';
import Rankings from './pages/Rankings';
import Contacts from './pages/Contacts';
import AIChat from './pages/AIChat';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SearchPage from './pages/SearchPage';
import Admin from './pages/Admin';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="loader"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Проверяем сохраненную тему в localStorage
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  // Создаем тему с учетом режима
  const theme = useMemo(() => {
    const baseTheme = modernTheme;
    
    if (darkMode) {
      return createTheme({
        ...baseTheme,
        palette: {
          mode: 'dark',
          primary: baseTheme.palette.primary,
          secondary: baseTheme.palette.secondary,
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
        },
      });
    }
    
    return createTheme(baseTheme);
  }, [darkMode]);

  // Функция для переключения темы
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <Routes>
            <Route path="/login" element={<Login darkMode={darkMode} />} />
            <Route path="/register" element={<Register darkMode={darkMode} />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/news" element={<PrivateRoute><News /></PrivateRoute>} />
            <Route path="/players" element={<PrivateRoute><Players /></PrivateRoute>} /> {/* Общая страница */}
            <Route path="/atp" element={<PrivateRoute><ATPPlayers /></PrivateRoute>} /> {/* ATP игроки */}
            <Route path="/wta" element={<PrivateRoute><WTAPlayers /></PrivateRoute>} /> {/* WTA игроки */}
            <Route path="/players/:id" element={<PrivateRoute><PlayerDetail /></PrivateRoute>} />
            <Route path="/tournaments" element={<PrivateRoute><Tournaments /></PrivateRoute>} />
            <Route path="/rankings" element={<PrivateRoute><Rankings /></PrivateRoute>} />
            <Route path="/contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />
            <Route path="/ai" element={<PrivateRoute><AIChat /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></PrivateRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;