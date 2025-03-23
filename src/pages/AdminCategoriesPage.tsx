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
  Add as AddIcon
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
    loading, 
    fetchCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategories();
  
  // Estado para busca
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para diálogos
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
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