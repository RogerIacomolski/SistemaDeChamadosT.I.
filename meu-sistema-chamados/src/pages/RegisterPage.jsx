// src/pages/RegisterPage.jsx (PUXANDO DEPARTAMENTOS DA API)

import React, { useState, useEffect } from 'react'; // Adicionado useEffect
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL, useAuth } from '../context/AuthContext';
import './LoginPage.css'; // Reutiliza o CSS da página de Login

// Ícone
const RegisterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4C51BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <line x1="19" y1="8" x2="19" y2="14"></line>
        <line x1="22" y1="11" x2="16" y2="11"></line>
    </svg>
);

// REMOVA a lista hardcoded de departamentos daqui

function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [departamento, setDepartamento] = useState(''); // Continua guardando o selecionado
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- NOVO: Estados para a lista de departamentos ---
  const [departamentosLista, setDepartamentosLista] = useState([]); // Guarda a lista vinda da API
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(true); // Controla o loading da lista
  const [errorDepartamentos, setErrorDepartamentos] = useState(''); // Erro ao buscar lista

  // --- NOVO: useEffect para buscar departamentos ---
  useEffect(() => {
    const fetchDepartamentos = async () => {
      setLoadingDepartamentos(true);
      setErrorDepartamentos('');
      try {
        const response = await axios.get(`${API_URL}/departamentos`);
        setDepartamentosLista(response.data); // Guarda a lista no estado
      } catch (err) {
        console.error("Erro ao buscar departamentos:", err);
        setErrorDepartamentos('Não foi possível carregar os departamentos.');
        // Mantém a lista vazia se der erro
      } finally {
        setLoadingDepartamentos(false);
      }
    };

    fetchDepartamentos(); // Chama a função ao montar o componente
  }, []); // Array vazio significa que roda só uma vez, na montagem

  // handleSubmit (sem alterações na lógica principal, apenas na mensagem de erro se o select falhar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!departamento) {
        setError('Por favor, selecione um departamento.');
        return;
    }
    setLoading(true);

    try {
      await axios.post(`${API_URL}/register`, { nome, email, senha, departamento });
      const loginResult = await login(email, senha, false);

      if (loginResult?.success) {
          navigate('/');
      } else {
          setError('Cadastro realizado, mas falha ao logar. Tente login manual.');
          setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao cadastrar.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <RegisterIcon />
        <h2>Criar Conta</h2>
        <p className="login-subtitle">Preencha seus dados para aceder ao sistema</p>

        {error && <p className="login-error">{error}</p>}
        {/* Mostra erro específico se falhar ao carregar departamentos */}
        {errorDepartamentos && <p className="login-error">{errorDepartamentos}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Inputs Nome, Email, Senha (sem alterações) */}
          <div className="form-group">
             <label htmlFor="nome-reg">Nome Completo</label>
             <input type="text" id="nome-reg" value={nome} onChange={(e) => setNome(e.target.value)} required className="form-input" disabled={loading} placeholder="Seu nome completo" />
           </div>
           <div className="form-group">
             <label htmlFor="email-reg">Email Corporativo</label>
             <input type="email" id="email-reg" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" disabled={loading} placeholder="seu.nome@teste.com.br" />
           </div>
           <div className="form-group">
             <label htmlFor="senha-reg">Senha</label>
             <input type="password" id="senha-reg" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} className="form-input" disabled={loading} placeholder="Mínimo 6 caracteres" />
           </div>


          {/* --- CAMPO DE DEPARTAMENTO (MODIFICADO) --- */}
          <div className="form-group">
            <label htmlFor="departamento-reg">Departamento</label>
            <select
              id="departamento-reg"
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              required
              className="form-select"
              // Desabilita enquanto carrega a lista OU durante o submit OU se deu erro ao carregar
              disabled={loadingDepartamentos || loading || errorDepartamentos}
            >
              {/* Opção inicial */}
              <option value="" disabled>
                 {loadingDepartamentos ? 'A carregar...' : 'Selecione...'}
              </option>

              {/* Mapeia a lista vinda da API */}
              {!loadingDepartamentos && !errorDepartamentos && departamentosLista.map(dep => (
                // Assume que a API retorna objetos { id: 1, nome: 'T.I.' }
                <option key={dep.id} value={dep.nome}>{dep.nome}</option>
              ))}
            </select>
          </div>
          {/* --- FIM DO CAMPO DEPARTAMENTO --- */}

          <button
             type="submit"
             className={`login-button ${loading ? 'loading' : ''}`}
             // Desabilita se estiver carregando algo
             disabled={loadingDepartamentos || loading}
           >
            {loading ? '' : 'Cadastrar e Entrar'}
          </button>
        </form>
        <p className="register-link">
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;