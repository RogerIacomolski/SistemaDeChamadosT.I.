import React, { useState, useRef } from 'react'; // Adicionar useRef
import axios from 'axios';

// Lista de categorias (poderia vir do backend se usar a tabela separada)
const categoriasDisponiveis = ['Infraestrutura', 'Hardware', 'Software', 'Impressora', 'Rede', 'Acesso/Login', 'Outros'];

function TicketForm({ onTicketCreated }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  // Novos states para os campos
  const [categoria, setCategoria] = useState(categoriasDisponiveis[0]); // Padrão: primeira categoria
  const [empresa, setEmpresa] = useState('Empresa X'); // Padrão
  const [criticidade, setCriticidade] = useState('Baixa'); // Padrão
  const [anexo, setAnexo] = useState(null); // State para o ficheiro anexo

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // Ref para limpar o input de ficheiro

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('Ficheiro muito grande! Máximo de 10MB.');
        if(fileInputRef.current) fileInputRef.current.value = ""; // Limpa
        setAnexo(null);
        return;
      }
      setAnexo(file);
    } else {
      setAnexo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('O título é obrigatório.');
      return;
    }
    // Validações adicionais (opcional, backend já valida)
    if (!empresa) { setError('Selecione a empresa.'); return; }
    if (!criticidade) { setError('Selecione a criticidade.'); return; }
    if (!categoria) { setError('Selecione a categoria.'); return; }

    setError('');
    setLoading(true);

    // Usar FormData para enviar texto E ficheiro
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('categoria', categoria);
    formData.append('empresa', empresa);
    formData.append('criticidade', criticidade);
    if (anexo) {
      formData.append('arquivo', anexo); // O nome 'arquivo' deve bater com o backend (upload.single('arquivo'))
    }

    try {
      await axios.post(
        'http://192.168.2.104:3001/chamados', // Usar IP se aceder de outra máquina!
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            // O token de autenticação já deve estar globalmente configurado pelo AuthContext
          }
        }
      );
      
      // Limpa o formulário após sucesso
      setTitulo('');
      setDescricao('');
      setCategoria(categoriasDisponiveis[0]);
      setEmpresa('Empresa X');
      setCriticidade('Baixa');
      setAnexo(null);
      if(fileInputRef.current) fileInputRef.current.value = "";

      // Chama a função passada pelo Modal para fechar e atualizar
      if(onTicketCreated) onTicketCreated();

    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao abrir chamado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ticket-form">
      {/* --- Campos Existentes --- */}
      <div className="form-group">
        <label htmlFor="titulo-form">Título do Problema *</label>
        <input
          type="text"
          id="titulo-form" // ID único
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Impressora não funciona"
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="descricao-form">Detalhes</label>
        <textarea
          id="descricao-form" // ID único
          rows={4}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva o que está acontecendo, qual o número da máquina, etc."
          className="form-textarea"
        />
      </div>

      {/* --- Novos Campos --- */}
      <div className="form-row"> {/* Div para agrupar lado a lado (opcional) */}
        <div className="form-group form-group-half">
          <label htmlFor="empresa-form">Empresa *</label>
          <select
            id="empresa-form"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            className="form-input" // Reutiliza estilo de input
            required
          >
            <option value="Empresa X">Empresa X</option>
            <option value="Empresa Y">Empresa Y</option>
          </select>
        </div>

        <div className="form-group form-group-half">
          <label htmlFor="criticidade-form">Criticidade *</label>
          <select
            id="criticidade-form"
            value={criticidade}
            onChange={(e) => setCriticidade(e.target.value)}
            className="form-input"
            required
          >
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="categoria-form">Categoria *</label>
        <select
          id="categoria-form"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="form-input"
          required
        >
          {categoriasDisponiveis.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
          <label htmlFor="anexo-form">Anexar Imagem/Documento (Opcional, Max 10MB)</label>
          <input
              type="file"
              id="anexo-form"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="form-input-file" // Classe para estilo customizado
              // accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt" // Opcional: limitar tipos
          />
          {/* Mostra o nome do ficheiro selecionado */}
          {anexo && <span className="file-name-display">{anexo.name}</span>}
      </div>


      {error && <p className="form-error">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="form-button"
        >
          {loading ? 'A Abrir...' : 'Abrir Chamado'}
        </button>
      </div>
    </form>
  );
}

export default TicketForm;