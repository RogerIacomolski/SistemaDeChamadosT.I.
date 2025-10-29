import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer'; // Para Upload
import path from 'path';    // Para Upload
import fs from 'fs';        // Para Upload
import db from './database.js';

// *** 1. IMPORTAR SERVIÇO DE E-MAIL E TEMPLATES ***
import crypto from 'crypto';
import { enviarEmail, templateConfirmacaoUsuario, templateNotificacaoAdmin, templateAtualizacaoStatus, templateSenhaTemporaria } from './emailService.js';
const app = express();
const port = 3001;
const JWT_SECRET = "sua_chave_secreta_super_segura_12345";

// === Middlewares ===
app.use(cors());
app.use(express.json());

// --- Configuração de Upload (Multer) ---
const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');
app.use('/uploads', express.static(UPLOAD_DIR));
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, UPLOAD_DIR); },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) { return cb(null, true); }
        cb(new Error('Tipo de ficheiro não suportado.'));
    }
}).single('arquivo');
// --- Fim Upload ---


// === Middleware de Autenticação ===
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) { return res.status(401).json({ message: 'Token de acesso não fornecido.' }); }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) { return res.status(403).json({ message: 'Token inválido.' }); }
        // Garante que req.user tem id, email, tipo E NOME (importante para e-mails)
        req.user = user;
        next();
    });
};

// *** NOVO: Middleware de Autorização (Admin) ***
const isAdmin = (req, res, next) => {
    // Este middleware deve rodar *DEPOIS* do authenticateToken
    if (req.user && req.user.tipo === 'admin') {
        next(); // Utilizador é admin, pode prosseguir
    } else {
        // Não é admin, retorna erro de acesso proibido
        res.status(403).json({ message: 'Acesso negado. Funcionalidade exclusiva para administradores.' });
    }
};
// --- ROTA PARA BUSCAR DEPARTAMENTOS ---
app.get('/departamentos', async (req, res) => {
    try {
        const [departamentos] = await db.query("SELECT id, nome FROM departamentos ORDER BY nome ASC");
        res.status(200).json(departamentos);
    } catch (error) {
        console.error("Erro ao buscar departamentos:", error);
        res.status(500).json({ message: 'Erro no servidor ao buscar departamentos.' });
    }
});
// --- FIM DA NOVA ROTA ---

// === ROTAS DE AUTENTICAÇÃO ===
app.post('/register', async (req, res) => {
    // 1. Extraia o departamento do corpo da requisição
    const { nome, email, senha, departamento } = req.body;
    const tipo = 'comum'; // Mantém o tipo padrão

    // 2. Valide todos os campos obrigatórios
    if (!nome || !email || !senha || !departamento) { // Adicionada validação para departamento
        return res.status(400).json({ message: 'Todos os campos são obrigatórios (Nome, Email, Senha, Departamento).' });
    }
    // (Opcional: Pode adicionar validação para verificar se o departamento é um dos válidos)

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // 3. Atualize a query SQL para incluir o departamento
        const sql = "INSERT INTO usuarios (nome, email, senha, tipo, departamento) VALUES (?, ?, ?, ?, ?)"; // Adicionado 'departamento'

        // 4. Adicione o departamento aos parâmetros da query
        await db.query(sql, [nome, email, senhaHash, tipo, departamento]); // Adicionado 'departamento'

        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }
        console.error("Erro no registo:", error);
        res.status(500).json({ message: 'Erro no servidor ao tentar cadastrar.' });
    }
});

// --- 2. SUBSTITUA SUA ROTA /login PELA VERSÃO ABAIXO ---
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) { return res.status(400).json({ message: 'Email e senha são obrigatórios.' }); }
    try {
        // Busca também a flag senha_temporaria
        const sql = "SELECT id, nome, email, senha, tipo, senha_temporaria FROM usuarios WHERE email = ?";
        const [usuarios] = await db.query(sql, [email]);

        if (usuarios.length === 0) { return res.status(404).json({ message: 'Usuário não encontrado.' }); }
        const usuario = usuarios[0];

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) { return res.status(401).json({ message: 'Senha incorreta.' }); }

        // Verifica a flag senha_temporaria (true ou 1)
        const mustChangePassword = usuario.senha_temporaria === 1 || usuario.senha_temporaria === true;

        const token = jwt.sign(
            {
                id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo,
                mustChangePassword: mustChangePassword // Adiciona a flag ao token
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Retorna a flag mustChangePassword junto com o token
        res.status(200).json({
            message: 'Login bem-sucedido!',
            token: token,
            mustChangePassword: mustChangePassword // Envia para o frontend
        });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: 'Erro no servidor ao tentar logar.' });
    }
});
// --- FIM DA ROTA /login MODIFICADA ---


