import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Import axios
import { API_URL } from '../context/AuthContext.jsx'; // Import API_URL
import './LoginPage.css';

// Ícone Simples de HelpDesk (SVG Inline)
const HelpDeskIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4C51BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
        <path d="M14.5 10.5a7.5 7.5 0 1 0-5 0"></path><path d="M9 14h6"></path><path d="M12 11v6"></path><path d="M12 21a9 9 0 0 0 0-18v0"></path>
    </svg>
);


function LoginPage() {
  const [email, setEmail] = useState(() => localStorage.getItem('savedEmail') || '');
  const [senha, setSenha] = useState('');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('rememberMe') === 'true' || false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Para mensagens de sucesso (ex: email enviado)
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // NOVO: Estado para controlar o modo "Esqueceu Senha"
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  useEffect(() => {
    // Guarda apenas se rememberMe estiver ativo
    if (rememberMe) {
        localStorage.setItem('savedEmail', email);
    } else {
        localStorage.removeItem('savedEmail'); // Remove se desmarcar
    }
  }, [email, rememberMe]); // Reage a mudanças em ambos

  useEffect(() => {
    localStorage.setItem('rememberMe', String(rememberMe));
  }, [rememberMe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const loginResult = await login(email, senha, rememberMe);
    setLoading(false);

    if (loginResult?.success) {
      // Verifica se o backend indicou que a senha precisa ser trocada
      if (loginResult.mustChangePassword) {
          navigate('/change-password'); // Redireciona para a página de troca
      } else {
          navigate('/'); // Redireciona para o dashboard normal
      }
    } else {
      setError(loginResult?.message || 'E-mail ou senha inválidos.');
    }
  };

  // NOVO: Handler para enviar pedido de recuperação de senha
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email) {
      setError('Por favor, insira o seu endereço de e-mail.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });

      // 1. Define a mensagem de sucesso
      setSuccess(response.data.message || 'Instruções enviadas para o seu e-mail!');

      // 2. Define um temporizador para voltar ao login após X segundos
      setTimeout(() => {
        setIsForgotPassword(false); // Volta para a tela de login
        setSuccess(''); // Limpa a mensagem de sucesso (opcional, pode limpar ao trocar)
      }, 4000); // 4000ms = 4 segundos (ajuste o tempo como desejar)

      // Não definimos setLoading(false) aqui, pois a troca de tela acontece

    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar o pedido.');
      setLoading(false); // Permite tentar novamente em caso de erro
    }
       finally {
          setLoading(false);
      }
  };


  const handleRememberChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const toggleForgotPassword = (e) => {
      e.preventDefault(); // Evita que o link navegue
      setIsForgotPassword(!isForgotPassword);
      setError(''); // Limpa erros ao trocar de modo
      setSuccess(''); // Limpa sucesso ao trocar de modo
      setSenha(''); // Limpa senha ao entrar no modo esqueceu
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <HelpDeskIcon />
        <h2>{isForgotPassword ? 'Recuperar Senha' : 'Bem-vindo!'}</h2>
        <p className="login-subtitle">{isForgotPassword ? 'Insira seu e-mail para receber uma senha temporária.' : 'Sistema de chamados'}</p>

        {/* Mensagens de Sucesso e Erro */}
        {success && <p className="login-success">{success}</p>}
        {error && <p className="login-error">{error}</p>}

        {/* --- Formulário Principal (Login ou Esqueceu Senha) --- */}
        <form onSubmit={isForgotPassword ? handleForgotPasswordSubmit : handleSubmit} className="login-form">

          {/* Campo de Email (mostrado em ambos os modos) */}
          <div className="form-group">
            <label htmlFor="email-login">Endereço de E-mail</label>
            <input
              type="email"
              id="email-login"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="seuemail@exemplo.com"
            />
          </div>

          {/* Campo de Senha (mostrado APENAS no modo Login) */}
          {!isForgotPassword && (
            <div className="form-group">
              <label htmlFor="senha-login">Palavra-passe</label>
              <input
                type="password"
                id="senha-login"
                className="form-input"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required={!isForgotPassword} // Só é obrigatório no login
                disabled={loading}
                placeholder="Senha do Sistema Antigo"
              />
            </div>
          )}

          {/* Checkbox Lembrar-me (mostrado APENAS no modo Login) */}
          {!isForgotPassword && (
            <div className="login-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember-me-checkbox"
                  checked={rememberMe}
                  onChange={handleRememberChange}
                  disabled={loading}
                />
                <label htmlFor="remember-me-checkbox">Lembrar-me</label>
              </div>
               {/* Link Esqueceu Senha */}
               <a href="#" onClick={toggleForgotPassword} className="forgot-password-link">
                   Esqueceu a senha?
               </a>
            </div>
          )}

          {/* Botão de Submissão (texto muda conforme o modo) */}
          <button
            type="submit"
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
           {loading ? '' : (isForgotPassword ? 'Enviar Instruções' : 'Entrar')}
          </button>
        </form>

        {/* Link para voltar ao Login ou ir para Registro */}
        {isForgotPassword ? (
            <p className="register-link">
               Lembrou a senha? <a href="#" onClick={toggleForgotPassword}>Voltar ao Login</a>
            </p>
        ) : (
            <p className="register-link">
              Ainda não tem conta? <Link to="/register">Crie uma aqui</Link>
            </p>
            
            
        )}
         <footer className="app-footer">
          <p>
            &copy; {new Date().getFullYear()} Desenvolvido pela empresa Union.
          
          </p>
        </footer>
      </div>
      
    </div>
 
        
    
  );
}

export default LoginPage;
