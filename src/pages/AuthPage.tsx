import React, { useEffect } from 'react';
import { Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import AuthCard from '../components/auth/AuthCard';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Redirecionar após login com base no papel do usuário
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/events');
      }
    }
  }, [user, navigate]);

  const handleLogoClick = () => {
    if (user) {
      navigate('/events');
    } else {
      navigate('/');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: { xs: 'flex-start', md: 'center' },
        bgcolor: 'grey.100',
        p: { xs: 2, sm: 3, md: 4 },
        overflowY: 'auto',
        py: { xs: 6, md: 4 }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 500,
          mx: 'auto',
          px: 2,
          position: 'relative'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: { xs: 3, sm: 4 },
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Box 
            onClick={handleLogoClick}
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              mb: 2
            }}
          >
            <Box
              sx={{
                width: { xs: 60, sm: 70 },
                height: { xs: 60, sm: 70 },
                mb: 1,
              }}
            >
              <img 
                src="/icons/logo.png" 
                alt="Eventor Logo" 
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }} 
              />
            </Box>

            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              component="h1" 
              align="center" 
              color="primary.main" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                '&:hover': {
                  textDecoration: 'none',
                  opacity: 0.9
                }
              }}
            >
              Eventor
            </Typography>
          </Box>
          
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            component="h2" 
            align="center" 
            color="text.secondary"
            sx={{ mb: { xs: 3, sm: 4 } }}
          >
            A plataforma completa para seus eventos
          </Typography>
        </Box>

        <AuthCard />

        <Paper 
          elevation={0} 
          sx={{ 
            mt: { xs: 3, sm: 4 }, 
            p: 2, 
            bgcolor: 'transparent',
            textAlign: 'center',
            width: '100%'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} Eventor. Todos os direitos reservados.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default AuthPage; 