// --- 3. ADICIONE A NOVA ROTA /forgot-password ---
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'O endereço de e-mail é obrigatório.' });
    }

    let connection;
    try {
        connection = await db.getConnection();

        const [usuarios] = await connection.query("SELECT id, nome, email FROM usuarios WHERE email = ?", [email]);
        if (usuarios.length === 0) {
            console.log(`Pedido de recuperação para email não encontrado: ${email}`);
            return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, instruções serão enviadas.' });
        }
        const usuario = usuarios[0];

        const senhaTemporaria = crypto.randomBytes(5).toString('hex'); // 10 chars
        const salt = await bcrypt.genSalt(10);
        const senhaHashTemporaria = await bcrypt.hash(senhaTemporaria, salt);

        await connection.query(
            "UPDATE usuarios SET senha = ?, senha_temporaria = TRUE WHERE id = ?",
            [senhaHashTemporaria, usuario.id]
        );

        const htmlEmail = templateSenhaTemporaria(usuario, senhaTemporaria);
        const emailEnviado = await enviarEmail(usuario.email, 'Recuperação de Senha - HelpDesk T.I.', htmlEmail);

        if (!emailEnviado) {
            console.error(`Falha ao enviar e-mail de recuperação para ${email}. Senha temporária foi definida.`);
        }

        console.log(`Senha temporária gerada e e-mail enviado para ${email}`);
        res.status(200).json({ message: 'Se o e-mail estiver cadastrado, instruções foram enviadas.' });

    } catch (error) {
        console.error("Erro em /forgot-password:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    } finally {
        if (connection) connection.release();
    }
});
// --- FIM DA ROTA /forgot-password ---


// --- 4. ADICIONE A NOVA ROTA /change-password ---
app.put('/change-password', authenticateToken, async (req, res) => {
    const { novaSenha, confirmarNovaSenha } = req.body;
    const userId = req.user.id; // Pega o ID do usuário logado

    if (!novaSenha || !confirmarNovaSenha) return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    if (novaSenha !== confirmarNovaSenha) return res.status(400).json({ message: 'As senhas não coincidem.' });
    if (novaSenha.length < 6) return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });

    let connection;
    try {
        connection = await db.getConnection();
        const salt = await bcrypt.genSalt(10);
        const novaSenhaHash = await bcrypt.hash(novaSenha, salt);

        const [result] = await connection.query(
            "UPDATE usuarios SET senha = ?, senha_temporaria = FALSE WHERE id = ?",
            [novaSenhaHash, userId]
        );

        if (result.affectedRows === 0) {
            console.error(`Tentativa de mudar senha para usuário ${userId} não encontrado.`);
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        console.log(`Senha alterada com sucesso para usuário ${userId}`);
        res.status(200).json({ message: 'Senha alterada com sucesso!' });

    } catch (error) {
        console.error(`Erro ao alterar senha para usuário ${userId}:`, error);
        res.status(500).json({ message: 'Erro interno ao alterar a senha.' });
    } finally {
        if (connection) connection.release();
    }
});
// --- FIM DA ROTA /change-password ---
// ********** INÍCIO DAS ROTAS /admin/users FALTANTES **********
// === ROTAS DE GESTÃO DE UTILIZADORES (ADMIN) ===

// Rota ADM 1: Listar todos os utilizadores
app.get('/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        // Seleciona as colunas relevantes da sua tabela atual, EXCLUI senha
        // Inclui data_cadastro pois ela existe na sua tabela
        const [users] = await db.query(
            "SELECT id, nome, email, tipo, departamento, data_cadastro FROM usuarios ORDER BY nome ASC"
        );
        res.status(200).json(users);
    } catch (error) {
        console.error("Erro ao listar utilizadores:", error);
        res.status(500).json({ message: 'Erro no servidor ao listar utilizadores.' });
    }
});

