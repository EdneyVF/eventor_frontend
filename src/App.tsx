import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CircularProgress, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';

// Páginas com carregamento normal
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';

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

// Páginas com lazy loading
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const MyEventsPage = lazy(() => import('./pages/MyEventsPage'));
const CreateEventPage = lazy(() => import('./pages/CreateEventPage'));
const EventDetailsPage = lazy(() => import('./pages/EventDetailsPage'));

// Páginas de admin com lazy loading
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminPendingPage = lazy(() => import('./pages/AdminPendingPage'));
const AdminCategoriesPage = lazy(() => import('./pages/AdminCategoriesPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));

// Componente para carregamento
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Componente para rotas protegidas que requerem autenticação
const ProtectedRoute = () => {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <LoadingComponent />;
  }
  
  return authState.user ? <Outlet /> : <Navigate to="/auth" />;
};

// Componente para rotas protegidas de admin
const ProtectedAdminRoute = () => {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <LoadingComponent />;
  }
  
  if (!authState.user) {
    return <Navigate to="/auth" />;
  }
  
  return authState.user.role === 'admin' ? <Outlet /> : <Navigate to="/" />;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Suspense fallback={<LoadingComponent />}>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />
                
                {/* Rotas protegidas (apenas usuários autenticados) */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/:userId" element={<UserProfilePage />} />
                  <Route path="/my-events" element={<MyEventsPage />} />
                  <Route path="/events/create" element={<CreateEventPage />} />
                  <Route path="/events/edit/:id" element={<CreateEventPage />} />
                </Route>
                
                {/* Rotas de admin (apenas usuários admin) */}
                <Route element={<ProtectedAdminRoute />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/pending" element={<AdminPendingPage />} />
                  <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                </Route>
                
                {/* Rota para páginas não encontradas */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
