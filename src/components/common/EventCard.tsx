import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Box, 
  Typography, 
  Chip, 
  Button, 
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  Cancel as CancelIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Event } from '../../services/eventService';
import defaultEventImage from '../../assets/images/default-event.svg';

interface EventCardProps {
  event: Event;
  showEditButton?: boolean;
  showCancelButton?: boolean;
  showCancelParticipationButton?: boolean;
  onEdit?: (eventId: string) => void;
  onCancel?: (eventId: string) => void;
  onCancelParticipation?: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  showEditButton = false,
  showCancelButton = false,
  showCancelParticipationButton = false,
  onEdit,
  onCancel,
  onCancelParticipation
}) => {
  const navigate = useNavigate();
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openCancelParticipationDialog, setOpenCancelParticipationDialog] = useState(false);

  // Handlers for cancel event dialog
  const handleOpenCancelDialog = () => {
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };

  const handleConfirmCancel = () => {
    onCancel?.(event._id);
    setOpenCancelDialog(false);
  };

  // Handlers for cancel participation dialog
  const handleOpenCancelParticipationDialog = () => {
    setOpenCancelParticipationDialog(true);
  };

  const handleCloseCancelParticipationDialog = () => {
    setOpenCancelParticipationDialog(false);
  };

  const handleConfirmCancelParticipation = () => {
    onCancelParticipation?.(event._id);
    setOpenCancelParticipationDialog(false);
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

  // Formatar localização
  const formatLocation = (location: { city: string; state: string }) => {
    return `${location.city}, ${location.state}`;
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      opacity: event.status === 'canceled' ? 0.7 : 1,
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      borderRadius: 2,
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6
      }
    }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={event.imageUrl || defaultEventImage}
          alt={event.title}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultEventImage;
          }}
        />
        {event.status === 'canceled' && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }}>
            <Chip 
              label="CANCELADO" 
              color="error" 
              sx={{ 
                fontWeight: 'bold', 
                fontSize: '1rem',
                backgroundColor: 'rgba(211, 47, 47, 0.9)',
                color: 'white'
              }}
            />
          </Box>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ 
            fontWeight: 'bold',
            fontSize: '1.1rem',
            lineHeight: 1.3,
            flex: 1,
            mr: 2
          }}>
            {event.title}
          </Typography>
          <Chip 
            label={event.category.name} 
            size="small" 
            color="primary" 
            sx={{ 
              ml: 1,
              backgroundColor: 'primary.main',
              color: 'white'
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ 
          mb: 2,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {event.description}
        </Typography>

        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EventIcon color="action" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(event.date)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon color="action" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {formatLocation(event.location)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon color="action" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {event.capacity !== null 
                ? `${event.participantsCount || 0}/${event.capacity} participantes` 
                : `${event.participantsCount || 0}/∞ participantes`
              }
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoneyIcon color="action" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color={event.price === 0 ? "success.main" : "text.secondary"} 
              fontWeight={event.price === 0 ? "bold" : "normal"}>
              {formatPrice(event.price)}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 2
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`${event.approvalStatus === 'approved' ? 'Aprovado' : 
                     event.approvalStatus === 'rejected' ? 'Rejeitado' : 'Pendente'}`} 
              size="small" 
              color={event.approvalStatus === 'approved' ? "success" : 
                     event.approvalStatus === 'rejected' ? "error" : "warning"} 
              variant="outlined"
            />
            <Chip 
              label={event.status === 'active' ? 'Ativo' :
                     event.status === 'inactive' ? 'Inativo' :
                     event.status === 'canceled' ? 'Cancelado' : 'Finalizado'}
              size="small"
              color={event.status === 'active' ? "success" :
                     event.status === 'inactive' ? "warning" :
                     event.status === 'canceled' ? "error" : "secondary"}
              variant="outlined"
            />
          </Box>
          <Box sx={{ display: 'flex' }}>
            {event.status !== 'canceled' && event.approvalStatus === 'approved' && (
              <>
                {showEditButton && (
                  <Tooltip title="Editar evento" arrow>
                    <IconButton 
                      color="primary" 
                      onClick={() => onEdit?.(event._id)}
                      size="small"
                      sx={{ 
                        mr: 1,
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText'
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {showCancelButton && (
                  <Tooltip title="Cancelar evento" arrow>
                    <IconButton 
                      color="error" 
                      onClick={handleOpenCancelDialog}
                      size="small"
                      sx={{ 
                        '&:hover': {
                          backgroundColor: 'error.light',
                          color: 'error.contrastText'
                        }
                      }}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
          </Box>
        </Box>
      </CardContent>
      <Box sx={{ p: 3, pt: 0, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate(`/events/${event._id}`)}
          fullWidth
          sx={{ 
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: 2,
            py: 1
          }}
        >
          Ver Detalhes
        </Button>
        {showCancelParticipationButton && event.status !== 'canceled' && (
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleOpenCancelParticipationDialog}
            fullWidth
            sx={{ 
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: 2,
              py: 1,
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.contrastText',
                borderColor: 'error.main'
              }
            }}
            startIcon={<DeleteIcon />}
          >
            Cancelar Participação
          </Button>
        )}
      </Box>

      {/* Confirmation Dialog for Canceling Event */}
      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">
          Cancelar Evento
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Tem certeza que deseja cancelar o evento "{event.title}"? Esta ação não pode ser desfeita e todos os participantes serão notificados.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="primary">
            Voltar
          </Button>
          <Button 
            onClick={handleConfirmCancel} 
            color="error"
            variant="contained"
            startIcon={<CancelIcon />}
          >
            Confirmar Cancelamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Canceling Participation */}
      <Dialog
        open={openCancelParticipationDialog}
        onClose={handleCloseCancelParticipationDialog}
        aria-labelledby="cancel-participation-dialog-title"
        aria-describedby="cancel-participation-dialog-description"
      >
        <DialogTitle id="cancel-participation-dialog-title">
          Cancelar Participação
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-participation-dialog-description">
            Tem certeza que deseja cancelar sua participação no evento "{event.title}"? Se o evento tiver uma lista de espera, seu lugar pode ser ocupado por outra pessoa.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelParticipationDialog} color="primary">
            Voltar
          </Button>
          <Button 
            onClick={handleConfirmCancelParticipation} 
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Confirmar Cancelamento
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default EventCard; 