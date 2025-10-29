import React from 'react';
import TicketItem from './TicketItem.jsx';


function TicketList({ tickets, onTicketSelect, notificacoes }) {
  return (
    // O h2 "Meus Chamados" foi removido daqui e movido para o Dashboard
    <div className="ticket-list">
      {tickets.length === 0 ? (
        <p className="ticket-list-empty">Nenhum chamado encontrado com este filtro.</p>
      ) : (
        <div>
          {tickets.map((ticket) => (
            <TicketItem 
              key={ticket.id} 
              ticket={ticket} 
              onSelect={onTicketSelect}
              notificacoes={notificacoes}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TicketList;