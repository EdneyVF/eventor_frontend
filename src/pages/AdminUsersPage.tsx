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

const AdminUsersPage: React.FC = () => {
  const { authState } = useAuth();
  const { user: currentUser } = authState;
  const navigate = useNavigate();
  
  // Usar o hook de usuários
  const { 
    users, 
    userStats, 
    loading, 
    error, 
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

  // Verificar se o usuário é admin e redirecionar se não for
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Carregar usuários ao iniciar
  useEffect(() => {
    const loadUsers = async () => {
      try {
        await fetchUsers({
          page: page + 1, // API usa base 1 para paginação
          limit: rowsPerPage,
          search: searchQuery || undefined,
          role: filterRole !== 'all' ? filterRole : undefined
        });
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    };
    
    loadUsers();
  }, [fetchUsers, page, rowsPerPage, searchQuery, filterRole]);

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
      navigate(`/admin/users/${selectedUserId}`);
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
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Erro ao atualizar usuário.',
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
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Erro ao deletar usuário.',
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
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Erro ao buscar estatísticas do usuário.',
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

  // Formatar data
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          Gerenciamento de Usuários
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Visualize, edite e gerencie os usuários da plataforma Eventor.
        </Typography>
      </Paper>

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
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Papel</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Criado em</TableCell>
                    <TableCell>Último Acesso</TableCell>
                    <TableCell>Ações</TableCell>
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
                    users.map((user) => (
                      <TableRow key={user._id} hover>
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
                            disabled={user._id === currentUser?._id} // Desabilitar ações para o usuário atual
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
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewUserProfile}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            Ver Perfil
          </MenuItem>
          <MenuItem onClick={handleOpenEditDialog}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem onClick={handleOpenStatsDialog}>
            <BarChartIcon fontSize="small" sx={{ mr: 1 }} />
            Estatísticas
          </MenuItem>
          <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Excluir
          </MenuItem>
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
        <Dialog open={openStatsDialog} onClose={handleCloseStatsDialog}>
          <DialogTitle>Estatísticas do Usuário</DialogTitle>
          <DialogContent>
            {userStats ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
                <Typography variant="body1">
                  <strong>Eventos organizados:</strong> {userStats.eventsOrganized}
                </Typography>
                <Typography variant="body1">
                  <strong>Eventos participando:</strong> {userStats.eventsParticipating}
                </Typography>
                <Typography variant="body1">
                  <strong>Eventos ativos:</strong> {userStats.activeEvents}
                </Typography>
                <Typography variant="body1">
                  <strong>Eventos cancelados:</strong> {userStats.canceledEvents}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStatsDialog} color="primary">
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