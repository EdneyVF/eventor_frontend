import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Divider,
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
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useCategories } from '../hooks/useCategories';
import { EventLocation } from '../services/eventService';
import defaultEventImage from '../assets/images/default-event.svg';

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
  const navigate = useNavigate();
  
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
  const [filterStatus, setFilterStatus] = useState<string>('ativo');
  const [sortOrder, setSortOrder] = useState<string>('date_asc');
  const [freeOnly, setFreeOnly] = useState(false);
  const [hasAvailability, setHasAvailability] = useState(false);
  const [location, setLocation] = useState('');

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

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Formatar localização para exibição
  const formatLocation = (location: EventLocation) => {
    if (!location) return 'Local não definido';
    return `${location.city}, ${location.state}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={event.imageUrl || defaultEventImage}
                      alt={event.title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultEventImage;
                      }}
                    />
                    {(event.status === 'cancelado' || event.status === 'inativo') && (
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0, 0, 0, 0.5)'
                      }}>
                        <Chip 
                          label={event.status === 'cancelado' ? 'CANCELADO' : 'INATIVO'} 
                          color={event.status === 'cancelado' ? "error" : "warning"} 
                          sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                        />
                      </Box>
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {event.title}
                      </Typography>
                      <Chip 
                        label={event.category.name} 
                        size="small" 
                        color="primary" 
                        sx={{ ml: 1 }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {event.description}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(event.date)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatLocation(event.location)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.participantsCount}/{event.capacity} participantes
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" color={event.price === 0 ? "success.main" : "text.secondary"} fontWeight={event.price === 0 ? "bold" : "normal"}>
                        {formatPrice(event.price)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </Box>
                </Card>
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