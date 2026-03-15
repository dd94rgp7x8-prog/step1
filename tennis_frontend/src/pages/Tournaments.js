import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, CardMedia,
  Typography, Box, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Paper, Tabs, Tab
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { tournamentsAPI } from '../services/api';

const Tournaments = () => {
  const { t } = useTranslation();
  const [tournaments, setTournaments] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await tournamentsAPI.getAll();
      setTournaments(response.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const upcomingTournaments = tournaments.filter(t => 
    new Date(t.start_date) > new Date()
  ).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  const pastTournaments = tournaments.filter(t => 
    new Date(t.end_date) < new Date()
  ).sort((a, b) => new Date(b.end_date) - new Date(a.end_date));

  const currentTournaments = tournaments.filter(t => {
    const now = new Date();
    const start = new Date(t.start_date);
    const end = new Date(t.end_date);
    return start <= now && end >= now;
  });

  const getTournamentsByTab = () => {
    switch(tabValue) {
      case 0: return upcomingTournaments;
      case 1: return currentTournaments;
      case 2: return pastTournaments;
      default: return [];
    }
  };

  const getSurfaceColor = (surface) => {
    switch(surface.toLowerCase()) {
      case 'hard': return 'primary';
      case 'clay': return 'error';
      case 'grass': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>{t('loading_tournaments')}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('tournaments')}
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label={t('upcoming')} />
          <Tab label={t('current')} />
          <Tab label={t('past')} />
        </Tabs>

        {getTournamentsByTab().length === 0 ? (
          <Typography>{t('no_data')}</Typography>
        ) : (
          <>
            {/* Tournament Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {getTournamentsByTab().slice(0, 6).map((tournament) => (
                <Grid item xs={12} sm={6} md={4} key={tournament.id}>
                  <Card sx={{ height: '100%' }}>
                    {tournament.image_url && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={tournament.image_url}
                        alt={tournament.name}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {tournament.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {tournament.location}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        <Chip
                          label={tournament.surface}
                          color={getSurfaceColor(tournament.surface)}
                          size="small"
                        />
                        <Chip
                          label={tournament.category}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2">
                        {t('dates')}: {new Date(tournament.start_date).toLocaleDateString()} - {' '}
                        {new Date(tournament.end_date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        {t('prize_money')}: ${parseInt(tournament.prize_money).toLocaleString()}
                      </Typography>
                      {tournament.winner && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {t('winner')}: {tournament.winner.name}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Tournament Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('tournaments')}</TableCell>
                    <TableCell>{t('location')}</TableCell>
                    <TableCell>{t('surface')}</TableCell>
                    <TableCell>{t('dates')}</TableCell>
                    <TableCell>{t('prize_money')}</TableCell>
                    <TableCell>{t('category')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getTournamentsByTab().map((tournament) => (
                    <TableRow key={tournament.id}>
                      <TableCell>{tournament.name}</TableCell>
                      <TableCell>{tournament.location}</TableCell>
                      <TableCell>
                        <Chip
                          label={tournament.surface}
                          color={getSurfaceColor(tournament.surface)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(tournament.start_date).toLocaleDateString()} - {' '}
                        {new Date(tournament.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        ${parseInt(tournament.prize_money).toLocaleString()}
                      </TableCell>
                      <TableCell>{tournament.category}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Tournaments;