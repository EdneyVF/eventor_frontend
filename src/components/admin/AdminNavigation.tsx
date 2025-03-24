import React from 'react';
import { 
  Box, 
  Paper,
  Typography, 
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Category as CategoryIcon,
  People as PeopleIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navigationItems = [
    { 
      text: 'Eventos', 
      icon: <EventIcon />, 
      path: '/admin',
      exact: true
    },
    { 
      text: 'Categorias', 
      icon: <CategoryIcon />, 
      path: '/admin/categories',
      exact: true
    },
    { 
      text: 'Usuários', 
      icon: <PeopleIcon />, 
      path: '/admin/users',
      exact: true
    }
  ];
  
  const isActive = (item: typeof navigationItems[0]) => {
    if (item.exact) {
      return currentPath === item.path;
    }
    return currentPath.startsWith(item.path);
  };
  
  return (
    <Paper
      elevation={1}
      sx={{
        width: '100%',
        mb: 3,
        borderRadius: 2
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          Administração
        </Typography>
      </Box>
      <List disablePadding>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isActive(item)}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default AdminNavigation; 