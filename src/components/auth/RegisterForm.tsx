import React, { useState, FormEvent } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  InputAdornment, 
  IconButton,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { RegisterData } from '../../types/auth';

interface RegisterFormProps {
  onSwitchForm: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchForm }) => {
  const { register, authState, clearError } = useAuth();
  const { loading, error } = authState;

  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    bio: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erros ao editar
    if (error) clearError();
    if (name === 'password') setPasswordError(null);
  };

  const validateForm = (): boolean => {
    // Verificação básica da senha
    if (formData.password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    await register(formData);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: { xs: '100%', sm: 450 },
        p: { xs: 2, sm: 2 },
        mx: 'auto',
        textAlign: 'center',
        alignItems: 'center'
      }}
    >
      <Typography variant="h5" component="h1" align="center" gutterBottom>
        Criar Conta
      </Typography>

      {error && (
        <Alert severity="error" onClose={clearError} sx={{ width: '100%' }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Nome Completo"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        required
        variant="outlined"
        sx={{ width: '100%' }}
      />

      <TextField
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        required
        autoComplete="email"
        variant="outlined"
      />

      <TextField
        label="Senha"
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        required
        error={!!passwordError}
        helperText={passwordError}
        variant="outlined"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={toggleShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <TextField
        label="Telefone (opcional)"
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        fullWidth
        variant="outlined"
      />

      <TextField
        label="Biografia (opcional)"
        name="bio"
        value={formData.bio}
        onChange={handleChange}
        fullWidth
        multiline
        rows={2}
        variant="outlined"
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Cadastrar'}
      </Button>

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Já tem uma conta?{' '}
        <Button
          color="primary"
          onClick={onSwitchForm}
          sx={{ textTransform: 'none', p: 0, fontWeight: 'bold', verticalAlign: 'baseline' }}
        >
          Faça login
        </Button>
      </Typography>
    </Box>
  );
};

export default RegisterForm; 