// Rota ADM 2: Criar novo utilizador (Admin)
app.post('/admin/users', authenticateToken, isAdmin, async (req, res) => {
    const { nome, email, senha, tipo, departamento } = req.body;

    if (!nome || !email || !senha || !tipo || !departamento) {
        return res.status(400).json({ message: 'Nome, email, senha, tipo e departamento são obrigatórios.' });
    }
    if (!['admin', 'comum'].includes(tipo)) {
        return res.status(400).json({ message: 'Tipo de utilizador inválido.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // Inclui departamento e define senha_temporaria como FALSE
        const sql = "INSERT INTO usuarios (nome, email, senha, tipo, departamento, senha_temporaria) VALUES (?, ?, ?, ?, ?, FALSE)";
        await db.query(sql, [nome, email, senhaHash, tipo, departamento]);

        res.status(201).json({ message: 'Utilizador criado com sucesso!' });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }
        console.error("Erro ao criar utilizador:", error);
        res.status(500).json({ message: 'Erro no servidor ao criar utilizador.' });
    }
});

// Rota ADM 3: Atualizar dados de um utilizador (Admin)
app.put('/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { nome, email, tipo, departamento } = req.body; // Recebe departamento

    if (!nome || !email || !tipo || !departamento) {
        return res.status(400).json({ message: 'Nome, email, tipo e departamento são obrigatórios.' });
    }
    if (!['admin', 'comum'].includes(tipo)) {
        return res.status(400).json({ message: 'Tipo de utilizador inválido.' });
    }
    if (parseInt(id, 10) === req.user.id && req.user.tipo === 'admin' && tipo !== 'admin') {
        return res.status(400).json({ message: 'Não pode remover o seu próprio privilégio de administrador.' });
    }

    try {
        const sql = "UPDATE usuarios SET nome = ?, email = ?, tipo = ?, departamento = ? WHERE id = ?";
        const [result] = await db.query(sql, [nome, email, tipo, departamento, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }
        res.status(200).json({ message: 'Utilizador atualizado com sucesso!' });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este e-mail já está a ser usado por outro utilizador.' });
        }
        console.error("Erro ao atualizar utilizador:", error);
        res.status(500).json({ message: 'Erro no servidor ao atualizar utilizador.' });
    }
});

