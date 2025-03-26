import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import {
  Add as AddIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useCategories } from '../hooks/useCategories';
import { EventCreateData } from '../services/eventService';

interface EventFormData {
  title: string;
  description: string;
  date: Date | null;
  endDate: Date | null;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  category: string;
  capacity: number;
  price: number;
  imageUrl: string;
  tags: string[];
}

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Hooks para eventos e categorias
  const { createEvent, loading: eventLoading, error: eventError } = useEvents();
  const { categories, loading: categoriesLoading, error: categoriesError, fetchCategories } = useCategories();
  
  // Carregar categorias ao montar o componente
  useEffect(() => {
    fetchCategories().catch(err => {
      console.error('Erro ao carregar categorias:', err);
    });
  }, [fetchCategories]);
  
  // Estado do formulário
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: null,
    endDate: null,
    location: {
      address: '',
      city: '',
      state: '',
      country: 'Brasil'
    },
    category: '',
    capacity: 0,
    price: 0,
    imageUrl: '',
    tags: []
  });

  // Estados de UI
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Handler para mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Limpa erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Para campos aninhados (location)
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handler para mudanças nos campos numéricos
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Limpa erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Converte para número e permite apenas valores não negativos
    const numValue = Math.max(0, Number(value));
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  // Handler para mudanças no select de categoria
  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    
    // Limpa erro do campo quando o usuário seleciona algo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler para mudanças na data
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    // Limpa erro do campo quando o usuário seleciona uma data
    if (errors.date) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.date;
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      date: date ? date.toDate() : null
    }));
  };

  // Handler para mudanças na data de término
  const handleEndDateChange = (date: dayjs.Dayjs | null) => {
    // Limpa erro do campo quando o usuário seleciona uma data
    if (errors.endDate) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.endDate;
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      endDate: date ? date.toDate() : null
    }));
  };

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validação de título
    if (!formData.title.trim()) {
      newErrors.title = 'O título é obrigatório';
    } else if (formData.title.length < 3) {
      newErrors.title = 'O título deve ter pelo menos 3 caracteres';
    } else if (formData.title.length > 100) {
      newErrors.title = 'O título deve ter no máximo 100 caracteres';
    }
    
    // Validação de descrição
    if (!formData.description.trim()) {
      newErrors.description = 'A descrição é obrigatória';
    } else if (formData.description.length < 10) {
      newErrors.description = 'A descrição deve ter pelo menos 10 caracteres';
    }
    
    // Validação de data
    if (!formData.date) {
      newErrors.date = 'A data e hora são obrigatórias';
    } else {
      const now = new Date();
      if (formData.date <= now) {
        newErrors.date = 'A data do evento deve ser futura';
      }
    }
    
    // Validação de data de término (se informada)
    if (formData.endDate && formData.date && formData.endDate <= formData.date) {
      newErrors.endDate = 'A data de término deve ser posterior à data de início';
    }
    
    // Validação dos campos de localização
    if (!formData.location.address.trim()) {
      newErrors['location.address'] = 'O endereço é obrigatório';
    }
    
    if (!formData.location.city.trim()) {
      newErrors['location.city'] = 'A cidade é obrigatória';
    }
    
    if (!formData.location.state.trim()) {
      newErrors['location.state'] = 'O estado é obrigatório';
    }
    
    // Validação de categoria
    if (!formData.category) {
      newErrors.category = 'A categoria é obrigatória';
    }
    
    // Validação de capacidade
    if (formData.capacity < 0) {
      newErrors.capacity = 'A capacidade deve ser um valor não-negativo';
    }
    
    // Validação de preço
    if (formData.price < 0) {
      newErrors.price = 'O preço deve ser um valor não-negativo';
    }
    
    // Validação de tags (se existirem)
    if (formData.tags.length > 10) {
      newErrors.tags = 'Máximo de 10 tags permitidas';
    }
    
    formData.tags.forEach((tag, index) => {
      if (tag.length < 3 || tag.length > 30) {
        newErrors[`tags[${index}]`] = 'Cada tag deve ter entre 3 e 30 caracteres';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Preparar dados para envio
  const prepareSubmitData = (): EventCreateData => {
    return {
      title: formData.title,
      description: formData.description,
      date: formData.date ? formData.date.toISOString() : '',
      endDate: formData.endDate ? formData.endDate.toISOString() : undefined,
      location: {
        address: formData.location.address,
        city: formData.location.city,
        state: formData.location.state,
        country: formData.location.country
      },
      category: formData.category,
      capacity: formData.capacity === 0 ? null : formData.capacity,
      price: formData.price,
      tags: formData.tags.length > 0 ? formData.tags : undefined
    };
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const eventData = prepareSubmitData();
      const result = await createEvent(eventData);
      
      setAlert({
        type: 'success',
        message: result.message || 'Evento criado com sucesso!'
      });
      
      // Redirecionar após um breve delay
      setTimeout(() => {
        navigate('/my-events');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao criar evento. Tente novamente.'
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Alerta de sucesso ou erro */}
        {(alert || eventError) && (
          <Alert 
            severity={alert?.type || 'error'} 
            sx={{ mb: 3 }}
            onClose={() => setAlert(null)}
          >
            {alert?.message || eventError}
          </Alert>
        )}

        {/* Cabeçalho da página */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EventIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
            <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
              Criar Novo Evento
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Preencha os detalhes do seu evento. Os campos obrigatórios estão marcados.
          </Typography>
        </Paper>

        {/* Formulário de criação de evento */}
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Informações básicas */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Informações Básicas
                </Typography>
              </Grid>
              
              {/* Título */}
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Título do Evento"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Descrição */}
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Descrição"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  multiline
                  minRows={4}
                  error={!!errors.description}
                  helperText={errors.description}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Categoria */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.category} required>
                  <InputLabel id="category-label">Categoria</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={formData.category}
                    onChange={handleSelectChange}
                    label="Categoria"
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon color="action" />
                      </InputAdornment>
                    }
                    disabled={categoriesLoading}
                  >
                    {categoriesLoading ? (
                      <MenuItem value="">Carregando categorias...</MenuItem>
                    ) : (
                      categories.map(category => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.category && (
                    <Typography color="error" variant="caption">
                      {errors.category}
                    </Typography>
                  )}
                  {categoriesError && (
                    <Typography color="error" variant="caption">
                      Erro ao carregar categorias. Por favor, tente novamente.
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              {/* Data e Hora */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Data e Horário do Evento
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="Data e Hora de Início"
                      value={formData.date ? dayjs(formData.date) : null}
                      onChange={handleDateChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!errors.date,
                          helperText: errors.date || ''
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="Data e Hora de Término"
                      value={formData.endDate ? dayjs(formData.endDate) : null}
                      onChange={handleEndDateChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.endDate,
                          helperText: errors.endDate || ''
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              {/* Localização e Limites */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Localização e Limites
                </Typography>
              </Grid>
              
              {/* Endereço */}
              <Grid item xs={12}>
                <TextField
                  name="location.address"
                  label="Endereço"
                  value={formData.location.address}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  error={!!errors['location.address']}
                  helperText={errors['location.address']}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Cidade e Estado */}
              <Grid item xs={12} sm={6}>
                <TextField
                  name="location.city"
                  label="Cidade"
                  value={formData.location.city}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  error={!!errors['location.city']}
                  helperText={errors['location.city']}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="location.state"
                  label="Estado"
                  value={formData.location.state}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  error={!!errors['location.state']}
                  helperText={errors['location.state']}
                  required
                />
              </Grid>
              
              {/* País */}
              <Grid item xs={12} sm={6}>
                <TextField
                  name="location.country"
                  label="País"
                  value={formData.location.country}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  helperText="Se não informado, será considerado 'Brasil'"
                />
              </Grid>
              
              {/* Número máximo de participantes */}
              <Grid item xs={12} sm={6}>
                <TextField
                  name="capacity"
                  label="Capacidade (máx. de participantes)"
                  type="number"
                  value={formData.capacity}
                  onChange={handleNumberChange}
                  fullWidth
                  variant="outlined"
                  inputProps={{ min: 0 }}
                  error={!!errors.capacity}
                  helperText={errors.capacity || "Use 0 para capacidade ilimitada"}
                  required
                />
              </Grid>
              
              {/* Preço */}
              <Grid item xs={12} sm={6}>
                <TextField
                  name="price"
                  label="Preço (R$)"
                  type="number"
                  value={formData.price}
                  onChange={handleNumberChange}
                  fullWidth
                  variant="outlined"
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="Deixe 0 para eventos gratuitos"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              {/* Imagem */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Imagem do Evento
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="imageUrl"
                  label="URL da Imagem"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  helperText="Deixe em branco para usar uma imagem padrão"
                />
              </Grid>

              {/* Botões de ação */}
              <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={() => navigate('/my-events')}
                  disabled={eventLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  disabled={eventLoading}
                  startIcon={eventLoading ? <CircularProgress size={20} /> : <AddIcon />}
                >
                  {eventLoading ? 'Criando...' : 'Criar Evento'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateEventPage; 