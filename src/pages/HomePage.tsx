import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Paper, 
  useTheme, 
  useMediaQuery,
  Card,
  CardContent
} from '@mui/material';
import { 
  CalendarMonth, 
  Groups, 
  LocationOn, 
  ArrowForward 
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import eventIllustration from '../assets/images/event-illustration.svg';

const HomePage: React.FC = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Função para navegar para página de autenticação
  const navigateToAuth = () => {
    navigate('/auth');
  };

  const features = [
    {
      icon: <CalendarMonth fontSize="large" color="primary" />,
      title: "Organize Eventos",
      description: "Crie e gerencie eventos facilmente com ferramentas intuitivas. Defina data, local e capacidade."
    },
    {
      icon: <Groups fontSize="large" color="primary" />,
      title: "Conecte Pessoas",
      description: "Reúna participantes com interesses semelhantes. Networking e novas conexões garantidas."
    },
    {
      icon: <LocationOn fontSize="large" color="primary" />,
      title: "Encontre Locais",
      description: "Descubra os melhores eventos próximos a você. Filtre por categoria, data ou localização."
    }
  ];

  return (
    <Box 
      sx={{ 
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.dark',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 10 },
          backgroundImage: 'linear-gradient(45deg, #5e35b1 30%, #7e57c2 90%)',
          width: '100%',
          flexShrink: 0
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant={isMobile ? "h3" : "h2"} 
                component="h1" 
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                Eventos que conectam pessoas
              </Typography>
              <Typography 
                variant={isMobile ? "body1" : "h6"}
                paragraph
                sx={{ mb: 4, opacity: 0.9 }}
              >
                Organize, participe e conecte-se através de eventos incríveis. 
                Uma plataforma completa para transformar suas ideias em experiências inesquecíveis.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  color="secondary"
                  onClick={navigateToAuth}
                  endIcon={<ArrowForward />}
                  sx={{ 
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3
                  }}
                >
                  Começar Agora
                </Button>
                {!user && (
                  <Button 
                    variant="outlined" 
                    size="large" 
                    onClick={navigateToAuth}
                    sx={{ 
                      borderColor: 'white', 
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Entrar
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: isMobile ? 'none' : 'block' } }}>
              <Box 
                component="img"
                src={eventIllustration}
                alt="Eventos"
                sx={{ 
                  width: '100%', 
                  maxWidth: 500,
                  height: 'auto',
                  display: 'block',
                  mx: 'auto',
                  filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.15))',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, width: '100%' }}>
        <Typography 
          variant="h4" 
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6, fontWeight: 'bold' }}
        >
          Por que escolher o Eventor?
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  borderRadius: 4,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box
        sx={{
          bgcolor: 'grey.100',
          py: { xs: 6, md: 8 },
          borderTop: '1px solid',
          borderColor: 'grey.200',
          width: '100%',
          flexShrink: 0
        }}
      >
        <Container maxWidth="md">
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 3, md: 5 }, 
              textAlign: 'center',
              borderRadius: 4,
              backgroundColor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Typography 
              variant="h5" 
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Pronto para começar sua jornada?
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Crie sua conta gratuitamente e comece a explorar o mundo de possibilidades.
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              color="primary"
              onClick={navigateToAuth}
              sx={{ 
                mt: 2,
                px: 4,
                py: 1.5,
                borderRadius: 3
              }}
            >
              Criar Conta Grátis
            </Button>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 