// Rota ADM 4: Alterar senha de um utilizador (Admin)
app.put('/admin/users/:id/password', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { novaSenha } = req.body;

    if (!novaSenha || novaSenha.length < 6) {
        return res.status(400).json({ message: 'A nova senha é obrigatória e deve ter pelo menos 6 caracteres.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(novaSenha, salt);

        // SQL ajustado: Define senha_temporaria como FALSE ao mudar manualmente
        const sql = "UPDATE usuarios SET senha = ?, senha_temporaria = FALSE WHERE id = ?";
        const [result] = await db.query(sql, [senhaHash, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }
        res.status(200).json({ message: 'Senha do utilizador atualizada com sucesso!' });

    } catch (error) {
        console.error("Erro ao alterar senha do utilizador:", error);
        res.status(500).json({ message: 'Erro no servidor ao alterar senha.' });
    }
});
// ********** FIM DAS ROTAS /admin/users FALTANTES **********
// === ROTAS DE RELATÓRIOS (ADMIN) ===

// Rota ADM Relatórios 1: Resumo (Summary) - CORRIGIDA
app.get('/admin/reports/summary', authenticateToken, isAdmin, async (req, res) => {
        try {
            // CORRIGIDO: Removidos espaços/linhas extras antes do SELECT e depois do ;
            const sql = `SELECT
     COUNT(*) AS total_chamados,
     SUM(CASE WHEN status = 'aberto' THEN 1 ELSE 0 END) AS aberto,
     SUM(CASE WHEN status = 'em_andamento' THEN 1 ELSE 0 END) AS em_andamento,
     SUM(CASE WHEN status = 'fechado' THEN 1 ELSE 0 END) AS fechado
     FROM chamados;`; // <- Sem espaços/linhas extras aqui
            
            const [results] = await db.query(sql);
            res.status(200).json(results[0]);
        } catch (error) {
            console.error("Erro ao buscar resumo de relatórios:", error); // <- Veja este log no terminal!
            res.status(500).json({ message: 'Erro no servidor ao buscar resumo.' });
        }
    });
    
    // Rota ADM Relatórios 2: Contagem por Departamento - CORRIGIDA
    app.get('/admin/reports/by-department', authenticateToken, isAdmin, async (req, res) => {
        try {
            // CORRIGIDO: Removidos espaços/linhas extras antes do SELECT e depois do ;
            const sql = `SELECT
     u.departamento,
     COUNT(c.id) AS count
     FROM chamados c
     JOIN usuarios u ON c.id_usuario_abriu = u.id
     WHERE u.departamento IS NOT NULL AND u.departamento != ''
     GROUP BY u.departamento
     ORDER BY count DESC, u.departamento ASC;`; // <- Sem espaços/linhas extras aqui
            
            const [results] = await db.query(sql);
            res.status(200).json(results);
        } catch (error) {
            console.error("Erro ao buscar relatórios por departamento:", error); // <- Veja este log no terminal!
            res.status(500).json({ message: 'Erro no servidor ao buscar relatórios.' });
        }
    });
    
    // Rota ADM Relatórios 3: Contagem por Técnico - CORRIGIDA
    app.get('/admin/reports/by-technician', authenticateToken, isAdmin, async (req, res) => {
        try {
            // CORRIGIDO: Removidos espaços/linhas extras antes do SELECT e depois do ;
            const sql = `SELECT
     u.nome AS technician_name,
     COUNT(c.id) AS count
     FROM chamados c
     JOIN usuarios u ON c.id_tecnico_atribuido = u.id
     WHERE c.id_tecnico_atribuido IS NOT NULL
     GROUP BY c.id_tecnico_atribuido, u.nome
     ORDER BY count DESC, u.nome ASC;`; // <- Sem espaços/linhas extras aqui
            
            const [results] = await db.query(sql);
            res.status(200).json(results);
        } catch (error) {
            console.error("Erro ao buscar relatórios por técnico:", error); // <- Veja este log no terminal!
            res.status(500).json({ message: 'Erro no servidor ao buscar relatórios.' });
        }
    });
    
    // === FIM DAS ROTAS DE RELATÓRIOS ===
// === ROTAS DE CHAMADOS ===

// Rota 3: Criar um novo chamado (POST /chamados) - *** COM E-MAIL ***
app.post('/chamados', authenticateToken, (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) { console.error("Multer error:", err); return res.status(400).json({ message: err.message }); }
        if (err) { console.error("File filter error:", err); return res.status(400).json({ message: err.message }); }

        const { titulo, descricao, categoria, empresa, criticidade } = req.body;
        const idUsuarioAbriu = req.user.id;
        const emailUsuarioAbriu = req.user.email; // Necessário para e-mail
        const nomeUsuarioAbriu = req.user.nome || 'Usuário'; // Necessário para e-mail (vem do token)
        const file = req.file;

        // Validações
        if (!titulo || !empresa || !criticidade) {
            if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return res.status(400).json({ message: 'Título, Empresa e Criticidade são obrigatórios.' });
        }
        // ... (outras validações se necessário) ...

        let anexo_url = file ? `/uploads/${file.filename}` : null;
        let anexo_nome = file ? file.originalname : null;

        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            const sqlInsert = `INSERT INTO chamados (titulo, descricao, id_usuario_abriu, status, categoria, empresa, criticidade, anexo_url, anexo_nome) VALUES (?, ?, ?, 'aberto', ?, ?, ?, ?, ?)`;
            const [result] = await connection.query(sqlInsert, [titulo, descricao || null, idUsuarioAbriu, categoria || null, empresa, criticidade, anexo_url, anexo_nome]);
            const novoTicketId = result.insertId;

            // Prepara dados para os e-mails
            const ticketParaEmail = { id: novoTicketId, titulo, descricao, categoria, empresa, criticidade, anexo_nome };
            const usuarioParaEmail = { nome: nomeUsuarioAbriu, email: emailUsuarioAbriu };

            // *** ENVIAR E-MAIL CONFIRMAÇÃO USUÁRIO ***
            const htmlConfirmacao = templateConfirmacaoUsuario(ticketParaEmail, usuarioParaEmail);
            enviarEmail(emailUsuarioAbriu, `Chamado #${novoTicketId} Recebido | HelpDesk T.I.`, htmlConfirmacao); // Não espera (fire and forget)

            // Buscar e-mails dos admins
            const [admins] = await connection.query("SELECT email FROM usuarios WHERE tipo = 'admin'");

            // *** ENVIAR E-MAIL NOTIFICAÇÃO ADMINS ***
            if (admins.length > 0) {
                const htmlAdmin = templateNotificacaoAdmin(ticketParaEmail, usuarioParaEmail);
                admins.forEach(admin => {
                    enviarEmail(admin.email, `Novo Chamado #${novoTicketId} (${empresa}) | HelpDesk T.I.`, htmlAdmin); // Não espera
                });
            }

            // Atualizar notificação no sistema (se não foi admin que abriu)
            if (req.user.tipo !== 'admin') {
                await connection.query("UPDATE chamados SET notificacao_admin = 'nova' WHERE id = ?", [novoTicketId]);
            }

            await connection.commit(); // Confirma tudo no DB
            res.status(201).json({ message: 'Chamado aberto com sucesso!' });

        } catch (error) {
            if (connection) await connection.rollback(); // Desfaz se algo deu erro
            console.error("Error creating ticket:", error);
            if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path); // Tenta limpar anexo órfão
            res.status(500).json({ message: 'Erro no servidor ao abrir chamado.' });
        } finally {
            if (connection) connection.release(); // Liberta a conexão
        }
    });
});

