import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, CardMedia,
  Typography, Box, TextField, Chip, LinearProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { playersAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ATPPlayers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await playersAPI.getATP();
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching ATP players:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('atp')} {t('players')}
        </Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('search_atp_players')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
        />

        {loading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
            <Typography align="center" sx={{ mt: 2 }}>{t('loading')}</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredPlayers.map((player, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={player.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                  onClick={() => navigate(`/players/${player.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={player.image_url || '/default-player.jpg'}
                    alt={player.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {player.name}
                    </Typography>
                    <Chip
                      label={`#${player.rank}`}
                      color="primary"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      {t('country')}: {player.country}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('points')}: {player.points}
                    </Typography>
                    {index < 10 && (
                      <>
                        <Typography variant="body2" color="textSecondary">
                          {t('coach')}: {player.coach || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {t('wins')}: {player.wins} | {t('losses')}: {player.losses}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default ATPPlayers;