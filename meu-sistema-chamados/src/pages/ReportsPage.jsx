// src/pages/ReportsPage.jsx

// 1. CORRIGIDO: Imports do React (useState, etc.) adicionados ao topo
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';

// 2. CORRIGIDO: Este caminho (../) está correto para src/pages/
import { API_URL, useAuth } from "../context/AuthContext.jsx";

// 3. CORRIGIDO: Este caminho (./) está correto para src/pages/
import "./Dashboard.css";
import "./ReportsPage.css"; // CSS específico



// Registra os componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Funções para buscar dados
const fetchSummary = () => axios.get(`${API_URL}/admin/reports/summary`);
const fetchByDepartment = () => axios.get(`${API_URL}/admin/reports/by-department`);
const fetchByTechnician = () => axios.get(`${API_URL}/admin/reports/by-technician`);

function ReportsPage() {
    const { user } = useAuth();
    const [summaryData, setSummaryData] = useState(null);
    const [departmentData, setDepartmentData] = useState(null); // Deve ser Array
    const [technicianData, setTechnicianData] = useState(null); // Deve ser Array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadReports = async () => {
            setLoading(true);
            setError('');
            try {
                console.log("ReportsPage: Iniciando busca de dados..."); // Log
                const [summaryRes, departmentRes, technicianRes] = await Promise.all([
                    fetchSummary(),
                    fetchByDepartment(),
                    fetchByTechnician()
                ]);
                console.log("ReportsPage: Dados recebidos:", { summary: summaryRes.data, department: departmentRes.data, tech: technicianRes.data }); // Log
                setSummaryData(summaryRes.data);
                // Garante que departmentData e technicianData sejam arrays
                setDepartmentData(Array.isArray(departmentRes.data) ? departmentRes.data : []);
                setTechnicianData(Array.isArray(technicianRes.data) ? technicianRes.data : []);
            } catch (err) {
                console.error("Erro ao carregar relatórios:", err);
                setError('Falha ao carregar dados dos relatórios. ' + (err.response?.data?.message || err.message));
                // Limpa os dados em caso de erro para evitar problemas nos gráficos
                setSummaryData(null);
                setDepartmentData(null);
                setTechnicianData(null);
            } finally {
                setLoading(false);
                console.log("ReportsPage: Busca finalizada."); // Log
            }
        };
        loadReports();
    }, []);

    // --- Configurações dos Gráficos (com mais verificações) ---
    const statusChartData = useMemo(() => {
        // Retorna null se não houver dados, para não tentar renderizar gráfico vazio
        if (!summaryData) return null;
        return {
            labels: ['Abertos', 'Em Andamento', 'Fechados'],
            datasets: [{
                label: 'Nº de Chamados',
                data: [
                    summaryData.aberto || 0, // Acesso seguro
                    summaryData.em_andamento || 0,
                    summaryData.fechado || 0
                ],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)', // Usa cores CSS se preferir
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(245, 158, 11)',
                    'rgb(34, 197, 94)',
                ],
                borderWidth: 1,
            }],
        };
    }, [summaryData]);

    const departmentChartData = useMemo(() => {
        // Retorna null se não for array ou estiver vazio
        if (!Array.isArray(departmentData) || departmentData.length === 0) return null;
        return {
            labels: departmentData.map(d => d.departamento),
            datasets: [{
                label: 'Chamados por Departamento',
                data: departmentData.map(d => d.count),
                backgroundColor: 'rgba(79, 70, 229, 0.7)',
                borderColor: 'rgb(79, 70, 229)',
                borderWidth: 1,
            }],
        };
    }, [departmentData]);

    const technicianChartData = useMemo(() => {
        // 4. CORRIGIDO: Removido o 's' que estava causando o erro
        // Retorna null se não for array ou estiver vazio
        if (!Array.isArray(technicianData) || technicianData.length === 0) return null;
        return {
            labels: technicianData.map(t => t.technician_name),
            datasets: [{
                label: 'Chamados Atribuídos por Técnico',
                data: technicianData.map(t => t.count),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            }],
        };
    }, [technicianData]);

    const barChartOptions = { /* ... como antes ... */ };

    return (
        <>
            <header className="dashboard-main-header">
                <h1>Relatórios e Métricas</h1>
            </header>

            {error && <div className="alert alert-danger">{error}</div>}
            {loading && <p className="loading-text">A carregar relatórios...</p>}

            {!loading && !error && (
                <div className="reports-grid">

                    {/* KPIs Resumidos */}
                    {summaryData && ( // Renderiza só se houver dados
                        <div className="report-card kpi-summary-card">
                            <h4>Resumo Geral</h4>
                            <div className="kpi-summary-grid">
                                {/* ... kpi items ... */}
                            </div>
                        </div>
                    )}

                    {/* Gráfico de Status */}
                    {statusChartData && ( // Renderiza só se houver dados
                        <div className="report-card chart-card">
                            <h4>Chamados por Status</h4>
                            <div className="chart-container" style={{ height: '250px' }}>
                                <Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                        </div>
                    )}

                    {/* 5. CORRIGIDO: Removidos caracteres 'i', 't', 'S', 'nbsp;' do JSX abaixo */}

                    {/* Gráfico por Departamento */}
                    {departmentChartData && ( // Renderiza só se houver dados
                        <div className="report-card chart-card wide-card">
                            <h4>Chamados por Departamento</h4>
                            <div className="chart-container" style={{ height: '350px' }}>
                                <Bar options={barChartOptions} data={departmentChartData} />
                            </div>
                        </div>
                    )}

                    {/* Gráfico por Técnico */}
                    {technicianChartData && ( // Renderiza só se houver dados
                        <div className="report-card chart-card wide-card">
                            <h4>Chamados Atribuídos por Técnico</h4>
                            <div className="chart-container" style={{ height: '350px' }}>
                                <Bar options={barChartOptions} data={technicianChartData} />
                            </div>
                        </div>
                    )}

                    {/* Mensagem se NENHUM dado foi carregado com sucesso */}
                    {!summaryData && !departmentData && !technicianData && !loading && !error && (
                        <div className="report-card">
                            <p>Não foi possível carregar nenhum dado para os relatórios.</p>
                        </div>
                    )}

                </div>
            )}
        </>
    );
}

export default ReportsPage;