// Rota 4: Listar chamados (GET /chamados) - (Ordenação melhorada)
app.get('/chamados', authenticateToken, async (req, res) => {
    try {
        let sql; let params;
        const baseSql = `SELECT c.*, u_abriu.nome as nome_usuario, u_tecnico.nome as nome_tecnico FROM chamados c JOIN usuarios u_abriu ON c.id_usuario_abriu = u_abriu.id LEFT JOIN usuarios u_tecnico ON c.id_tecnico_atribuido = u_tecnico.id`;
        // Ordena por status (Aberto > Em Andamento > Fechado) e depois por data (mais recente primeiro)
        const orderBy = "ORDER BY FIELD(c.status, 'aberto', 'em_andamento', 'fechado'), c.data_abertura DESC";

        if (req.user.tipo === 'admin') {
            sql = `${baseSql} ${orderBy}`;
            params = [];
        } else {
            sql = `${baseSql} WHERE c.id_usuario_abriu = ? ${orderBy}`;
            params = [req.user.id];
        }
        const [chamados] = await db.query(sql, params);
        res.status(200).json(chamados);
    } catch (error) {
        console.error('Erro ao buscar chamados:', error);
        res.status(500).json({ message: 'Erro ao buscar chamados.' });
    }
});


// Rota 5: Mudar o status de um chamado (PUT /chamados/:id/status) - *** COM E-MAIL ***
app.put('/chamados/:id/status', authenticateToken, async (req, res) => {
    if (req.user.tipo !== 'admin') return res.status(403).json({ message: 'Acesso negado.' });
    const { id } = req.params;
    const { status } = req.body;
    const statusValidos = ['aberto', 'em_andamento', 'fechado'];
    if (!status || !statusValidos.includes(status)) return res.status(400).json({ message: 'Status inválido.' });

    try {
        // Buscar dados ANTES de atualizar
        const [chamadosAntes] = await db.query(
            `SELECT c.titulo, c.status as status_anterior, u.email as email_usuario, u.nome as nome_usuario, ut.nome as nome_tecnico
             FROM chamados c JOIN usuarios u ON c.id_usuario_abriu = u.id LEFT JOIN usuarios ut ON c.id_tecnico_atribuido = ut.id
             WHERE c.id = ?`, [id]);
        if (chamadosAntes.length === 0) return res.status(404).json({ message: 'Chamado não encontrado.' });
        const ticketAntes = chamadosAntes[0];

        // Não faz nada se o status for o mesmo
        if (ticketAntes.status_anterior === status) {
            return res.status(200).json({ message: 'Status já está atualizado.' });
        }

        // Atualiza o status
        let sqlUpdate = (status === 'fechado')
            ? "UPDATE chamados SET status = ?, data_fechamento = NOW() WHERE id = ?"
            : "UPDATE chamados SET status = ?, data_fechamento = NULL WHERE id = ?";
        await db.query(sqlUpdate, [status, id]);

        // *** ENVIAR E-MAIL ATUALIZAÇÃO STATUS ***
        const ticketParaEmail = { id: id, titulo: ticketAntes.titulo, status: status, nome_tecnico: ticketAntes.nome_tecnico };
        const usuarioParaEmail = { nome: ticketAntes.nome_usuario, email: ticketAntes.email_usuario };
        const htmlAtualizacao = templateAtualizacaoStatus(ticketParaEmail, usuarioParaEmail);
        enviarEmail(usuarioParaEmail.email, `Atualização Chamado #${id}: ${status.replace('_', ' ')} | HelpDesk T.I.`, htmlAtualizacao); // Fire and forget

        res.status(200).json({ message: 'Status atualizado com sucesso!' });

    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: 'Erro no servidor ao atualizar status.' });
    }
});

