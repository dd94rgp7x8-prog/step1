import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { newsAPI, playersAPI } from '../services/api';

const SearchPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({
    news: [],
    atpPlayers: [],
    wtaPlayers: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = async (query) => {
    setLoading(true);
    try {
      const [newsResponse, atpResponse, wtaResponse] = await Promise.all([
        newsAPI.getAll().catch(() => ({ data: [] })),
        playersAPI.getATP().catch(() => ({ data: [] })),
        playersAPI.getWTA().catch(() => ({ data: [] }))
      ]);

      const searchTerm = query.toLowerCase();
      
      const newsResults = (newsResponse.data || []).filter(item =>
        item.title?.toLowerCase().includes(searchTerm) ||
        item.summary?.toLowerCase().includes(searchTerm)
      );

      const atpResults = (atpResponse.data || []).filter(player =>
        player.name?.toLowerCase().includes(searchTerm) ||
        player.country?.toLowerCase().includes(searchTerm)
      );

      const wtaResults = (wtaResponse.data || []).filter(player =>
        player.name?.toLowerCase().includes(searchTerm) ||
        player.country?.toLowerCase().includes(searchTerm)
      );

      setResults({
        news: newsResults,
        atpPlayers: atpResults,
        wtaPlayers: wtaResults
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleItemClick = (type, id) => {
    switch(type) {
      case 'news':
        navigate(`/news/${id}`);
        break;
      case 'atp':
      case 'wta':
        navigate(`/players/${id}`);
        break;
    }
  };

  const totalResults = results.news.length + results.atpPlayers.length + results.wtaPlayers.length;

  if (loading) {
    return (
      <Container>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>Searching...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        Search results for: "{searchQuery}"
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Found {totalResults} results
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label={`News (${results.news.length})`} />
        <Tab label={`ATP Players (${results.atpPlayers.length})`} />
        <Tab label={`WTA Players (${results.wtaPlayers.length})`} />
      </Tabs>

      {activeTab === 0 && (
        <>
          {results.news.length === 0 ? (
            <Typography>No news found</Typography>
          ) : (
            <Grid container spacing={3}>
              {results.news.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card onClick={() => handleItemClick('news', item.id)} sx={{ cursor: 'pointer' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.image_url || 'https://via.placeholder.com/400x200'}
                      alt={item.title}
                    />
                    <CardContent>
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {item.summary?.substring(0, 100)}...
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip label={item.category} size="small" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {activeTab === 1 && (
        <>
          {results.atpPlayers.length === 0 ? (
            <Typography>No ATP players found</Typography>
          ) : (
            <Grid container spacing={3}>
              {results.atpPlayers.map((player) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={player.id}>
                  <Card onClick={() => handleItemClick('atp', player.id)} sx={{ cursor: 'pointer' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={player.image_url || '/default-player.jpg'}
                      alt={player.name}
                    />
                    <CardContent>
                      <Typography variant="h6">{player.name}</Typography>
                      <Chip label={`#${player.rank}`} color="success" size="small" />
                      <Typography variant="body2" color="textSecondary">
                        {player.country}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {activeTab === 2 && (
        <>
          {results.wtaPlayers.length === 0 ? (
            <Typography>No WTA players found</Typography>
          ) : (
            <Grid container spacing={3}>
              {results.wtaPlayers.map((player) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={player.id}>
                  <Card onClick={() => handleItemClick('wta', player.id)} sx={{ cursor: 'pointer' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={player.image_url || '/default-player.jpg'}
                      alt={player.name}
                    />
                    <CardContent>
                      <Typography variant="h6">{player.name}</Typography>
                      <Chip label={`#${player.rank}`} color="secondary" size="small" />
                      <Typography variant="body2" color="textSecondary">
                        {player.country}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
};

export default SearchPage;