import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon,
  PendingActions as PendingActionsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { Event } from '../services/eventService';
import AdminNavigation from '../components/admin/AdminNavigation';

interface ApiResponse {
  success: boolean;
  message: string;
  event: Event;
}

const AdminPendingPage: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { user } = authState;
  const { 
    events, 
    loading, 
    error,
    fetchPendingEvents,
    approveEvent,
    rejectEvent
  } = useEvents();

  // Estados para diálogos
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Verificar se o usuário é admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Carregar eventos pendentes
  useEffect(() => {
    fetchPendingEvents();
  }, [fetchPendingEvents]);

  // Ações para eventos
  const handleApproveEvent = async (id?: string) => {
    const eventId = id || selectedEventId;
    if (!eventId) return;
    
    try {
      const response = await approveEvent(eventId) as unknown as ApiResponse;
      setSnackbar({
        open: true,
        message: response.message || 'Evento aprovado com sucesso!',
        severity: 'success'
      });
      // Recarregar eventos pendentes
      fetchPendingEvents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao aprovar evento';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleOpenRejectDialog = (id?: string) => {
    if (id) {
      setSelectedEventId(id);
    }
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectionReason('');
  };

  const handleRejectEvent = async () => {
    if (!selectedEventId || rejectionReason.trim() === '') return;
    
    try {
      const response = await rejectEvent(selectedEventId, rejectionReason) as unknown as ApiResponse;
      setRejectionReason('');
      handleCloseRejectDialog();
      setSnackbar({
        open: true,
        message: response.message || 'Evento rejeitado com sucesso!',
        severity: 'success'
      });
      // Recarregar eventos pendentes
      fetchPendingEvents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao rejeitar evento';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Renderizar informações do organizador
  const renderOrganizer = (organizer: { name: string; email: string }) => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" fontWeight="medium">
          {organizer.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {organizer.email}
        </Typography>
      </Box>
    );
  };

  // Renderizar categoria
  const renderCategory = (category: { name: string }) => {
    return (
      <Chip
        label={category.name}
        size="small"
        color="primary"
        variant="outlined"
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          Eventos Pendentes
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Gerencie os eventos que aguardam aprovação na plataforma.
          {events.length > 0 && ` (${events.length} eventos pendentes)`}
        </Typography>
      </Paper>

      <AdminNavigation />

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" component="h2">
            Lista de Eventos Pendentes
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Pendentes
            <PendingActionsIcon color="primary" />
            <Typography variant="h6" color="primary">
              {events.length}
            </Typography>
          </Box>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Título</TableCell>
                  <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Organizador</TableCell>
                  <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Categoria</TableCell>
                  <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Data de Criação</TableCell>
                  <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }} align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Nenhum evento pendente de aprovação.
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event, index) => (
                    <TableRow 
                      key={event._id} 
                      hover
                      sx={{ 
                        bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover',
                        '&:hover': {
                          bgcolor: 'action.selected',
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" fontWeight="medium">
                            {event.title}
                          </Typography>
                          {event.date && (
                            <Typography variant="caption" color="text.secondary">
                              Evento: {formatDate(event.date)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{renderOrganizer(event.organizer)}</TableCell>
                      <TableCell>{renderCategory(event.category)}</TableCell>
                      <TableCell>{formatDate(event.date)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Aprovar evento">
                            <IconButton 
                              color="success" 
                              size="small"
                              onClick={() => handleApproveEvent(event._id)}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rejeitar evento">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleOpenRejectDialog(event._id)}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Visualizar evento">
                            <IconButton 
                              size="small"
                              onClick={() => navigate(`/events/${event._id}`)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Diálogo de Rejeição */}
        <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog} fullWidth maxWidth="sm">
          <DialogTitle sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            Rejeitar Evento
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
              <InfoIcon color="info" sx={{ mr: 1, mt: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                Por favor, forneça um motivo para a rejeição deste evento. Este motivo será enviado ao organizador.
              </Typography>
            </Box>
            <TextField
              autoFocus
              margin="dense"
              label="Motivo da rejeição"
              fullWidth
              multiline
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              variant="outlined"
              required
              error={rejectionReason.trim() === ''}
              helperText={rejectionReason.trim() === '' && "O motivo é obrigatório."}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button onClick={handleCloseRejectDialog} color="inherit">
              Cancelar
            </Button>
            <Button 
              onClick={handleRejectEvent} 
              color="error"
              variant="contained"
              disabled={rejectionReason.trim() === ''}
            >
              Rejeitar Evento
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
      </Paper>
    </Container>
  );
};

export default AdminPendingPage; 