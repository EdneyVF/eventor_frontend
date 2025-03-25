import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  Chip,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  Event as EventIcon,
  EventAvailable as EventAvailableIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { Event, EventQueryParams } from '../services/eventService';
import EventCard from '../components/common/EventCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`events-tabpanel-${index}`}
      aria-labelledby={`events-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const MyEventsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  
  // Estados para paginação e filtros
  const [page, setPage] = useState(1);
  const limit = 6; // Constante ao invés de state já que não muda
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Estado para eventos
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<Event[]>([]);
  
  // Usar hook de eventos
  const { 
    loading, 
    error, 
    counts,
    pagination,
    fetchMyEvents,
    cancelEvent
  } = useEvents();

  // Estado para o diálogo de confirmação
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: () => {}
  });

  // Alerta para mensagens de sucesso/erro
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Carregar eventos criados pelo usuário
  useEffect(() => {
    if (tabValue === 0) {
      const params: EventQueryParams = { page, limit };
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      fetchMyEvents(params)
        .then(data => {
          setCreatedEvents(data);
        })
        .catch(err => {
          console.error('Erro ao buscar eventos criados:', err);
          setAlert({
            type: 'error',
            message: err instanceof Error ? err.message : 'Erro ao buscar eventos'
          });
        });
    }
  }, [tabValue, page, limit, statusFilter, fetchMyEvents]);

  // Carregar eventos que o usuário está participando
  useEffect(() => {
    if (tabValue === 1) {
      const params: EventQueryParams = { page, limit };
      
      // Mapear filtros para o formato esperado pela API
      if (statusFilter === 'future') {
        params.when = 'future';
      } else if (statusFilter === 'past') {
        params.when = 'past';
      } else if (statusFilter === 'canceled') {
        params.status = 'cancelado';
      }
      
      fetchMyEvents(params)
        .then(data => {
          setParticipatingEvents(data);
        })
        .catch(err => {
          console.error('Erro ao buscar eventos que participo:', err);
          setAlert({
            type: 'error',
            message: err instanceof Error ? err.message : 'Erro ao buscar eventos'
          });
        });
    }
  }, [tabValue, page, limit, statusFilter, fetchMyEvents]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/events/edit/${eventId}`);
  };

  const handleCancelEvent = async (eventId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Cancelar Evento',
      message: 'Tem certeza que deseja cancelar este evento? Esta ação não pode ser desfeita.',
      action: async () => {
        try {
          await cancelEvent(eventId);
          setAlert({
            type: 'success',
            message: 'Evento cancelado com sucesso!'
          });
          // Recarregar eventos apenas da aba atual
          if (tabValue === 0) {
            const params: EventQueryParams = { page, limit };
            if (statusFilter) {
              params.status = statusFilter;
            }
            const data = await fetchMyEvents(params);
            setCreatedEvents(data);
          } else {
            const params: EventQueryParams = { page, limit };
            if (statusFilter === 'future') {
              params.when = 'future';
            } else if (statusFilter === 'past') {
              params.when = 'past';
            } else if (statusFilter === 'canceled') {
              params.status = 'cancelado';
            }
            const data = await fetchMyEvents(params);
            setParticipatingEvents(data);
          }
        } catch {
          setAlert({
            type: 'error',
            message: 'Erro ao cancelar evento. Tente novamente.'
          });
        }
      }
    });
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1); // Voltar para a primeira página ao mudar o filtro
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Renderizar filtros para eventos criados
  const renderCreatedEventsFilters = () => {
    return (
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
          <FormControl sx={{ minWidth: 180, mr: 2 }} size="small">
            <InputLabel id="status-filter-label">Status do Evento</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status do Evento"
              onChange={(e: SelectChangeEvent) => handleStatusFilterChange(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="active">Ativos</MenuItem>
              <MenuItem value="inactive">Inativos</MenuItem>
              <MenuItem value="canceled">Cancelados</MenuItem>
              <MenuItem value="finished">Finalizados</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          {counts?.total !== undefined && (
            <Chip 
              label={`Total: ${counts.total}`} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          )}
          {counts?.active !== undefined && (
            <Chip 
              label={`Ativos: ${counts.active}`} 
              size="small" 
              color="success" 
              variant="outlined" 
            />
          )}
          {counts?.inactive !== undefined && (
            <Chip 
              label={`Inativos: ${counts.inactive}`} 
              size="small" 
              color="warning" 
              variant="outlined" 
            />
          )}
          {counts?.canceled !== undefined && (
            <Chip 
              label={`Cancelados: ${counts.canceled}`} 
              size="small" 
              color="error" 
              variant="outlined" 
            />
          )}
        </Box>
      </Box>
    );
  };

  // Renderizar filtros para eventos participando
  const renderParticipatingEventsFilters = () => {
    return (
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
          <FormControl sx={{ minWidth: 180, mr: 2 }} size="small">
            <InputLabel id="when-filter-label">Quando</InputLabel>
            <Select
              labelId="when-filter-label"
              id="when-filter"
              value={statusFilter}
              label="Quando"
              onChange={(e: SelectChangeEvent) => handleStatusFilterChange(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="future">Próximos</MenuItem>
              <MenuItem value="past">Passados</MenuItem>
              <MenuItem value="canceled">Cancelados</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          {counts?.upcoming !== undefined && (
            <Chip 
              label={`Próximos: ${counts.upcoming}`} 
              size="small" 
              color="success" 
              variant="outlined" 
            />
          )}
          {counts?.past !== undefined && (
            <Chip 
              label={`Passados: ${counts.past}`} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          )}
          {counts?.canceled !== undefined && (
            <Chip 
              label={`Cancelados: ${counts.canceled}`} 
              size="small" 
              color="error" 
              variant="outlined" 
            />
          )}
        </Box>
      </Box>
    );
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
          Meus Eventos
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Gerencie seus eventos e veja em quais eventos você está participando.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/events/create')}
          startIcon={<EventIcon />}
        >
          Criar Novo Evento
        </Button>
      </Paper>

      {/* Tabs para alternar entre eventos criados e participando */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="eventos tabs"
            variant="fullWidth"
          >
            <Tab 
              label="Eventos que Criei" 
              id="events-tab-0" 
              aria-controls="events-tabpanel-0" 
              icon={<EventIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Eventos que Participo" 
              id="events-tab-1" 
              aria-controls="events-tabpanel-1" 
              icon={<EventAvailableIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab panel para eventos criados pelo usuário */}
        <TabPanel value={tabValue} index={0}>
          {renderCreatedEventsFilters()}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : createdEvents.length > 0 ? (
            <>
              <Grid container spacing={4}>
                {createdEvents.map((event) => (
                  <Grid item xs={12} sm={6} md={4} key={event._id}>
                    <EventCard
                      event={event}
                      showEditButton={true}
                      showCancelButton={true}
                      onEdit={handleEditEvent}
                      onCancel={handleCancelEvent}
                    />
                  </Grid>
                ))}
              </Grid>
              
              {/* Paginação */}
              {pagination?.pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                  <Pagination 
                    count={pagination.pages} 
                    page={page} 
                    onChange={handlePageChange} 
                    color="primary" 
                    size="large"
                  />
                </Box>
              )}
            </>
          ) : (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Você ainda não criou nenhum evento
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Comece agora mesmo a criar seu primeiro evento!
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/events/create')}
              >
                Criar Evento
              </Button>
            </Paper>
          )}
        </TabPanel>

        {/* Tab panel para eventos em que o usuário está participando */}
        <TabPanel value={tabValue} index={1}>
          {renderParticipatingEventsFilters()}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : participatingEvents.length > 0 ? (
            <>
              <Grid container spacing={4}>
                {participatingEvents.map((event) => (
                  <Grid item xs={12} sm={6} md={4} key={event._id}>
                    <EventCard
                      event={event}
                      showCancelParticipationButton={true}
                      onCancelParticipation={handleCancelEvent}
                    />
                  </Grid>
                ))}
              </Grid>
              
              {/* Paginação */}
              {pagination?.pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                  <Pagination 
                    count={pagination.pages} 
                    page={page} 
                    onChange={handlePageChange} 
                    color="primary" 
                    size="large"
                  />
                </Box>
              )}
            </>
          ) : (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <EventAvailableIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Você não está participando de nenhum evento
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Explore eventos disponíveis e participe!
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/events')}
              >
                Explorar Eventos
              </Button>
            </Paper>
          )}
        </TabPanel>
      </Paper>

      {/* Diálogo de confirmação */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography id="confirm-dialog-description">
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              confirmDialog.action();
              setConfirmDialog(prev => ({ ...prev, open: false }));
            }} 
            color={confirmDialog.title.includes('Cancelar') ? "error" : "primary"}
            variant="contained"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyEventsPage; 