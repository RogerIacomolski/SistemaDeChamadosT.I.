// src/components/TicketChatModal.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx'; // Certifique-se que o caminho está correto

// --- Imagens PNG para Ícones ---
import anexarIcon from '../assets/icons/anexar.png'; // <-- VERIFIQUE ESTE CAMINHO
import enviarIcon from '../assets/icons/enviar.png'; // <-- VERIFIQUE ESTE CAMINHO

// --- CSS do Componente ---
import './TicketChatModal.css'; // Ou o nome correto do seu CSS

// --- Estilos customizados para o Modal (mantidos) ---
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '85vh',
    padding: '0',
    borderRadius: '8px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden' // Garante que o conteúdo não vaze
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000 // Garante que o modal fique sobre outros elementos
  }
};

Modal.setAppElement('#root'); // Necessário para acessibilidade

// --- Funções Auxiliares (mantidas) ---
const formatarData = (dataString) => {
  if (!dataString) return '';
  const data = new Date(dataString);
  return data.toLocaleTimeString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '');
};

const isImage = (fileName) => {
  if (!fileName) return false;
  return /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(fileName);
};

// --- Constantes ---
const POLLING_INTERVAL_MS = 7000; // Intervalo de busca de novas mensagens (7 segundos)
const API_BASE_URL = 'http://192.168.2.104:3001'; // <- CONFIRME SE ESTA É SUA URL CORRETA DA API

