import React, { useState } from 'react';
import {
  Container, Grid, Card, CardContent, Typography,
  Box, TextField, Button, Alert, Paper, Link,
  List, ListItem, ListItemIcon, ListItemText,
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const Contacts = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <EmailIcon color="primary" />,
      title: t('email'),
      content: 'info@tennisportal.com',
      link: 'mailto:info@tennisportal.com'
    },
    {
      icon: <PhoneIcon color="primary" />,
      title: t('phone'),
      content: '+7 (777) 123-45-67',
      link: 'tel:+77771234567'
    },
    {
      icon: <LocationOnIcon color="primary" />,
      title: t('address'),
      content: 'Almaty, Kazakhstan, Tennis Street 123',
      link: 'https://maps.google.com'
    }
  ];

  const socialLinks = [
    {
      icon: <FacebookIcon />,
      name: t('facebook'),
      url: 'https://facebook.com/tennisportal'
    },
    {
      icon: <TwitterIcon />,
      name: t('twitter'),
      url: 'https://twitter.com/tennisportal'
    },
    {
      icon: <InstagramIcon />,
      name: t('instagram'),
      url: 'https://instagram.com/tennisportal'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          {t('contact_us')}
        </Typography>
        
        <Grid container spacing={4}>
          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {t('get_in_touch')}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {t('contact_description')}
                </Typography>
                
                <List>
                  {contactInfo.map((item, index) => (
                    <React.Fragment key={item.title}>
                      <ListItem>
                        <ListItemIcon>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          secondary={
                            <Link href={item.link} target="_blank" rel="noopener">
                              {item.content}
                            </Link>
                          }
                        />
                      </ListItem>
                      {index < contactInfo.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  {t('follow_us')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {socialLinks.map((social) => (
                    <Button
                      key={social.name}
                      variant="outlined"
                      startIcon={social.icon}
                      component="a"
                      href={social.url}
                      target="_blank"
                      rel="noopener"
                    >
                      {social.name}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                {t('send_message')}
              </Typography>
              
              {submitStatus === 'success' && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {t('message_sent')}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label={t('your_name')}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={submitStatus === 'loading'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label={t('email_address')}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={submitStatus === 'loading'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label={t('subject')}
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      disabled={submitStatus === 'loading'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label={t('message')}
                      name="message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      disabled={submitStatus === 'loading'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitStatus === 'loading'}
                      fullWidth
                    >
                      {submitStatus === 'loading' ? t('sending') : t('send_message')}
                    </Button>
                  </Grid>
                </Grid>
              </form>

              {/* FAQ Section */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('faq')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary={t('faq_rankings')}
                      secondary={t('faq_rankings_answer')}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={t('faq_tickets')}
                      secondary={t('faq_tickets_answer')}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={t('faq_report')}
                      secondary={t('faq_report_answer')}
                    />
                  </ListItem>
                </List>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Map Location */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            {t('our_location')}
          </Typography>
          <Paper elevation={3} sx={{ p: 2 }}>
            {/* This would be a real Google Maps embed */}
            <Box
              sx={{
                height: 300,
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1
              }}
            >
              <Typography color="textSecondary">
                {t('map_placeholder')}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Contacts;