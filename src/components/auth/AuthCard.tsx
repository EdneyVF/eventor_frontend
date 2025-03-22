import React, { useState } from 'react';
import { Card, Box, CardContent, useTheme, useMediaQuery } from '@mui/material';
import { keyframes } from '@mui/system';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

// Animações
const slideLeft = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideRight = keyframes`
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const AuthCard: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSwitchForm = () => {
    setTransitioning(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setTransitioning(false);
    }, 300); // Tempo da animação
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Card
        elevation={8}
        sx={{
          maxWidth: isMobile ? 'calc(100% - 32px)' : 440,
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          alignSelf: 'center',
        }}
      >
        <CardContent sx={{ p: { xs: 1, sm: 0 }, position: 'relative' }}>
          <Box
            sx={{
              animation: transitioning
                ? `${fadeOut} 300ms ease-in-out forwards`
                : isLogin
                ? `${slideRight} 400ms ease-in-out`
                : `${slideLeft} 400ms ease-in-out`,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'visible'
            }}
          >
            {isLogin ? (
              <LoginForm onSwitchForm={handleSwitchForm} />
            ) : (
              <RegisterForm onSwitchForm={handleSwitchForm} />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthCard; 