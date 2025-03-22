import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        overflow: 'visible'
      }}
    >
      {!isAuthPage && <Header />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          overflow: 'visible'
        }}
      >
        {children}
      </Box>
      {!isAuthPage && <Footer />}
    </Box>
  );
};

export default Layout; 