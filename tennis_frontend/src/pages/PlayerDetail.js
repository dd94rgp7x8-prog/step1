import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, CardMedia,
  Typography, Box, Chip, Table, TableBody,
  TableCell, TableContainer, TableRow, Paper,
  Divider, Stack, Avatar, LinearProgress,
  Tabs, Tab, Tooltip, Fade, Grow,
  CircularProgress, IconButton
} from '@mui/material';
import {
  Flag as FlagIcon,
  EmojiEvents as TrophyIcon,
  Person as CoachIcon,
  TrendingUp as TrendIcon,
  SportsTennis as TennisIcon,
  CalendarToday as CalendarIcon,
  Height as HeightIcon,
  FitnessCenter as WeightIcon,
  AttachMoney as MoneyIcon,
  Timeline as StatsIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  MilitaryTech as AchievementIcon,
  Favorite as FavoriteIcon,
  Warning as WarningIcon,
  Public as SurfaceIcon,
  Star,
  Share,
  Download
} from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import SportsTennis from '@mui/icons-material/SportsTennis';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { playersAPI } from '../services/api';

const PlayerDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    fetchPlayer();
  }, [id]);

  const fetchPlayer = async () => {
    try {
      const response = await playersAPI.getById(id);
      const playerData = response.data;
      setPlayer(playerData);
      
      const totalMatches = playerData.wins + playerData.losses;
      const winRate = totalMatches > 0 
        ? ((playerData.wins / totalMatches) * 100).toFixed(1)
        : 0;
      
      const totalSurfaceWins = (playerData.hard_wins || 0) + (playerData.clay_wins || 0) + (playerData.grass_wins || 0);
      const surfaceStats = {
        hard: totalSurfaceWins > 0 ? ((playerData.hard_wins || 0) / totalSurfaceWins * 100).toFixed(1) : 0,
        clay: totalSurfaceWins > 0 ? ((playerData.clay_wins || 0) / totalSurfaceWins * 100).toFixed(1) : 0,
        grass: totalSurfaceWins > 0 ? ((playerData.grass_wins || 0) / totalSurfaceWins * 100).toFixed(1) : 0
      };
      
      setStats({
        winRate,
        totalMatches,
        form: calculateRecentForm(playerData.recent_matches),
        averagePointsPerTournament: playerData.tournaments_played > 0
          ? Math.round(playerData.points / playerData.tournaments_played)
          : 0,
        surfaceStats,
        totalSurfaceWins
      });
    } catch (error) {
      console.error('Error fetching player:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRecentForm = (recentMatches) => {
    if (!recentMatches || recentMatches.length === 0) return 'N/A';
    
    const last5 = recentMatches.slice(0, 5);
    const wins = last5.filter(match => match.result === 'win').length;
    const losses = last5.filter(match => match.result === 'loss').length;
    
    return `${wins}W-${losses}L`;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatMoney = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '70vh' 
        }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="primary">
            {t('loading_player_details')}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!player) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ 
          textAlign: 'center', 
          py: 10,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          color: 'white'
        }}>
          <Typography variant="h3" gutterBottom>
            🎾
          </Typography>
          <Typography variant="h5">
            {t('player_not_found')}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        {/* Hero Section */}
        <Grow in={true} timeout={800}>
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 4, 
              p: 4, 
              background: player.gender === 'ATP' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              position: 'absolute', 
              right: 0, 
              top: 0, 
              bottom: 0, 
              width: '40%',
              background: 'rgba(255,255,255,0.1)',
              clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)'
            }} />
            
            <Grid container alignItems="center" spacing={3}>
              <Grid item>
                <Avatar
                  src={player.image_url}
                  alt={player.name}
                  sx={{ 
                    width: 150, 
                    height: 150, 
                    border: 4, 
                    borderColor: 'white',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}
                />
              </Grid>
              <Grid item xs>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Typography variant="h2" fontWeight="bold">
                    {player.name}
                  </Typography>
                  <Chip
                    label={`#${player.rank}`}
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}
                  />
                </Stack>
                
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
                  <Chip
                    icon={<FlagIcon />}
                    label={player.country}
                    sx={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip
                    icon={<TrophyIcon />}
                    label={`${stats?.winRate || 0}% Win Rate`}
                    sx={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  {player.age && (
                    <Chip
                      label={`${player.age} years`}
                      sx={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grow>

        {/* Stats Bar */}
        <Fade in={true} timeout={1000}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              { label: 'Points', value: player.points?.toLocaleString(), color: 'primary.main' },
              { label: 'Wins', value: player.wins, color: 'success.main' },
              { label: 'Losses', value: player.losses, color: 'error.main' },
              { label: 'Tournaments', value: player.tournaments_played || 0, color: 'warning.main' },
              { label: 'Prize Money', value: formatMoney(player.career_prize_money), color: 'info.main' },
            ].map((stat, index) => (
              <Grid item xs key={index}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }
                }}>
                  <Typography variant="h4" fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Fade>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={4}>
            <Grow in={true} timeout={1200}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                {/* Player Image with Loading */}
                <Box sx={{ position: 'relative' }}>
                  {imageLoading && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'background.paper'
                    }}>
                      <CircularProgress />
                    </Box>
                  )}
                  <CardMedia
                    component="img"
                    height="350"
                    image={player.image_url || '/default-player.jpg'}
                    alt={player.name}
                    sx={{ 
                      objectFit: 'cover',
                      filter: imageLoading ? 'blur(20px)' : 'none',
                      transition: 'filter 0.3s ease'
                    }}
                    onLoad={() => setImageLoading(false)}
                  />
                </Box>
                
                <CardContent>
                  {/* Quick Stats */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'primary.main'
                    }}>
                      <TrendIcon sx={{ mr: 1 }} />
                      {t('quick_stats')}
                    </Typography>
                    
                    {[
                      { label: t('rank'), value: `#${player.rank}`, color: 'primary' },
                      { label: t('points'), value: player.points?.toLocaleString(), color: 'text.primary' },
                      { label: t('win_rate'), value: `${stats?.winRate}%`, color: 'success.main' },
                      { label: t('total_matches'), value: stats?.totalMatches, color: 'text.primary' },
                    ].map((item, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1,
                        borderBottom: index < 3 ? '1px solid' : 'none',
                        borderColor: 'divider'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color={item.color}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Player Info */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'primary.main'
                    }}>
                      <TennisIcon sx={{ mr: 1 }} />
                      {t('player_info')}
                    </Typography>
                    
                    <Stack spacing={2}>
                      {player.coach && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Coach
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {player.coach}
                          </Typography>
                        </Box>
                      )}
                      
                      {player.turned_pro && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Turned Pro
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {player.turned_pro}
                          </Typography>
                        </Box>
                      )}
                      
                      {player.plays && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Playing Style
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {player.plays}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={8}>
            <Grow in={true} timeout={1400}>
              <Card sx={{ borderRadius: 3 }}>
                {/* Animated Tabs */}
                <Box sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  px: 3
                }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      '& .MuiTab-root': {
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        minHeight: 60,
                      }
                    }}
                  >
                    <Tab icon={<TrendIcon />} label={t('overview')} />
                    <Tab icon={<StatsIcon />} label={t('statistics')} />
                    <Tab icon={<AchievementIcon />} label={t('achievements')} />
                    <Tab icon={<PsychologyIcon />} label={t('strengths_weaknesses')} />
                  </Tabs>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  {/* Tab Content */}
                  {tabValue === 0 && (
                    <Fade in={tabValue === 0} timeout={500}>
                      <div>
                        {/* Overview content */}
                        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                          {t('player_overview')}
                        </Typography>
                        
                        {/* Biography */}
                        {player.biography && (
                          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              {t('biography')}
                            </Typography>
                            <Typography variant="body1" paragraph>
                              {player.biography}
                            </Typography>
                          </Paper>
                        )}

                        {/* Career Highlights */}
                        {player.career_highlights && (
                          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                              <AchievementIcon sx={{ mr: 1 }} />
                              {t('career_highlights')}
                            </Typography>
                            <Typography variant="body1">
                              {player.career_highlights.split('; ').map((highlight, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <TrophyIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1rem' }} />
                                  {highlight}
                                </Box>
                              ))}
                            </Typography>
                          </Paper>
                        )}

                        {/* Match Statistics */}
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                                <SportsTennis sx={{ mr: 1 }} />
                                {t('match_statistics')}
                              </Typography>
                              <Table size="small">
                                <TableBody>
                                  <TableRow>
                                    <TableCell><Typography variant="body2">{t('wins')}:</Typography></TableCell>
                                    <TableCell align="right">
                                      <Typography variant="body2" fontWeight="bold" color="success.main">
                                        {player.wins}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell><Typography variant="body2">{t('losses')}:</Typography></TableCell>
                                    <TableCell align="right">
                                      <Typography variant="body2" fontWeight="bold" color="error.main">
                                        {player.losses}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell><Typography variant="body2">{t('win_rate')}:</Typography></TableCell>
                                    <TableCell align="right">
                                      <Typography variant="body2" fontWeight="bold">
                                        {stats.winRate}%
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell><Typography variant="body2">{t('tournaments_played')}:</Typography></TableCell>
                                    <TableCell align="right">
                                      <Typography variant="body2" fontWeight="bold">
                                        {player.tournaments_played || 0}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Paper>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                                <SurfaceIcon sx={{ mr: 1 }} />
                                {t('surface_preference')}
                              </Typography>
                              {stats.totalSurfaceWins > 0 ? (
                                <Stack spacing={1}>
                                  <Box>
                                    <Box display="flex" justifyContent="space-between">
                                      <Typography variant="body2">Hard:</Typography>
                                      <Typography variant="body2" fontWeight="bold">
                                        {player.hard_wins || 0} wins ({stats.surfaceStats.hard}%)
                                      </Typography>
                                    </Box>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={parseFloat(stats.surfaceStats.hard)} 
                                      sx={{ mt: 0.5, borderRadius: 5 }}
                                    />
                                  </Box>
                                  <Box>
                                    <Box display="flex" justifyContent="space-between">
                                      <Typography variant="body2">Clay:</Typography>
                                      <Typography variant="body2" fontWeight="bold">
                                        {player.clay_wins || 0} wins ({stats.surfaceStats.clay}%)
                                      </Typography>
                                    </Box>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={parseFloat(stats.surfaceStats.clay)} 
                                      sx={{ mt: 0.5, borderRadius: 5 }}
                                      color="warning"
                                    />
                                  </Box>
                                  <Box>
                                    <Box display="flex" justifyContent="space-between">
                                      <Typography variant="body2">Grass:</Typography>
                                      <Typography variant="body2" fontWeight="bold">
                                        {player.grass_wins || 0} wins ({stats.surfaceStats.grass}%)
                                      </Typography>
                                    </Box>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={parseFloat(stats.surfaceStats.grass)} 
                                      sx={{ mt: 0.5, borderRadius: 5 }}
                                      color="success"
                                    />
                                  </Box>
                                </Stack>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  {t('no_surface_data')}
                                </Typography>
                              )}
                            </Paper>
                          </Grid>
                        </Grid>
                      </div>
                    </Fade>
                  )}
                  
                  {tabValue === 1 && (
                    <Fade in={tabValue === 1} timeout={500}>
                      <div>
                        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                          <StatsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          {t('detailed_statistics')}
                        </Typography>

                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                {t('serve_statistics')}
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                  <Box textAlign="center">
                                    <Typography variant="h4" color="primary.main">
                                      {player.ace_count || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {t('total_aces')}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Box textAlign="center">
                                    <Typography variant="h4" color="error.main">
                                      {player.double_faults || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {t('double_faults')}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Box textAlign="center">
                                    <Typography variant="h4" color="success.main">
                                      {player.first_serve_percentage ? `${player.first_serve_percentage.toFixed(1)}%` : 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {t('first_serve_percentage')}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {t('tournament_statistics')}
                              </Typography>
                              <TableContainer>
                                <Table size="small">
                                  <TableBody>
                                    <TableRow>
                                      <TableCell><Typography variant="body2">{t('tournaments_played')}:</Typography></TableCell>
                                      <TableCell align="right">
                                        <Typography variant="body2" fontWeight="bold">
                                          {player.tournaments_played || 0}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell><Typography variant="body2">{t('average_points_per_tournament')}:</Typography></TableCell>
                                      <TableCell align="right">
                                        <Typography variant="body2" fontWeight="bold">
                                          {stats.averagePointsPerTournament}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell><Typography variant="body2">{t('break_points_saved')}:</Typography></TableCell>
                                      <TableCell align="right">
                                        <Typography variant="body2" fontWeight="bold">
                                          {player.break_points_saved ? `${player.break_points_saved.toFixed(1)}%` : 'N/A'}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Paper>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                <FitnessCenterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {t('physical_characteristics')}
                              </Typography>
                              <TableContainer>
                                <Table size="small">
                                  <TableBody>
                                    <TableRow>
                                      <TableCell><Typography variant="body2">{t('height')}:</Typography></TableCell>
                                      <TableCell align="right">
                                        <Typography variant="body2" fontWeight="bold">
                                          {player.height ? `${player.height} cm` : 'N/A'}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell><Typography variant="body2">{t('weight')}:</Typography></TableCell>
                                      <TableCell align="right">
                                        <Typography variant="body2" fontWeight="bold">
                                          {player.weight ? `${player.weight} kg` : 'N/A'}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell><Typography variant="body2">{t('playing_style')}:</Typography></TableCell>
                                      <TableCell align="right">
                                        <Typography variant="body2" fontWeight="bold">
                                          {player.plays || 'N/A'}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell><Typography variant="body2">{t('years_pro')}:</Typography></TableCell>
                                      <TableCell align="right">
                                        <Typography variant="body2" fontWeight="bold">
                                          {player.turned_pro ? `${player.age - player.turned_pro} years` : 'N/A'}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Paper>
                          </Grid>
                        </Grid>
                      </div>
                    </Fade>
                  )}

                  {tabValue === 2 && (
                    <Fade in={tabValue === 2} timeout={500}>
                      <div>
                        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                          <AchievementIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          {t('career_achievements')}
                        </Typography>

                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                <TrophyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {t('title_wins')}
                              </Typography>
                              <Stack spacing={2}>
                                <Box>
                                  <Typography variant="body1" fontWeight="bold" color="primary.main">
                                    Grand Slam Titles
                                  </Typography>
                                  <Typography variant="h3" textAlign="center" color="primary.main">
                                    {player.grand_slam_titles || 0}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="body1" fontWeight="bold" color="secondary.main">
                                    Masters/WTA 1000 Titles
                                  </Typography>
                                  <Typography variant="h3" textAlign="center" color="secondary.main">
                                    {player.masters_titles || 0}
                                  </Typography>
                                </Box>
                                {player.gender === 'ATP' && (
                                  <Box>
                                    <Typography variant="body1" fontWeight="bold" color="warning.main">
                                      ATP Finals Titles
                                    </Typography>
                                    <Typography variant="h3" textAlign="center" color="warning.main">
                                      {player.atp_finals_titles || 0}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </Paper>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                <TrendIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {t('records')}
                              </Typography>
                              <TableContainer>
                                <Table size="small">
                                  <TableBody>
                                    <TableRow>
                                      <TableCell><Typography variant="body2">{t('best_ranking')}:</Typography></TableCell>
                                      <TableCell align="right">
                                        <Chip 
                                          label={`#${player.best_ranking || player.rank}`} 
                                          size="small" 
                                          color="primary" 
                                        />
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell><Typography variant="body2">{t('weeks_at_no1')}:</Typography></TableCell>
                                      <TableCell align="right">
                                        <Typography variant="body2" fontWeight="bold" color="warning.main">
                                          {player.weeks_at_no1 || 0}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell><Typography variant="body2">{t('career_prize_money')}:</Typography></TableCell>
                                      <TableCell align="right">
                                        <Typography variant="body2" fontWeight="bold" color="success.main">
                                          {formatMoney(player.career_prize_money)}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Paper>
                          </Grid>

                          {player.career_highlights && (
                            <Grid item xs={12}>
                              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                  {t('career_highlights')}
                                </Typography>
                                <Box sx={{ pl: 2 }}>
                                  {player.career_highlights.split('; ').map((highlight, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                      <TrophyIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '1rem', mt: 0.25 }} />
                                      <Typography variant="body1">{highlight}</Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </Paper>
                            </Grid>
                          )}
                        </Grid>
                      </div>
                    </Fade>
                  )}

                  {tabValue === 3 && (
                    <Fade in={tabValue === 3} timeout={500}>
                      <div>
                        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                          <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          {t('player_analysis')}
                        </Typography>

                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                                <FavoriteIcon sx={{ mr: 1, color: 'success.main' }} />
                                {t('strengths')}
                              </Typography>
                              {player.strengths ? (
                                <Stack spacing={1}>
                                  {player.strengths.split(', ').map((strength, index) => (
                                    <Chip 
                                      key={index}
                                      label={strength}
                                      color="success"
                                      variant="outlined"
                                      sx={{ mr: 1, mb: 1 }}
                                      icon={<TrendIcon />}
                                    />
                                  ))}
                                </Stack>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  {t('no_strengths_data')}
                                </Typography>
                              )}
                            </Paper>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                                <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
                                {t('weaknesses')}
                              </Typography>
                              {player.weaknesses ? (
                                <Stack spacing={1}>
                                  {player.weaknesses.split(', ').map((weakness, index) => (
                                    <Chip 
                                      key={index}
                                      label={weakness}
                                      color="error"
                                      variant="outlined"
                                      sx={{ mr: 1, mb: 1 }}
                                      icon={<WarningIcon />}
                                    />
                                  ))}
                                </Stack>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  {t('no_weaknesses_data')}
                                </Typography>
                              )}
                            </Paper>
                          </Grid>

                          <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {t('playing_style_analysis')}
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                  <Box textAlign="center" sx={{ p: 2 }}>
                                    <TennisIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                    <Typography variant="h6">{t('surface_preference')}</Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      {player.surface_preference || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Box textAlign="center" sx={{ p: 2 }}>
                                    <HeightIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                                    <Typography variant="h6">{t('serve_power')}</Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      {player.ace_count > 1000 ? 'Very Strong' : 
                                       player.ace_count > 500 ? 'Strong' : 
                                       player.ace_count > 200 ? 'Average' : 'Developing'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Box textAlign="center" sx={{ p: 2 }}>
                                    <TrendIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                    <Typography variant="h6">{t('consistency')}</Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      {parseFloat(stats.winRate) > 70 ? 'Excellent' : 
                                       parseFloat(stats.winRate) > 60 ? 'Good' : 
                                       parseFloat(stats.winRate) > 50 ? 'Average' : 'Developing'}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Grid>
                        </Grid>
                      </div>
                    </Fade>
                  )}
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PlayerDetail;