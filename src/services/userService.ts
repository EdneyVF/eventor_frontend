import api from './api';

const USER_ROUTES = {
  list: '/api/users',
  detail: (id: string) => `/api/users/${id}`,
  update: (id: string) => `/api/users/${id}`,
  delete: (id: string) => `/api/users/${id}`,
  stats: (id: string) => `/api/users/${id}/stats`,
};

// Interfaces
export interface UserStats {
  eventsOrganized: number;
  eventsParticipating: number;
  activeEvents: number;
  canceledEvents: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  bio?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
  phone?: string;
  bio?: string;
}

export interface UsersResponse {
  users: User[];
  page: number;
  pages: number;
  total: number;
}

// Buscar lista de usuários com paginação e filtros
export const getUsers = async (params: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
} = {}) => {
  const response = await api.get<UsersResponse>(USER_ROUTES.list, { params });
  return response.data;
};

// Buscar um usuário específico por ID
export const getUserById = async (id: string) => {
  const response = await api.get<User>(USER_ROUTES.detail(id));
  return response.data;
};

// Atualizar um usuário
export const updateUser = async (id: string, userData: UserUpdateData) => {
  const response = await api.put<User>(USER_ROUTES.update(id), userData);
  return response.data;
};

// Deletar um usuário
export const deleteUser = async (id: string) => {
  const response = await api.delete(USER_ROUTES.delete(id));
  return response.data;
};

// Obter estatísticas de um usuário
export const getUserStats = async (id: string) => {
  const response = await api.get<UserStats>(USER_ROUTES.stats(id));
  return response.data;
}; 