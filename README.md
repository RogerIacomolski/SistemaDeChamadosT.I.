# 🧩 Sistema de Chamados T.I.

O **Sistema de Chamados T.I.** é uma plataforma moderna e completa para gestão de suporte técnico interno, desenvolvida com **React (frontend)** e **Node.js (backend)**.  
Com foco em praticidade, segurança e comunicação em tempo real, o sistema foi projetado para otimizar o atendimento entre usuários e equipe de suporte.

---

## ⚙️ Funcionalidades Principais

### 👤 Autenticação e Gestão de Usuários
- ✨ **Auto-cadastro** — novos usuários podem criar suas próprias contas.  
- 🔑 **Recuperação de senha automática** — envia uma **senha temporária por e-mail**, forçando o usuário a alterá-la no próximo login.  
- 🧭 **Painel administrativo** — o administrador pode criar, atualizar ou redefinir senhas de usuários.  

---

### 🎫 Abertura e Acompanhamento de Chamados
- 📝 Criação de chamados com detalhes do problema.  
- 🔄 Controle de status: **Aberto**, **Em andamento** e **Fechado**.  
- 👨‍🔧 Atribuição de chamados a técnicos específicos.  

---

### 💬 Chat em Tempo Real
- 📡 Comunicação instantânea entre usuário e suporte técnico.  
- 🕓 Histórico completo de mensagens por ticket.  

---

### 📊 Painel Administrativo e Relatórios
- 📈 Dashboard com métricas e relatórios sobre os chamados.  
- 🔍 Visualização detalhada de chamados **em andamento** e **concluídos**.  
- 🧩 Gestão de usuários, técnicos e departamentos.

---

## 🧠 Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|-------------|
| **Frontend** | React.js + Tailwind CSS |
| **Backend** | Node.js + Express |
| **Banco de Dados** | MySQL |
| **E-mails** | Integração com Gmail (envio de senhas temporárias e notificações) |

---

## 🔒 Segurança

- 🔐 Senhas criptografadas com **bcrypt**.  
- 🕵️‍♂️ Redefinição obrigatória após recuperação de senha.  
- 👥 Controle de acesso por perfil (usuário, técnico, administrador).  
- 🧾 Logs de ações críticas para auditoria e rastreabilidade.  

---

## 🚀 Benefícios

- Centraliza todo o suporte técnico em um único ambiente.  
- Aumenta a eficiência e reduz o tempo de resposta.  
- Mantém histórico e rastreabilidade de todas as interações.  
- Interface moderna e intuitiva, adaptada para desktop e mobile.  

---

## ⚙️ Instruções de Configuração

### 🔸 Front-End (React)
Antes de iniciar o sistema, **altere o IP do servidor backend** nos arquivos abaixo:

| Arquivo | Linha | Descrição |
|----------|--------|-----------|
| `Dashboard.jsx` | 45 | Trocar o IP do servidor backend |
| `AuthContext.jsx` | 8 | Trocar o IP do servidor backend |
| `TicketChatModal.jsx` | 57 | Trocar o IP do servidor backend |
| `TicketItem.jsx` | 9 | Trocar o IP do servidor backend |
| `TicketForm.jsx` | 62 | Trocar o IP do servidor backend |

---

### 🔸 Back-End (Node.js)
Atualize o IP do banco de dados MySQL no arquivo:

| Arquivo | Linha | Descrição |
|----------|--------|-----------|
| `database.js` | 17 | Trocar o IP do banco de dados |

---

### 🔐 Hash de Senha (bcrypt)

Hash de teste utilizado no sistema:

$2b$10$B6xTC9bnIYAqh4UVdxUjJ.hCb3/5StBKy0TsSM1q5/fszOTGPWjRq



> 🔸 **Senha correspondente:** `123456`

---

## 📧 Configuração de E-mail (Gmail)

O envio de e-mails (senhas temporárias, notificações, etc.) é feito via **Gmail**.

### Passos para configurar:
1. Crie uma conta Gmail exclusiva para o sistema.  
2. Ative a verificação em duas etapas:  
   🔗 [https://myaccount.google.com/signinoptions/twosv](https://myaccount.google.com/signinoptions/twosv)  
3. Gere uma **senha de app** no painel da conta Google.  
4. Edite o arquivo `emailService.js` e substitua:
   - O endereço de e-mail remetente;
   - A senha de app (gerada no passo 3).

---

## ✅ Fluxo de Uso

1. O usuário cria sua conta no sistema.  
2. Caso esqueça a senha, recebe uma **senha temporária por e-mail**.  
3. Após redefinir a senha, ele pode **abrir um chamado**.  
4. O técnico responde via **chat em tempo real** dentro do ticket.  
5. O status é atualizado para **Em andamento** e depois **Fechado**.  
6. O administrador visualiza métricas e relatórios no dashboard.  

---

## 🧑‍💻 Desenvolvido com
💙 **React.js + Node.js + MySQL**  
🎨 Paleta de cores:  
- 🟠 `#E0711D` (laranja)  
- 🔵 `#0C1949` (azul escuro)  
- 🔷 `#2E3A63` (azul claro)  
- ⚪ `#B0B4C4` (cinza)

---

## 📄 Licença
Projeto de uso interno. Todos os direitos reservados © 2025.

---

## 🛠️ Autor
Desenvolvido por **[Roger L. Iacomolski e empresa Union]**  
💼 Sistema de Chamados T.I. — Gestão inteligente de suporte técnico.
