import axios from 'axios';
import { LoginCredentials, RegisterData, User } from '../types/auth';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL
});

// Login de usuário
export const login = async (credentials: LoginCredentials): Promise<User> => {
  const response = await api.post('/api/auth/login', credentials);
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
  }
  
  return response.data;
};

// Registro de usuário
export const register = async (data: RegisterData): Promise<User> => {
  const response = await api.post('/api/auth/register', data);
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
  }
  
  return response.data;
};

// Obter dados do usuário
export const getMe = async (): Promise<User> => {
  const token = localStorage.getItem('token');
  
  const response = await api.get('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data;
};

// Atualizar perfil do usuário
export const updateProfile = async (profileData: {
  name?: string;
  phone?: string;
  bio?: string;
}): Promise<User> => {
  const response = await api.put('/api/auth/profile', profileData);
  return response.data;
};

// Atualizar senha
export const updatePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const response = await api.put('/api/auth/password', passwordData);
  return response.data;
};

// Checar se o token parece válido
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  // Verificar formato básico do JWT (header.payload.signature)
  const parts = token.split('.');
  return parts.length === 3;
};

// Limpar todos os tokens armazenados
export const clearTokens = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

// Atualizar token usando refresh token
export const refreshToken = async (): Promise<string | null> => {
  const storedRefreshToken = localStorage.getItem('refreshToken');
  
  // Verificar se temos um refresh token e se ele tem formato válido
  if (!storedRefreshToken || !isTokenValid(storedRefreshToken)) {
    clearTokens();
    return null;
  }
  
  try {
    const response = await api.post('/api/auth/refresh-token', {
      refreshToken: storedRefreshToken
    });
    
    const newToken = response.data.token;
    localStorage.setItem('token', newToken);
    
    // Atualizar também o refresh token se recebido
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return newToken;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    
    // Limpar tokens inválidos
    clearTokens();
    
    return null;
  }
};

// Logout
export const logout = (): void => {
  clearTokens();
};

// Configurar interceptor para renovar token automaticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Se o erro for de token expirado (401) e ainda não tentamos renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const newToken = await refreshToken();
      
      if (newToken) {
        // Atualizar header de autorização
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 