function TicketChatModal({ ticket, isOpen, onRequestClose, onTicketUpdated }) {
  const { user } = useAuth();
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [novoStatus, setNovoStatus] = useState(ticket?.status || 'aberto');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const chatBodyRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const prevMensagensRef = useRef([]); // Ref para guardar mensagens da verificação anterior
  const isModalOpenRef = useRef(isOpen); // Ref para controlar o polling de forma segura

  // --- Função Memoizada para buscar mensagens ---
  const fetchMensagens = useCallback(async (showLoading = true) => {
    if (!ticket?.id) return; // Garante que temos um ID de ticket
    if (showLoading) setLoadingMessages(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/chamados/${ticket.id}/mensagens`);
      // Atualiza o estado apenas se os dados recebidos forem diferentes dos atuais
      setMensagens(prevMsgs => {
        if (JSON.stringify(prevMsgs) !== JSON.stringify(response.data)) {
          return response.data;
        }
        return prevMsgs; // Evita re-renderização desnecessária
      });
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      // Não limpa mensagens em caso de erro no polling para não "piscar" a tela
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  }, [ticket?.id]); // Dependência apenas no ID do ticket

  // --- Efeitos ---

  // Atualiza o state 'novoStatus' se o prop 'ticket' mudar externamente
  useEffect(() => {
    if (ticket) setNovoStatus(ticket.status);
  }, [ticket]);

  // Gerencia o início/fim do Polling e a limpeza do estado do modal
  useEffect(() => {
    isModalOpenRef.current = isOpen; // Atualiza a ref sempre que 'isOpen' mudar

    if (ticket && isOpen) {
      console.log("Modal aberto para ticket:", ticket.id, "- Iniciando busca e polling.");
      prevMensagensRef.current = []; // Limpa histórico ao abrir
      fetchMensagens(true); // Busca inicial mostrando loading

      // Limpa intervalo anterior por segurança antes de criar um novo
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

      // Inicia o polling (busca periódica)
      pollingIntervalRef.current = setInterval(() => {
        // Verifica pela Ref se o modal AINDA está aberto antes de buscar
        if (isModalOpenRef.current) {
          // console.log("Polling de mensagens..."); // Log de debug (opcional)
          fetchMensagens(false); // Busca sem mostrar loading
        } else {
          // Se o modal fechou entre os intervalos, para o polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            console.log("Polling interrompido pois o modal fechou.");
          }
        }
      }, POLLING_INTERVAL_MS);

    } else {
      // Se o modal fechou ou não há ticket
      console.log("Modal fechado ou sem ticket. Limpando estado e parando polling.");
      setMensagens([]);
      setSelectedFile(null);
      setNovaMensagem('');
      if (fileInputRef.current) fileInputRef.current.value = ""; // Limpa o input de arquivo
      // Para o polling se ele estiver rodando
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    // Função de limpeza: Garante que o polling pare se o componente for desmontado
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        console.log("Polling parado na limpeza do useEffect (desmontagem/fechamento).");
      }
    };
  }, [ticket, isOpen, fetchMensagens]); // Re-executa se ticket, isOpen ou a função fetchMensagens mudar

  // Efeito para scrollar o chat para a última mensagem
  useEffect(() => {
    if (isOpen && chatBodyRef.current && mensagens.length > 0) {
      // Usar setTimeout garante que o DOM atualizou antes de tentar scrollar
      const scrollTimeout = setTimeout(() => {
        if (chatBodyRef.current) {
          chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
      }, 100); // 100ms costuma ser suficiente
      return () => clearTimeout(scrollTimeout); // Limpa o timeout se o componente atualizar rápido
    }
  }, [mensagens, isOpen]); // Roda quando as mensagens chegam ou o modal abre

  // Efeito para pedir permissão de notificação
  useEffect(() => {
    if (isOpen) {
      // Verifica suporte e se permissão está como 'default' (nem permitido, nem negado)
      if ('Notification' in window && Notification.permission === 'default') {
        console.log('Solicitando permissão para notificações...');
        Notification.requestPermission().then(permission => {
          console.log('Permissão de notificação concedida:', permission);
          if (permission !== 'granted') {
            // Poderia informar o usuário que as notificações não funcionarão
            console.warn('Permissão para notificações não concedida.');
          }
        });
      } else if ('Notification' in window && Notification.permission === 'denied') {
        // Apenas informa no console que foi negado (evita alertar o usuário toda vez)
        console.warn('As permissões de notificação foram negadas anteriormente.');
      }
    }
  }, [isOpen]); // Executa apenas quando o modal abre

  // Efeito para verificar novas mensagens e disparar notificação
  useEffect(() => {
    // Só executa se o modal estiver aberto, tiver um ticket e mensagens carregadas
    if (!isOpen || !ticket || mensagens.length === 0 || !user?.id) {
      prevMensagensRef.current = mensagens; // Atualiza a referência mesmo sem notificar
      return;
    }

    const previousMessages = prevMensagensRef.current; // Mensagens da verificação anterior
    const currentMessages = mensagens; // Mensagens atuais

    // Filtra mensagens que estão no 'current' mas não estavam no 'previous'
    const newMessages = currentMessages.filter(
      (msg) => !previousMessages.some((prevMsg) => prevMsg.id === msg.id)
    );

    // Dentre as novas, pega apenas as que NÃO são do usuário logado e NÃO são otimistas
    const notificationsToShow = newMessages.filter(
      (msg) => msg.id_usuario !== user.id && !msg.isOptimistic
    );

    // Atualiza a referência com as mensagens atuais para a próxima comparação
    prevMensagensRef.current = currentMessages;

    // Se houver mensagens para notificar, verifica permissão e se a aba está visível
    if (notificationsToShow.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
      // Verifica se a aba/janela está OCULTA (minimizado ou outra aba selecionada)
      if (document.hidden) {
        console.log(`Novas mensagens (${notificationsToShow.length}) recebidas com a aba oculta. Notificando...`);
        notificationsToShow.forEach((msg) => {
          const title = `Nova mensagem - Chamado #${ticket.id}`;
          let body = `${msg.nome_usuario}: `;
          if (msg.tipo_mensagem === 'arquivo') {
            body += msg.nome_original_arquivo ? `Enviou "${msg.nome_original_arquivo}"` : 'Enviou um anexo';
          } else {
            // Limita o tamanho do corpo da notificação (opcional)
            body += msg.mensagem.length > 100 ? msg.mensagem.substring(0, 97) + '...' : msg.mensagem;
          }

          // Cria a notificação
          try {
            const notification = new Notification(title, {
              body: body,
              icon: '/favicon.ico', // Opcional: Caminho para um ícone (geralmente na pasta public)
              tag: `chamado-${ticket.id}`, // Agrupa notificações (impede spam)
              renotify: true // Faz vibrar/tocar som mesmo se tag for igual (depende do SO)
            });

            // Adiciona ação ao clicar na notificação
            notification.onclick = () => {
              window.focus(); // Traz a janela/aba do navegador para frente
              // Poderia tentar reabrir o modal se necessário, mas focar a janela é o principal
              notification.close(); // Fecha a notificação após o clique
            };
          } catch (err) {
            console.error("Erro ao criar notificação:", err);
          }
        });
      } else {
        console.log(`Novas mensagens (${notificationsToShow.length}) recebidas, mas a aba está visível.`);
        // Opcional: Tocar um som curto de notificação aqui
        // const audio = new Audio('/caminho/para/som_notificacao.mp3');
        // audio.play().catch(e => console.error("Erro ao tocar som:", e));
      }
    }
  }, [mensagens, user?.id, ticket, isOpen]); // Dependências do efeito de notificação


  // --- Handlers (Funções de Evento) ---

  // Enviar Mensagem (com otimismo)
  const handleEnviarMensagem = async (e) => {
    e.preventDefault();
    if (!user || (!novaMensagem.trim() && !selectedFile) || !ticket?.id) return;

    // 1. Cria objeto da mensagem otimista
    const optimisticMessage = {
      id: `temp-${Date.now()}-${Math.random()}`, // ID único temporário
      id_chamado: ticket.id,
      id_usuario: user.id,
      nome_usuario: user.nome || 'Você',
      mensagem: selectedFile ? (novaMensagem.trim() || selectedFile.name) : novaMensagem.trim(),
      tipo_mensagem: selectedFile ? 'arquivo' : 'texto',
      // Cria URL temporária para imagens otimistas
      url_arquivo: selectedFile && isImage(selectedFile.name) ? URL.createObjectURL(selectedFile) : null,
      nome_original_arquivo: selectedFile ? selectedFile.name : null,
      data_envio: new Date().toISOString(),
      isOptimistic: true // Flag para identificar
    };

    // 2. Adiciona ao estado local imediatamente
    setMensagens(prev => [...prev, optimisticMessage]);

    // 3. Guarda os valores e limpa os inputs
    const messageToSend = novaMensagem;
    const fileToSend = selectedFile;
    setNovaMensagem('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Limpa o input file

    // 4. Prepara o FormData para envio
    const formData = new FormData();
    // Envia a mensagem mesmo que esteja vazia, caso haja um arquivo
    formData.append('mensagem', messageToSend);
    if (fileToSend) {
      formData.append('arquivo', fileToSend);
    }

    setIsSending(true);
    try {
      // 5. Envia para o backend
      await axios.post(
        `${API_BASE_URL}/chamados/${ticket.id}/mensagens`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // 6. SUCESSO: Notifica o componente pai (Dashboard) e força busca local
      if (onTicketUpdated) onTicketUpdated();
      fetchMensagens(false); // Busca imediatamente para substituir a msg otimista pela real

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert(error.response?.data?.message || 'Falha ao enviar mensagem. Tente novamente.');
      // 7. FALHA: Remove a mensagem otimista do estado
      setMensagens(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      // Opcional: Restaurar os inputs para o usuário tentar de novo
      // setNovaMensagem(messageToSend);
      // setSelectedFile(fileToSend); // Requer lógica mais complexa para restaurar o file input
    } finally {
      setIsSending(false);
      // 8. Limpa a URL temporária do Blob (importante para memória)
      if (optimisticMessage.url_arquivo && optimisticMessage.url_arquivo.startsWith('blob:')) {
        URL.revokeObjectURL(optimisticMessage.url_arquivo);
      }
    }
  };

  // Selecionar Arquivo
  const handleFileChange = (event) => {
    const file = event.target.files?.[0]; // Pega o primeiro arquivo ou undefined
    if (file) {
      // Validação de tamanho (ex: 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande! O limite é de 10MB.');
        if (fileInputRef.current) fileInputRef.current.value = ""; // Limpa seleção
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null); // Caso o usuário cancele a seleção
    }
  };

  // Mudar Status (Admin)
  const handleStatusChange = async (e) => {
    if (!ticket?.id) return;
    const statusSelecionado = e.target.value;
    const statusAntigo = novoStatus; // Guarda o status atual para reverter em caso de erro
    setNovoStatus(statusSelecionado); // Atualiza a UI otimisticamente

    try {
      await axios.put(`${API_BASE_URL}/chamados/${ticket.id}/status`, {
        status: statusSelecionado
      });
      // SUCESSO: Notifica o Dashboard
      if (onTicketUpdated) onTicketUpdated();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert(error.response?.data?.message || 'Não foi possível alterar o status.');
      setNovoStatus(statusAntigo); // Reverte a mudança na UI
    }
  };

  // Assumir Chamado (Admin)
  const handleAssumirChamado = async () => {
    if (!ticket?.id || user?.tipo !== 'admin') return;
    try {
      await axios.post(`${API_BASE_URL}/chamados/${ticket.id}/atribuir`);
      // SUCESSO: Notifica o Dashboard e busca mensagens localmente
      if (onTicketUpdated) onTicketUpdated();
      fetchMensagens(false); // Busca mensagens para ver a mensagem automática de atribuição
    } catch (error) {
      console.error('Erro ao assumir chamado:', error);
      alert(error.response?.data?.message || 'Não foi possível assumir o chamado.');
    }
  };

  // --- Renderização Condicional Inicial ---
  if (!isOpen) return null; // Não renderiza nada se o modal não estiver aberto
  if (!ticket && isOpen) { // Se está aberto mas não tem ticket (erro?)
    return (
      <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Erro">
        <div className="modal-header">
          <h3>Erro</h3>
          <button onClick={onRequestClose} className="modal-close-btn">&times;</button>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#dc3545' }}>
          Não foi possível carregar os dados do chamado.
        </div>
      </Modal>
    );
  }

  // --- Renderização Principal ---
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customModalStyles}
      contentLabel={`Detalhes do Chamado #${ticket?.id}`}
    >
      {/* Cabeçalho do Modal */}
      <div className="modal-header">
        <div>
          <h3>{ticket?.titulo || 'Carregando Título...'} (ID: {ticket?.id})</h3>
          <small>Aberto por: {ticket?.nome_usuario || 'Usuário Desconhecido'}</small>
          {/* Opcional: Mostrar Empresa/Criticidade aqui também */}
          {/* <small style={{ marginLeft: '10px' }}> | Empresa: {ticket?.empresa} | Criticidade: {ticket?.criticidade}</small> */}
        </div>
        <button onClick={onRequestClose} className="modal-close-btn" aria-label="Fechar modal">&times;</button>
      </div>

      {/* Barra de Status e Ações (Apenas Admin) */}
      {user?.tipo === 'admin' && (
        <div className="modal-status-bar">
          <div className="status-selector">
            <label htmlFor={`status-select-${ticket?.id}`}>Status:</label>
            <select
              id={`status-select-${ticket?.id}`}
              value={novoStatus}
              onChange={handleStatusChange}
              disabled={!ticket}
              className={`status-${novoStatus}`} // Classe para estilizar o select baseado no status
            >
              <option value="aberto">Aberto</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="fechado">Fechado</option>
            </select>
          </div>
          {/* Botão Assumir ou Info do Técnico */}
          {!ticket?.id_tecnico_atribuido ? (
            <button
              onClick={handleAssumirChamado}
              className="btn-assumir"
              disabled={!ticket}
            >
              Assumir Chamado
            </button>
          ) : (
            <span className="tecnico-atribuido">
              Atribuído a: {ticket?.id_tecnico_atribuido === user?.id ? 'Você' : (ticket?.nome_tecnico || 'Desconhecido')}
            </span>
          )}
        </div>
      )}

      {/* Corpo do Chat (Área de Mensagens) */}
      <div className="modal-chat-body" ref={chatBodyRef}>
        {loadingMessages && <p className="chat-loading">Carregando mensagens...</p>}
        {!loadingMessages && mensagens.length === 0 && (<p className="chat-empty">Nenhuma mensagem neste chamado ainda.</p>)}
        {mensagens.map((msg) => (
          <div
            key={msg.id} // ID real ou temporário
            className={`chat-bubble ${msg.id_usuario === user?.id ? 'minha-mensagem' : 'outra-mensagem'} ${msg.isOptimistic ? 'optimistic' : ''}`}
          >
            <strong>{msg.id_usuario === user?.id ? 'Você' : msg.nome_usuario}</strong>

            {/* Conteúdo da Mensagem: Texto ou Arquivo */}
            {msg.tipo_mensagem === 'arquivo' && (msg.url_arquivo || msg.nome_original_arquivo) ? (
              <div className="mensagem-arquivo">
                {isImage(msg.nome_original_arquivo) ? (
                  // Renderiza Imagem (Usa URL otimista ou URL real da API)
                  <a href={msg.isOptimistic ? msg.url_arquivo : `${API_BASE_URL}${msg.url_arquivo}`} target="_blank" rel="noopener noreferrer" title={`Ver imagem: ${msg.nome_original_arquivo}`}>
                    <img
                      src={msg.isOptimistic ? msg.url_arquivo : `${API_BASE_URL}${msg.url_arquivo}`}
                      alt={msg.nome_original_arquivo || 'Imagem Anexada'}
                      className="chat-imagem-anexo"
                      // Limpa URL do Blob após carregar a imagem real (se aplicável)
                      onLoad={() => { if (msg.url_arquivo && msg.url_arquivo.startsWith('blob:') && !msg.isOptimistic) URL.revokeObjectURL(msg.url_arquivo); }}
                      onError={(e) => e.target.style.display='none'} // Esconde se imagem falhar
                    />
                  </a>
                ) : (
                  // Renderiza Link para outros arquivos
                  <a
                    href={msg.isOptimistic ? '#' : `${API_BASE_URL}${msg.url_arquivo}`} // Link real só se não for otimista
                    target={msg.isOptimistic ? '_self' : '_blank'} // Abre em nova aba só se não for otimista
                    rel="noopener noreferrer"
                    className="link-arquivo"
                    download={msg.isOptimistic ? undefined : (msg.nome_original_arquivo || true)} // Download só se não for otimista
                    title={msg.isOptimistic ? `Enviando: ${msg.nome_original_arquivo}` : `Baixar: ${msg.nome_original_arquivo}`}
                    style={ msg.isOptimistic ? { cursor: 'default', opacity: 0.7 } : {}} // Estilo para otimista
                  >
                    <img src={anexarIcon} alt="Anexo" className="icon-anexo-link" />
                    <span>{msg.nome_original_arquivo || 'Ver Anexo'}</span>
                  </a>
                )}
                {/* Mostra texto adicional se houver */}
                {(msg.mensagem && msg.mensagem !== msg.nome_original_arquivo) && (
                  <p className="texto-anexo">{msg.mensagem}</p>
                )}
              </div>
            ) : (
              // Renderiza Texto normal
              <p>{msg.mensagem}</p>
            )}
            {/* Data/Hora ou Status de Envio */}
            <small>{msg.isOptimistic ? 'Enviando...' : formatarData(msg.data_envio)}</small>
          </div>
        ))}
      </div>

      {/* Formulário de Envio de Mensagem */}
      <form onSubmit={handleEnviarMensagem} className="modal-form-envio">
        {/* Input de Arquivo (oculto) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id={`file-input-${ticket?.id}`} // ID único para o label funcionar
          aria-label="Selecionar arquivo"
        />
        {/* Botão para Anexar (aciona o input oculto) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-anexar"
          title="Anexar ficheiro (Max 10MB)"
          disabled={isSending || !ticket}
          aria-label="Anexar arquivo"
        >
          <img src={anexarIcon} alt="Anexar" />
        </button>

        {/* Campo de Texto para Mensagem */}
        <input
          type="text"
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          placeholder={selectedFile ? `Anexando: ${selectedFile.name}` : "Digite sua mensagem..."}
          disabled={isSending || !ticket}
          aria-label="Digite sua mensagem"
          className="input-mensagem"
        />
        {/* Botão de Enviar */}
        <button
          type="submit"
          className="btn-enviar"
          // Habilita se tiver texto OU arquivo selecionado (e não estiver enviando)
          disabled={isSending || (!novaMensagem.trim() && !selectedFile) || !ticket}
          title="Enviar mensagem"
          aria-label="Enviar mensagem"
        >
          {/* Mostra '...' durante o envio, senão o ícone */}
          {isSending ? '...' : <img src={enviarIcon} alt="Enviar" />}
        </button>
      </form>
    </Modal>
  );
}

export default TicketChatModal;