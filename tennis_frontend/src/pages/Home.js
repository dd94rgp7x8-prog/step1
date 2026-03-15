import React, { useEffect, useState } from 'react';
import {
  Container, Grid, Typography, Box,
  Card, CardContent, CardMedia, Chip, useTheme
} from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Avatar from '@mui/material/Avatar';

const liveMatches = [
  {
    tour: 'ATP',
    p1: { name: 'C. Alcaraz', flag: 'https://flagcdn.com/w20/es.png' },
    p2: { name: 'J. Sinner', flag: 'https://flagcdn.com/w20/it.png' },
    score: '6-4, 3-6, 5-4',
  },
  {
    tour: 'WTA',
    p1: { name: 'I. Swiatek', flag: 'https://flagcdn.com/w20/pl.png' },
    p2: { name: 'A. Sabalenka', flag: 'https://flagcdn.com/w20/by.png' },
    score: '7-6, 4-3',
  },
  {
    tour: 'ATP',
    p1: { name: 'D. Medvedev', flag: 'https://flagcdn.com/w20/ru.png' },
    p2: { name: 'S. Tsitsipas', flag: 'https://flagcdn.com/w20/gr.png' },
    score: '6-3, 6-4',
  },
  {
    tour: 'WTA',
    p1: { name: 'C. Gauff', flag: 'https://flagcdn.com/w20/us.png' },
    p2: { name: 'E. Rybakina', flag: 'https://flagcdn.com/w20/kz.png' },
    score: '4-6, 6-3, 3-2',
  },
];

