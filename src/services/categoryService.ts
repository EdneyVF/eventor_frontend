import api from './api';
import { CategoryStats } from '../hooks/useCategories';

const CATEGORY_ROUTES = {
  list: '/api/categories',
  detail: (id: string) => `/api/categories/${id}`,
  create: '/api/categories',
  update: (id: string) => `/api/categories/${id}`,
  delete: (id: string) => `/api/categories/${id}`,
  stats: (id: string) => `/api/categories/${id}/stats`
};

// Interfaces
export interface Category {
  _id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface CategoryCreateData {
  name: string;
  description?: string;
  active?: boolean;
}

// Usando type alias em vez de interface vazia
export type CategoryUpdateData = Partial<CategoryCreateData>;

// Buscar todas as categorias
export const getCategories = async () => {
  const response = await api.get<Category[]>(CATEGORY_ROUTES.list);
  return response.data;
};

// Buscar uma categoria específica por ID
export const getCategoryById = async (id: string) => {
  const response = await api.get<Category>(CATEGORY_ROUTES.detail(id));
  return response.data;
};

// Criar uma nova categoria
export const createCategory = async (categoryData: CategoryCreateData) => {
  const response = await api.post<Category>(CATEGORY_ROUTES.create, categoryData);
  return response.data;
};

// Atualizar uma categoria existente
export const updateCategory = async (id: string, categoryData: CategoryUpdateData) => {
  const response = await api.put<Category>(CATEGORY_ROUTES.update(id), categoryData);
  return response.data;
};

// Deletar uma categoria
export const deleteCategory = async (id: string) => {
  const response = await api.delete(CATEGORY_ROUTES.delete(id));
  return response.data;
};

export const getCategoryStats = async (id: string): Promise<CategoryStats> => {
  const response = await api.get(CATEGORY_ROUTES.stats(id));
  return response.data.stats;
}; 