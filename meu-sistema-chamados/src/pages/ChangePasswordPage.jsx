// src/pages/ChangePasswordPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext'; // Importa useAuth e API_URL
// Importe o CSS que contém os estilos de formulário
import './Dashboard.css'; // Ou LoginPage.css, dependendo de onde estão os estilos
import './ChangePasswordPage.css'; // Opcional: Para estilos específicos desta página

// Ícone opcional (Ex: Chave)
import { FiLock, FiCheckCircle } from 'react-icons/fi';

function ChangePasswordPage() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth(); // Pega a função logout do contexto
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (!novaSenha || !confirmarNovaSenha) {
      setError('Por favor, preencha ambos os campos de senha.');
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    // Adicione mais validações de força de senha se desejar

    setLoading(true);

    try {
      // Chama a rota PUT /change-password do backend
      // O token de autorização já está sendo adicionado globalmente pelo AuthContext
      const response = await axios.put(`${API_URL}/change-password`, {
        novaSenha,
        confirmarNovaSenha,
      });

      setSuccess(response.data.message || 'Senha alterada com sucesso! Faça login novamente com sua nova senha.');

      // Força o logout após um pequeno delay para mostrar a mensagem de sucesso
      setTimeout(() => {
        logout(); // Desloga o usuário (token pode não ser válido ou melhor prática de segurança)
        navigate('/login'); // Redireciona para a página de login
      }, 3000); // Espera 3 segundos

    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao tentar alterar a senha.');
      setLoading(false); // Permite tentar novamente
    }
    // Não seta setLoading(false) em caso de sucesso, pois o logout vai acontecer
  };

  return (
    // Usa um wrapper similar ao de LoginPage para centralizar
    <div className="login-page-wrapper">
      <div className="login-card change-password-card"> {/* Adiciona classe específica */}
        <FiLock size={40} style={{ marginBottom: '1rem', color: 'var(--cor-primaria)' }} />
        <h2>Definir Nova Senha</h2>
        <p className="login-subtitle">Por segurança, defina uma nova senha permanente.</p>

        {/* Mensagens de Sucesso e Erro */}
        {success && (
          <div className="form-success"> {/* Classe para sucesso */}
            <FiCheckCircle style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            {success}
          </div>
        )}
        {error && <p className="form-error">{error}</p>} {/* Reutiliza classe de erro */}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="novaSenha">Nova Senha</label>
            <input
              type="password"
              id="novaSenha"
              className="form-input"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
              minLength={6}
              disabled={loading || success} // Desabilita se estiver carregando ou se já deu sucesso
              placeholder="Pelo menos 6 caracteres"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmarNovaSenha">Confirmar Nova Senha</label>
            <input
              type="password"
              id="confirmarNovaSenha"
              className="form-input"
              value={confirmarNovaSenha}
              onChange={(e) => setConfirmarNovaSenha(e.target.value)}
              required
              minLength={6}
              disabled={loading || success}
              placeholder="Repita a nova senha"
            />
          </div>

          <button
            type="submit"
            className={`form-button login-button ${loading ? 'loading' : ''}`} // Reutiliza estilo do botão de login
            disabled={loading || success}
          >
           {/* Mostra spinner ou texto */}
           {loading ? '' : 'Salvar Nova Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;