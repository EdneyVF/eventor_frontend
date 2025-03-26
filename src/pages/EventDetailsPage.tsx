import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  Tag as TagIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import defaultEventImage from '../assets/images/default-event.svg';

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { user } = authState;

  const {
    event,
    loading,
    error,
    fetchEventById,
    participateInEvent,
    cancelEventParticipation,
    cancelEvent,
    fetchApprovalStatus,
    approvalInfo
  } = useEvents();

  // Estados para diálogos e mensagens
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    action: () => {}
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Carregar detalhes do evento
  useEffect(() => {
    if (id) {
      fetchEventById(id).catch(err => {
        console.error('Erro ao carregar evento:', err);
      });
    }
  }, [id, fetchEventById]);

  // Buscar informações de aprovação quando o evento for rejeitado
  useEffect(() => {
    if (event && event.approvalStatus === 'rejected' && id) {
      fetchApprovalStatus(id).catch(err => {
        console.error('Erro ao buscar informações de aprovação:', err);
      });
    }
  }, [event, id, fetchApprovalStatus]);

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

  // Formatar localização
  const formatLocation = (location: { city: string; state: string; country: string }) => {
    return `${location.city}, ${location.state}, ${location.country}`;
  };

  // Verificar se o usuário é o organizador do evento
  const isOrganizer = event?.organizer._id === user?._id;

  // Verificar se o usuário está participando do evento
  const isParticipating = event?.participants?.some(p => p._id === user?._id);

  // Handlers para ações
  const handleParticipate = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Confirmar Participação',
      message: 'Tem certeza que deseja participar deste evento?',
      action: confirmParticipate
    });
  };

  const confirmParticipate = async () => {
    if (!event?._id) return;

    try {
      await participateInEvent(event._id);
      setSnackbar({
        open: true,
        message: 'Participação confirmada com sucesso!',
        severity: 'success'
      });
      // Recarregar detalhes do evento
      fetchEventById(event._id);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Erro ao participar do evento',
        severity: 'error'
      });
    } finally {
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
  };

  const handleCancelParticipation = () => {
    setConfirmDialog({
      open: true,
      title: 'Cancelar Participação',
      message: 'Tem certeza que deseja cancelar sua participação neste evento?',
      action: confirmCancelParticipation
    });
  };

  const confirmCancelParticipation = async () => {
    if (!event?._id) return;

    try {
      await cancelEventParticipation(event._id);
      setSnackbar({
        open: true,
        message: 'Participação cancelada com sucesso!',
        severity: 'success'
      });
      // Recarregar detalhes do evento
      fetchEventById(event._id);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Erro ao cancelar participação',
        severity: 'error'
      });
    } finally {
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
  };

  const handleCancelEvent = () => {
    setConfirmDialog({
      open: true,
      title: 'Cancelar Evento',
      message: 'Tem certeza que deseja cancelar este evento? Esta ação não pode ser desfeita.',
      action: confirmCancelEvent
    });
  };

  const confirmCancelEvent = async () => {
    if (!event?._id) return;

    try {
      await cancelEvent(event._id);
      setSnackbar({
        open: true,
        message: 'Evento cancelado com sucesso!',
        severity: 'success'
      });
      // Recarregar detalhes do evento
      fetchEventById(event._id);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Erro ao cancelar evento',
        severity: 'error'
      });
    } finally {
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
  };

  const handleEditEvent = () => {
    if (event?._id) {
      navigate(`/events/edit/${event._id}`);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSnackbar({
        open: true,
        message: 'Link copiado para a área de transferência!',
        severity: 'success'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleCloseDialog = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">
          {error || 'Evento não encontrado'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Alerta para evento rejeitado (apenas para o organizador) */}
      {event.approvalStatus === 'rejected' && isOrganizer && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Evento Rejeitado</AlertTitle>
          Este evento foi rejeitado por um administrador. Verifique e faça as alterações necessárias antes de tentar novamente.
        </Alert>
      )}
      
      {/* Imagem do evento */}
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{ position: 'relative', height: 400 }}>
          <CardMedia
            component="img"
            image={event.imageUrl || defaultEventImage}
            alt={event.title}
            sx={{ height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultEventImage;
            }}
          />
          {(event.status === 'canceled' || event.status === 'inactive') && (
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
                label={event.status === 'canceled' ? 'CANCELADO' : 'INATIVO'} 
                color={event.status === 'canceled' ? "error" : "warning"} 
                sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
              />
            </Box>
          )}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Informações principais do evento */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                {event.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Compartilhar">
                  <IconButton onClick={handleShare} color="primary">
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                {isOrganizer && event.status !== 'canceled' && (
                  <>
                    <Tooltip title="Editar">
                      <IconButton onClick={handleEditEvent} color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancelar Evento">
                      <IconButton onClick={handleCancelEvent} color="error">
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Chip 
                label={event.category.name} 
                color="primary" 
                icon={<CategoryIcon />}
              />
              <Chip 
                label={`${event.approvalStatus === 'approved' ? 'Aprovado' : 
                       event.approvalStatus === 'rejected' ? 'Rejeitado' : 'Pendente'}`} 
                color={event.approvalStatus === 'approved' ? "success" : 
                       event.approvalStatus === 'rejected' ? "error" : "warning"} 
                icon={event.approvalStatus === 'approved' ? <CheckIcon /> : 
                       event.approvalStatus === 'rejected' ? <CloseIcon /> : <TimeIcon />}
              />
              {event.tags && event.tags.map((tag, index) => (
                <Chip 
                  key={index}
                  label={tag} 
                  variant="outlined" 
                  icon={<TagIcon />}
                />
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom fontWeight="bold">
              Sobre o Evento
            </Typography>
            <Typography variant="body1" paragraph>
              {event.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom fontWeight="bold">
              Informações do Organizador
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56,
                  bgcolor: 'primary.main'
                }}
              >
                {event.organizer.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {event.organizer.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.organizer.email}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Card lateral com informações e ações */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Data" 
                    secondary={formatDate(event.date)}
                  />
                </ListItem>
                {event.endDate && (
                  <ListItem>
                    <ListItemIcon>
                      <TimeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Término" 
                      secondary={formatDate(event.endDate)}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Local" 
                    secondary={formatLocation(event.location)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Participantes" 
                    secondary={event.capacity !== null 
                      ? `${event.participantsCount || 0}/${event.capacity}` 
                      : `${event.participantsCount || 0}/Ilimitado`
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AttachMoneyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Preço" 
                    secondary={
                      <Typography 
                        variant="body2" 
                        color={event.price === 0 ? "success.main" : "text.secondary"}
                        fontWeight={event.price === 0 ? "bold" : "normal"}
                      >
                        {formatPrice(event.price)}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Status de aprovação para eventos rejeitados */}
              {event.approvalStatus === 'rejected' && (
                <>
                  <Box sx={{ p: 2, mb: 2, borderRadius: 1, border: '1px solid', borderColor: 'error.main'}}>
                    <Typography variant="h6" fontWeight="bold" color="error.dark">
                      Status: Rejeitado
                    </Typography>
                    {isOrganizer && (
                      <>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="error.dark">
                        Motivo da Rejeição
                      </Typography>
                      <Typography variant="body1" color="error.dark">
                        {approvalInfo?.rejectionReason || 'Nenhuma justificativa fornecida.'}
                      </Typography>
                      </>
                    )}
                  </Box>
                  <Divider sx={{ mt: 2 }} />
                  <Box sx={{ mt: 0, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="subtitle1" mb={1} color="error.dark">
                      Você precisa editar e reenviar este evento para aprovação.
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Como proceder:
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      1. Edite seu evento seguindo as orientações fornecidas no motivo da rejeição.
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      2. Ao salvar as alterações, seu evento será automaticamente reenviado para aprovação.
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      3. Um administrador revisará as alterações e aprovará ou rejeitará novamente seu evento.
                    </Typography>
                  </Box>
                </>
              )}

              {event.status !== 'canceled' && (
                <Box sx={{ mt: 2 }}>
                  {isOrganizer ? (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      startIcon={<EditIcon />}
                      onClick={handleEditEvent}
                    >
                      Editar Evento
                    </Button>
                  ) : isParticipating ? (
                    <Button 
                      variant="outlined" 
                      color="error" 
                      fullWidth
                      startIcon={<CancelIcon />}
                      onClick={handleCancelParticipation}
                    >
                      Cancelar Participação
                    </Button>
                  ) : (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      startIcon={<CheckIcon />}
                      onClick={handleParticipate}
                      disabled={event.capacity !== null && event.participantsCount >= event.capacity}
                    >
                      Participar do Evento
                    </Button>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de confirmação */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={confirmDialog.action} 
            color={confirmDialog.title.includes('Cancelar') ? "error" : "primary"}
            variant="contained"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EventDetailsPage; 