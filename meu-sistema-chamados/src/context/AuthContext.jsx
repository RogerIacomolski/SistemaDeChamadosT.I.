// src/context/AuthContext.jsx (CORRIGIDO)

import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// URL base da sua API
export const API_URL = 'http://192.168.2.104:3001';
// const API_URL = 'http://localhost:3001';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || sessionStorage.getItem('token') || null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Efeito para validar o token e definir o usuário
  useEffect(() => {
    setLoadingAuth(true);
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedUser.exp < currentTime) {
          console.log("AuthContext: Token expirado encontrado.");
          logout();
        } else {
          setUser(decodedUser);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // console.log("AuthContext: Usuário definido a partir do token:", decodedUser);
        }
      } catch (error) {
        console.error("AuthContext: Token inválido encontrado:", error);
        logout();
      }
    } else {
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      // console.log("AuthContext: Nenhum token encontrado.");
    }
    setLoadingAuth(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // *** FUNÇÃO login MODIFICADA ***
  const login = async (email, senha, rememberMe = false) => {
    logout(); // Limpa tokens antigos
    try {
      const response = await axios.post(`${API_URL}/login`, { email, senha });
      // Extrai o token E a nova flag da resposta do backend
      const { token: newToken, mustChangePassword } = response.data; // <-- MUDANÇA AQUI

      // Lógica para guardar o token (localStorage ou sessionStorage)
      if (rememberMe) {
        localStorage.setItem('token', newToken);
        sessionStorage.removeItem('token');
        // console.log("AuthContext: Token salvo no localStorage (Lembrar-me ATIVO)");
      } else {
        sessionStorage.setItem('token', newToken);
        localStorage.removeItem('token');
        // console.log("AuthContext: Token salvo no sessionStorage (Lembrar-me INATIVO)");
      }

      // Atualiza o state 'token' (o useEffect vai decodificar e setar o user)
      setToken(newToken);

      // *** RETORNA OBJETO COM SUCESSO E A FLAG ***
      return { success: true, mustChangePassword: mustChangePassword }; // <-- MUDANÇA AQUI

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro desconhecido ao tentar logar.';
      console.error('AuthContext: Erro no login:', errorMessage);
      logout(); // Garante limpeza em caso de erro

      // *** RETORNA OBJETO COM FALHA E MENSAGEM DE ERRO ***
      return { success: false, mustChangePassword: false, message: errorMessage }; // <-- MUDANÇA AQUI
    }
  };
  // *** FIM DA MODIFICAÇÃO NA FUNÇÃO login ***

  // Função logout (sem alterações)
  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setToken(null); // O useEffect tratará de limpar 'user' e axios header
    // console.log("AuthContext: Logout executado, tokens removidos.");
  };

  // Valor fornecido pelo contexto
  const value = {
    user,
    token,
    loadingAuth,
    login,
    logout,
  };

  // Renderiza loading inicial
  if (loadingAuth) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>A verificar autenticação...</div>;
  }

  // Renderiza a aplicação
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para usar o contexto
export function useAuth() {
  return useContext(AuthContext);
}