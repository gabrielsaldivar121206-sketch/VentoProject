import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import OfflineIndicator from './components/OfflineIndicator';
import PageTransition from './components/PageTransition';
import Login from './pages/Login';
import WelcomeFlow from './pages/WelcomeFlow';
import AppDashboard from './pages/AppDashboard';
import EnglishModule from './pages/EnglishModule';
import MusicModule from './pages/MusicModule';
import MathModule from './pages/MathModule';
import ChessModule from './pages/ChessModule';
import AdminPanel from './pages/AdminPanel';
import SignLanguageModule from './pages/SignLanguageModule';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/welcome" replace />;
  return children;
};

/* Animated routes wrapper */
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PublicRoute>
            <PageTransition><Login /></PageTransition>
          </PublicRoute>
        } />
        <Route path="/welcome" element={
          <ProtectedRoute>
            <PageTransition><WelcomeFlow /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PageTransition><AppDashboard /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/english" element={
          <ProtectedRoute>
            <PageTransition><EnglishModule /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/music" element={
          <ProtectedRoute>
            <PageTransition><MusicModule /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/math" element={
          <ProtectedRoute>
            <PageTransition><MathModule /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/chess" element={
          <ProtectedRoute>
            <PageTransition><ChessModule /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <PageTransition><AdminPanel /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/signlanguage" element={
          <ProtectedRoute>
            <PageTransition><SignLanguageModule /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  React.useEffect(() => {
    // Aplicar el tema globalmente en cuanto la app cargue
    const saved = localStorage.getItem('vento-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', defaultTheme);
      localStorage.setItem('vento-theme', defaultTheme);
    }
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <OfflineIndicator />
          <AnimatedRoutes />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;