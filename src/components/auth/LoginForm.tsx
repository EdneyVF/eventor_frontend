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
import { LoginCredentials } from '../../types/auth';

interface LoginFormProps {
  onSwitchForm: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchForm }) => {
  const { login, authState, clearError } = useAuth();
  const { loading, error } = authState;

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(formData);
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
        maxWidth: { xs: '100%', sm: 400 },
        p: { xs: 2, sm: 3 },
        mx: 'auto',
        textAlign: 'center',
        alignItems: 'center'
      }}
    >
      <Typography variant="h5" component="h1" align="center" gutterBottom>
        Login
      </Typography>

      {error && (
        <Alert severity="error" onClose={clearError} sx={{ width: '100%' }}>
          {error}
        </Alert>
      )}

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
        sx={{ width: '100%' }}
      />

      <TextField
        label="Senha"
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        required
        autoComplete="current-password"
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

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Entrar'}
      </Button>

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Não tem uma conta?{' '}
        <Button
          color="primary"
          onClick={onSwitchForm}
          sx={{ textTransform: 'none', p: 0, fontWeight: 'bold', verticalAlign: 'baseline' }}
        >
          Registre-se
        </Button>
      </Typography>
    </Box>
  );
};

export default LoginForm; 