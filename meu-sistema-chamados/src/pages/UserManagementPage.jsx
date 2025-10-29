// src/pages/UserManagementPage.jsx (ATUALIZADO PARA NOVA ESTRUTURA DA TABELA)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL, useAuth } from '../context/AuthContext'; // Assegure que API_URL está exportada
import Modal from 'react-modal';

// Importe os componentes de modal
import UserFormModal from '../components/UserFormModal.jsx';
import ChangePasswordModal from '../components/ChangePasswordModal.jsx';

// Importe ícones
import { FiPlus, FiEdit, FiLock, FiUsers } from 'react-icons/fi'; // Adicionado FiUsers

import './UserManagementPage.css'; // CSS específico da tabela
import './Dashboard.css'; // CSS principal (para header, card, botões, modais)

// Defina o App Element (idealmente no App.jsx ou index.js)
// Modal.setAppElement('#root');

// Função da API
const adminGetUsers = () => axios.get(`${API_URL}/admin/users`);

function UserManagementPage() {
  const { user, logout } = useAuth(); // 'user' é o admin logado

  // Estados da página
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados dos modais
  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userForPasswordChange, setUserForPasswordChange] = useState(null);

  // Busca inicial e re-busca
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      // setSuccess(''); // Limpa sucesso ao recarregar
      const response = await adminGetUsers();
      // Assume que a API retorna [{ id, nome, email, tipo, departamento }, ...]
      setUsuarios(response.data);
    } catch (err) {
      setError('Falha ao carregar utilizadores. ' + (err.response?.data?.message || err.message));
      setUsuarios([]); // Limpa a lista em caso de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // --- Funções para ABRIR os modais ---
  const handleOpenCreateModal = () => {
    setUserToEdit(null);
    setIsUserFormModalOpen(true);
  };
  const handleOpenEditModal = (userRow) => {
    setUserToEdit(userRow);
    setIsUserFormModalOpen(true);
  };
  const handleOpenPasswordModal = (userRow) => {
    setUserForPasswordChange(userRow);
    setIsPasswordModalOpen(true);
  };

  // --- Funções chamadas PELOS modais em caso de SUCESSO ---
  const handleUserSaved = () => {
    setIsUserFormModalOpen(false);
    setSuccess('Utilizador salvo com sucesso!');
    fetchUsuarios(); // Atualiza a lista
    setTimeout(() => setSuccess(''), 4000);
  };
  const handlePasswordChanged = () => {
    setIsPasswordModalOpen(false);
    setSuccess('Senha alterada com sucesso!');
    // Não precisa buscar usuários novamente
    setTimeout(() => setSuccess(''), 4000);
  };

  // --- Renderização ---
  return (
    <>
      {/* Navbar (Consistente com Dashboard) */}
      <header className="dashboard-header">
        <div className="header-title">
          <FiUsers style={{ marginRight: '0.5rem', verticalAlign: 'bottom' }} /> {/* Ícone no título */}
          Gestão de Utilizadores
        </div>
        <div className="header-user">
          Olá, <strong>{user?.nome}</strong> ({user?.tipo})
          <Link to="/" className="btn-secondary">
            &larr; Voltar ao Dashboard
          </Link>
          <button onClick={logout} className="btn-logout">
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="dashboard-main-single-column">
        <div className="card"> {/* Estilo de Card */}

          {/* Cabeçalho do Card */}
          <div className="ticket-list-header"> {/* Reutiliza estilo do header da lista */}
            <h3>Lista de Utilizadores ({usuarios.length})</h3>
            <button className="btn-primary" onClick={handleOpenCreateModal}>
              <FiPlus /> Criar Novo Utilizador
            </button>
          </div>

          {/* Feedback */}
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Loading */}
          {loading && <p className="loading-text">A carregar utilizadores...</p>}

          {/* Tabela de Utilizadores */}
          {!loading && !error && (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Departamento</th> {/* <-- COLUNA ADICIONADA */}
                    <th>Tipo</th>
                    {/* <th>Data Registo</th> <-- COLUNA REMOVIDA */}
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Verifica se 'usuarios' é um array antes de mapear */}
                  {Array.isArray(usuarios) && usuarios.map(userRow => (
                    <tr key={userRow.id}>
                      <td>{userRow.id}</td>
                      <td>{userRow.nome}</td>
                      <td>{userRow.email}</td>
                      <td>{userRow.departamento}</td> {/* <-- EXIBE O DEPARTAMENTO */}
                      <td>
                        {/* Badge de Tipo (Admin/Usuário) */}
                        <span className={`status-badge ${userRow.tipo === 'admin' ? 'status-em_andamento' : 'status-fechado'}`}
                              style={ userRow.tipo === 'admin' ? { backgroundColor: 'var(--cor-primaria-clara)', color: 'var(--cor-primaria)' } : {}}>
                          {userRow.tipo}
                        </span>
                      </td>
                      {/* <td>{userRow.data_cadastro ? new Date(userRow.data_cadastro).toLocaleDateString() : '-'}</td> <-- COLUNA REMOVIDA */}
                      <td className="actions-cell">
                        {/* Botão Editar */}
                        <button
                          className="btn-secondary btn-icon"
                          onClick={() => handleOpenEditModal(userRow)}
                          title="Editar Utilizador"
                        >
                          <FiEdit />
                        </button>
                        {/* Botão Senha */}
                        <button
                          className="btn-warning btn-icon"
                          onClick={() => handleOpenPasswordModal(userRow)}
                          title="Alterar Senha"
                        >
                          <FiLock />
                        </button>
                      </td>
                    </tr>
                  ))}
                   {/* Mensagem se a lista estiver vazia */}
                   {Array.isArray(usuarios) && usuarios.length === 0 && (
                       <tr>
                           <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--cor-texto-claro)' }}>
                               Nenhum utilizador encontrado.
                           </td>
                       </tr>
                   )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* --- Renderiza os Modais --- */}
      <UserFormModal
        isOpen={isUserFormModalOpen}
        onRequestClose={() => setIsUserFormModalOpen(false)}
        onUserSaved={handleUserSaved}
        userToEdit={userToEdit} // Passa null para criar, userRow para editar
      />

      {/* Renderiza o modal de senha APENAS se houver um user selecionado */}
      {userForPasswordChange && (
          <ChangePasswordModal
            isOpen={isPasswordModalOpen}
            onRequestClose={() => setIsPasswordModalOpen(false)}
            onPasswordChanged={handlePasswordChanged}
            user={userForPasswordChange}
          />
      )}
    </>
  );
}

export default UserManagementPage;