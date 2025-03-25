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
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { CategoryCreateData, CategoryUpdateData } from '../services/categoryService';
import AdminNavigation from '../components/admin/AdminNavigation';

const AdminCategoriesPage: React.FC = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const navigate = useNavigate();
  
  // Usar o hook de categorias
  const { 
    categories, 
    categoryStats,
    loading, 
    error, 
    fetchCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    fetchCategoryStats 
  } = useCategories();
  
  // Estado para busca
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para diálogos
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStatsDialog, setOpenStatsDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Estado para formulários
  const [createFormData, setCreateFormData] = useState<CategoryCreateData>({
    name: '',
    description: '',
    active: true
  });
  
  const [editFormData, setEditFormData] = useState<CategoryUpdateData>({
    name: '',
    description: '',
    active: true
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
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Carregar categorias ao iniciar
  useEffect(() => {
    const loadCategories = async () => {
      try {
        await fetchCategories();
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    
    loadCategories();
  }, [fetchCategories]);

  // Filtragem de categorias
  const filteredCategories = categories.filter(category => 
    searchQuery === '' || 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handlers de busca
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Menu de ações
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, categoryId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategoryId(categoryId);
    
    // Preencher o formulário de edição com os dados da categoria selecionada
    const selectedCategory = categories.find(c => c._id === categoryId);
    if (selectedCategory) {
      setEditFormData({
        name: selectedCategory.name,
        description: selectedCategory.description || '',
        active: selectedCategory.active
      });
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Ações para categorias
  const handleOpenCreateDialog = () => {
    setCreateFormData({
      name: '',
      description: '',
      active: true
    });
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleCreateFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateFormSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCreateFormData(prev => ({
      ...prev,
      active: event.target.checked
    }));
  };

  const handleCreateCategory = async () => {
    try {
      await createCategory(createFormData);
      setSnackbar({
        open: true,
        message: 'Categoria criada com sucesso!',
        severity: 'success'
      });
      handleCloseCreateDialog();
    } catch {
      setSnackbar({
        open: true,
        message: 'Erro ao criar categoria.',
        severity: 'error'
      });
    }
  };

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
    handleMenuClose();
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleEditFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFormSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditFormData(prev => ({
      ...prev,
      active: event.target.checked
    }));
  };

  const handleUpdateCategory = async () => {
    if (selectedCategoryId) {
      try {
        await updateCategory(selectedCategoryId, editFormData);
        setSnackbar({
          open: true,
          message: 'Categoria atualizada com sucesso!',
          severity: 'success'
        });
        handleCloseEditDialog();
      } catch {
        setSnackbar({
          open: true,
          message: 'Erro ao atualizar categoria.',
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

  const handleDeleteCategory = async () => {
    if (selectedCategoryId) {
      try {
        await deleteCategory(selectedCategoryId);
        setSnackbar({
          open: true,
          message: 'Categoria deletada com sucesso!',
          severity: 'success'
        });
        handleCloseDeleteDialog();
      } catch {
        setSnackbar({
          open: true,
          message: 'Erro ao deletar categoria.',
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  // Renderizar status da categoria
  const renderStatusChip = (active: boolean) => {
    return active ? 
      <Chip size="small" label="Ativa" color="success" /> : 
      <Chip size="small" label="Inativa" color="error" />;
  };

  const handleOpenStatsDialog = async () => {
    if (selectedCategoryId) {
      try {
        await fetchCategoryStats(selectedCategoryId);
        setOpenStatsDialog(true);
      } catch (err) {
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Erro ao buscar estatísticas da categoria',
          severity: 'error'
        });
      }
    }
    handleMenuClose();
  };

  const handleCloseStatsDialog = () => {
    setOpenStatsDialog(false);
  };

  // Renderização de componentes para estatísticas de categoria
  const renderEventsByStatus = (stats: typeof categoryStats) => {
    if (!stats) return null;
    
    return (
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Quantidade</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ bgcolor: 'background.paper' }}>
              <TableCell component="th" scope="row">Ativos</TableCell>
              <TableCell align="center">
                <Chip 
                  label={stats.eventsByStatus.active} 
                  color="success" 
                  size="small" 
                  sx={{ minWidth: '60px' }}
                />
              </TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell component="th" scope="row">Cancelados</TableCell>
              <TableCell align="center">
                <Chip 
                  label={stats.eventsByStatus.canceled} 
                  color="error" 
                  size="small" 
                  sx={{ minWidth: '60px' }}
                />
              </TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: 'background.paper' }}>
              <TableCell component="th" scope="row">Finalizados</TableCell>
              <TableCell align="center">
                <Chip 
                  label={stats.eventsByStatus.finished} 
                  color="info" 
                  size="small" 
                  sx={{ minWidth: '60px' }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderCategoryStatsSummary = (stats: typeof categoryStats) => {
    if (!stats) return null;
    
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
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" component="div" fontWeight="bold">
            {stats.eventsCount}
          </Typography>
          <Typography variant="body2">
            Total de Eventos
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
            bgcolor: 'secondary.light',
            color: 'secondary.contrastText',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" component="div" fontWeight="bold">
            {stats.totalParticipants}
          </Typography>
          <Typography variant="body2">
            Total de Participantes
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
            {stats.avgParticipantsPerEvent.toFixed(1)}
          </Typography>
          <Typography variant="body2">
            Média por Evento
          </Typography>
        </Paper>
      </Box>
    );
  };

  const renderEventsDistribution = (stats: typeof categoryStats) => {
    if (!stats) return null;
    
    // Calcular os percentuais
    const total = stats.eventsCount;
    const activePercent = total > 0 ? Math.round((stats.eventsByStatus.active / total) * 100) : 0;
    const canceledPercent = total > 0 ? Math.round((stats.eventsByStatus.canceled / total) * 100) : 0;
    const finishedPercent = total > 0 ? Math.round((stats.eventsByStatus.finished / total) * 100) : 0;
    
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
        flexDirection: 'column'
      }}>
        <Typography variant="subtitle1" gutterBottom>
          Distribuição de Eventos
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Ativos ({activePercent}%)
          </Typography>
          <Box sx={{ height: 8, bgcolor: 'grey.300', borderRadius: 4, mb: 2, position: 'relative' }}>
            <Box 
              sx={{ 
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${activePercent}%`,
                bgcolor: 'success.main',
                borderRadius: 4
              }}
            />
          </Box>
          
          <Typography variant="body2" gutterBottom>
            Cancelados ({canceledPercent}%)
          </Typography>
          <Box sx={{ height: 8, bgcolor: 'grey.300', borderRadius: 4, mb: 2, position: 'relative' }}>
            <Box 
              sx={{ 
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${canceledPercent}%`,
                bgcolor: 'error.main',
                borderRadius: 4
              }}
            />
          </Box>
          
          <Typography variant="body2" gutterBottom>
            Finalizados ({finishedPercent}%)
          </Typography>
          <Box sx={{ height: 8, bgcolor: 'grey.300', borderRadius: 4, mb: 2, position: 'relative' }}>
            <Box 
              sx={{ 
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${finishedPercent}%`,
                bgcolor: 'info.main',
                borderRadius: 4
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          Gerenciamento de Categorias
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Crie, edite e gerencie categorias para eventos na plataforma Eventor.
        </Typography>
      </Paper>

      <AdminNavigation />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" component="h2">
            Lista de Categorias
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Buscar categorias..."
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
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              Nova Categoria
            </Button>
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
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Nenhuma categoria encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category._id} hover>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.description || '-'}</TableCell>
                      <TableCell>{renderStatusChip(category.active)}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, category._id)}
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
        )}

        {/* Menu de Ações */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
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

        {/* Diálogo de Criação */}
        <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Nome"
                name="name"
                value={createFormData.name}
                onChange={handleCreateFormChange}
                fullWidth
                required
              />
              <TextField
                label="Descrição"
                name="description"
                value={createFormData.description}
                onChange={handleCreateFormChange}
                multiline
                rows={3}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={createFormData.active} 
                    onChange={handleCreateFormSwitchChange} 
                    name="active" 
                    color="primary"
                  />
                }
                label="Categoria Ativa"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateDialog} color="primary">
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateCategory} 
              color="primary" 
              variant="contained"
              disabled={!createFormData.name.trim()}
            >
              Criar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de Edição */}
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Nome"
                name="name"
                value={editFormData.name}
                onChange={handleEditFormChange}
                fullWidth
                required
              />
              <TextField
                label="Descrição"
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
                multiline
                rows={3}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={editFormData.active} 
                    onChange={handleEditFormSwitchChange} 
                    name="active" 
                    color="primary"
                  />
                }
                label="Categoria Ativa"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} color="primary">
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateCategory} 
              color="primary" 
              variant="contained"
              disabled={!editFormData.name?.trim()}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de Exclusão */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Excluir Categoria</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza de que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Nota: Categorias com eventos associados serão apenas desativadas, não excluídas.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleDeleteCategory} color="error">
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo para estatísticas da categoria */}
        <Dialog open={openStatsDialog} onClose={handleCloseStatsDialog} maxWidth="md" fullWidth>
          <DialogTitle>Estatísticas da Categoria</DialogTitle>
          <DialogContent>
            {categoryStats ? (
              <Box sx={{ pt: 2 }}>
                {/* Cards de resumo no topo */}
                {renderCategoryStatsSummary(categoryStats)}
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Status dos Eventos
                    </Typography>
                    {renderEventsByStatus(categoryStats)}
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    {renderEventsDistribution(categoryStats)}
                  </Box>
                </Box>
                
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

export default AdminCategoriesPage; 