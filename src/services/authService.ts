import api from './api';
import { LoginCredentials, RegisterData, User } from '../types/auth';

const AUTH_ROUTES = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  me: '/api/auth/me',
  updateProfile: '/api/auth/profile',
  updatePassword: '/api/auth/password',
};

// Login de usuário
export const login = async (credentials: LoginCredentials): Promise<User> => {
  const response = await api.post(AUTH_ROUTES.login, credentials);
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Registro de novo usuário
export const register = async (data: RegisterData): Promise<User> => {
  const response = await api.post(AUTH_ROUTES.register, data);
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Obter dados do usuário logado
export const getMe = async (): Promise<User> => {
  const response = await api.get(AUTH_ROUTES.me);
  return response.data;
};

// Atualizar perfil do usuário
export const updateProfile = async (profileData: {
  name?: string;
  phone?: string;
  bio?: string;
}): Promise<User> => {
  const response = await api.put(AUTH_ROUTES.updateProfile, profileData);
  return response.data;
};

// Atualizar senha
export const updatePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const response = await api.put(AUTH_ROUTES.updatePassword, passwordData);
  return response.data;
};

// Logout (client-side)
export const logout = (): void => {
  localStorage.removeItem('token');
}; 