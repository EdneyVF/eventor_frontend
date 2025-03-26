import React, { useState, FormEvent } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  InputAdornment, 
  IconButton,
  Alert,
  CircularProgress,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { RegisterData } from '../../types/auth';

interface RegisterFormProps {
  onSwitchForm: () => void;
}

interface PasswordValidation {
  minLength: boolean;
  hasNumber: boolean;
  hasLetter: boolean;
  hasSpecialChar: boolean;
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
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasNumber: false,
    hasLetter: false,
    hasSpecialChar: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erros ao editar
    if (error) clearError();
    
    // Validar senha em tempo real
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const validatePassword = (password: string): void => {
    setPasswordValidation({
      minLength: password.length >= 6,
      hasNumber: /\d/.test(password),
      hasLetter: /[a-zA-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const isPasswordValid = (): boolean => {
    return (
      passwordValidation.minLength &&
      passwordValidation.hasNumber &&
      passwordValidation.hasLetter &&
      passwordValidation.hasSpecialChar
    );
  };

  const validateForm = (): boolean => {
    // Verificação completa da senha
    if (!isPasswordValid()) {
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

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    if (formData.password === '') {
      setPasswordFocused(false);
    }
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
        onFocus={handlePasswordFocus}
        onBlur={handlePasswordBlur}
        fullWidth
        required
        error={!isPasswordValid() && formData.password.length > 0}
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

      {(passwordFocused || formData.password.length > 0) && (
        <Box sx={{ width: '100%', mb: 1, mt: -1 }}>
          <Typography variant="caption" color="text.secondary" align="left" sx={{ display: 'block', mb: 1 }}>
            Sua senha deve conter:
          </Typography>
          <List dense disablePadding>
            <ListItem dense disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                {passwordValidation.minLength ? (
                  <CheckIcon fontSize="small" color="success" />
                ) : (
                  <CancelIcon fontSize="small" color="error" />
                )}
              </ListItemIcon>
              <ListItemText 
                primary="Mínimo de 6 caracteres" 
                primaryTypographyProps={{ 
                  variant: 'caption',
                  color: passwordValidation.minLength ? 'success.main' : 'error'
                }}
              />
            </ListItem>
            <ListItem dense disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                {passwordValidation.hasLetter ? (
                  <CheckIcon fontSize="small" color="success" />
                ) : (
                  <CancelIcon fontSize="small" color="error" />
                )}
              </ListItemIcon>
              <ListItemText 
                primary="Pelo menos uma letra" 
                primaryTypographyProps={{ 
                  variant: 'caption',
                  color: passwordValidation.hasLetter ? 'success.main' : 'error'
                }}
              />
            </ListItem>
            <ListItem dense disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                {passwordValidation.hasNumber ? (
                  <CheckIcon fontSize="small" color="success" />
                ) : (
                  <CancelIcon fontSize="small" color="error" />
                )}
              </ListItemIcon>
              <ListItemText 
                primary="Pelo menos um número" 
                primaryTypographyProps={{ 
                  variant: 'caption',
                  color: passwordValidation.hasNumber ? 'success.main' : 'error'
                }}
              />
            </ListItem>
            <ListItem dense disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                {passwordValidation.hasSpecialChar ? (
                  <CheckIcon fontSize="small" color="success" />
                ) : (
                  <CancelIcon fontSize="small" color="error" />
                )}
              </ListItemIcon>
              <ListItemText 
                primary="Pelo menos um caractere especial (!@#$%^&*.,)" 
                primaryTypographyProps={{ 
                  variant: 'caption',
                  color: passwordValidation.hasSpecialChar ? 'success.main' : 'error'
                }}
              />
            </ListItem>
          </List>
        </Box>
      )}

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
        disabled={loading || !isPasswordValid()}
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