// Rota 9: Atribuir chamado a um técnico (POST /chamados/:id/atribuir) - *** COM E-MAIL ***
app.post('/chamados/:id/atribuir', authenticateToken, async (req, res) => {
    if (req.user.tipo !== 'admin') return res.status(403).json({ message: 'Acesso negado.' });
    const { id: id_chamado } = req.params;
    const id_tecnico = req.user.id;
    const nome_tecnico = req.user.nome || 'Admin'; // Nome do admin logado (do token)

    try {
        // Buscar dados ANTES de atribuir (para e-mail)
        const [chamadosAntes] = await db.query(
            `SELECT c.titulo, u.email as email_usuario, u.nome as nome_usuario
            FROM chamados c JOIN usuarios u ON c.id_usuario_abriu = u.id
            WHERE c.id = ?`, [id_chamado]);
        if (chamadosAntes.length === 0) return res.status(404).json({ message: 'Chamado não encontrado.' });
        const ticketAntes = chamadosAntes[0];

        // Verifica se já está atribuído (evita re-atribuir e reenviar e-mail)
        const [checkTecnico] = await db.query("SELECT id_tecnico_atribuido FROM chamados WHERE id = ?", [id_chamado]);
        if (checkTecnico.length > 0 && checkTecnico[0].id_tecnico_atribuido) {
            return res.status(400).json({ message: 'Este chamado já está atribuído a um técnico.' });
        }

        // Atualiza o chamado no banco
        const sqlUpdate = "UPDATE chamados SET id_tecnico_atribuido = ?, status = 'em_andamento', notificacao_usuario = 'nova' WHERE id = ?";
        await db.query(sqlUpdate, [id_tecnico, id_chamado]);

        // Envia mensagem automática no chat
        const mensagemAutomatica = `O técnico ${nome_tecnico} assumiu este chamado.`;
        // Adiciona tipo_mensagem='texto' para consistência com a nova estrutura da tabela
        await db.query("INSERT INTO chat_mensagens (id_chamado, id_usuario, mensagem, tipo_mensagem) VALUES (?, ?, ?, 'texto')", [id_chamado, id_tecnico, mensagemAutomatica]);

        // *** ENVIAR E-MAIL ATUALIZAÇÃO STATUS (ATRIBUIÇÃO) ***
        const ticketParaEmail = { id: id_chamado, titulo: ticketAntes.titulo, status: 'em_andamento', nome_tecnico: nome_tecnico };
        const usuarioParaEmail = { nome: ticketAntes.nome_usuario, email: ticketAntes.email_usuario };
        const htmlAtribuicao = templateAtualizacaoStatus(ticketParaEmail, usuarioParaEmail);
        enviarEmail(usuarioParaEmail.email, `Atualização Chamado #${id_chamado}: Em Andamento | HelpDesk T.I.`, htmlAtribuicao); // Fire and forget

        res.status(200).json({ message: 'Chamado atribuído a você.' });

    } catch (error) {
        console.error("Error assigning ticket:", error);
        res.status(500).json({ message: 'Erro no servidor ao atribuir chamado.' });
    }
});


