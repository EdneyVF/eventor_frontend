import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Box, 
  Typography, 
  Chip, 
  Button, 
  Divider 
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  Cancel as CancelIcon
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
      opacity: event.status === 'cancelado' ? 0.7 : 1,
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3
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
        {event.status === 'cancelado' && (
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
              {event.participantsCount || 0}/{event.capacity} participantes
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
          <Box>
            {event.status !== 'cancelado' && event.approvalStatus === 'approved' && (
              <>
                {showEditButton && (
                  <Button 
                    size="small" 
                    color="primary" 
                    onClick={() => onEdit?.(event._id)}
                    startIcon={<EditIcon />}
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                )}
                {showCancelButton && (
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => onCancel?.(event._id)}
                    startIcon={<CancelIcon />}
                  >
                    Cancelar
                  </Button>
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
            fontWeight: 'bold'
          }}
        >
          Ver Detalhes
        </Button>
        {showCancelParticipationButton && event.status !== 'cancelado' && (
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => onCancelParticipation?.(event._id)}
            fullWidth
            sx={{ 
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Cancelar Participação
          </Button>
        )}
      </Box>
    </Card>
  );
};

export default EventCard; 