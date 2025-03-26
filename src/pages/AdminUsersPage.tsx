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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { UserUpdateData } from '../services/userService';
import AdminNavigation from '../components/admin/AdminNavigation';

const AdminUsersPage: React.FC = () => {
  const { authState } = useAuth();
  const { user: currentUser } = authState;
  const navigate = useNavigate();
  
  // Usar o hook de usuários
  const { 
    users, 
    userStats, 
    loading, 
    pagination, 
    fetchUsers, 
    updateUser, 
    deleteUser,
    fetchUserStats
  } = useUsers();
  
  // Estados para paginação e filtros
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  // Estados para diálogos
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStatsDialog, setOpenStatsDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<UserUpdateData>({
    name: '',
    email: '',
    role: 'user',
    phone: '',
    bio: ''
  });
  
  // Estado para menu de ações
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Estado para mensagens de sucesso/erro
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Estado para erros
  const [error, setError] = useState<string | null>(null);

  // Verificar se o usuário é admin e redirecionar se não for
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Carregar usuários ao iniciar e quando os filtros mudarem
  useEffect(() => {
    const loadUsers = async () => {
      if (currentUser?.role === 'admin') {
        try {
          setError(null);
          await fetchUsers({
            page: page + 1, // API usa base 1 para paginação
            limit: rowsPerPage,
            search: searchQuery || undefined,
            role: filterRole !== 'all' ? filterRole : undefined
          });
        } catch (err) {
          console.error('Erro ao carregar usuários:', err);
          setError(err instanceof Error ? err.message : 'Não foi possível carregar os usuários.');
        }
      }
    };
    
    loadUsers();
  }, [fetchUsers, page, rowsPerPage, searchQuery, filterRole, currentUser]);

  // Handlers para ações da tabela
  const handleChangePage = (_event: unknown, newPage: number) => {
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

  const handleRoleFilterChange = (event: SelectChangeEvent) => {
    setFilterRole(event.target.value);
    setPage(0);
  };

  // Menu de ações
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
    
    // Preencher o formulário de edição com os dados do usuário selecionado
    const selectedUser = users.find(u => u._id === userId);
    if (selectedUser) {
      setEditFormData({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        phone: selectedUser.phone || '',
        bio: selectedUser.bio || ''
      });
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Ações para usuários
  const handleViewUserProfile = () => {
    if (selectedUserId) {
      navigate(`/profile/${selectedUserId}`);
    }
    handleMenuClose();
  };

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
    handleMenuClose();
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleEditFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = event.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateUser = async () => {
    if (selectedUserId) {
      try {
        await updateUser(selectedUserId, editFormData);
        setSnackbar({
          open: true,
          message: 'Usuário atualizado com sucesso!',
          severity: 'success'
        });
        handleCloseEditDialog();
      } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Erro ao atualizar usuário.',
          severity: 'error'
        });
      }
    }
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleDeleteUser = async () => {
    if (selectedUserId) {
      try {
        await deleteUser(selectedUserId);
        setSnackbar({
          open: true,
          message: 'Usuário deletado com sucesso!',
          severity: 'success'
        });
        handleCloseDeleteDialog();
      } catch (err) {
        console.error('Erro ao deletar usuário:', err);
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Erro ao deletar usuário.',
          severity: 'error'
        });
      }
    }
  };

  const handleOpenStatsDialog = async () => {
    if (selectedUserId) {
      try {
        await fetchUserStats(selectedUserId);
        setOpenStatsDialog(true);
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Erro ao buscar estatísticas do usuário.',
          severity: 'error'
        });
      }
    }
    handleMenuClose();
  };

  const handleCloseStatsDialog = () => {
    setOpenStatsDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  // Renderizar chips de papel (role)
  const renderRoleChip = (role: string) => {
    switch (role) {
      case 'admin':
        return <Chip size="small" label="Admin" color="error" />;
      case 'user':
        return <Chip size="small" label="Usuário" color="primary" />;
      default:
        return <Chip size="small" label={role} />;
    }
  };

  // Formatação de data
  const formatDate = (dateString?: string) => {
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

  // Função auxiliar para formatar data de maneira concisa (apenas mês e ano)
  const formatMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleString('pt-BR', { month: 'long' }),
      year: date.toLocaleString('pt-BR', { year: 'numeric' })
    };
  };

  // Funções para renderização das estatísticas
  const renderParticipantsStats = (stats: typeof userStats) => {
    if (!stats || !stats.participantsStats || !stats.participantsStats.participantsByCategory) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Participação por Categoria
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'success.light' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'success.contrastText' }}>Categoria</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'success.contrastText' }}>Participantes</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'success.contrastText' }}>Proporção</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.participantsStats.participantsByCategory.map((category, index) => (
                <TableRow key={category.name} sx={{ bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover' }}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.count}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: `${Math.min((category.count / stats.participantsStats.totalParticipants) * 100, 100)}%`,
                          height: 8,
                          bgcolor: 'success.main',
                          borderRadius: 1,
                          minWidth: '8px'
                        }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderEventsByMonth = (stats: typeof userStats) => {
    if (!stats || !stats.eventsByMonth || stats.eventsByMonth.length === 0) return null;
    
    // Ordenar por data (mais recente primeiro)
    const sortedMonths = [...stats.eventsByMonth].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Limitar a 12 meses para melhor visualização
    const recentMonths = sortedMonths.slice(0, 12);
    
    // Calcular o valor máximo para as barras
    const maxCount = Math.max(...recentMonths.map(m => m.count), 1);
    
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Atividade ao Longo do Tempo (Últimos 12 meses)
        </Typography>
        
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'info.light' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'info.contrastText' }}>Mês</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'info.contrastText' }}>Ano</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'info.contrastText', width: '100px' }}>Eventos</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'info.contrastText' }}>Distribuição</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentMonths.map((month, index) => {
                const { month: monthName, year } = formatMonthYear(month.date);
                return (
                  <TableRow key={month.date} sx={{ bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover' }}>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{monthName}</TableCell>
                    <TableCell>{year}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={month.count} 
                        color={month.count > 0 ? "info" : "default"} 
                        size="small" 
                        variant={month.count === 0 ? "outlined" : "filled"}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: `${Math.min((month.count / maxCount) * 100, 100)}%`,
                            height: 8,
                            bgcolor: month.count > 0 ? 'info.main' : 'grey.300',
                            borderRadius: 1,
                            minWidth: month.count > 0 ? '8px' : '0',
                            transition: 'width 0.3s ease-in-out'
                          }}
                        />
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          {month.count > 0 
                            ? `${Math.round((month.count / maxCount) * 100)}%` 
                            : 'Sem eventos'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Renderizar card de resumo da participação
  const renderParticipationSummary = (stats: typeof userStats) => {
    if (!stats || !stats.participantsStats) return null;
    
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        gap: 2, 
        flexWrap: 'wrap',
        mt: 3,
        mb: 3
      }}>
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            flex: 1, 
            p: 2, 
            minWidth: { xs: '100%', sm: '45%', md: '30%' }, 
            textAlign: 'center',
            bgcolor: 'secondary.light',
            color: 'secondary.contrastText',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" component="div" fontWeight="bold">
            {stats.participantsStats.totalParticipants}
          </Typography>
          <Typography variant="body2">
            Participantes Totais
          </Typography>
        </Paper>
        
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            flex: 1, 
            p: 2, 
            minWidth: { xs: '100%', sm: '45%', md: '30%' }, 
            textAlign: 'center',
            bgcolor: 'info.light',
            color: 'info.contrastText',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" component="div" fontWeight="bold">
            {stats.participantsStats.avgParticipantsPerEvent.toFixed(1)}
          </Typography>
          <Typography variant="body2">
            Média por Evento
          </Typography>
        </Paper>
        
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            flex: 1, 
            p: 2, 
            minWidth: { xs: '100%', sm: '45%', md: '30%' }, 
            textAlign: 'center',
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" component="div" fontWeight="bold">
            {stats.eventsOrganized}
          </Typography>
          <Typography variant="body2">
            Eventos Organizados
          </Typography>
        </Paper>
      </Box>
    );
  };

  const renderEventsComparisonChart = (stats: typeof userStats) => {
    if (!stats) return null;
    
    const activeEvents = stats.activeEvents || 0;
    const canceledEvents = stats.canceledEvents || 0;
    const totalEvents = activeEvents + canceledEvents;
    
    const activePercentage = totalEvents > 0 ? (activeEvents / totalEvents) * 100 : 0;
    const canceledPercentage = totalEvents > 0 ? (canceledEvents / totalEvents) * 100 : 0;
    
    return (
      <Box sx={{ 
        borderRadius: 2, 
        p: 3, 
        bgcolor: 'background.paper', 
        boxShadow: 1, 
        border: '1px solid',
        borderColor: 'divider',
        mt: { xs: 3, md: 0 },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="subtitle1" align="center" gutterBottom>
          Proporção de Eventos
        </Typography>
        
        <Box sx={{ 
          position: 'relative', 
          width: 150, 
          height: 150, 
          borderRadius: '50%',
          mb: 2,
          background: totalEvents === 0
            ? 'lightgrey'
            : `conic-gradient(
                #4caf50 0% ${activePercentage}%, 
                #f44336 ${activePercentage}% 100%
              )`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '70%',
            height: '70%',
            borderRadius: '50%',
            backgroundColor: 'background.paper',
          }
        }}>
          <Box sx={{ 
            position: 'relative', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1
          }}>
            <Typography variant="h5" fontWeight="bold">
              {totalEvents}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              Eventos Totais
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 16, 
              height: 16, 
              mr: 1, 
              borderRadius: 1,
              bgcolor: '#4caf50' 
            }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                Ativos
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {activeEvents}
                <Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
                  ({activePercentage.toFixed(0)}%)
                </Typography>
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 16, 
              height: 16, 
              mr: 1, 
              borderRadius: 1,
              bgcolor: '#f44336' 
            }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                Cancelados
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                {canceledEvents}
                <Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
                  ({canceledPercentage.toFixed(0)}%)
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          Gerenciamento de Usuários
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Gerencie os usuários da plataforma Eventor, seus papéis e permissões.
        </Typography>
      </Paper>

      <AdminNavigation />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" component="h2">
            Lista de Usuários
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Filtro de Papel (Role) */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Papel</InputLabel>
              <Select
                value={filterRole}
                label="Papel"
                name="role"
                onChange={handleRoleFilterChange}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="user">Usuários</MenuItem>
                <MenuItem value="admin">Administradores</MenuItem>
              </Select>
            </FormControl>

            {/* Campo de Busca */}
            <TextField
              placeholder="Buscar usuários..."
              size="small"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: '300px' } }}
            />
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
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
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Nome</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Email</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Papel</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Telefone</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Criado em</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Último Acesso</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user, index) => (
                      <TableRow 
                        key={user._id} 
                        hover
                        sx={{ 
                          bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover',
                          '&:hover': {
                            bgcolor: 'action.selected',
                          }
                        }}
                      >
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{renderRoleChip(user.role)}</TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{formatDate(user.lastLogin)}</TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleMenuOpen(e, user._id)}
                            aria-label="Ações do usuário"
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
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count}`
              }
            />
          </>
        )}

        {/* Menu de Ações */}
        <Menu
          id="user-actions-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleViewUserProfile}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            Ver Perfil
          </MenuItem>
          <MenuItem onClick={handleOpenStatsDialog}>
            <BarChartIcon fontSize="small" sx={{ mr: 1 }} />
            Estatísticas
          </MenuItem>
          
          {selectedUserId !== currentUser?._id && (
            <>
              <MenuItem onClick={handleOpenEditDialog}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Editar
              </MenuItem>
              <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Excluir
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Diálogo de Edição */}
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Nome"
                name="name"
                value={editFormData.name}
                onChange={handleEditFormChange}
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={editFormData.email}
                onChange={handleEditFormChange}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Papel</InputLabel>
                <Select
                  value={editFormData.role}
                  label="Papel"
                  name="role"
                  onChange={handleEditFormChange}
                >
                  <MenuItem value="user">Usuário</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Telefone"
                name="phone"
                value={editFormData.phone}
                onChange={handleEditFormChange}
                fullWidth
              />
              <TextField
                label="Biografia"
                name="bio"
                value={editFormData.bio}
                onChange={handleEditFormChange}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} color="primary" variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de Exclusão */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Excluir Usuário</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza de que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleDeleteUser} color="error">
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de Estatísticas */}
        <Dialog open={openStatsDialog} onClose={handleCloseStatsDialog} maxWidth="md" fullWidth>
          <DialogTitle>Estatísticas do Usuário</DialogTitle>
          <DialogContent>
            {userStats ? (
              <Box sx={{ pt: 2 }}>
                {/* Cards de resumo no topo */}
                {renderParticipationSummary(userStats)}
              
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Resumo de Eventos
                    </Typography>
                    
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'primary.light' }}>
                            <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Métrica</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Quantidade</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow sx={{ bgcolor: 'background.paper' }}>
                            <TableCell component="th" scope="row">Eventos organizados</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={userStats.eventsOrganized} 
                                color="primary" 
                                size="small" 
                                sx={{ minWidth: '60px' }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell component="th" scope="row">Eventos participando</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={userStats.eventsParticipating} 
                                color="primary" 
                                size="small" 
                                sx={{ minWidth: '60px' }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ bgcolor: 'background.paper' }}>
                            <TableCell component="th" scope="row">Eventos ativos</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={userStats.activeEvents} 
                                color="success" 
                                size="small" 
                                sx={{ minWidth: '60px' }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell component="th" scope="row">Eventos cancelados</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={userStats.canceledEvents} 
                                color="error" 
                                size="small" 
                                sx={{ minWidth: '60px' }}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    {/* Exibir estatísticas de participantes */}
                    {renderParticipantsStats(userStats)}
                  </Box>
                
                  <Box sx={{ flex: 1 }}>
                    {/* Resumo em círculo */}
                    {renderEventsComparisonChart(userStats)}
                  </Box>
                </Box>
                
                {/* Eventos por mês (toda a largura) */}
                {renderEventsByMonth(userStats)}
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'right' }}>
                  Estatísticas atualizadas em: {new Date().toLocaleString('pt-BR')}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStatsDialog} color="primary" variant="contained">
              Fechar
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

export default AdminUsersPage; 