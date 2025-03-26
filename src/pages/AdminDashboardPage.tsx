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
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
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
    setAnchorEl(null);
    setSelectedEventId(null);
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

  const handleApproveEvent = async () => {
    if (!selectedEventId) return;
    
    try {
      await approveEvent(selectedEventId);
      handleMenuClose();
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

  const handleOpenRejectDialog = () => {
    setOpenRejectDialog(true);
    handleMenuClose();
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectionReason('');
  };

  const handleRejectEvent = async () => {
    if (!selectedEventId || rejectionReason.trim() === '') return;
    
    try {
      await rejectEvent(selectedEventId, rejectionReason);
      setRejectionReason('');
      handleCloseRejectDialog();
      handleMenuClose();
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

  const handleDeleteEvent = async () => {
    if (!selectedEventId) return;
    
    try {
      await deleteEvent(selectedEventId);
      handleMenuClose();
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

  // Ativar evento
  const handleActivateEvent = async () => {
    if (!selectedEventId) return;
    
    try {
      await activateEvent(selectedEventId);
      handleMenuClose();
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

  // Inativar evento
  const handleDeactivateEvent = async () => {
    if (!selectedEventId) return;
    
    try {
      await deactivateEvent(selectedEventId);
      handleMenuClose();
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
                    <TableRow>
                      <TableCell>Título</TableCell>
                      <TableCell>Organizador</TableCell>
                      <TableCell>Categoria</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aprovação</TableCell>
                      <TableCell>Capacidade</TableCell>
                      <TableCell align="right">Ações</TableCell>
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
                      events.map((event) => (
                        <TableRow key={event._id}>
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
                          <TableCell align="right">
                            <IconButton
                              aria-label="ações"
                              aria-controls={`menu-${event._id}`}
                              aria-haspopup="true"
                              onClick={(e) => handleMenuOpen(e, event._id)}
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
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
              Visualizar
            </MenuItem>
            <MenuItem onClick={handleEditEvent}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Editar
            </MenuItem>
            
            {events.find(e => e._id === selectedEventId)?.approvalStatus === 'pending' && (
              <>
                <MenuItem onClick={handleApproveEvent}>
                  <CheckIcon fontSize="small" sx={{ mr: 1 }} color="success" />
                  Aprovar
                </MenuItem>
                <MenuItem onClick={handleOpenRejectDialog}>
                  <CloseIcon fontSize="small" sx={{ mr: 1 }} color="error" />
                  Rejeitar
                </MenuItem>
              </>
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
          <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog}>
            <DialogTitle>Rejeitar Evento</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Por favor, forneça um motivo para a rejeição deste evento. Este motivo será enviado ao organizador.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Motivo da rejeição"
                fullWidth
                multiline
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                variant="outlined"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseRejectDialog} color="primary">
                Cancelar
              </Button>
              <Button 
                onClick={handleRejectEvent} 
                color="error"
                disabled={rejectionReason.trim() === ''}
              >
                Rejeitar
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
      </Box>
    </Container>
  );
};

export default AdminDashboardPage; 