import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Paper, TextField, Button,
  Box, Typography, List, ListItem,
  ListItemText, Avatar, CircularProgress,
  useTheme, Fade, Grow, Zoom,
  IconButton, Chip, Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { chatAPI } from '../services/api';
import Grid from '@mui/material/Grid';
import {
  SendRounded as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  AutoAwesome as SparkleIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Refresh as RefreshIcon,
  ExpandLess as CollapseIcon,
  ExpandMore as ExpandIcon,
  Lightbulb as TipIcon,
  Psychology as BrainIcon,
  SettingsSuggest as SettingsIcon
} from '@mui/icons-material';

const AIChat = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  const [suggestions] = useState([
    "Who are the top 5 ATP players right now?",
    "Tell me about the Wimbledon tournament",
    "Compare Novak Djokovic and Rafael Nadal",
    "Explain tennis scoring system",
    "What's the difference between ATP and WTA?"
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      setTyping(true);
      const response = await chatAPI.getHistory();
      const history = response.data.map(item => ({
        id: item.id,
        text: item.message,
        response: item.response,
        timestamp: new Date(item.created_at),
        isUser: true
      }));
      setMessages(history);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setMessages([{
        id: Date.now(),
        text: '',
        response: t('welcome_ai'),
        timestamp: new Date(),
        isUser: false
      }]);
    } finally {
      setTyping(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message;
    setMessage('');
    
    const userMsg = {
      id: Date.now(),
      text: userMessage,
      response: null,
      timestamp: new Date(),
      isUser: true
    };
    
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Add typing indicator
    const typingMsg = {
      id: Date.now() + 1,
      text: null,
      response: null,
      timestamp: new Date(),
      isUser: false,
      typing: true
    };
    setMessages(prev => [...prev, typingMsg]);

    try {
      const response = await chatAPI.sendMessage(userMessage);
      
      // Remove typing indicator and add response
      setMessages(prev => prev.filter(msg => !msg.typing));
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.isUser) {
          lastMsg.response = response.data.response;
          lastMsg.responseTime = new Date();
        }
        return newMessages;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].response = t('error_occurred');
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
  };

  const handleClearChat = () => {
    if (window.confirm(t('clear_chat_confirm'))) {
      setMessages([]);
    }
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleRateResponse = (messageId, rating) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, rating }
        : msg
    ));
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessageTimestamp = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderMessageContent = (msg) => {
    if (msg.typing) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2">AI is typing...</Typography>
        </Box>
      );
    }
    
    return (
      <Typography sx={{ 
        whiteSpace: 'pre-wrap',
        lineHeight: 1.6,
        fontSize: '0.95rem'
      }}>
        {msg.response || msg.text}
      </Typography>
    );
  };

  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Header with Animated Icon */}
        <Grow in={true} timeout={800}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            position: 'relative'
          }}>
            <Box sx={{
              position: 'absolute',
              top: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 120,
              height: 120,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              opacity: 0.1,
              filter: 'blur(40px)'
            }} />
            
            <Box sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              mb: 3,
              position: 'relative',
              animation: 'pulse 2s infinite'
            }}>
              <AIIcon sx={{ fontSize: 40, color: 'white' }} />
              <SparkleIcon sx={{ 
                position: 'absolute',
                top: -8,
                right: -8,
                fontSize: 24,
                color: '#FFD700',
                animation: 'spin 4s linear infinite'
              }} />
            </Box>
            
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Tennis AI Assistant
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                color: isDarkMode ? '#b0b0b0' : '#475569',
                maxWidth: 600,
                mx: 'auto',
                mb: 2
              }}
            >
              Your intelligent companion for tennis insights, analysis, and discussions
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 1,
              flexWrap: 'wrap'
            }}>
            </Box>
          </Box>
        </Grow>

        {/* Main Chat Container */}
        <Grow in={true} timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              height: '70vh',
              display: 'flex',
              flexDirection: 'column',
              mb: 4,
              overflow: 'hidden',
              borderRadius: 4,
              background: isDarkMode
                ? 'linear-gradient(135deg, rgba(30,30,30,0.8) 0%, rgba(30,30,30,0.6) 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: isDarkMode 
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
          >
            {/* Chat Header */}
            <Box sx={{ 
              p: 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: 'rgba(255,255,255,0.02)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 36,
                  height: 36
                }}>
                  <AIIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Tennis AI Assistant
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {typing ? 'Loading history...' : 'Online • Ready to assist'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Clear chat">
                  <IconButton 
                    size="small" 
                    onClick={handleClearChat}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { color: 'error.main' }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh history">
                  <IconButton 
                    size="small" 
                    onClick={fetchChatHistory}
                    disabled={typing}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Chat Messages Area */}
            <List
              sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 3,
                background: 'transparent',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: isDarkMode ? '#4a5568' : '#cbd5e1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: isDarkMode ? '#718096' : '#94a3b8',
                }
              }}
            >
              {messages.length === 0 && !typing && (
                <Fade in={true} timeout={800}>
                  <ListItem sx={{ justifyContent: 'center' }}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 8,
                        px: 4,
                        maxWidth: 500
                      }}
                    >
                      <AIIcon sx={{ 
                        fontSize: 60, 
                        mb: 3, 
                        opacity: 0.3,
                        color: 'primary.main'
                      }} />
                      <Typography variant="h5" gutterBottom>
                        {t('welcome_ai')}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Ask me anything about tennis! I can help with player stats, tournament info, rules, and analysis.
                      </Typography>
                      
                      {/* Quick Suggestions */}
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2,
                        alignItems: 'center'
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Try asking:
                        </Typography>
                        {suggestions.slice(0, 3).map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outlined"
                            size="small"
                            onClick={() => handleSuggestionClick(suggestion)}
                            sx={{
                              borderRadius: 3,
                              textTransform: 'none',
                              fontWeight: 400,
                              borderColor: 'divider',
                              '&:hover': {
                                borderColor: 'primary.main',
                                backgroundColor: 'primary.light',
                                color: 'primary.main'
                              }
                            }}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  </ListItem>
                </Fade>
              )}

              {messages.map((msg, index) => (
                <React.Fragment key={msg.id || index}>
                  {/* User Message */}
                  {msg.text && (
                    <Fade in={true} timeout={300}>
                      <ListItem sx={{ 
                        justifyContent: 'flex-end', 
                        mb: 2,
                        animation: 'slideInRight 0.3s ease'
                      }}>
                        <Box
                          sx={{
                            maxWidth: { xs: '85%', md: '70%' },
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            p: 2.5,
                            borderRadius: 3,
                            borderTopRightRadius: 8,
                            position: 'relative',
                            boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)',
                            '&:before': {
                              content: '""',
                              position: 'absolute',
                              right: -8,
                              top: 0,
                              width: 0,
                              height: 0,
                              borderLeft: '8px solid',
                              borderLeftColor: '#764ba2',
                              borderTop: '8px solid transparent',
                              borderBottom: '8px solid transparent',
                            }
                          }}
                        >
                          <Typography sx={{ 
                            fontWeight: 500,
                            mb: 1
                          }}>
                            {msg.text}
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 2
                          }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                opacity: 0.8,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              {formatTime(msg.timestamp)}
                            </Typography>
                          </Box>
                        </Box>
                        <Avatar 
                          sx={{ 
                            ml: 2,
                            width: 36,
                            height: 36,
                            bgcolor: 'primary.dark',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        >
                          <PersonIcon />
                        </Avatar>
                      </ListItem>
                    </Fade>
                  )}

                  {/* AI Response */}
                  {(msg.response || msg.typing) && (
                    <Fade in={true} timeout={500}>
                      <ListItem sx={{ mb: 3 }}>
                        <Avatar 
                          sx={{ 
                            mr: 2,
                            width: 36,
                            height: 36,
                            bgcolor: isDarkMode ? '#2d3748' : '#e2e8f0',
                            color: isDarkMode ? '#a0aec0' : '#4a5568',
                            border: '2px solid',
                            borderColor: isDarkMode ? '#4a5568' : '#cbd5e1'
                          }}
                        >
                          {msg.typing ? (
                            <CircularProgress size={20} />
                          ) : (
                            <AIIcon />
                          )}
                        </Avatar>
                        <Box
                          sx={{
                            maxWidth: { xs: '85%', md: '70%' },
                            background: isDarkMode 
                              ? 'linear-gradient(135deg, rgba(45,55,72,0.8) 0%, rgba(45,55,72,0.6) 100%)'
                              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            color: isDarkMode ? '#e2e8f0' : '#2d3748',
                            p: 2.5,
                            borderRadius: 3,
                            borderTopLeftRadius: 8,
                            border: '1px solid',
                            borderColor: isDarkMode ? '#4a5568' : '#e2e8f0',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                            position: 'relative',
                            '&:before': {
                              content: '""',
                              position: 'absolute',
                              left: -8,
                              top: 0,
                              width: 0,
                              height: 0,
                              borderRight: '8px solid',
                              borderRightColor: isDarkMode ? '#2d3748' : '#f8fafc',
                              borderTop: '8px solid transparent',
                              borderBottom: '8px solid transparent',
                            }
                          }}
                        >
                          {renderMessageContent(msg)}
                          
                          {msg.response && !msg.typing && (
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mt: 2,
                              pt: 2,
                              borderTop: '1px solid',
                              borderColor: isDarkMode ? '#4a5568' : '#e2e8f0'
                            }}>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Copy response">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleCopyMessage(msg.response)}
                                    sx={{ 
                                      color: 'text.secondary',
                                      '&:hover': { color: 'primary.main' }
                                    }}
                                  >
                                    <CopyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Helpful response">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleRateResponse(msg.id, 'up')}
                                    sx={{ 
                                      color: msg.rating === 'up' ? 'success.main' : 'text.secondary',
                                      '&:hover': { color: 'success.main' }
                                    }}
                                  >
                                    <ThumbUpIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Not helpful">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleRateResponse(msg.id, 'down')}
                                    sx={{ 
                                      color: msg.rating === 'down' ? 'error.main' : 'text.secondary',
                                      '&:hover': { color: 'error.main' }
                                    }}
                                  >
                                    <ThumbDownIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                              
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  opacity: 0.7,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}
                              >
                                {formatMessageTimestamp(msg.timestamp)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </ListItem>
                    </Fade>
                  )}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </List>

            {/* Input Area */}
            <Box sx={{ 
              p: 3, 
              borderTop: '1px solid',
              borderColor: 'divider',
              background: 'rgba(255,255,255,0.02)'
            }}>
              {/* Quick Suggestions */}
              {messages.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    <TipIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                    Quick suggestions:
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    flexWrap: 'wrap',
                    '& .MuiChip-root': {
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)'
                      }
                    }
                  }}>
                    {suggestions.map((suggestion, index) => (
                      <Chip
                        key={index}
                        label={suggestion}
                        size="small"
                        onClick={() => handleSuggestionClick(suggestion)}
                        sx={{
                          cursor: 'pointer',
                          fontWeight: 400,
                          fontSize: '0.8rem',
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'primary.main'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                alignItems: 'flex-end'
              }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything about tennis..."
                  disabled={loading}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDarkMode 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: isDarkMode 
                          ? 'rgba(255, 255, 255, 0.08)' 
                          : 'rgba(0, 0, 0, 0.04)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: isDarkMode 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.06)',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      color: isDarkMode ? '#e2e8f0' : '#2d3748',
                      fontSize: '0.95rem',
                      paddingTop: '12px',
                      paddingBottom: '12px'
                    },
                    '& .MuiInputLabel-root': {
                      color: isDarkMode ? '#a0aec0' : '#718096',
                    }
                  }}
                />
                
                <Zoom in={message.trim().length > 0}>
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={loading || !message.trim()}
                    sx={{
                      minWidth: 56,
                      height: 56,
                      borderRadius: '50%',
                      p: 0,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 5px 20px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.6)',
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      },
                      '&:disabled': {
                        background: isDarkMode
                          ? 'linear-gradient(135deg, #555 0%, #333 100%)'
                          : 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <SendIcon sx={{ fontSize: 24 }} />
                    )}
                  </Button>
                </Zoom>
              </Box>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  textAlign: 'center',
                  mt: 2,
                  color: isDarkMode ? '#a0aec0' : '#718096',
                  opacity: 0.8
                }}
              >
                Press Enter to send • Shift+Enter for new line
              </Typography>
            </Box>
          </Paper>
        </Grow>

        {/* Info Section */}
        <Fade in={true} timeout={1400}>
          <Paper
            sx={{ 
              p: 4, 
              borderRadius: 4,
              background: isDarkMode
                ? 'linear-gradient(135deg, rgba(30,30,30,0.8) 0%, rgba(30,30,30,0.6) 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: isDarkMode 
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <SparkleIcon sx={{ 
                    fontSize: 40, 
                    color: 'primary.main',
                    mb: 2
                  }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Intelligent Responses
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Powered by advanced AI with up-to-date tennis knowledge and real-time data processing
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <HistoryIcon sx={{ 
                    fontSize: 40, 
                    color: 'secondary.main',
                    mb: 2
                  }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Conversation Memory
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Remembers your previous questions and maintains context throughout our conversation
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <SettingsIcon sx={{ 
                    fontSize: 40, 
                    color: 'info.main',
                    mb: 2
                  }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Multiple Languages
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available in English, Russian, and Kazakh with automatic language detection
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ 
              mt: 4, 
              pt: 3, 
              borderTop: '1px solid',
              borderColor: 'divider',
              textAlign: 'center'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isDarkMode ? '#a0aec0' : '#718096',
                  mb: 1
                }}
              >
                <strong>Note:</strong> AI responses may contain inaccuracies. Verify important information with official sources.
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  color: isDarkMode ? '#718096' : '#94a3b8'
                }}
              >
                Last updated: Today • Version 2.1 • Powered by OpenAI GPT-4
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Box>

      {/* Add CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </Container>
  );
};

export default AIChat;