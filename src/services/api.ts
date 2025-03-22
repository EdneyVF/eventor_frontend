import axios from 'axios';

// Determinando a URL base do backend
// Em desenvolvimento, usamos o proxy do Vite para evitar problemas de CORS
// Em produção, deve ser configurado de acordo com o ambiente
const baseURL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL || '/api';

// Criar instância do Axios
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento de erros comuns
    if (error.response) {
      // Se receber 401 Unauthorized e não for uma requisição de login/registro
      if (error.response.status === 401 && 
          !error.config.url.includes('login') && 
          !error.config.url.includes('register')) {
        // Token expirado ou inválido
        localStorage.removeItem('token');
        // Aqui podemos adicionar uma lógica de redirecionamento para login
      }
    }
    return Promise.reject(error);
  }
);

export default api; 