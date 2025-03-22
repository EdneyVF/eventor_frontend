import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  Divider,
  useTheme 
} from '@mui/material';

const Footer: React.FC = () => {
  const theme = useTheme();
  
  const footerLinks = {
    empresa: [
      { name: 'Sobre nós', url: '/about' },
      { name: 'Nossa equipe', url: '/team' },
      { name: 'Contato', url: '/contact' }
    ],
    recursos: [
      { name: 'Eventos', url: '/events' },
      { name: 'Blog', url: '/blog' },
      { name: 'FAQ', url: '/faq' }
    ],
    legal: [
      { name: 'Termos de uso', url: '/terms' },
      { name: 'Política de privacidade', url: '/privacy' },
      { name: 'Cookies', url: '/cookies' }
    ]
  };
  
  return (
    <Box
      component="footer"
      sx={{
        py: 5,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'grey.200',
        width: '100%',
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Links da empresa */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom fontWeight={600}>
              Empresa
            </Typography>
            {footerLinks.empresa.map((link, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Link
                  href={link.url}
                  color="text.secondary"
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { 
                      color: theme.palette.primary.main,
                      textDecoration: 'underline' 
                    }
                  }}
                >
                  {link.name}
                </Link>
              </Box>
            ))}
          </Grid>
          
          {/* Links de recursos */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom fontWeight={600}>
              Recursos
            </Typography>
            {footerLinks.recursos.map((link, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Link
                  href={link.url}
                  color="text.secondary"
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { 
                      color: theme.palette.primary.main,
                      textDecoration: 'underline' 
                    }
                  }}
                >
                  {link.name}
                </Link>
              </Box>
            ))}
          </Grid>
          
          {/* Links legais */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom fontWeight={600}>
              Legal
            </Typography>
            {footerLinks.legal.map((link, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Link
                  href={link.url}
                  color="text.secondary"
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { 
                      color: theme.palette.primary.main,
                      textDecoration: 'underline' 
                    }
                  }}
                >
                  {link.name}
                </Link>
              </Box>
            ))}
          </Grid>
          
          {/* Logo e descrição */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom fontWeight={600}>
              Eventor
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              A plataforma que conecta pessoas através de eventos incríveis. Organize, participe e conecte-se.
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} Eventor. Todos os direitos reservados.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Feito com ❤️ no Brasil
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 