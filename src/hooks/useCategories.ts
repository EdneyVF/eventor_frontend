import { useState, useCallback } from 'react';
import * as categoryService from '../services/categoryService';
import { 
  Category, 
  CategoryCreateData, 
  CategoryUpdateData 
} from '../services/categoryService';

interface UseCategoriesState {
  categories: Category[];
  category: Category | null;
  categoryStats: CategoryStats | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface CategoryStats {
  eventsCount: number;
  totalParticipants: number;
  avgParticipantsPerEvent: number;
  eventsByStatus: {
    ativo: number;
    cancelado: number;
    finalizado: number;
  };
}

export const useCategories = () => {
  const [state, setState] = useState<UseCategoriesState>({
    categories: [],
    category: null,
    categoryStats: null,
    loading: false,
    error: null,
    success: false
  });

  // Buscar todas as categorias
  const fetchCategories = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const categories = await categoryService.getCategories();
      setState(prev => ({
        ...prev,
        categories,
        loading: false,
        success: true
      }));
      return categories;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar categorias';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Buscar categoria por ID
  const fetchCategoryById = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const category = await categoryService.getCategoryById(id);
      setState(prev => ({
        ...prev,
        category,
        loading: false,
        success: true
      }));
      return category;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar categoria';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Criar categoria
  const createCategory = useCallback(async (categoryData: CategoryCreateData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const category = await categoryService.createCategory(categoryData);
      setState(prev => ({
        ...prev,
        category,
        categories: [...prev.categories, category],
        loading: false,
        success: true
      }));
      return category;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar categoria';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Atualizar categoria
  const updateCategory = useCallback(async (id: string, categoryData: CategoryUpdateData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const category = await categoryService.updateCategory(id, categoryData);
      setState(prev => ({
        ...prev,
        category,
        categories: prev.categories.map(c => c._id === id ? category : c),
        loading: false,
        success: true
      }));
      return category;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar categoria';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Excluir categoria
  const deleteCategory = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await categoryService.deleteCategory(id);
      setState(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c._id !== id),
        category: prev.category?._id === id ? null : prev.category,
        loading: false,
        success: true
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir categoria';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Limpar estado
  const clearState = useCallback(() => {
    setState({
      categories: [],
      category: null,
      categoryStats: null,
      loading: false,
      error: null,
      success: false
    });
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Fetch category statistics by id
  const fetchCategoryStats = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const stats = await categoryService.getCategoryStats(id);
      setState(prev => ({ 
        ...prev, 
        categoryStats: stats,
        loading: false 
      }));
      return stats;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Falha ao carregar estatísticas da categoria',
        loading: false
      }));
      throw error;
    }
  }, []);

  return {
    categories: state.categories,
    category: state.category,
    categoryStats: state.categoryStats,
    loading: state.loading,
    error: state.error,
    success: state.success,
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    clearState,
    clearError,
    fetchCategoryStats
  };
};

export default useCategories; 