// src/App.jsx (CORRIGIDO)

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import MainLayout from './components/MainLayout.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

// *** 1. IMPORTE A PÁGINA DE TROCA DE SENHA ***
import ChangePasswordPage from './pages/ChangePasswordPage.jsx'; // Certifique-se que o nome do ficheiro está correto

function App() {
  return (
    <Routes>
      {/* Rotas Públicas (sem navbar/layout principal) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rota para Troca de Senha Obrigatória (sem navbar/layout principal) */}
      {/* Esta rota precisa ser acessível apenas se o utilizador estiver logado */}
      {/* mas *antes* de ele aceder ao layout principal */}
       <Route
         path="/change-password"
         element={
           <ProtectedRoute> {/* Garante que só utilizadores logados acedem */}
             <ChangePasswordPage />
           </ProtectedRoute>
         }
       />

      {/* --- Rotas Protegidas (COM navbar/layout principal) --- */}
      {/* Todas as rotas aqui dentro usarão o MainLayout */}
      <Route
        element={
          <ProtectedRoute> {/* Protege todo o layout */}
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Rota Padrão (Dashboard) */}
        {/* O 'index' é desnecessário se já tem path="/" */}
        <Route path="/" element={<Dashboard />} />

        {/* Rota de Admin (Gestão de Utilizadores) */}
        <Route
          path="/admin/users"
          element={
            <AdminRoute> {/* Proteção extra só para admins */}
              <UserManagementPage />
            </AdminRoute>
          }
        />

        {/* Rota de Admin (Relatórios) */}
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <ReportsPage />
            </AdminRoute>
          }
        />

        {/* Adicione outras rotas protegidas aqui DENTRO deste <Route> pai */}

      </Route>
      {/* --- Fim das Rotas Protegidas com Layout --- */}


      {/* Redirecionamento Padrão (ÚLTIMA ROTA) */}
      {/* Qualquer URL não correspondida redireciona para a raiz ('/') */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;