const Home = () => {
  const theme = useTheme();
  const [news, setNews] = useState([]);

  useEffect(() => {
    setNews([
      {
        id: 1,
        title: 'Djokovic Claims Historic 25th Grand Slam Title',
        summary:
          'In an epic five-set battle, Novak Djokovic secured his 25th Grand Slam title, cementing his legacy as one of the greatest players of all time.',
        image:
          'https://mntimes.me/wp-content/uploads/2025/11/photo_2025-11-07_16-24-42.jpg',
        tag: 'Breaking',
      },
      {
        id: 2,
        title: 'Alcaraz Advances to Semifinals',
        summary: 'Carlos Alcaraz dominates in straight sets.',
        tour: 'ATP',
      },
      {
        id: 3,
        title: 'Swiatek Breaks Serving Record',
        summary: 'Iga Swiatek sets new tournament record.',
        tour: 'WTA',
      },
      {
        id: 4,
        title: 'Wimbledon Announces New Courts',
        summary: 'All England Club unveils new facilities.',
        tour: 'Tournament',
      },
    ]);
  }, []);

  // Определяем цвета в зависимости от темы
  const getColors = () => {
    if (theme.palette.mode === 'dark') {
      return {
        background: '#121212',
        card: '#1e1e1e',
        textPrimary: '#ffffff',
        textSecondary: '#b0b0b0',
        liveBackground: '#2a2a2a',
        atp: '#4ade80',   // светлый зеленый для темной темы
        wta: '#60a5fa',   // светлый синий для темной темы
        live: '#f87171',  // светлый красный для темной темы
        breaking: '#ef4444',
        readMore: '#22c55e',
      };
    }
    return {
      background: '#f8fafc',
      card: '#ffffff',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      liveBackground: '#0f172a',
      atp: '#16a34a',   // зеленый ATP
      wta: '#2563eb',   // синий WTA
      live: '#dc2626',  // красный LIVE
      breaking: '#dc2626',
      readMore: '#16a34a',
    };
  };

  const colors = getColors();

  return (
    <Box sx={{ 
      background: colors.background, 
      minHeight: '100vh', 
      py: 5,
      transition: 'background-color 0.3s ease'
    }}>
      <Container maxWidth="xl">
        {/* ===== TITLE ===== */}
        <Typography fontSize={24} fontWeight={700} color={colors.textPrimary}>
          Latest Tennis Stories
        </Typography>
        <Typography color={colors.textSecondary} mb={4}>
          Breaking news and updates from ATP and WTA tours
        </Typography>

        {/* ===== NEWS GRID ===== */}
        <Grid container spacing={3}>
          {/* FEATURED */}
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              display: 'flex', 
              borderRadius: 3,
              backgroundColor: colors.card,
              boxShadow: theme.shadows[2]
            }}>
              <CardMedia
                component="img"
                image={news[0]?.image}
                sx={{ width: 360 }}
              />
              <CardContent>
                <Chip
                  label="Breaking"
                  sx={{
                    bgcolor: colors.breaking,
                    color: '#fff',
                    mb: 1,
                    fontWeight: 600,
                  }}
                />
                <Typography fontSize={20} fontWeight={700} color={colors.textPrimary}>
                  {news[0]?.title}
                </Typography>
                <Typography color={colors.textSecondary} mt={1}>
                  {news[0]?.summary}
                </Typography>

                <Typography
                  mt={2}
                  fontWeight={600}
                  color={colors.readMore}
                  sx={{ cursor: 'pointer' }}
                >
                  Read More →
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" gap={2}>
              {news.slice(1).map(item => (
                <Card key={item.id} sx={{ 
                  borderRadius: 3,
                  backgroundColor: colors.card,
                  boxShadow: theme.shadows[1]
                }}>
                  <CardContent>
                    <Chip
                      label={item.tour}
                      sx={{
                        bgcolor: item.tour === 'ATP'
                          ? colors.atp
                          : item.tour === 'WTA'
                          ? colors.wta
                          : colors.textPrimary,
                        color: '#fff',
                        mb: 1,
                        fontSize: 12,
                      }}
                    />
                    <Typography fontWeight={600} color={colors.textPrimary}>
                      {item.title}
                    </Typography>
                    <Typography color={colors.textSecondary} fontSize={14}>
                      {item.summary}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* ===== LIVE SCORES ===== */}
        <Box
          mt={6}
          sx={{
            background: colors.liveBackground,
            borderRadius: 4,
            p: 3,
            transition: 'background-color 0.3s ease'
          }}
        >
          {/* TITLE */}
          <Box display="flex" alignItems="center" mb={3}>
            <FiberManualRecordIcon
              sx={{ color: colors.live, fontSize: 10, mr: 1 }}
            />
            <Typography color="#fff" fontWeight={700}>
              Live Scores
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {liveMatches.map((m, i) => (
              <Grid item xs={12} md={3} key={i}>
                <Card
                  sx={{
                    borderRadius: 3,
                    backgroundColor: colors.card,
                    boxShadow: theme.shadows[1]
                  }}
                >
                  <CardContent>
                    {/* ATP / WTA + LIVE */}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Chip
                        label={m.tour}
                        size="small"
                        sx={{
                          bgcolor: m.tour === 'ATP' ? colors.atp : colors.wta,
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      />
                      <Box display="flex" alignItems="center">
                        <FiberManualRecordIcon
                          sx={{ color: colors.live, fontSize: 10, mr: 0.5 }}
                        />
                        <Typography fontSize={12} color={colors.live}>
                          LIVE
                        </Typography>
                      </Box>
                    </Box>

                    {/* PLAYER 1 */}
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        src={m.p1.flag}
                        sx={{ width: 20, height: 14, borderRadius: 0 }}
                        variant="square"
                      />
                      <Typography fontSize={14} color={colors.textPrimary}>
                        {m.p1.name}
                      </Typography>
                    </Box>

                    {/* PLAYER 2 */}
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Avatar
                        src={m.p2.flag}
                        sx={{ width: 20, height: 14, borderRadius: 0 }}
                        variant="square"
                      />
                      <Typography fontSize={14} color={colors.textPrimary}>
                        {m.p2.name}
                      </Typography>
                    </Box>

                    {/* SCORE */}
                    <Typography
                      mt={1}
                      fontWeight={700}
                      fontSize={14}
                      color={colors.textPrimary}
                    >
                      {m.score}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;