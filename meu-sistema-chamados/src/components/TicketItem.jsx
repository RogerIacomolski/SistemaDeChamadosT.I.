import React, { useMemo, memo, useState, useRef, useEffect } from 'react';
import './TicketItem.css';

// --- Funções Auxiliares ---

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  'http://192.168.2.104:3001'; 

// MUDANÇA: Adicionada de volta
const buildAnexoUrl = (path) => {
  try {
    return path ? new URL(path, API_BASE_URL).toString() : null;
  } catch {
    return null;
  }
};

const timeAgo = (dataString) => {
  if (!dataString) return '';
  const data = new Date(dataString);
  if (isNaN(data.getTime())) return '';
  const now = new Date();
  const seconds = Math.round((now.getTime() - data.getTime()) / 1000);
  if (seconds < 60) return "agora mesmo";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.round(hours / 24);
  return `${days} dias atrás`;
};

const formatarDataSimples = (dataString) => {
  if (!dataString) return '';
  const data = new Date(dataString);
  if (isNaN(data.getTime())) return '';
  return data.toISOString().split('T')[0];
};

const humanizeStatus = (status) => {
  const s = String(status || 'aberto').replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// --- Componentes Auxiliares ---

// MUDANÇA: Adicionado de volta
const PaperclipIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12" /* Tamanho menor para o badge */
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5" /* Linha mais grossa */
    strokeLinecap="round"
    strokeLinejoin="round"
    className="paperclip-icon"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
));

const StatusBadge = memo(({ status }) => {
  const raw = String(status || 'aberto');
  const humanized = humanizeStatus(raw);
  const statusClassName = `status-badge status-${raw.replace(/_/g, '-')}`;
  return (
    <span className={statusClassName} aria-label={`Status: ${humanized}`}>
      {humanized}
    </span>
  );
});

const Avatar = memo(({ nome }) => {
  const inicial = nome ? nome.charAt(0).toUpperCase() : '?';
  return (
    <div className="avatar-placeholder" title={nome}>
      <span>{inicial}</span>
    </div>
  );
});

const TitleTags = memo(({ categoria, criticidade, empresa }) => (
  <div className="title-tags">
    
    {/* ADICIONADO: Lógica das Tags de Empresa */}
    {empresa === 'Empresa X' && (
      <span className="tag-company tag-empresax">Empresa X</span>
    )}
    {empresa === 'Empresa Y' && (
      <span className="tag-company tag-empresay">Empresa Y</span>
    )}
    {/* FIM DA ADIÇÃO */}

    {categoria && <span className="tag-general">{categoria}</span>}
    {criticidade === 'Alta' && <span className="tag-prio tag-alta" title="Alta">A</span>}
    {criticidade === 'Media' && <span className="tag-prio tag-media" title="Média">M</span>}
    {criticidade === 'Baixa' && <span className="tag-prio tag-baixa" title="Baixa">B</span>}
  </div>
));


// --- Componente Principal (Completo) ---
function TicketItem({ ticket, onSelect, notificacoes }) {
  if (!ticket) return null;

  // Hooks para "Ver mais"
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descriptionRef = useRef(null); 

  // Lógica da Notificação
  const temNotificacao = useMemo(() => 
    Array.isArray(notificacoes) && notificacoes.includes(ticket.id),
    [notificacoes, ticket.id]
  );

  // Lógica das Datas
  const dataRelativa = useMemo(() => 
    timeAgo(ticket.data_abertura), 
    [ticket.data_abertura]
  );
  const dataAbsoluta = useMemo(() => 
    formatarDataSimples(ticket.data_abertura),
    [ticket.data_abertura]
  );
  
  // MUDANÇA: Lógica do Anexo
  const anexoUrlCompleta = useMemo(() => 
    buildAnexoUrl(ticket.anexo_url),
    [ticket.anexo_url]
  );

  // Efeito para checar overflow da descrição
  useEffect(() => {
    const checkOverflow = () => {
      const el = descriptionRef.current;
      if (el) {
        const computedStyle = getComputedStyle(el);
        const lineHeight = parseFloat(computedStyle.lineHeight);
        const twoLinesHeight = (lineHeight * 2) + 1; 
        const scrollHeight = el.scrollHeight;
        setIsOverflowing(scrollHeight > twoLinesHeight);
      }
    };
    
    const timer = setTimeout(checkOverflow, 50);
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [ticket.descricao]); 

  // Funções de Evento
  const handleSelect = () => onSelect?.(ticket);
  const stop = (e) => e.stopPropagation();

  const handleToggleExpand = (e) => {
    stop(e); 
    setIsExpanded(prev => !prev);
  };

  return (
    <div
      className={`ticket-item-row ${temNotificacao ? 'has-notification' : ''}`}
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect()}
      aria-label={`Abrir chamado ${ticket.titulo || ticket.id}`}
    >
      {/* Col 1 e Col 2 (Checkbox, Avatar) ... */}
      <div className="ticket-col-select" onClick={stop}>
        <div className="checkbox-placeholder"></div>
      </div>
      <div className="ticket-col-user">
        <Avatar nome={ticket.nome_usuario} />
        <div className="user-info">
          <span className="user-name">{ticket.nome_usuario || 'Usuário'}</span>
          <span className="user-email">{ticket.email || ticket.empresa || 'Sem empresa'}</span>
        </div>
      </div>

      {/* Col 3: Conteúdo Principal ... */}
      <div className="ticket-col-main">
        <div className="ticket-main-header">
          <div className="ticket-title-wrapper">
            <span className="ticket-title">{ticket.titulo}</span>
            {temNotificacao && (
              <span className="notification-dot" title="Nova mensagem" aria-hidden="true" />
            )}
          </div>
          <TitleTags categoria={ticket.categoria} criticidade={ticket.criticidade} empresa={ticket.empresa} />
        </div>
        
        {ticket.descricao && (
          <p 
            className={`ticket-item-description ${
                isOverflowing && !isExpanded ? 'is-clamped' : ''
            }`}
            ref={descriptionRef}
            aria-hidden={isOverflowing && !isExpanded} 
          >
            {ticket.descricao}
          </p>
        )}
        
        {isOverflowing && (
          <button 
            className="see-more-btn" 
            onClick={handleToggleExpand}
            aria-expanded={isExpanded}
          >
            {isExpanded ? 'Ver menos' : 'Ver mais'}
          </button>
        )}
      </div>

      {/* Col 4: Badges de Status (MUDANÇA AQUI) */}
      <div className="ticket-col-tags">
        
        {/* MUDANÇA: Botão de Anexo Adicionado */}
        {anexoUrlCompleta && (
          <a
            href={anexoUrlCompleta}
            target="_blank"
            rel="noopener noreferrer"
            className="attachment-badge" // O "lindo botão"
            title={ticket.anexo_nome || 'Ver anexo'}
            onClick={stop} // Impede o clique no card
            aria-label="Abrir anexo em nova aba"
          >
            <PaperclipIcon />
            <span>Anexo</span>
          </a>
        )}
        
        <StatusBadge status={ticket.status} />
      </div>

      {/* Col 5: Data ... */}
      <div className="ticket-col-date">
        <span className="date-relative">{dataRelativa}</span>
        <span className="date-absolute">{dataAbsoluta}</span>
      </div>
    </div>
  );
}

export default memo(TicketItem);