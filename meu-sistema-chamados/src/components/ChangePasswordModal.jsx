// src/components/ChangePasswordModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

// Modal.setAppElement('#root'); // Faça isso no App.jsx ou index.js

// API Call
const adminUpdatePassword = (userId, novaSenha) =>
  axios.put(`${API_URL}/admin/users/${userId}/password`, { novaSenha });

function ChangePasswordModal({ isOpen, onRequestClose, onPasswordChanged, user }) {
  const [novaSenha, setNovaSenha] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpa o formulário ao abrir
  useEffect(() => {
    if (isOpen) {
      setNovaSenha('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!novaSenha || novaSenha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      await adminUpdatePassword(user.id, novaSenha);
      onPasswordChanged(); // Avisa o pai para fechar e mostrar sucesso

    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar a senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal-content" // Use classes do Dashboard.css
      overlayClassName="modal-backdrop" // Use classes do Dashboard.css
      contentLabel="Alterar Senha"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Alterar Senha de: {user?.nome}</h2>
          <button type="button" className="modal-close-btn" onClick={onRequestClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="novaSenha-modal">Nova Senha</label>
            <input
              type="password"
              id="novaSenha-modal"
              name="novaSenha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="form-input"
              required
              minLength={6}
            />
          </div>
          {error && <div className="alert alert-danger modal-error" style={{marginTop: '1rem'}}>{error}</div>}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onRequestClose} disabled={isSubmitting}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Aguarde...' : 'Alterar Senha'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ChangePasswordModal;