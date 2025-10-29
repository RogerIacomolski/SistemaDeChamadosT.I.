// src/components/MainLayout.jsx (CRIE ESTE FICHEIRO)

import React, { useState } from 'react';
import { Outlet, Link, useLocation, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Importe o CSS que tem o estilo da sidebar
import '../pages/Dashboard.css'; 

// Importe os ícones
import {
    FiHome, FiUsers, FiLogOut, FiPlus, FiMenu, FiX,
    FiBarChart2 // --- NOVO ÍCONE ---
  } from 'react-icons/fi';

// O Componente de Filtro agora vive no Layout
const FilterButton = ({ status, label, activeFilter, setFilter }) => (
  <button 
    className={`filter-btn ${activeFilter === status ? 'active' : ''}`}
    onClick={() => setFilter(status)}
  >
    {label}
  </button>
);

function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation(); // Para o link 'active'
  
  // O estado do filtro VIVE AQUI, no Layout, pois os botões estão aqui
  const [filterStatus, setFilterStatus] = useState('aberto'); 

  return (
    <div className="dashboard-container">
      
      {/* --- 1. SIDEBAR (Copiada do seu Dashboard.jsx) --- */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          HelpDesk T.I.
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">{user?.nome[0].toUpperCase()}</div>
          <div className="user-info">
            <strong>{user?.nome}</strong>
            <span>{user?.tipo}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
   <Link 
     to="/" 
     className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
     onClick={() => setIsSidebarOpen(false)} // Add onClick here too
   >
     <FiHome /> Dashboard
   </Link>
   
   {/* --- Start Admin Links Block --- */}
   {user?.tipo === 'admin' && (
     <> {/* Use a Fragment <> to group multiple admin links */}
       <Link 
         to="/admin/users" 
         className={`nav-link ${location.pathname === '/admin/users' ? 'active' : ''}`}
         onClick={() => setIsSidebarOpen(false)} // Add onClick here
       >
         <FiUsers /> Gerir Utilizadores
       </Link>
       
       {/* --- Move Relatórios Link INSIDE this block --- */}
       <Link 
         to="/admin/reports" 
         className={`nav-link ${location.pathname === '/admin/reports' ? 'active' : ''}`} 
         onClick={() => setIsSidebarOpen(false)} 
       >
         <FiBarChart2 /> Relatórios
       </Link>
     </>
   )}
   {/* --- End Admin Links Block --- */}
   
 </nav>
        {/* Filtros (Agora controlados aqui) */}
        <div className="sidebar-filters">
          <h4>Vistas Rápidas</h4>
          <FilterButton status="aberto" label="Abertos" activeFilter={filterStatus} setFilter={setFilterStatus} />
          <FilterButton status="em_andamento" label="Em Andamento" activeFilter={filterStatus} setFilter={setFilterStatus} />
          <FilterButton status="fechado" label="Fechados" activeFilter={filterStatus} setFilter={setFilterStatus} />
          <FilterButton status="todos" label="Ver Todos" activeFilter={filterStatus} setFilter={setFilterStatus} />
        </div>

        {/* RAMAIS ==================== 
        <div className="sidebar-filters">
          <h4>Atalhos</h4>
          <FilterButton status="Ramais" label="Ramais" activeFilter={filterStatus} setFilter={setFilterStatus} />
          
        </div>*/}
        
        <div className="sidebar-footer">
          <button onClick={logout} className="nav-link logout-btn">
            <FiLogOut /> Sair
          </button>
          {/* --- ADICIONE O FOOTER AQUI --- */}
        <footer className="app-footer">
          <p>
            &copy; {new Date().getFullYear()} Desenvolvido pelo empresa Union.
            
          </p>
        </footer>
        {/* --- FIM DO FOOTER --- */}
        </div>
      </aside>
      

      {/* --- 2. CONTEÚDO PRINCIPAL (Onde as páginas entram) --- */}
      <div className="dashboard-main-content">
        {/* O Outlet renderiza o componente da rota (Dashboard ou UserManagementPage).
          Passamos o 'filterStatus' e o 'setFilterStatus' para as páginas filhas.
        */}
        <Outlet context={{ filterStatus, setFilterStatus }} />
      </div>
    </div>
  );
}

// Hook customizado para as páginas filhas (Dashboard) usarem o contexto
export function useLayoutContext() {
  return useOutletContext();
}

export default MainLayout;