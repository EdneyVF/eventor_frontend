import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import Layout from './components/layout/Layout';

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#5e35b1', // Roxo
    },
    secondary: {
      main: '#00a152', // Verde
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Componente para rotas protegidas por autenticação de admin
interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { authState } = useAuth();
  const location = useLocation();
  const { user, loading } = authState;

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    // Redirecionar para o login se não estiver autenticado
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    // Redirecionar para a home se não for admin
    return <Navigate to="/" replace />;
  }

  // Se estiver autenticado e for admin, renderizar o componente
  return children;
};

// Componente App com Context Providers e Roteamento
function AppWithProviders() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/events/:id" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/events/edit/:id" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            } 
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppWithProviders />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
