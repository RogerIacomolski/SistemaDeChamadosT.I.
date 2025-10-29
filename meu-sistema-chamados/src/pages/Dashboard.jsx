// src/pages/Dashboard.jsx (COM POLLING DUPLO PARA ATUALIZAÇÕES)

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import TicketList from '../components/TicketList.jsx';
import TicketChatModal from '../components/TicketChatModal.jsx';
import TicketFormModal from '../components/TicketFormModal.jsx';
import { useLayoutContext } from '../components/MainLayout.jsx';
import {
  FiPlus, FiFileText, FiClock, FiCheckCircle, FiChevronRight
} from 'react-icons/fi';

// *** Certifique-se que o nome do CSS está correto ***
import './DashboardCSS.css'; // Ou './DashboardCSS.css'

const KpiCard = ({ title, count, icon, status, setFilter }) => (
  <div className="kpi-card" onClick={() => setFilter(status)}>
    <div className="kpi-icon-wrapper">{icon}</div>
    <div className="kpi-info">
      <span className="kpi-title">{title}</span>
      <span className="kpi-count">{count}</span>
    </div>
    <FiChevronRight className="kpi-arrow" />
  </div>
);

// --- Componente Principal do Dashboard ---
function Dashboard() {
  const { user } = useAuth();
  const { filterStatus, setFilterStatus } = useLayoutContext();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const previousNotificacoesRef = useRef([]);

  // Flag para evitar múltiplas buscas simultâneas
  const isFetchingTicketsRef = useRef(false);

  const API_BASE_URL = 'http://192.168.2.104:3001';

  // --- Funções de Busca ---
  const fetchNotificacoes = async (isInitialLoad = false) => {
    // Evita buscar se já estiver buscando tickets (menos importante para notificações)
    // if (isFetchingTicketsRef.current && !isInitialLoad) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/notificacoes`);
      const currentNotificacoes = response.data || [];
      setNotificacoes(currentNotificacoes);

      const previousNotificacoes = previousNotificacoesRef.current;
      const hasNewNotifications = currentNotificacoes.some(id => !previousNotificacoes.includes(id));

      // Trigger para Admin: Se houver notificações novas E a lista aumentou
      if (!isInitialLoad && user?.tipo === 'admin' && hasNewNotifications && currentNotificacoes.length > previousNotificacoes.length) {
         console.log("Dashboard: Novas notificações detetadas via polling, buscando tickets...");
         fetchTickets(false); // Busca tickets em background
      }

      previousNotificacoesRef.current = currentNotificacoes;

    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
         console.error('Erro ao buscar notificações:', err);
      }
    }
  };

  const fetchTickets = async (showInitialLoading = false) => {
    // Previne múltiplas chamadas simultâneas
    if (isFetchingTicketsRef.current) {
        // console.log("Dashboard: fetchTickets já em andamento, ignorando nova chamada."); // Para depuração
        return;
    }
    isFetchingTicketsRef.current = true; // Marca como buscando

    if (showInitialLoading) {
        setLoading(true);
    }
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/chamados`);
      setTickets(response.data);
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
         setError('Erro ao buscar seus chamados.');
         console.error('Erro fetchTickets:', err);
      }
    } finally {
      if (showInitialLoading) {
        setLoading(false);
      }
      isFetchingTicketsRef.current = false; // Marca como busca finalizada
    }
  };

  // --- UseEffects ---
  // 1. Busca inicial de tickets (com loading)
  useEffect(() => {
    fetchTickets(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Polling de Notificações (a cada 5 segundos)
  useEffect(() => {
    fetchNotificacoes(true); // Busca inicial
    const intervalId = setInterval(() => fetchNotificacoes(false), 5000); // Poll a cada 5 segundos
    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Depende do 'user'

  // *** NOVO *** 3. Polling de Tickets (a cada 30 segundos como fallback)
  useEffect(() => {
    // Não executa a busca inicial aqui, pois o primeiro useEffect já faz isso.
    const intervalId = setInterval(() => {
        // console.log("Dashboard: Polling de tickets (30s)..."); // Para depuração
        fetchTickets(false); // Busca em background
    }, 30000); // 30000ms = 30 segundos (ajuste conforme necessário)
    return () => clearInterval(intervalId); // Limpa ao desmontar
  }, []); // Roda apenas uma vez para configurar o intervalo


  // --- Handlers ---
  // Chamado pelo TicketFormModal quando um ticket é criado
  const handleTicketCreatedInternal = () => {
      fetchTickets(false); // Busca tickets sem loading
      setIsNewTicketModalOpen(false);
      fetchNotificacoes(false); // Força busca de notificações
  };

  // Abre o modal de chat
  const handleOpenChatModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsChatModalOpen(true);
  };
  // Fecha o modal de chat e atualiza dados
  const handleCloseChatModal = () => {
    setIsChatModalOpen(false);
    setSelectedTicket(null);
    fetchTickets(false); // Atualiza ao fechar
    fetchNotificacoes(false);
  };
  // Chamado pelo modal de chat quando status/atribuição/mensagem mudam
  const handleTicketUpdated = async () => {
    // console.log("Dashboard: handleTicketUpdated foi chamada!"); // Para depuração
    await fetchTickets(false); // Espera a busca iniciar
    await fetchNotificacoes(false); // Espera a busca iniciar
    // console.log("Dashboard: fetchTickets e fetchNotificacoes chamadas dentro de handleTicketUpdated."); // Para depuração
  };


  // --- Lógica de Filtros e KPIs ---
  const filteredTickets = useMemo(() => {
     if (!tickets || tickets.length === 0) return [];
     if (!filterStatus || filterStatus === 'todos') {
      return tickets;
    }
    return tickets.filter(ticket => ticket.status === filterStatus);
  }, [tickets, filterStatus]);

  const kpiCounts = useMemo(() => {
     if (!tickets || tickets.length === 0) return { aberto: 0, em_andamento: 0, fechado: 0 };
     return {
      aberto: tickets.filter(t => t.status === 'aberto').length,
      em_andamento: tickets.filter(t => t.status === 'em_andamento').length,
      fechado: tickets.filter(t => t.status === 'fechado').length,
    };
  }, [tickets]);


  // --- Renderização ---
  return (
    <>
      {/* Cabeçalho do Conteúdo */}
      <header className="dashboard-main-header">
         <h1>{user?.tipo === 'admin' ? 'Painel do Administrador' : 'Meu Painel'}</h1>
         <button onClick={() => setIsNewTicketModalOpen(true)} className="btn-primary">
           <FiPlus /> Novo Chamado
         </button>
      </header>

      {/* KPIs */}
      <section className="kpi-card-grid">
         <KpiCard
           title="Chamados Abertos"
           count={kpiCounts.aberto}
           status="aberto"
           setFilter={setFilterStatus || (() => {})}
           icon={<FiFileText />}
         />
         <KpiCard
           title="Em Andamento"
           count={kpiCounts.em_andamento}
           status="em_andamento"
           setFilter={setFilterStatus || (() => {})}
           icon={<FiClock />}
         />
         <KpiCard
           title="Fechados"
           count={kpiCounts.fechado}
           status="fechado"
           setFilter={setFilterStatus || (() => {})}
           icon={<FiCheckCircle />}
         />
      </section>

      {/* Lista de Chamados */}
      <section className="ticket-list-container">
         <div className="ticket-list-header">
           <h3>
             Chamados: <span style={{ textTransform: 'capitalize' }}>{(filterStatus || 'aberto').replace('_', ' ')}</span> ({filteredTickets.length})
           </h3>
         </div>

         {/* Mostra loading apenas na primeira carga */}
         {loading && <p className="loading-text">A carregar chamados...</p>}
         {error && <p className="error-text">{error}</p>}

         {!loading && !error && filteredTickets.length === 0 && (
           <p className='ticket-list-empty'>Nenhum chamado encontrado para este status.</p>
         )}

         {!error && filteredTickets && (
           <TicketList
             tickets={filteredTickets}
             onTicketSelect={handleOpenChatModal}
             notificacoes={notificacoes}
           />
         )}
      </section>

      {/* Modais */}
      <TicketChatModal
         ticket={selectedTicket}
         isOpen={isChatModalOpen}
         onRequestClose={handleCloseChatModal}
         onTicketUpdated={handleTicketUpdated} // Passa a função corrigida
      />
      <TicketFormModal
         isOpen={isNewTicketModalOpen}
         onRequestClose={() => setIsNewTicketModalOpen(false)}
         onTicketCreated={handleTicketCreatedInternal}
      />
    </>
  );
}

export default Dashboard;