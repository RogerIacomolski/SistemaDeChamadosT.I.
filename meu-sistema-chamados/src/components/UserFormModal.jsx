// src/components/UserFormModal.jsx (ATUALIZADO COM DEPARTAMENTO)

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { API_URL } from '../context/AuthContext'; // Importa a URL base

// Funções da API (podem ser movidas para um ficheiro api.js)
const adminCreateUser = (userData) => axios.post(`${API_URL}/admin/users`, userData);
const adminUpdateUser = (userId, userData) => axios.put(`${API_URL}/admin/users/${userId}`, userData);
// *** NOVO: Função para buscar departamentos ***
const getDepartamentos = () => axios.get(`${API_URL}/departamentos`);

// Estilos do Modal - Use as suas classes CSS ou estilos inline
// Garanta que Modal.setAppElement('#root') está no seu App.jsx ou index.js principal

function UserFormModal({ isOpen, onRequestClose, onUserSaved, userToEdit }) {
    const isEditMode = Boolean(userToEdit);

    // Estado unificado para o formulário
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '', // Só para criar
        tipo: 'comum',
        departamento: '', // *** NOVO CAMPO ***
    });

    // *** NOVO: Estados para departamentos ***
    const [departamentosLista, setDepartamentosLista] = useState([]); // Guarda [{id, nome}, ...]
    const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);

    // Estados de controlo
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Efeito para buscar departamentos ---
    useEffect(() => {
        const fetchDepartamentos = async () => {
            setLoadingDepartamentos(true);
            try {
                const response = await getDepartamentos();
                setDepartamentosLista(response.data || []); // Guarda a lista completa [{id, nome}, ...]
                // Define valor inicial SÓ se for criar e a lista não estiver vazia
                if (!isEditMode && response.data?.length > 0 && !formData.departamento) {
                     // Define o ID do primeiro departamento como padrão ao criar
                     setFormData(prev => ({ ...prev, departamento: response.data[0].id }));
                }
            } catch (err) {
                console.error("Erro ao buscar departamentos:", err);
                // Não define erro aqui para não sobrescrever erros do formulário principal
            } finally {
                setLoadingDepartamentos(false);
            }
        };

        if (isOpen) { // Busca apenas quando o modal abre
            fetchDepartamentos();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]); // Depende só de isOpen

    // --- Efeito para preencher o formulário ---
    useEffect(() => {
        if (isOpen) { // Só executa quando o modal está aberto
            if (isEditMode && userToEdit) {
                setFormData({
                    nome: userToEdit.nome || '',
                    email: userToEdit.email || '',
                    tipo: userToEdit.tipo || 'comum',
                    // *** NOVO: Preenche departamento (usa o NOME para encontrar o ID correspondente) ***
                    // Assumindo que userToEdit.departamento é o NOME e departamentosLista tem {id, nome}
                    departamento: departamentosLista.find(d => d.nome === userToEdit.departamento)?.id || '',
                    senha: '', // Limpa senha ao editar
                });
            } else {
                // Limpa para modo criação, define departamento padrão se a lista carregou
                setFormData({
                    nome: '',
                    email: '',
                    senha: '',
                    tipo: 'comum',
                    departamento: departamentosLista.length > 0 ? departamentosLista[0].id : '', // Usa ID do primeiro
                });
            }
            setError(''); // Limpa erros ao abrir/mudar modo
        }
    }, [isOpen, isEditMode, userToEdit, departamentosLista]); // Re-executa se qualquer um destes mudar

    // Handler para mudanças nos inputs/selects
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler de Submissão
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validações
        if (!formData.nome || !formData.email || !formData.tipo || !formData.departamento) {
            setError('Todos os campos (Nome, Email, Tipo, Departamento) são obrigatórios.'); return;
        }
        if (!isEditMode && (!formData.senha || formData.senha.length < 6)) {
             setError('Senha é obrigatória (mínimo 6 caracteres) para criar utilizador.'); return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
             setError('Formato de e-mail inválido.'); return;
        }

        setIsSubmitting(true);

        // Prepara os dados a enviar (exclui senha se for edição)
        const userData = {
            nome: formData.nome,
            email: formData.email,
            tipo: formData.tipo,
            departamento: formData.departamento, // Envia o ID do departamento
            ...(isEditMode ? {} : { senha: formData.senha })
        };

        try {
            if (isEditMode) {
                await adminUpdateUser(userToEdit.id, userData);
            } else {
                await adminCreateUser(userData);
            }
            if (onUserSaved) onUserSaved(); // Chama a função do pai

        } catch (err) {
            setError(err.response?.data?.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} utilizador.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            // style={customModalStyles} // Use estilos se necessário
            className="modal-content user-form-modal" // Adicione uma classe específica
            overlayClassName="modal-backdrop"
            contentLabel={isEditMode ? "Editar Utilizador" : "Criar Novo Utilizador"}
        >
            <form onSubmit={handleSubmit}>
                <div className="modal-header">
                    <h2>{isEditMode ? `Editar Utilizador: ${userToEdit?.nome}` : 'Criar Novo Utilizador'}</h2>
                    <button type="button" className="modal-close-btn" onClick={onRequestClose} disabled={isSubmitting}>&times;</button>
                </div>

                <div className="modal-body">
                    {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                    <div className="form-group">
                        <label htmlFor="nome-modal">Nome</label>
                        <input type="text" id="nome-modal" name="nome" value={formData.nome} onChange={handleFormChange} className="form-input" required disabled={isSubmitting} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email-modal">Email</label>
                        <input type="email" id="email-modal" name="email" value={formData.email} onChange={handleFormChange} className="form-input" required disabled={isSubmitting} />
                    </div>

                    {/* --- CAMPO DEPARTAMENTO --- */}
                    <div className="form-group">
                        <label htmlFor="departamento-modal">Departamento</label>
                        <select
                            id="departamento-modal"
                            name="departamento" // O 'name' deve bater com a chave no state formData
                            value={formData.departamento} // Controlado pelo state
                            onChange={handleFormChange}
                            className="form-input" // Reutiliza estilo (ou use form-select)
                            required
                            disabled={isSubmitting || loadingDepartamentos}
                        >
                            {loadingDepartamentos ? (
                                <option value="" disabled>A carregar...</option>
                            ) : (
                                departamentosLista.length > 0 ? (
                                    <>
                                        {/* Opção vazia para forçar seleção se não houver valor inicial */}
                                        <option value="" disabled={formData.departamento !== ''}>-- Selecione um Departamento --</option>
                                        {/* Mapeia a lista de departamentos vinda da API */}
                                        {departamentosLista.map((dep) => (
                                            // Assume que a API retorna {id, nome}
                                            <option key={dep.id} value={dep.id}>{dep.nome}</option>
                                        ))}
                                    </>
                                ) : (
                                    <option value="" disabled>Nenhum departamento disponível</option>
                                )
                            )}
                        </select>
                    </div>
                    {/* --- FIM CAMPO DEPARTAMENTO --- */}


                    <div className="form-group">
                        <label htmlFor="tipo-modal">Tipo</label>
                        <select id="tipo-modal" name="tipo" value={formData.tipo} onChange={handleFormChange} className="form-input" required disabled={isSubmitting}>
                            <option value="comum">Comum</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Campos de Senha (SÓ para Criar) */}
                    {!isEditMode && (
                        <>
                            <div className="form-group">
                                <label htmlFor="senha-modal">Senha (mínimo 6 caracteres)</label>
                                <input type="password" id="senha-modal" name="senha" value={formData.senha} onChange={handleFormChange} className="form-input" required minLength={6} disabled={isSubmitting} />
                            </div>
                            {/* Opcional: Adicionar confirmação de senha */}
                            {/* <div className="form-group">
                                <label htmlFor="confirmar-senha-modal">Confirmar Senha</label>
                                <input type="password" id="confirmar-senha-modal" name="confirmarSenha" ... />
                            </div> */}
                        </>
                    )}
                </div>

                <div className="modal-footer modal-actions"> {/* Reutiliza .modal-actions */}
                    <button type="button" className="btn-secondary" onClick={onRequestClose} disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className={`btn-primary login-button ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                        {isSubmitting ? '' : (isEditMode ? 'Salvar Alterações' : 'Criar Utilizador')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// Reutilize os estilos dos outros modais ou defina estilos específicos
const customModalStyles = {
  content: { /* ... */ },
  overlay: { /* ... */ }
};

export default UserFormModal;