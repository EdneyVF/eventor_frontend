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
  Typography
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
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
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
              {user ? (
                <>
                  <Button 
                    color="primary" 
                    onClick={() => navigate('/events')}
                    size="small"
                    sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
                  >
                    Meus Eventos
                  </Button>
                  <Button 
                    color="primary" 
                    onClick={() => navigate('/profile')}
                    size="small"
                    sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
                  >
                    Perfil
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={handleLogout}
                    size="small"
                    sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    color="primary" 
                    onClick={handleLogin}
                    size="small"
                    sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
                  >
                    Entrar
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleLogin}
                    size="small"
                    sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
                  >
                    Cadastrar
                  </Button>
                </>
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
                    <MenuItem onClick={() => { navigate('/events'); handleClose(); }}>
                      Meus Eventos
                    </MenuItem>
                    <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                      Perfil
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      Sair
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem onClick={handleLogin}>Entrar</MenuItem>
                    <MenuItem onClick={handleLogin}>Cadastrar</MenuItem>
                  </>
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