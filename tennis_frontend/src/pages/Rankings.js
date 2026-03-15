import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
  alpha
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { playersAPI } from '../services/api';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

const Rankings = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [topPlayers, setTopPlayers] = useState({ atp_top: [], wta_top: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        setLoading(true);
        const response = await playersAPI.getTopPlayers();
        setTopPlayers(response.data);
      } catch (error) {
        console.error('Error fetching top players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlayers();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getTrendIcon = (rank) => {
    // Since we don't have rank_change in getTopPlayers response,
    // we can simulate or leave it out
    return <TrendingFlat color="action" />;
  };

  const currentPlayers = tabValue === 0 ? topPlayers.atp_top : topPlayers.wta_top;
  const tourName = tabValue === 0 ? 'ATP' : 'WTA';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          {t('world_rankings')}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {t('current_rankings_desc')}
        </Typography>
      </Box>

      {/* Tour Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label="ATP" 
                  size="small" 
                  sx={{ 
                    bgcolor: '#19bf56ff', 
                    color: 'white',
                    fontWeight: 600
                  }} 
                />
                <Typography>Men's Singles Top 10</Typography>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label="WTA" 
                  size="small" 
                  sx={{ 
                    bgcolor: '#2d69eaff', 
                    color: 'white',
                    fontWeight: 600
                  }} 
                />
                <Typography>Women's Singles Top 10</Typography>
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Rankings Table */}
          <TableContainer 
            component={Paper} 
            elevation={2}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              mb: 4
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#1976d2', 0.08) }}>
                  <TableCell width="60px" align="center">
                    <Typography fontWeight={600}>Rank</Typography>
                  </TableCell>
                  <TableCell width="80px"></TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>Player</Typography>
                  </TableCell>
                  <TableCell width="120px" align="center">
                    <Typography fontWeight={600}>Country</Typography>
                  </TableCell>
                  <TableCell width="120px" align="center">
                    <Typography fontWeight={600}>Points</Typography>
                  </TableCell>
                  <TableCell width="100px" align="center">
                    <Typography fontWeight={600}>Age</Typography>
                  </TableCell>
                  <TableCell width="120px" align="center">
                    <Typography fontWeight={600}>Trend</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentPlayers.map((player, index) => (
                  <TableRow 
                    key={player.id}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: alpha('#1976d2', 0.04) 
                      },
                      ...(index < 3 && {
                        bgcolor: alpha('#1976d2', 0.02),
                        borderLeft: `4px solid ${
                          index === 0 ? '#FFD700' : 
                          index === 1 ? '#C0C0C0' : 
                          '#CD7F32'
                        }`
                      })
                    }}
                  >
                    <TableCell align="center">
                      <Box sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: index < 3 ? 'primary.main' : 'grey.100',
                        color: index < 3 ? 'white' : 'text.primary',
                        fontWeight: 600
                      }}>
                        {player.rank || index + 1}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Avatar
                        src={player.image_url}
                        alt={player.name}
                        sx={{ width: 48, height: 48 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography fontWeight={600} variant="body1">
                          {player.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {player.height ? `${player.height} cm` : ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={player.country} 
                        size="small"
                        sx={{ 
                          bgcolor: alpha('#1976d2', 0.1),
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600}>
                        {player.points ? player.points.toLocaleString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography>{player.age || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      {getTrendIcon(player.rank)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Stats Summary */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {tourName} World No. 1
                  </Typography>
                  {currentPlayers[0] && (
                    <>
                      <Avatar
                        src={currentPlayers[0].image_url}
                        alt={currentPlayers[0].name}
                        sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                      />
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        {currentPlayers[0].name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentPlayers[0].points ? `${currentPlayers[0].points.toLocaleString()} points` : ''}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={currentPlayers[0].country} 
                          size="small"
                          sx={{ 
                            bgcolor: alpha('#1976d2', 0.1),
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Top 3 {tourName} Players
                  </Typography>
                  <Grid container spacing={2}>
                    {currentPlayers.slice(0, 3).map((player, index) => (
                      <Grid item xs={12} sm={4} key={player.id}>
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          bgcolor: alpha('#1976d2', 0.02)
                        }}>
                          <Box sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: index === 0 ? '#FFD700' : 
                                    index === 1 ? '#C0C0C0' : 
                                    '#CD7F32',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            mx: 'auto',
                            mb: 1
                          }}>
                            {index + 1}
                          </Box>
                          <Avatar
                            src={player.image_url}
                            alt={player.name}
                            sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }}
                          />
                          <Typography fontWeight={600}>
                            {player.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {player.points ? `${player.points.toLocaleString()} pts` : ''}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Showing top 10 {tourName} players based on ranking points.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Rankings;