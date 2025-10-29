import React from 'react';
import Modal from 'react-modal';
import TicketForm from './TicketForm.jsx'; // Importa o formulário que já temos

// Estilos customizados para o Modal (mais simples que o de chat)
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '500px', // Mais estreito que o chat
    padding: '0',
    borderRadius: '8px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    border: 'none',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  }
};

// Informa ao Modal qual é o elemento principal do app
Modal.setAppElement('#root');

function TicketFormModal({ isOpen, onRequestClose, onTicketCreated }) {
  
  // Esta função é chamada pelo TicketForm após o sucesso
  const handleTicketCreatedAndClose = () => {
    onTicketCreated();  // Avisa o Dashboard para recarregar a lista
    onRequestClose(); // Fecha este modal
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customModalStyles}
      contentLabel="Abrir Novo Chamado"
    >
      {/* Cabeçalho do Modal */}
      <div className="modal-header">
        <h3 style={{ margin: 0 }}>Abrir Novo Chamado</h3>
        <button onClick={onRequestClose} className="modal-close-btn">&times;</button>
      </div>
      
      {/* Corpo do Modal (O Formulário) */}
      <div style={{ padding: '1.5rem' }}>
        <TicketForm 
          onTicketCreated={handleTicketCreatedAndClose}
        />
      </div>
    </Modal>
  );
}

export default TicketFormModal;