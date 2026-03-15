import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, CardMedia,
  Typography, Box, Button, Chip, IconButton,
  CircularProgress, useTheme, Fade, Grow,
  Paper, Skeleton
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { newsAPI } from '../services/api';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
  Visibility as ViewsIcon,
  CalendarToday as CalendarIcon,
  Person as AuthorIcon,
  ArrowForward as ArrowIcon,
  TrendingUp as TrendingIcon,
  Whatshot as HotIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import Modal from '@mui/material/Modal';
const News = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [news, setNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const [allNewsResponse, featuredResponse] = await Promise.all([
        newsAPI.getAll(),
        newsAPI.getFeatured()
      ]);
      setNews(allNewsResponse.data);
      setFeaturedNews(featuredResponse.data);
      
      // Extract unique categories
      const uniqueCategories = ['all', ...new Set(allNewsResponse.data.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsClick = async (newsItem) => {
    setSelectedNews(newsItem);
    setModalOpen(true);
    try {
      await newsAPI.incrementViews(newsItem.id);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const filteredNews = filter === 'all' 
    ? news 
    : news.filter(item => item.category === filter);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: true,
    fade: true,
    cssEase: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)'
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Breaking': '#ef4444',
      'ATP': '#16a34a',
      'WTA': '#2563eb',
      'Tournament': '#7c3aed',
      'Injury': '#dc2626',
      'Transfer': '#f59e0b'
    };
    return colors[category] || theme.palette.primary.main;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ my: 6 }}>
          {/* Hero Section Skeleton */}
          <Box sx={{ mb: 6 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4, mb: 2 }} />
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" />
          </Box>
          
          {/* Categories Skeleton */}
          <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
            {[1,2,3,4,5].map(item => (
              <Skeleton key={item} variant="rectangular" width={100} height={32} sx={{ borderRadius: 20 }} />
            ))}
          </Box>
          
          {/* Grid Skeleton */}
          <Grid container spacing={3}>
            {[1,2,3,4,5,6].map(item => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 6 }}>
        {featuredNews.length > 0 && (
          <Grow in={true} timeout={1000}>
            <Box sx={{ mb: 8 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HotIcon sx={{ color: '#ef4444', fontSize: 28 }} />
                  <Typography variant="h4" fontWeight={700}>
                    Featured News
                  </Typography>
                </Box>
                <Chip 
                  icon={<TrendingIcon />} 
                  label="Trending" 
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              
              <Slider {...sliderSettings}>
                {featuredNews.map((item) => (
                  <div key={item.id}>
                    <Card 
                      sx={{ 
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-10px)',
                          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                          '& .hover-overlay': {
                            opacity: 1
                          }
                        }
                      }}
                      onClick={() => handleNewsClick(item)}
                    >
                      {/* Hover Overlay */}
                      <Box 
                        className="hover-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(135deg, rgba(102,126,234,0.9) 0%, rgba(118,75,162,0.9) 100%)',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2
                        }}
                      >
                        <Button 
                          variant="contained" 
                          sx={{ 
                            bgcolor: 'white',
                            color: '#764ba2',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            '&:hover': {
                              bgcolor: '#f8fafc',
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          Read Full Story
                        </Button>
                      </Box>
                      
                      <CardMedia
                        component="img"
                        height="500"
                        image={item.image_url || 'https://source.unsplash.com/random/1200x600/?tennis'}
                        alt={item.title}
                        sx={{ 
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                      
                      {/* Gradient Overlay */}
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '60%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                        zIndex: 1
                      }} />
                      
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 4,
                        zIndex: 2,
                        color: 'white'
                      }}>
                        <Chip 
                          label={item.category}
                          sx={{ 
                            bgcolor: getCategoryColor(item.category),
                            color: 'white',
                            fontWeight: 600,
                            mb: 2
                          }}
                        />
                        <Typography variant="h3" sx={{ 
                          fontWeight: 800,
                          mb: 2,
                          fontSize: { xs: '1.8rem', md: '2.5rem' }
                        }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          opacity: 0.9,
                          mb: 3,
                          fontSize: '1.1rem'
                        }}>
                          {item.summary}
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 3,
                          opacity: 0.8
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AuthorIcon fontSize="small" />
                            <Typography variant="body2">{item.author}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarIcon fontSize="small" />
                            <Typography variant="body2">{formatDate(item.published_date)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ViewsIcon fontSize="small" />
                            <Typography variant="body2">{item.views || 0} views</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  </div>
                ))}
              </Slider>
            </Box>
          </Grow>
        )}

        {/* Categories Filter */}
        <Fade in={true} timeout={1200}>
          <Box sx={{ mb: 6 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 3
            }}>
              <FilterIcon />
              <Typography variant="h5" fontWeight={600}>
                Browse by Category
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              flexWrap: 'wrap',
              '& .MuiChip-root': {
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }
            }}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => setFilter(category)}
                  sx={{
                    bgcolor: filter === category 
                      ? getCategoryColor(category)
                      : theme.palette.mode === 'dark' 
                        ? '#2d3748' 
                        : '#f1f5f9',
                    color: filter === category ? 'white' : 'inherit',
                    fontWeight: 600,
                    px: 2,
                    py: 2,
                    fontSize: '0.9rem',
                    borderRadius: 20,
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Box>
          </Box>
        </Fade>

        {/* All News Grid */}
        <Fade in={true} timeout={1400}>
          <Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 4
            }}>
              <Typography variant="h4" fontWeight={700}>
                Latest News
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredNews.length} articles found
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {filteredNews.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Grow in={true} timeout={(index + 1) * 200}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: theme.palette.mode === 'dark' 
                          ? '1px solid rgba(255, 255, 255, 0.1)' 
                          : '1px solid rgba(0, 0, 0, 0.08)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                          borderColor: getCategoryColor(item.category),
                          '& .read-more': {
                            opacity: 1,
                            transform: 'translateX(0)'
                          }
                        }
                      }}
                      onClick={() => handleNewsClick(item)}
                    >
                      {/* Category Tag */}
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 16, 
                        left: 16, 
                        zIndex: 2 
                      }}>
                        <Chip 
                          label={item.category}
                          size="small"
                          sx={{ 
                            bgcolor: getCategoryColor(item.category),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                      
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.image_url || 'https://source.unsplash.com/random/400x200/?tennis,sport'}
                        alt={item.title}
                        sx={{ 
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }}
                      />
                      
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Typography 
                          variant="h6" 
                          gutterBottom
                          sx={{ 
                            fontWeight: 700,
                            lineHeight: 1.4,
                            mb: 2,
                            minHeight: 56
                          }}
                        >
                          {item.title}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          paragraph
                          sx={{ 
                            flexGrow: 1,
                            lineHeight: 1.6,
                            mb: 2
                          }}
                        >
                          {item.summary.length > 120 
                            ? `${item.summary.substring(0, 120)}...` 
                            : item.summary}
                        </Typography>
                        
                        {/* Stats Row */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mt: 'auto',
                          pt: 2,
                          borderTop: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(item.published_date)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ViewsIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {item.views || 0}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box 
                            className="read-more"
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              opacity: 0,
                              transform: 'translateX(-10px)',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Typography variant="caption" fontWeight={600} color="primary">
                              Read More
                            </Typography>
                            <ArrowIcon sx={{ fontSize: 16 }} />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
            
            {filteredNews.length === 0 && (
              <Paper sx={{ 
                p: 8, 
                textAlign: 'center',
                borderRadius: 3,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(30,30,30,0.8) 0%, rgba(30,30,30,0.6) 100%)'
                  : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
              }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                  No articles found in this category
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Try selecting a different category or check back later for new content
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => setFilter('all')}
                  sx={{ 
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                >
                  View All Articles
                </Button>
              </Paper>
            )}
          </Box>
        </Fade>

        {/* Load More Button */}
        {filteredNews.length > 0 && (
          <Fade in={true} timeout={1600}>
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <Button
                variant="outlined"
                sx={{
                  px: 6,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: '1rem',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={fetchNews}
              >
                Load More Articles
              </Button>
            </Box>
          </Fade>
        )}
      </Box>

      {/* News Detail Modal - Modernized */}
      {selectedNews && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Fade in={modalOpen}>
            <Paper
              sx={{
                width: '90%',
                maxWidth: 900,
                maxHeight: '90vh',
                overflow: 'auto',
                borderRadius: 4,
                position: 'relative',
                background: theme.palette.background.paper,
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
              }}
            >
              {/* Close Button */}
              <IconButton
                onClick={() => setModalOpen(false)}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  zIndex: 10,
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                ×
              </IconButton>
              
              {/* Hero Image */}
              <Box sx={{ position: 'relative' }}>
                <img
                  src={selectedNews.image_url || 'https://source.unsplash.com/random/1200x600/?tennis,match'}
                  alt={selectedNews.title}
                  style={{
                    width: '100%',
                    height: 400,
                    objectFit: 'cover',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16
                  }}
                />
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
                }} />
              </Box>
              
              <Box sx={{ p: { xs: 3, md: 6 } }}>
                {/* Article Header */}
                <Box sx={{ mb: 4 }}>
                  <Chip 
                    label={selectedNews.category}
                    sx={{ 
                      bgcolor: getCategoryColor(selectedNews.category),
                      color: 'white',
                      fontWeight: 600,
                      mb: 3
                    }}
                  />
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800,
                    mb: 3,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    lineHeight: 1.3
                  }}>
                    {selectedNews.title}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 4,
                    flexWrap: 'wrap',
                    mb: 4,
                    pb: 3,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AuthorIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="body1" fontWeight={500}>
                        {selectedNews.author}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="body1">
                        {new Date(selectedNews.published_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ViewsIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="body1">
                        {selectedNews.views || 0} views
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                {/* Article Content */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-line',
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                    '& p': {
                      mb: 3
                    }
                  }}
                >
                  {selectedNews.content}
                </Typography>
                
                {/* Action Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mt: 6,
                  pt: 4,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Button
                    variant="contained"
                    onClick={() => setModalOpen(false)}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    Close Article
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Fade>
        </Modal>
      )}
    </Container>
  );
};

export default News;