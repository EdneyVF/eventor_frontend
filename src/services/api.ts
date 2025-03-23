import axios from 'axios';

// Determinando a URL base do backend
// Em desenvolvimento, usamos o proxy do Vite para evitar problemas de CORS
// Em produção, deve ser configurado de acordo com o ambiente
const local_url = 'http://localhost:3001';
const baseURL = import.meta.env.DEV ? local_url : import.meta.env.VITE_API_URL;

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
      
      // Melhorar as mensagens de erro
      if (error.response.data && error.response.data.message) {
        error.message = error.response.data.message;
      } else {
        // Mensagens padrão baseadas no status
        switch (error.response.status) {
          case 403:
            error.message = 'Você não tem permissões suficientes para acessar este recurso.';
            break;
          case 401:
            error.message = 'Sua sessão expirou ou você precisa fazer login novamente.';
            break;
          case 404:
            error.message = 'O recurso solicitado não foi encontrado.';
            break;
          case 500:
            error.message = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
          default:
            error.message = 'Ocorreu um erro ao processar sua solicitação.';
        }
      }
    } else if (error.request) {
      // A requisição foi feita mas nenhuma resposta foi recebida
      error.message = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    } else {
      // Algo aconteceu na configuração da requisição que causou um erro
      error.message = 'Erro ao configurar a requisição.';
    }
    
    return Promise.reject(error);
  }
);

export default api; 