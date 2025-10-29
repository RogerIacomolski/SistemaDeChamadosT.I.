// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function AdminRoute({ children }) {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <div>A verificar permissões...</div>; // Ou spinner
  }

  if (!user || user.tipo !== 'admin') {
    // Não está logado OU não é admin, redireciona para o Dashboard normal
    return <Navigate to="/" replace />;
  }

  // É admin, renderiza a página de gestão
  return children;
}

export default AdminRoute;