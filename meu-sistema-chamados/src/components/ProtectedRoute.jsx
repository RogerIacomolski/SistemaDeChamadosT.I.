import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    // Usuário não está logado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Usuário está logado, renderiza o componente "filho" (no caso, o Dashboard)
  return children;
}

export default ProtectedRoute;