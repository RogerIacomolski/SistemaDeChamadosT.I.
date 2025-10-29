import nodemailer from 'nodemailer';

// --- Configuração do Transporter (Usando as suas credenciais) ---
// ⚠️ Lembre-se de usar variáveis de ambiente em produção!
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para porta 465 (SSL), false para outras (TLS)
    auth: {
        user: 'engebag8@gmail.com',     // O seu e-mail Gmail
        pass: 'ejkbenopqhctnkcb'        // A sua SENHA DE APP gerada no Gmail
    },
    tls: {
        // Não falhar em certificados inválidos (útil para localhost, mas tenha cuidado)
        // rejectUnauthorized: false 
    }
});



// --- Templates de E-mail (HTML Básico) ---

// Template para o usuário que abriu o chamado
const templateConfirmacaoUsuario = (ticket, usuario) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chamado Recebido</title>
    <style> body { font-family: sans-serif; line-height: 1.6; color: #333; } .container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: 20px auto; } h1 { color: #4c51bf; } strong { color: #555; } </style>
</head>
<body>
    <div class="container">
        <h1>HelpDesk T.I. - Chamado Recebido</h1>
        <p>Olá ${usuario.nome || 'Usuário'},</p>
        <p>Recebemos o seu chamado com sucesso. A nossa equipa técnica irá analisá-lo em breve.</p>
        <hr>
        <p><strong>ID do Chamado:</strong> #${ticket.id}</p>
        <p><strong>Título:</strong> ${ticket.titulo}</p>
        <p><strong>Categoria:</strong> ${ticket.categoria || 'Não especificada'}</p>
        <p><strong>Empresa:</strong> ${ticket.empresa || 'Não especificada'}</p>
        <p><strong>Criticidade:</strong> ${ticket.criticidade || 'Não especificada'}</p>
        <p><strong>Descrição:</strong> ${ticket.descricao || 'Nenhuma'}</p>
        <hr>
        <p>Pode acompanhar o estado do seu chamado no nosso portal.</p>
        <p>Obrigado,<br>Equipa de Suporte T.I.</p>
    </div>
</body>
</html>
`;

// Template para os administradores
const templateNotificacaoAdmin = (ticket, usuario) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head> <meta charset="UTF-8"> <title>Novo Chamado Aberto</title> <style> body { font-family: sans-serif; color: #333; } .container { padding: 15px; border: 1px solid #ddd; max-width: 600px; } h2 { color: #c53030; } </style> </head>
<body>
    <div class="container">
        <h2>Novo Chamado Aberto no HelpDesk T.I.</h2>
        <p>Um novo chamado foi aberto e requer atenção.</p>
        <hr>
        <p><strong>ID do Chamado:</strong> #${ticket.id}</p>
        <p><strong>Aberto por:</strong> ${usuario.nome} (${usuario.email})</p>
        <p><strong>Título:</strong> ${ticket.titulo}</p>
        <p><strong>Categoria:</strong> ${ticket.categoria || 'N/A'}</p>
        <p><strong>Empresa:</strong> ${ticket.empresa || 'N/A'}</p>
        <p><strong>Criticidade:</strong> ${ticket.criticidade || 'N/A'}</p>
        <p><strong>Descrição:</strong> ${ticket.descricao || 'Nenhuma'}</p>
        ${ticket.anexo_nome ? `<p><strong>Anexo:</strong> ${ticket.anexo_nome}</p>` : ''}
        <hr>
        <p>Por favor, aceda ao sistema para ver mais detalhes e atribuir o chamado.</p>
    </div>
</body>
</html>
`;

// Template para atualização de status
const templateAtualizacaoStatus = (ticket, usuario) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head> <meta charset="UTF-8"> <title>Atualização do Chamado</title> <style> body { font-family: sans-serif; color: #333; } .container { padding: 15px; border: 1px solid #ddd; max-width: 600px; } h2 { color: #4c51bf; } .status { font-weight: bold; text-transform: capitalize; } </style> </head>
<body>
    <div class="container">
        <h2>Atualização do Chamado #${ticket.id}</h2>
        <p>Olá ${usuario.nome || 'Usuário'},</p>
        <p>O estado do seu chamado "${ticket.titulo}" foi atualizado para: <strong class="status">${ticket.status.replace('_', ' ')}</strong>.</p>
        ${ticket.status === 'fechado' ? '<p>Este chamado foi concluído. Se o problema persistir, por favor, abra um novo chamado.</p>' : ''}
        ${ticket.status === 'em_andamento' && ticket.nome_tecnico ? `<p>O técnico ${ticket.nome_tecnico} está a analisar o seu pedido.</p>` : ''}
        <hr>
        <p>Pode ver mais detalhes ou responder no portal do HelpDesk.</p>
        <p>Obrigado,<br>Equipa de Suporte T.I.</p>
    </div>
</body>
</html>
`;

const templateSenhaTemporaria = (usuario, senhaTemporaria) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head> <meta charset="UTF-8"> <title>Recuperação de Senha</title> <style> body { font-family: sans-serif; color: #333; } .container { padding: 15px; border: 1px solid #ddd; max-width: 600px; } h2 { color: #4c51bf; } code { background-color: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-family: monospace; } </style> </head>
<body>
    <div class="container">
        <h2>Recuperação de Senha - HelpDesk T.I.</h2>
        <p>Olá ${usuario.nome || 'Usuário'},</p>
        <p>Você solicitou a recuperação da sua senha. Use a senha temporária abaixo para fazer login:</p>
        <p><strong>Senha Temporária:</strong> <code>${senhaTemporaria}</code></p>
        <p><strong>Importante:</strong> Ao fazer login com esta senha, você será solicitado a definir uma nova senha imediatamente por motivos de segurança.</p>
        <p>Se você não solicitou esta recuperação, pode ignorar este e-mail.</p>
        <p>Obrigado,<br>Equipa de Suporte T.I.</p>
    </div>
</body>
</html>
`;

// --- NOVO TEMPLATE ADICIONADO ---
/**
 * Notifica um usuário sobre uma nova mensagem no chat.
 * @param {object} destinatario - O usuário que receberá o e-mail (ex: { nome, email })
 * @param {object} ticket - O ticket que foi atualizado (ex: { id, titulo })
 * @param {object} novaMensagem - A mensagem que foi enviada (ex: { nome_usuario, mensagem, tipo_mensagem, nome_original_arquivo })
 * @param {string} linkParaChamado - A URL completa para o usuário clicar e ver o chamado.
 */
const templateNovaMensagem = (destinatario, ticket, novaMensagem, linkParaChamado) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Nova Mensagem no Chamado</title>
  <style>
    body { font-family: sans-serif; color: #333; }
    .container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: 20px auto; }
    h2 { color: #4c51bf; }
    .mensagem { background-color: #f4f4f4; border-left: 4px solid #4c51bf; padding: 10px 15px; margin: 15px 0; }
    .mensagem p { margin: 0; }
    .cta-button { background-color: #4c51bf; color: #ffffff !important; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; }
    small { color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Nova Resposta no Chamado #${ticket.id}</h2>
    <p>Olá ${destinatario.nome || 'Usuário'},</p>
    <p>O chamado <strong>"${ticket.titulo}"</strong> recebeu uma nova resposta de <strong>${novaMensagem.nome_usuario || 'Suporte'}</strong>.</p>
    
    <div class="mensagem">
      <!-- Mostra a mensagem de texto ou um aviso de anexo -->
      ${novaMensagem.tipo_mensagem === 'arquivo'
        ? `<p><i>Enviou um anexo: ${novaMensagem.nome_original_arquivo}</i></p>${(novaMensagem.mensagem && novaMensagem.mensagem !== novaMensagem.nome_original_arquivo) ? `<p>${novaMensagem.mensagem}</p>` : ''}`
        : `<p>${novaMensagem.mensagem}</p>`}
    </div>

    <p>Por favor, acesse o sistema para ver todos os detalhes e responder.</p>
    <!-- ⚠️ Certifique-se que 'linkParaChamado' é uma URL completa, ex: "https://seusite.com/chamados" -->
    <a href="${linkParaChamado}" class="cta-button">Acessar o Chamado</a>
    <br><br>
    <small>Este é um e-mail automático. Por favor, não responda.</small>
  </div>
</body>
</html>
`;


// --- Função de Envio de E-mail ---
export const enviarEmail = async (para, assunto, html) => {
    const mailOptions = {
        from: `"HelpDesk T.I." <${transporter.options.auth.user}>`, // Remetente (O seu e-mail Gmail)
        to: para, // Destinatário(s)
        subject: assunto, // Assunto
        html: html // Corpo do e-mail em HTML
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email enviado para ${para}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Erro ao enviar email para ${para}:`, error);
        return false;
    }
};

// Exporta os templates também, para facilitar o uso no index.js
// --- LINHA CORRIGIDA (com o novo template) ---
export {
  templateConfirmacaoUsuario,
  templateNotificacaoAdmin,
  templateAtualizacaoStatus,
  templateSenhaTemporaria,
  templateNovaMensagem // <-- ADICIONADO AQUI
};

