import React, { createContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { AuthState, AuthContextType, LoginCredentials, RegisterData, User } from '../types/auth';
import * as authService from '../services/authService';

// Estado inicial
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  success: false
};

// Criar o contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tipos de ações
type ActionType = 
  | { type: 'AUTH_REQUEST' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

// Reducer
const authReducer = (state: AuthState, action: ActionType): AuthState => {
  switch (action.type) {
    case 'AUTH_REQUEST':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload, 
        error: null,
        success: true 
      };
    case 'AUTH_FAILURE':
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        success: false 
      };
    case 'LOGOUT':
      return { 
        ...initialState,
        success: false 
      };
    case 'CLEAR_ERROR':
      return { 
        ...state, 
        error: null 
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

// Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  // Verificar se o usuário está logado ao carregar a página
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      // Verificar se o token tem formato válido
      if (token && authService.isTokenValid(token)) {
        try {
          dispatch({ type: 'AUTH_REQUEST' });
          const userData = await authService.getMe();
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { ...userData, token }
          });
        } catch {
          // Tentar usar refresh token para obter novo token
          try {
            const newToken = await authService.refreshToken();
            
            if (newToken) {
              // Com novo token, tentar obter dados do usuário novamente
              const userData = await authService.getMe();
              dispatch({ 
                type: 'AUTH_SUCCESS', 
                payload: { ...userData, token: newToken }
              });
            } else {
              // Sem refresh token válido, fazer logout
              authService.clearTokens();
              dispatch({ 
                type: 'AUTH_FAILURE', 
                payload: 'Sessão expirada. Por favor, faça login novamente.' 
              });
            }
          } catch {
            // Token inválido ou expirado e não foi possível renovar
            authService.clearTokens();
            dispatch({ 
              type: 'AUTH_FAILURE', 
              payload: 'Sessão expirada. Por favor, faça login novamente.' 
            });
          }
        }
      } else if (token) {
        // Token existe mas não é válido
        authService.clearTokens();
        dispatch({ 
          type: 'AUTH_FAILURE', 
          payload: 'Sessão inválida. Por favor, faça login novamente.' 
        });
      }
    };

    loadUser();
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_REQUEST' });
      const user = await authService.login(credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (err) {
      const errorMessage = 
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 
        'Erro ao fazer login. Verifique suas credenciais.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
    }
  }, []);

  // Registro
  const register = useCallback(async (data: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_REQUEST' });
      const user = await authService.register(data);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (err) {
      const errorMessage = 
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 
        'Erro ao registrar. Verifique os dados informados.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Atualizar dados do usuário após edição de perfil
  const updateUserData = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_REQUEST' });
      const userData = await authService.getMe();
      // Preservar o token existente
      const token = authState.user?.token || '';
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { ...userData, token }
      });
      return userData;
    } catch (err) {
      const errorMessage = 
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 
        'Erro ao atualizar dados do usuário.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw err;
    }
  }, [authState.user]);

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        clearError,
        updateUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 