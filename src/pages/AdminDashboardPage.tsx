import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import AdminNavigation from '../components/admin/AdminNavigation';

const AdminDashboardPage: React.FC = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const navigate = useNavigate();
  
  // Usar o hook de eventos
  const { 
    events, 
    loading, 
    error, 
    pagination, 
    fetchAllEvents, 
    approveEvent, 
    rejectEvent, 
    deleteEvent,
    activateEvent,
    deactivateEvent,
    counts 
  } = useEvents();
  
  // Estados para paginação e filtros
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterApproval, setFilterApproval] = useState<string>('all');
  
  // Estados para diálogos
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openActivateDialog, setOpenActivateDialog] = useState(false);
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Estado para menu de ações
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Estado para mensagens de sucesso/erro
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Verificar se o usuário é admin e redirecionar se não for
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Carregar eventos ao iniciar
  useEffect(() => {
    const loadEvents = async () => {
      try {
        await fetchAllEvents({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          approvalStatus: filterApproval !== 'all' ? filterApproval : undefined
        });
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    };
    
    loadEvents();
  }, [fetchAllEvents, page, rowsPerPage, searchQuery, filterStatus, filterApproval]);

  // Handlers para ações da tabela
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const handleApprovalFilterChange = (event: SelectChangeEvent) => {
    setFilterApproval(event.target.value);
    setPage(0);
  };

  // Menu de ações
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, eventId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedEventId(eventId);
  };

  const handleMenuClose = () => {
    // Só limpar o selectedEventId se nenhum diálogo estiver aberto
    if (!openApproveDialog && !openRejectDialog && !openDeleteDialog && 
        !openActivateDialog && !openDeactivateDialog) {
      setSelectedEventId(null);
    }
    setAnchorEl(null);
  };

  // Ações para eventos
  const handleViewEvent = () => {
    if (selectedEventId) {
      navigate(`/events/${selectedEventId}`);
    }
    handleMenuClose();
  };

  const handleEditEvent = () => {
    if (selectedEventId) {
      navigate(`/events/edit/${selectedEventId}`);
    }
    handleMenuClose();
  };

  // Restaurar estas funções
  const handleApproveEvent = async () => {
    // Manter o ID para o diálogo primeiro
    setOpenApproveDialog(true);
    // Depois fechar o menu
    setAnchorEl(null);
  };

  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
    // Limpar o ID selecionado somente quando todos os diálogos estiverem fechados
    if (!openRejectDialog && !openDeleteDialog && !openActivateDialog && !openDeactivateDialog) {
      setSelectedEventId(null);
    }
  };

  const handleOpenRejectDialog = () => {
    // Manter o ID para o diálogo primeiro
    setOpenRejectDialog(true);
    // Depois fechar o menu
    setAnchorEl(null);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectionReason('');
    // Limpar o ID selecionado somente quando todos os diálogos estiverem fechados
    if (!openApproveDialog && !openDeleteDialog && !openActivateDialog && !openDeactivateDialog) {
      setSelectedEventId(null);
    }
  };

  const handleDeleteEvent = async () => {
    // Manter o ID para o diálogo primeiro
    setOpenDeleteDialog(true);
    // Depois fechar o menu
    setAnchorEl(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    // Limpar o ID selecionado somente quando todos os diálogos estiverem fechados
    if (!openApproveDialog && !openRejectDialog && !openActivateDialog && !openDeactivateDialog) {
      setSelectedEventId(null);
    }
  };

  // Ativar evento
  const handleActivateEvent = async () => {
    // Manter o ID para o diálogo primeiro
    setOpenActivateDialog(true);
    // Depois fechar o menu
    setAnchorEl(null);
  };

  const handleCloseActivateDialog = () => {
    setOpenActivateDialog(false);
    // Limpar o ID selecionado somente quando todos os diálogos estiverem fechados
    if (!openApproveDialog && !openRejectDialog && !openDeleteDialog && !openDeactivateDialog) {
      setSelectedEventId(null);
    }
  };

  // Inativar evento
  const handleDeactivateEvent = async () => {
    // Manter o ID para o diálogo primeiro
    setOpenDeactivateDialog(true);
    // Depois fechar o menu sem limpar o ID
    setAnchorEl(null);
  };

  const handleCloseDeactivateDialog = () => {
    setOpenDeactivateDialog(false);
    // Limpar o ID selecionado somente quando todos os diálogos estiverem fechados
    if (!openApproveDialog && !openRejectDialog && !openDeleteDialog && !openActivateDialog) {
      setSelectedEventId(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  // Formatar data
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

  // Renderizar chips de status
  const renderStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip size="small" label="Ativo" color="success" />;
      case 'inactive':
        return <Chip size="small" label="Inativo" color="warning" />;
      case 'canceled':
        return <Chip size="small" label="Cancelado" color="error" />;
      case 'finished':
        return <Chip size="small" label="Finalizado" color="secondary" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  // Renderizar chips de status de aprovação
  const renderApprovalStatusChip = (status: string) => {
    switch (status) {
      case 'approved':
        return <Chip size="small" label="Aprovado" color="success" icon={<CheckIcon />} />;
      case 'rejected':
        return <Chip size="small" label="Rejeitado" color="error" icon={<CloseIcon />} />;
      case 'pending':
        return <Chip size="small" label="Pendente" color="warning" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  // Componente de diálogo de aprovação
  const Approve = () => {
    // Capturar o ID diretamente
    const dialogEventId = selectedEventId;
    
    // Função local para confirmar aprovação
    const confirmApprove = async () => {
      if (!dialogEventId) {
        return;
      }
      
      try {
        await approveEvent(dialogEventId);
        setOpenApproveDialog(false);
        setSnackbar({
          open: true,
          message: 'Evento aprovado com sucesso!',
          severity: 'success'
        });
        // Recarregar eventos
        fetchAllEvents({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          approvalStatus: filterApproval !== 'all' ? filterApproval : undefined
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Erro ao aprovar evento',
          severity: 'error'
        });
      }
    };
    
    return (
      <Dialog open={openApproveDialog} onClose={handleCloseApproveDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
          Aprovar Evento
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {dialogEventId && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {events.find(e => e._id === dialogEventId)?.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">
                  <strong>Organizador:</strong> {events.find(e => e._id === dialogEventId)?.organizer.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Categoria:</strong> {events.find(e => e._id === dialogEventId)?.category.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Data:</strong> {events.find(e => e._id === dialogEventId)?.date ? formatDate(events.find(e => e._id === dialogEventId)?.date || '') : '-'}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
            <InfoIcon color="info" sx={{ mr: 1, mt: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              Ao aprovar este evento, ele ficará visível para todos os usuários e poderá receber inscrições imediatamente.
            </Typography>
          </Box>
          <Typography variant="body2">
            Deseja aprovar este evento?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleCloseApproveDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              confirmApprove();
            }} 
            color="success"
            variant="contained"
          >
            Aprovar Evento
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Componente de diálogo de rejeição
  const Reject = () => {
    // Capturar o ID diretamente
    const dialogEventId = selectedEventId;
    
    // Função local para confirmar rejeição
    const confirmReject = async () => {
      if (!dialogEventId) {
        return;
      }
      if (rejectionReason.trim() === '') {
        return;
      }
      
      try {
        await rejectEvent(dialogEventId, rejectionReason);
        setRejectionReason('');
        handleCloseRejectDialog();
        setSnackbar({
          open: true,
          message: 'Evento rejeitado com sucesso!',
          severity: 'success'
        });
        // Recarregar eventos
        fetchAllEvents({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          approvalStatus: filterApproval !== 'all' ? filterApproval : undefined
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Erro ao rejeitar evento',
          severity: 'error'
        });
      }
    };
    
    return (
      <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
          Rejeitar Evento
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {dialogEventId && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {events.find(e => e._id === dialogEventId)?.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">
                  <strong>Organizador:</strong> {events.find(e => e._id === dialogEventId)?.organizer.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Categoria:</strong> {events.find(e => e._id === dialogEventId)?.category.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Data:</strong> {events.find(e => e._id === dialogEventId)?.date ? formatDate(events.find(e => e._id === dialogEventId)?.date || '') : '-'}
                </Typography>
              </Box>
            </Box>
          )}
          
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
            onClick={() => {
              confirmReject();
            }} 
            color="error"
            variant="contained"
            disabled={rejectionReason.trim() === ''}
          >
            Rejeitar Evento
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Componente de diálogo de exclusão
  const Delete = () => {
    // Capturar o ID diretamente
    const dialogEventId = selectedEventId;
    const selectedEvent = events.find(e => e._id === dialogEventId);
    const hasParticipants = selectedEvent?.participants ? selectedEvent.participants.length > 0 : false;
    const isInactive = selectedEvent?.status === 'inactive';
    
    // Função local para confirmar exclusão
    const confirmDelete = async () => {
      if (!dialogEventId) {
        return;
      }
      
      try {
        await deleteEvent(dialogEventId);
        setOpenDeleteDialog(false);
        setSnackbar({
          open: true,
          message: 'Evento excluído com sucesso!',
          severity: 'success'
        });
        // Recarregar eventos
        fetchAllEvents({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          approvalStatus: filterApproval !== 'all' ? filterApproval : undefined
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Erro ao excluir evento',
          severity: 'error'
        });
      }
    };
    
    return (
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: 'error.dark', color: 'error.contrastText' }}>
          Excluir Evento
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {dialogEventId && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {events.find(e => e._id === dialogEventId)?.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">
                  <strong>Organizador:</strong> {events.find(e => e._id === dialogEventId)?.organizer.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Categoria:</strong> {events.find(e => e._id === dialogEventId)?.category.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Data:</strong> {events.find(e => e._id === dialogEventId)?.date ? formatDate(events.find(e => e._id === dialogEventId)?.date || '') : '-'}
                </Typography>
                <Typography variant="body2">
                  <strong>Participantes:</strong> {events.find(e => e._id === dialogEventId)?.participants?.length || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {events.find(e => e._id === dialogEventId)?.status}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
            <InfoIcon color="warning" sx={{ mr: 1, mt: 0.5 }} />
            <Typography variant="body2" color="error">
              <strong>Atenção:</strong> Esta ação é irreversível. O evento será permanentemente excluído do sistema.
            </Typography>
          </Box>
          
          {hasParticipants && (
            <Box sx={{ display: 'flex', alignItems: 'start', mb: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
              <InfoIcon color="warning" sx={{ mr: 1, mt: 0.5 }} />
              <Typography variant="body2">
                <strong>Nota:</strong> Este evento possui participantes inscritos.
                {!isInactive ? (
                  <span> Eventos com participantes só podem ser excluídos quando estiverem inativos. Por favor, inative o evento primeiro.</span>
                ) : (
                  <span> Como o evento está inativo, você pode prosseguir com a exclusão.</span>
                )}
              </Typography>
            </Box>
          )}
          
          <Typography variant="body2" color="text.secondary">
            Tem certeza que deseja excluir este evento?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              confirmDelete();
            }} 
            color="error"
            variant="contained"
            disabled={hasParticipants && !isInactive}
          >
            Excluir Permanentemente
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Componente de diálogo de ativação
  const Activate = () => {
    // Capturar o ID diretamente
    const dialogEventId = selectedEventId;
    
    // Função local para confirmar ativação
    const confirmActivate = async () => {
      if (!dialogEventId) {
        return;
      }
      
      try {
        await activateEvent(dialogEventId);
        setOpenActivateDialog(false);
        setSnackbar({
          open: true,
          message: 'Evento ativado com sucesso!',
          severity: 'success'
        });
        // Recarregar eventos
        fetchAllEvents({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          approvalStatus: filterApproval !== 'all' ? filterApproval : undefined
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Erro ao ativar evento',
          severity: 'error'
        });
      }
    };
    
    return (
      <Dialog open={openActivateDialog} onClose={handleCloseActivateDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
          Ativar Evento
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {dialogEventId && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {events.find(e => e._id === dialogEventId)?.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">
                  <strong>Organizador:</strong> {events.find(e => e._id === dialogEventId)?.organizer.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Categoria:</strong> {events.find(e => e._id === dialogEventId)?.category.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Data:</strong> {events.find(e => e._id === dialogEventId)?.date ? formatDate(events.find(e => e._id === dialogEventId)?.date || '') : '-'}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
            <InfoIcon color="info" sx={{ mr: 1, mt: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              Ao ativar este evento, ele ficará visível para todos os usuários da plataforma e poderá receber inscrições.
            </Typography>
          </Box>
          <Typography variant="body2">
            Deseja ativar este evento?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleCloseActivateDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              confirmActivate();
            }} 
            color="success"
            variant="contained"
          >
            Ativar Evento
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Componente de diálogo de inativação
  const Deactivate = () => {
    // Em vez de usar o useState, vamos usar uma variável que captura o ID no momento da função
    // para garantir que temos o valor correto
    const dialogEventId = selectedEventId;
    
    // Função local para confirmar desativação
    const confirmDeactivate = async () => {
      if (!dialogEventId) {
        return;
      }
      
      try {
        await deactivateEvent(dialogEventId);
        setOpenDeactivateDialog(false);
        setSnackbar({
          open: true,
          message: 'Evento inativado com sucesso!',
          severity: 'success'
        });
        // Recarregar eventos
        fetchAllEvents({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          approvalStatus: filterApproval !== 'all' ? filterApproval : undefined
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Erro ao inativar evento',
          severity: 'error'
        });
      }
    };
    
    return (
      <Dialog open={openDeactivateDialog} onClose={handleCloseDeactivateDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          Inativar Evento
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {dialogEventId && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {events.find(e => e._id === dialogEventId)?.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">
                  <strong>Organizador:</strong> {events.find(e => e._id === dialogEventId)?.organizer.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Categoria:</strong> {events.find(e => e._id === dialogEventId)?.category.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Data:</strong> {events.find(e => e._id === dialogEventId)?.date ? formatDate(events.find(e => e._id === dialogEventId)?.date || '') : '-'}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
            <InfoIcon color="warning" sx={{ mr: 1, mt: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              Ao inativar este evento, ele ficará oculto para usuários não-administrativos e não poderá receber inscrições.
            </Typography>
          </Box>
          <Typography variant="body2">
            Deseja inativar este evento?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleCloseDeactivateDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              confirmDeactivate();
            }} 
            color="warning"
            variant="contained"
          >
            Inativar Evento
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          Gerenciamento de Eventos
        </Typography>
        
        <AdminNavigation />
        
        {/* Seção de estatísticas */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Estatísticas de Eventos
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Chip 
              label={`Total: ${counts.total}`} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={`Ativos: ${counts.active}`} 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              label={`Inativos: ${counts.inactive}`} 
              color="default" 
              variant="outlined" 
            />
            <Chip 
              label={`Cancelados: ${counts.canceled}`} 
              color="error" 
              variant="outlined" 
            />
            <Chip 
              label={`Finalizados: ${counts.finished}`} 
              color="secondary" 
              variant="outlined" 
            />
            <Chip 
              label={`Pendentes: ${counts.pending}`} 
              color="warning" 
              variant="outlined" 
            />
            <Chip 
              label={`Aprovados: ${counts.approved}`} 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              label={`Rejeitados: ${counts.rejected}`} 
              color="error" 
              variant="outlined" 
            />
          </Box>
        </Paper>
        
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Todos os Eventos
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <TextField
              label="Buscar eventos"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={filterStatus}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Ativos</MenuItem>
                <MenuItem value="inactive">Inativos</MenuItem>
                <MenuItem value="canceled">Cancelados</MenuItem>
                <MenuItem value="finished">Finalizados</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="approval-filter-label">Aprovação</InputLabel>
              <Select
                labelId="approval-filter-label"
                id="approval-filter"
                value={filterApproval}
                label="Aprovação"
                onChange={handleApprovalFilterChange}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="pending">Pendentes</MenuItem>
                <MenuItem value="approved">Aprovados</MenuItem>
                <MenuItem value="rejected">Rejeitados</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/events/create')}
              size="small"
              sx={{ marginLeft: 'auto' }}
            >
              Criar Evento
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Título</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Organizador</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Categoria</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Data</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Status</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Aprovação</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Capacidade</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }} align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          Nenhum evento encontrado
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
                          <TableCell>{event.title}</TableCell>
                          <TableCell>{event.organizer.name}</TableCell>
                          <TableCell>{event.category.name}</TableCell>
                          <TableCell>{formatDate(event.date)}</TableCell>
                          <TableCell>{renderStatusChip(event.status)}</TableCell>
                          <TableCell>{renderApprovalStatusChip(event.approvalStatus)}</TableCell>
                          <TableCell>
                            <Chip
                              label={event.capacity ? `${event.capacity} pessoas` : 'Ilimitado'}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Mais ações">
                              <IconButton
                                aria-label="ações"
                                aria-controls={`menu-${event._id}`}
                                aria-haspopup="true"
                                onClick={(e) => handleMenuOpen(e, event._id)}
                                size="small"
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            
              <TablePagination
                component="div"
                count={pagination.total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Eventos por página:"
              />
            </>
          )}

          {/* Menu de Ações */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleViewEvent}>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
              Visualizar
            </MenuItem>
            <MenuItem onClick={handleEditEvent}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Editar
            </MenuItem>
            
            {/* Opção para Aprovar - apenas se o evento estiver pendente */}
            {events.find(e => e._id === selectedEventId)?.approvalStatus === 'pending' && (
              <MenuItem onClick={handleApproveEvent}>
                <CheckIcon fontSize="small" sx={{ mr: 1 }} color="success" />
                Aprovar
              </MenuItem>
            )}
            
            {/* Opção para Rejeitar - apenas se o evento estiver pendente */}
            {events.find(e => e._id === selectedEventId)?.approvalStatus === 'pending' && (
              <MenuItem onClick={handleOpenRejectDialog}>
                <CloseIcon fontSize="small" sx={{ mr: 1 }} color="error" />
                Rejeitar
              </MenuItem>
            )}
            
            {/* Opção para Ativar - apenas se o evento estiver inativo e aprovado */}
            {events.find(e => e._id === selectedEventId)?.status === 'inactive' && 
             events.find(e => e._id === selectedEventId)?.approvalStatus === 'approved' && (
              <MenuItem onClick={handleActivateEvent}>
                <CheckIcon fontSize="small" sx={{ mr: 1 }} color="success" />
                Ativar
              </MenuItem>
            )}
            
            {/* Opção para Inativar - apenas se o evento estiver ativo */}
            {events.find(e => e._id === selectedEventId)?.status === 'active' && (
              <MenuItem onClick={handleDeactivateEvent}>
                <CloseIcon fontSize="small" sx={{ mr: 1 }} color="warning" />
                Inativar
              </MenuItem>
            )}
            
            <MenuItem onClick={handleDeleteEvent} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Excluir
            </MenuItem>
          </Menu>

          {/* Diálogo de Rejeição */}
          {Reject()}

          {/* Diálogo de Exclusão */}
          {Delete()}

          {/* Diálogo de Ativação */}
          {Activate()}

          {/* Diálogo de Inativação */}
          {Deactivate()}

          {/* Diálogo de Aprovação */}
          {Approve()}

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
      </Box>
    </Container>
  );
};

export default AdminDashboardPage; 