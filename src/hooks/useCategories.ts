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
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const useCategories = () => {
  const [state, setState] = useState<UseCategoriesState>({
    categories: [],
    category: null,
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
      loading: false,
      error: null,
      success: false
    });
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    clearState,
    clearError
  };
}; 