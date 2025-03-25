import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  SelectChangeEvent,
  FormGroup,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Event as EventIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useEvents } from '../hooks/useEvents';
import { useCategories } from '../hooks/useCategories';
import EventCard from '../components/common/EventCard';

interface EventParams {
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
  category?: string;
  status?: string;
  free?: boolean;
  hasAvailability?: boolean;
  location?: string;
  sort?: string;
}

const EventsPage: React.FC = () => {
  
  // Hook para eventos
  const { 
    events, 
    loading, 
    error, 
    pagination,
    fetchEvents
  } = useEvents();

  // Hook para categorias
  const { 
    categories, 
    loading: loadingCategories, 
    fetchCategories 
  } = useCategories();
  
  // Estados para paginação e filtros
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [sortOrder, setSortOrder] = useState<string>('date_asc');
  const [freeOnly, setFreeOnly] = useState(false);
  const [hasAvailability, setHasAvailability] = useState(false);
  const [location, setLocation] = useState('');

  // Alerta para mensagens de sucesso/erro
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Carregar categorias e eventos ao montar o componente
  useEffect(() => {
    fetchCategories().catch(err => console.error('Erro ao carregar categorias:', err));
  }, [fetchCategories]);

  // Carregar eventos com filtros
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const params: EventParams = {
          page,
          limit: 9, // 9 cards por página (grid 3x3)
          status: filterStatus,
          sort: sortOrder
        };

        // Adicionar filtros quando preenchidos
        if (searchQuery) {
          params.q = searchQuery;
        }
        
        if (selectedCategory) {
          params.category = selectedCategory;
        }
        
        if (freeOnly) {
          params.free = true;
        }
        
        if (hasAvailability) {
          params.hasAvailability = true;
        }
        
        if (location) {
          params.location = location;
        }
        
        await fetchEvents(params);
      } catch (err) {
        console.error('Erro ao carregar eventos:', err);
        setAlert({
          type: 'error',
          message: err instanceof Error ? err.message : 'Erro ao carregar eventos'
        });
      }
    };
    
    loadEvents();
  }, [fetchEvents, page, searchQuery, selectedCategory, filterStatus, sortOrder, freeOnly, hasAvailability, location]);

  // Manipuladores de eventos para filtros
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1); // Reiniciar paginação ao pesquisar
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value);
    setPage(1);
  };

  const handleFreeOnlyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFreeOnly(event.target.checked);
    setPage(1);
  };

  const handleAvailabilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasAvailability(event.target.checked);
    setPage(1);
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setFilterStatus('ativo');
    setSortOrder('date_asc');
    setFreeOnly(false);
    setHasAvailability(false);
    setLocation('');
    setPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Alerta de sucesso ou erro */}
      {alert && (
        <Alert 
          severity={alert.type} 
          sx={{ mb: 3 }}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      {/* Cabeçalho da página */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          Eventos Disponíveis
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Descubra e participe dos eventos mais interessantes na plataforma Eventor.
        </Typography>
      </Paper>

      {/* Filtros e pesquisa */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSearch}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
            <TextField
              placeholder="Pesquisar eventos..."
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchInputChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <TextField
              placeholder="Localização..."
              variant="outlined"
              value={location}
              onChange={handleLocationChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', md: '30%' } }}
            />
            <Button 
              variant="contained" 
              color="primary"
              type="submit"
              sx={{ minWidth: '120px' }}
            >
              Buscar
            </Button>
          </Box>
        </form>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between',
          gap: 2
        }}>
          {/* Dropdowns para filtros */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2,
            flexGrow: 1
          }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={selectedCategory}
                label="Categoria"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">Todas</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortOrder}
                label="Ordenar por"
                onChange={handleSortChange}
              >
                <MenuItem value="date_asc">Data (Próximos)</MenuItem>
                <MenuItem value="date_desc">Data (Antigos)</MenuItem>
                <MenuItem value="price_asc">Preço (Menor)</MenuItem>
                <MenuItem value="price_desc">Preço (Maior)</MenuItem>
                <MenuItem value="recent">Recém adicionados</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* Switches para filtros adicionais */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2
          }}>
            <FormGroup>
              <FormControlLabel 
                control={<Switch checked={freeOnly} onChange={handleFreeOnlyChange} />} 
                label="Apenas gratuitos" 
              />
            </FormGroup>
            <FormGroup>
              <FormControlLabel 
                control={<Switch checked={hasAvailability} onChange={handleAvailabilityChange} />} 
                label="Com vagas disponíveis" 
              />
            </FormGroup>
            <Button 
              color="secondary" 
              variant="outlined" 
              size="small" 
              onClick={clearFilters}
              sx={{ alignSelf: 'center' }}
            >
              Limpar filtros
            </Button>
          </Box>
        </Box>
        
        {!loadingCategories && categories.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label="Todos" 
              variant={selectedCategory === '' ? "filled" : "outlined"} 
              color="primary" 
              onClick={() => handleCategoryClick('')} 
            />
            {categories.map((category) => (
              <Chip 
                key={category._id}
                label={category.name} 
                variant={selectedCategory === category._id ? "filled" : "outlined"} 
                color="primary"
                onClick={() => handleCategoryClick(category._id)} 
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Lista de eventos */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : events.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event._id}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>
          
          {/* Paginação */}
          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={pagination.pages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum evento encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Tente ajustar seus filtros ou crie um novo evento
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default EventsPage; 