// === ROTAS DE CHAT E NOTIFICAÇÕES === (sem mudanças na lógica interna)
// Rota 6: /chamados/:id/mensagens (buscar)
app.get('/chamados/:id/mensagens', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const idUsuarioLogado = req.user.id;
    const tipoUsuarioLogado = req.user.tipo;
    try {
        const [chamados] = await db.query("SELECT id_usuario_abriu FROM chamados WHERE id = ?", [id]);
        if (chamados.length === 0) { return res.status(404).json({ message: 'Chamado não encontrado.' }); }
        if (req.user.tipo !== 'admin' && chamados[0].id_usuario_abriu !== idUsuarioLogado) { return res.status(403).json({ message: 'Acesso negado.' }); }
        // Marca notificação como lida
        if (tipoUsuarioLogado === 'admin') { await db.query("UPDATE chamados SET notificacao_admin = 'nenhuma' WHERE id = ?", [id]); }
        else { await db.query("UPDATE chamados SET notificacao_usuario = 'nenhuma' WHERE id = ? AND id_usuario_abriu = ?", [id, idUsuarioLogado]); }
        // Busca mensagens
        const sql = `SELECT m.*, u.nome as nome_usuario FROM chat_mensagens m JOIN usuarios u ON m.id_usuario = u.id WHERE m.id_chamado = ? ORDER BY m.data_envio ASC`;
        const [mensagens] = await db.query(sql, [id]);
        res.status(200).json(mensagens);
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ message: 'Erro ao buscar mensagens.' });
    }
});
// Rota 7: /chamados/:id/mensagens (enviar com upload)
app.post('/chamados/:id/mensagens', authenticateToken, (req, res) => {
    upload(req, res, async (err) => {
        if (err) { console.error("Upload error:", err.message); return res.status(400).json({ message: err.message }); }

        const { id: id_chamado } = req.params;
        const { mensagem } = req.body;
        const id_usuario = req.user.id;
        const tipo_usuario = req.user.tipo;
        const file = req.file;

        if ((!mensagem || !mensagem.trim()) && !file) { return res.status(400).json({ message: 'A mensagem ou o ficheiro não pode estar vazio.' }); }

        try {
            const [chamados] = await db.query("SELECT id_usuario_abriu FROM chamados WHERE id = ?", [id_chamado]);
            if (chamados.length === 0) { if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path); return res.status(404).json({ message: 'Chamado não encontrado.' }); }
            if (req.user.tipo !== 'admin' && chamados[0].id_usuario_abriu !== id_usuario) { if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path); return res.status(403).json({ message: 'Acesso negado.' }); }

            let tipo_mensagem = 'texto';
            let url_arquivo = null;
            let nome_original_arquivo = null;
            let mensagem_db = mensagem;

            if (file) {
                tipo_mensagem = 'arquivo';
                url_arquivo = `/uploads/${file.filename}`;
                nome_original_arquivo = file.originalname;
                mensagem_db = mensagem || file.originalname;
            }

            const sql = `INSERT INTO chat_mensagens (id_chamado, id_usuario, mensagem, tipo_mensagem, url_arquivo, nome_original_arquivo) VALUES (?, ?, ?, ?, ?, ?)`;
            await db.query(sql, [id_chamado, id_usuario, mensagem_db, tipo_mensagem, url_arquivo, nome_original_arquivo]);

            // Atualiza notificação e status
            if (tipo_usuario === 'admin') { await db.query("UPDATE chamados SET notificacao_usuario = 'nova', status = 'em_andamento', data_fechamento = NULL WHERE id = ?", [id_chamado]); }
            else { await db.query("UPDATE chamados SET notificacao_admin = 'nova' WHERE id = ?", [id_chamado]); }

            res.status(201).json({ message: 'Mensagem enviada!' });

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            res.status(500).json({ message: 'Erro no servidor ao enviar mensagem.' });
        }
    });
});
// Rota 8: /notificacoes (verificar)
app.get('/notificacoes', authenticateToken, async (req, res) => {
    const idUsuarioLogado = req.user.id;
    const tipoUsuarioLogado = req.user.tipo;
    try {
        let sql; let params;
        if (tipoUsuarioLogado === 'admin') { sql = "SELECT id FROM chamados WHERE notificacao_admin = 'nova'"; params = []; }
        else { sql = "SELECT id FROM chamados WHERE notificacao_usuario = 'nova' AND id_usuario_abriu = ?"; params = [idUsuarioLogado]; }
        const [chamadosComNotificacao] = await db.query(sql, params);
        const ids = chamadosComNotificacao.map(c => c.id);
        res.status(200).json(ids);
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        res.status(500).json({ message: 'Erro ao buscar notificações.' });
    }
});


// === Iniciar o servidor === (DEVE SER A ÚLTIMA COISA)
app.listen(port, () => {
    console.log(`🚀 Servidor backend rodando em http://localhost:${port}`);
});