import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Avatar, 
  Button, 
  TextField, 
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import * as authService from '../services/authService';
import { Event } from '../services/eventService';
import defaultEventImage from '../assets/images/default-event.svg';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { authState, updateUserData } = useAuth();
  const { user } = authState;
  const { 
    loading: eventsLoading, 
    error: eventsError, 
    events: userEvents, 
    fetchMyEvents, 
    fetchParticipatingEvents,
    cancelEvent,
    cancelEventParticipation
  } = useEvents();

  // Estado para a interface
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Estado para o diálogo de confirmação
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: () => {}
  });

  // Estados para formulários
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    bio: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  // Carregar eventos com base na tab ativa
  useEffect(() => {
    if (tabValue === 0) {
      fetchMyEvents({ limit: 4 });
    } else if (tabValue === 1) {
      fetchParticipatingEvents({ limit: 4 });
    }
  }, [tabValue, fetchMyEvents, fetchParticipatingEvents]);

  // Manipulação das abas
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Manipulação do formulário de perfil
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await authService.updateProfile(profileForm);
      
      // Recarregar os dados do usuário para atualizar o contexto
      await updateUserData();
      
      setEditMode(false);
      setSnackbar({
        open: true,
        message: 'Perfil atualizado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar perfil. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Manipulação do formulário de senha
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    // Validação básica
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'As senhas não coincidem.',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await authService.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordDialogOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSnackbar({
        open: true,
        message: 'Senha atualizada com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar senha. Verifique se a senha atual está correta.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Manipulação do diálogo de senha
  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Função para gerar as iniciais do nome do usuário
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Renderizar mensagem quando não há eventos
  const renderEmptyState = (message: string) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      py: 8 
    }}>
      <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );

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

  // Formatar localização
  const formatLocation = (location: { city: string; state: string }) => {
    return `${location.city}, ${location.state}`;
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Manipular cancelamento de evento
  const handleCancelEvent = async (eventId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Cancelar Evento',
      message: 'Tem certeza que deseja cancelar este evento? Esta ação não pode ser desfeita.',
      action: async () => {
        try {
          await cancelEvent(eventId);
          setSnackbar({
            open: true,
            message: 'Evento cancelado com sucesso!',
            severity: 'success'
          });
          // Recarregar eventos
          fetchMyEvents();
          fetchParticipatingEvents();
        } catch {
          setSnackbar({
            open: true,
            message: 'Erro ao cancelar evento. Tente novamente.',
            severity: 'error'
          });
        }
      }
    });
  };

  // Manipular cancelamento de participação
  const handleCancelParticipation = async (eventId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Cancelar Participação',
      message: 'Tem certeza que deseja cancelar sua participação neste evento?',
      action: async () => {
        try {
          await cancelEventParticipation(eventId);
          setSnackbar({
            open: true,
            message: 'Participação cancelada com sucesso!',
            severity: 'success'
          });
          // Recarregar eventos
          fetchParticipatingEvents();
        } catch {
          setSnackbar({
            open: true,
            message: 'Erro ao cancelar participação. Tente novamente.',
            severity: 'error'
          });
        }
      }
    });
  };

  // Fechar diálogo de confirmação
  const handleCloseConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  // Renderizar card de evento
  const renderEventCard = (event: Event, isParticipatingTab: boolean = false) => (
    <Card key={event._id} sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      opacity: event.status === 'cancelado' ? 0.7 : 1
    }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
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
            justifyContent: 'center'
          }}>
            <Chip 
              label="CANCELADO" 
              color="error" 
              sx={{ fontWeight: 'bold', fontSize: '1rem' }}
            />
          </Box>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            {event.title}
          </Typography>
          <Chip 
            label={event.category.name} 
            size="small" 
            color="primary" 
            sx={{ ml: 1 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          {event.description.length > 120 
            ? `${event.description.substring(0, 120)}...` 
            : event.description}
        </Typography>

        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EventIcon color="action" fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {formatDate(event.date)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationIcon color="action" fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {formatLocation(event.location)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon color="action" fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {event.participantsCount || 0}/{event.capacity} participantes
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AttachMoneyIcon color="action" fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color={event.price === 0 ? "success.main" : "text.secondary"} fontWeight={event.price === 0 ? "bold" : "normal"}>
            {formatPrice(event.price)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              label={event.status === 'ativo' ? 'Ativo' :
                     event.status === 'inativo' ? 'Inativo' :
                     event.status === 'cancelado' ? 'Cancelado' : 'Finalizado'}
              size="small"
              color={event.status === 'ativo' ? "success" :
                     event.status === 'inativo' ? "warning" :
                     event.status === 'cancelado' ? "error" : "secondary"}
              variant="outlined"
            />
          </Box>
          <Box>
            {event.status !== 'cancelado' && event.approvalStatus === 'approved' && (
              <>
                <Button 
                  size="small" 
                  color="primary" 
                  onClick={() => navigate(`/events/edit/${event._id}`)}
                  startIcon={<EditIcon />}
                >
                  Editar
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  onClick={() => handleCancelEvent(event._id)}
                  startIcon={<CancelIcon />}
                  sx={{ ml: 1 }}
                >
                  Cancelar
                </Button>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
      <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate(`/events/${event._id}`)}
        >
          Ver Detalhes
        </Button>
        {event.status !== 'cancelado' && isParticipatingTab && (
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => handleCancelParticipation(event._id)}
          >
            Cancelar Participação
          </Button>
        )}
      </Box>
    </Card>
  );

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          Meu Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Visualize e gerencie seus dados pessoais e seus eventos na plataforma Eventor.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Seção de perfil do usuário */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem'
                }}
              >
                {getInitials(user.name)}
              </Avatar>
              
              {!editMode ? (
                <>
                  <Typography variant="h5" fontWeight="medium" align="center">
                    {user.name}
                  </Typography>
                  <Chip 
                    label={user.role === 'admin' ? 'Administrador' : 'Usuário'} 
                    color={user.role === 'admin' ? 'error' : 'primary'} 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                </>
              ) : (
                <TextField
                  fullWidth
                  label="Nome Completo"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  margin="normal"
                  variant="outlined"
                  autoFocus
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <List dense>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <EmailIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Email" 
                  secondary={user.email} 
                />
              </ListItem>

              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <PhoneIcon />
                  </Avatar>
                </ListItemAvatar>
                {!editMode ? (
                  <ListItemText 
                    primary="Telefone" 
                    secondary={user.phone || 'Não informado'} 
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="Telefone"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    margin="dense"
                    variant="outlined"
                    placeholder="(00) 00000-0000"
                  />
                )}
              </ListItem>

              <ListItem alignItems="flex-start" sx={{ display: 'block' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <InfoIcon />
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    Biografia
                  </Typography>
                </Box>
                
                {!editMode ? (
                  <Typography variant="body2" paragraph sx={{ ml: 7 }}>
                    {user.bio || 'Nenhuma biografia informada.'}
                  </Typography>
                ) : (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Biografia"
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    margin="dense"
                    variant="outlined"
                    placeholder="Conte um pouco sobre você..."
                    sx={{ ml: 0 }}
                  />
                )}
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              {!editMode ? (
                <>
                  <Button 
                    variant="contained" 
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                  >
                    Editar Perfil
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    startIcon={<LockIcon />}
                    onClick={handleOpenPasswordDialog}
                  >
                    Alterar Senha
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    Salvar
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setEditMode(false);
                      if (user) {
                        setProfileForm({
                          name: user.name || '',
                          phone: user.phone || '',
                          bio: user.bio || ''
                        });
                      }
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Seção de eventos e atividades */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="Abas do perfil">
                <Tab label="Meus Eventos" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
                <Tab label="Eventos Participando" id="profile-tab-1" aria-controls="profile-tabpanel-1" />
                <Tab label="Atividade Recente" id="profile-tab-2" aria-controls="profile-tabpanel-2" />
              </Tabs>
            </Box>

            {/* Conteúdo das abas */}
            <TabPanel value={tabValue} index={0}>
              {/* Eventos criados pelo usuário */}
              {eventsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : eventsError ? (
                <Box sx={{ py: 2 }}>
                  <Alert severity="error">{eventsError}</Alert>
                </Box>
              ) : userEvents && userEvents.length > 0 ? (
                <Grid container spacing={2}>
                  {userEvents.map((event) => (
                    <Grid item xs={12} sm={6} key={event._id}>
                      {renderEventCard(event, false)}
                    </Grid>
                  ))}
                </Grid>
              ) : (
                renderEmptyState("Você ainda não criou nenhum evento")
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {/* Eventos em que o usuário está participando */}
              {eventsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : eventsError ? (
                <Box sx={{ py: 2 }}>
                  <Alert severity="error">{eventsError}</Alert>
                </Box>
              ) : userEvents && userEvents.length > 0 ? (
                <Grid container spacing={2}>
                  {userEvents.map((event) => (
                    <Grid item xs={12} sm={6} key={event._id}>
                      {renderEventCard(event, true)}
                    </Grid>
                  ))}
                </Grid>
              ) : (
                renderEmptyState("Você ainda não está participando de nenhum evento")
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {/* Atividade recente */}
              {renderEmptyState("Nenhuma atividade recente para mostrar")}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo para alterar senha */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Alterar Senha</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Senha Atual"
              name="currentPassword"
              type="password"
              fullWidth
              variant="outlined"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              autoFocus
            />
            <TextField
              label="Nova Senha"
              name="newPassword"
              type="password"
              fullWidth
              variant="outlined"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
            />
            <TextField
              label="Confirmar Nova Senha"
              name="confirmPassword"
              type="password"
              fullWidth
              variant="outlined"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              error={passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== ''}
              helperText={
                passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== '' 
                  ? "As senhas não coincidem" 
                  : ""
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={handleChangePassword} 
            color="primary" 
            variant="contained"
            disabled={
              loading || 
              !passwordForm.currentPassword || 
              !passwordForm.newPassword || 
              passwordForm.newPassword !== passwordForm.confirmPassword
            }
          >
            {loading ? <CircularProgress size={24} /> : "Alterar Senha"}
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

      {/* Diálogo de confirmação */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography id="confirm-dialog-description">
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              confirmDialog.action();
              handleCloseConfirmDialog();
            }} 
            color={confirmDialog.title.includes('Cancelar') ? "error" : "primary"}
            variant="contained"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage; 