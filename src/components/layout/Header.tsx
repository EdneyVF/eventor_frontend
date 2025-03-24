import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  Container,
  useMediaQuery,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  Divider,
  Avatar,
  ListItemIcon
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  Logout, 
  Person,
  Event as EventIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logoSvg from '../../assets/icons/logo.png';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const { user } = authState;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estado para o menu móvel
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    navigate('/auth');
    handleClose();
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  // Renderiza o menu do usuário autenticado
  const renderUserMenu = () => {
    if (!user) return null;

    return (
      <Box sx={{ ml: 2 }}>
        <IconButton
          onClick={handleMenu}
          size="small"
          edge="end"
          color="inherit"
          aria-label="menu do usuário"
          aria-controls={open ? 'user-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar
            sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem disabled>
            <Typography variant="body2" color="textSecondary">
              {user.email}
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            Meu Perfil
          </MenuItem>
          {user.role === 'admin' && (
            <MenuItem onClick={() => { handleClose(); navigate('/admin'); }}>
              <ListItemIcon>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              Dashboard Admin
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Sair
          </MenuItem>
        </Menu>
      </Box>
    );
  };

  return (
    <AppBar 
      position="static" 
      color="inherit" 
      elevation={0}
      sx={{ 
        borderBottom: '1px solid', 
        borderColor: 'grey.200',
        bgcolor: 'background.paper' 
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ 
          justifyContent: 'space-between',
          py: { xs: 1, sm: 1.5 }
        }}>
          {/* Logo à esquerda */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              gap: { xs: 0.5, sm: 1 }
            }}
            onClick={() => navigate('/')}
          >
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                flexShrink: 0
              }}
            >
              <img 
                src={logoSvg} 
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
              variant="h6" 
              component="span" 
              color="primary"
              fontWeight="bold"
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                letterSpacing: '0.5px'
              }}
            >
              Eventor
            </Typography>
            <Typography 
              variant="subtitle1" 
              component="span" 
              color="primary"
              fontWeight="bold"
              sx={{ 
                display: { xs: 'block', sm: 'none' },
                fontSize: '1rem'
              }}
            >
              E
            </Typography>
          </Box>
          
          {/* Botões à direita (desktop) */}
          {!isMobile ? (
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, alignItems: 'center' }}>
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Tooltip title="Painel Administrativo">
                      <Button 
                        color="primary" 
                        variant="outlined"
                        startIcon={<DashboardIcon />}
                        onClick={() => navigate('/admin')}
                        size="small"
                        sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
                      >
                        Admin
                      </Button>
                    </Tooltip>
                  )}
                  <Button 
                    color="primary"
                    variant="outlined"
                    onClick={() => navigate('/events')}
                    size="small"
                    sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
                  >
                    Eventos
                  </Button>
                  <Button 
                    color="primary" 
                    variant="outlined"
                    onClick={() => navigate('/my-events')}
                    size="small"
                    sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
                  >
                    Meus Eventos
                  </Button>
                  <Tooltip title="Criar Novo Evento">
                    <Button 
                      color="secondary" 
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/events/create')}
                      size="small"
                      sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
                    >
                      Criar Evento
                    </Button>
                  </Tooltip>
                  {renderUserMenu()}
                </>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleLogin}
                  sx={{ fontWeight: 'medium' }}
                >
                  Entrar
                </Button>
              )}
            </Box>
          ) : (
            // Menu para dispositivos móveis
            <Box>
              <IconButton
                size={isMobile ? "medium" : "large"}
                edge="end"
                color="primary"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                sx={{ 
                  padding: { xs: '6px', sm: '8px' }
                }}
              >
                <MenuIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                {user ? (
                  <>
                    <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                      <ListItemIcon>
                        <Person fontSize="small" />
                      </ListItemIcon>
                      Meu Perfil
                    </MenuItem>
                    <Divider />
                    {user.role === 'admin' && (
                      <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>
                        <ListItemIcon>
                          <DashboardIcon fontSize="small" />
                        </ListItemIcon>
                        Painel Administrativo
                      </MenuItem>
                    )}
                    <MenuItem onClick={() => { navigate('/events'); handleClose(); }}>
                      <ListItemIcon>
                        <EventIcon fontSize="small" />
                      </ListItemIcon>
                      Eventos
                    </MenuItem>
                    <MenuItem onClick={() => { navigate('/my-events'); handleClose(); }}>
                      <ListItemIcon>
                        <EventIcon fontSize="small" />
                      </ListItemIcon>
                      Meus Eventos
                    </MenuItem>
                    <MenuItem onClick={() => { navigate('/events/create'); handleClose(); }}
                      sx={{ color: 'secondary.main' }}
                    >
                      <ListItemIcon>
                        <AddIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                      </ListItemIcon>
                      Criar Evento
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <Logout fontSize="small" />
                      </ListItemIcon>
                      Sair
                    </MenuItem>
                  </>
                ) : (
                  <MenuItem onClick={handleLogin}>Entrar</MenuItem>
                )}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 