-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 24-Out-2025 às 15:34
-- Versão do servidor: 10.1.21-MariaDB
-- versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `sistema_chamados_ti`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `tipo` enum('admin','comum') NOT NULL DEFAULT 'comum',
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `senha_temporaria` tinyint(1) DEFAULT '0',
  `departamento` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `tipo`, `data_cadastro`, `senha_temporaria`, `departamento`) VALUES
(1, 'Roger Luiz', 'info@engebag.com.br', '$2b$10$xz6fWpHecWKoMqLmaXWX3.b/5ie0QFzchOueM/l1rRaovAlq5wxsa', 'admin', '2025-10-23 14:29:37', 0, 'T.I.'),
(2, 'Henrique de Barros Arroyo', 'info01@engebag.com.br', '$2y$10$E0ZQknVAtbEcS.QvC6sdEuSuLAcIMJ1IAXMWFTMGfJTRpt7utw2ta', 'admin', '2025-10-23 14:29:37', 0, 'T.I.'),
(3, 'Jaderson', 'jaderson@engebag.com.br', '$2y$10$6A8qRTDsuNxtaLTxqc6d9.bjXAcmxX0dDCQoJEC/69/sSdVJIzs2W', 'comum', '2025-10-23 14:29:37', 0, 'Comercial'),
(4, 'Robson', 'robson@engebag.com.br', '$2y$10$0lWZoYdLYkuwDxpS9r0kaOcx9rn0BynlQBnd/U5jLlrr0YjT9eVhe', 'comum', '2025-10-23 14:29:37', 0, 'Comercial'),
(5, 'Eleir Correia Ferreira Surge', 'financeiro@engebag.com.br', '$2y$10$adbU4vjc3uIuf0ETAag.4u.rrFN893l676NohI1FYDM8oUlLoei4y', 'admin', '2025-10-23 14:29:37', 0, 'Financeiro'),
(6, 'Milena N. Moraes Cosenza', 'compras@bagcleaner.com.br', '$2y$10$GJOLWH3n5RQjzqPYw42ry.JjTxJBr0phHhsTuj.dvoxPJGG4phRBW', 'comum', '2025-10-23 14:29:37', 0, 'Compras'),
(7, 'Jose Amaragi', 'compras2@engebag.com.br', '$2y$10$pTLQgvEosgJZ8QaEfQi1Y.KvbihMMGU51yUykoSjDsZI91vxLvAuC', 'comum', '2025-10-23 14:29:37', 0, 'Compras'),
(8, 'Arthur Frederico', 'dp@engebag.com.br', '$2y$10$q89tyhidRO2sGPDxmq74leJPVtrElZOm42hQ7WZZ3/eQhTmN4/cGm', 'comum', '2025-10-23 14:29:37', 0, 'RH'),
(9, 'Joici Santana', 'processo@engebag.com.br', '$2y$10$BK/.UVWy8Ji2zUVhWe8j8uZ3q98lHnuXC9J.MAYRVEL9fkEl0cea2', 'comum', '2025-10-23 14:29:37', 0, 'PCP'),
(10, 'Julio Moreira Pereira da Silva', 'expedicao@engebag.com.br', '$2y$10$UJiOiA8sP7lpF/xWzbbrIOkaGn8OJiqL8j3YM7dC3qu7nvJH0GjXy', 'comum', '2025-10-23 14:29:37', 0, 'Expedição'),
(11, 'Maria Tereza Martinatti', 'recrutamento01@engebag.com.br', '$2y$10$GWKF5DmHmB1hjYHOhyJKJeThtabnEoWoWO6TKANn68.hMELngNR0a', 'comum', '2025-10-23 14:29:37', 0, 'RH'),
(12, 'Julia Honorio', 'administrativo@engebag.com.br', '$2y$10$GIluS/pZcO/NytzvPHUir.Z8K3/l.H45rN7.vRjgwYKyeJtp18V1W', 'comum', '2025-10-23 14:29:37', 0, 'Financeiro'),
(13, 'Lucas Pereira', 'pcp@engebag.com.br', '$2y$10$oHs3drYKGsjKm5IR9MBOi.LbHa3vBH2jC5A9HwLvE3wll6Nv3Klf2', 'comum', '2025-10-23 14:29:37', 0, 'PCP'),
(14, 'Rute Furtado', 'qualidade@engebag.com.br', '$2y$10$HFvo8NAwOKYWC0j8qQXWveHXFK9lCG1paxUYFJikySmDcuIbhAscK', 'comum', '2025-10-23 14:29:37', 0, 'Qualidade'),
(15, 'Juliana Maria Martins', 'qualidade12@engebag.com.br', '$2y$10$lS.tGUHy2HRaGcbBO94nFOpOhyPQmsqdnVKDuDXCisxwQL/RenmIe', 'comum', '2025-10-23 14:29:37', 0, 'Qualidade'),
(16, 'Manutencao', 'manutencao@engebag.com.br', '$2y$10$Gs4ybA6FUBtprHSi98F0EuezIE1pz6sP/RDCG5e9Dz2F76gj79Lxu', 'comum', '2025-10-23 14:29:37', 0, 'Manutenção'),
(17, 'Luis Felipe', 'luisfelipe@engebag.com.br', '$2y$10$E9F64EyuTnr2Jqfwauq15OPckbaxbS5OtX00uBrwV3/SwxVflxd82', 'comum', '2025-10-23 14:29:37', 0, 'Comercial'),
(18, 'Paulo César Carvalho', 'processo2@engebag.com.br', '$2y$10$XH1Ds0J4y7g0PsKQfqG7S.OaJiue3ltw3A7Rc/nj94en4.9.xBPyy', 'comum', '2025-10-23 14:29:37', 0, 'Manutenção'),
(19, 'Cleide Euripedes', 'operacional@engebag.com.br', '$2y$10$7B/RqSzpefo8Lt0mTJnA0.64YdlQew2sW4knAFXZj/G/IdmWaOmI6', 'comum', '2025-10-23 14:29:37', 0, 'Operacional'),
(20, 'Maria Eduarda Campos', 'recepcao@engebag.com.br', '$2y$10$G3zk4BJNMbNyLM0HUAEOFO05xS8BasXsw9/bPXq.cvLRW/H98.EzK', 'comum', '2025-10-23 14:29:37', 0, 'Recepção'),
(21, 'Cintia Maria Selingardi', 'recrutamento@engebag.com.br', '$2y$10$LCCIhj1tzY6IrK3/IuvMPObuA8QZ9gwVeQSIaRkwEFWYu4Jjmq.9W', 'comum', '2025-10-23 14:29:37', 0, 'RH'),
(22, 'Glaucia Ap. R. Silva', 'rh@engebag.com.br', '$2y$10$np8nDJbO/MsT6QhlQsvesOXLPrhJC0aaLkx9ha8ny.AwHJ23yPddy', 'comum', '2025-10-23 14:29:37', 0, 'RH'),
(23, 'Cassiane Cristina Dos Santos Hernandes', 'recrutamento02@engebag.com.br', '$2y$10$Gajkv..eAfwrrt0doZMxy.n.Xqg8urgWpJhgQBfvj7fs.XyfD8pxO', 'comum', '2025-10-23 14:29:37', 0, 'RH'),
(24, 'Cristiane Diniz', 'gestaorh@engebag.com.br', '$2y$10$B0.52UYloLOEvdDmAISdJOEFe9H2jVWmDAtIPITEt.ZzIsTv6C0pW', 'comum', '2025-10-23 14:29:37', 0, 'RH'),
(26, 'Angie Lima Ichibassi', 'qualidade3@engebag.com.br', '$2y$10$aQ2AxPWTKVu7k.A0j/cuWOQkBLXfkVk7w6PxP9orRwjtgsFIMuONS', 'comum', '2025-10-23 14:29:37', 0, 'Qualidade'),
(27, 'Lucilene Torres', 'dp3@engebag.com.br', '$2y$10$PCBNYS6MWPz8TR3xfnmfFuc5H88KSNc77NPOPh.hAG9JCUC2kJmZm', 'comum', '2025-10-23 14:29:37', 0, 'RH'),
(29, 'Vitoria Della Riva Franco', 'logistica2@bagcleaner.com.br', '$2y$10$XNjwUTjn9M5mW9sEWAb6muPkJK.Sug/3dqc0JO3pzwSVUt.O0i6/y', 'comum', '2025-10-23 14:29:37', 0, 'Logistica'),
(30, 'Yasmin Carvalho da Silva', 'faturamento@bagcleaner.com.br', '$2y$10$x1WSftH5207O4A9YMXPF8uFtmMzcx8hEFSGs/QROlYKedSnuCOptm', 'comum', '2025-10-23 14:29:37', 0, 'Faturamento'),
(31, 'Alynne Correa', 'logistica@bagcleaner.com.br', '$2y$10$./7A4PPnakKw9O3s6jbsbeGJo3C8i.FQAdox08tmRVvw2IQ16tJ6y', 'comum', '2025-10-23 14:29:37', 0, 'Logistica'),
(32, 'Carla Cristina Dos Santos Hernandes', 'recrutamento@bagcleaner.com.br', '$2y$10$4OqpBlXz1jroxb1HowG8zOFa2uoy1ZZ95fXVdhF1xf0N5ftionmJi', 'comum', '2025-10-23 14:29:37', 0, 'RH'),
(33, 'beatriz fontolan ferreira', 'recrutamento01@bagcleaner.com.br', '$2y$10$owUz4gTElYsLsnkg9C31ieoDehHqyx9rFOJ90Cyw8ZRdf2ebV12ka', 'comum', '2025-10-23 14:29:37', 0, 'RH'),
(34, 'Enzo Storto Bonin', 'enzo@bagcleaner.com.br', '$2y$10$Qe5Clb05O/OZJxnl305uaOLKxuoKZSaDzBjnjEK4rhja0e4L2JWuG', 'comum', '2025-10-23 14:29:37', 0, 'Comercial'),
(35, 'Rogerio Neri Cruz', 'gestaoindustrial@engebag.com.br', '$2y$10$PspVt1uuWKhqDU3rRJJuAurnXw.ZD.iNrfygpD3CZYJWr7rurHzQC', 'comum', '2025-10-23 14:29:37', 0, 'Operacional'),
(36, 'Giovanna Staub Mattasoglio Gomes', 'dp2@engebag.com.br', '$2y$10$8kN3Ognl3w7vat.bp0hRTuF5Wfxpr5JlPqApd1GgQDoMRlKUb9YWO', 'comum', '2025-10-23 14:29:37', 0, 'RH'),
(37, 'Lucas Porto Gomes', 'qualidade2@engebag.com.br', '$2y$10$5O3UJw1zelDvjC5HzoeyO.0Dn9yWMgdGzfOfrvatJWEXrWFcY/5NK', 'comum', '2025-10-23 14:29:37', 0, 'Qualidade'),
(38, 'Alex José Grosso', 'manutencao2@bagcleaner.com.br', '$2y$10$6wNE.pB8hdiqccaSlmBZ7ekhPpoqXRXNFU1Jhw4GYWuTliRuiy6qq', 'comum', '2025-10-23 14:29:37', 0, 'Operacional'),
(39, 'Nicolas Souza', 'info@bagcleaner.com.br', '$2y$10$ZeW59HxVFyHCUoXrEvJbQesnrSUYwBCv5oCIitPV0SwI/3v3/e2fm', 'admin', '2025-10-23 14:29:37', 0, 'T.I.'),
(40, 'Thales Henrique', 'pcp2@engebag.com.br', '$2y$10$r5VXYNm6i.wH2NPARm2uHu4Ji0hnFAsWj2RbBoIFERc4mjwhZhGNW', 'comum', '2025-10-23 14:29:37', 0, 'PCP'),
(43, 'Cesar Ricardo Meneghin', 'processo@bagcleaner.com.br', '$2y$10$/Dwv2Zki7/LCf5RJpGuXyOP0v09tAURUbWvfTaihxJ8YDXaPDLTum', 'comum', '2025-10-23 14:29:37', 0, 'Processo'),
(44, 'Franciane Vieira', 'franciane@bagcleaner.com.br', '$2y$10$UzWMglIGFMCe0Chenf45Zu6PLqtjNbwJfLsSbqnT3nWIaCCNRL3me', 'admin', '2025-10-23 14:29:37', 0, 'Comercial'),
(46, 'Alex José Grosso', 'manutencao@bagcleaner.com.br', '$2y$10$SccNVZl/Y/4ZkjJHlIxTzeJkrdOFbb8zYFSFyOndEOyctJ8TW6WHK', 'comum', '2025-10-23 14:29:37', 0, 'Manutenção'),
(47, 'Patrick Eduardo Previero', 'qualidade3@bagcleaner.com.br', '$2y$10$Sp.XAmtWuyPPrz5BhRP3JuPtFskxsX80U8d4ZgrRe3Mczf.3mEzgC', 'comum', '2025-10-23 14:29:37', 0, 'Qualidade'),
(48, 'expedicao', 'expedicao@bagcleaner.com.br', '$2y$10$QVTlB2s9JNBgvtngqJvV2OTx3BzEgYCli1pIkjz/hIcxSXv./VT/K', 'comum', '2025-10-23 14:29:37', 0, 'Expedição'),
(50, 'Samuel do Carmo', 'operacional@bagcleaner.com.br', '$2y$10$czQS7X.5GJyMo1j66RWBQ.w4cOL2P8anrlUagTOv48zqGm5zt28qu', 'comum', '2025-10-23 14:29:37', 0, 'Operacional'),
(51, 'Maria', 'recepcao@bagcleaner.com.br', '$2y$10$hgDpYkg0Q0BVpZRxLZJG1OZ4CSpYKEhygTTr9fWRShtt/NrNFKPFW', 'comum', '2025-10-23 14:29:37', 0, 'Recepção'),
(59, 'Ana Paula Alves', 'qualidade@bagcleaner.com.br', '$2y$10$FmXycvILgYqdGBg0q1drpOwgVyUGI8Gw1AYC7dV75oDO6EW8NicnW', 'comum', '2025-10-23 14:29:37', 0, 'Qualidade'),
(60, 'Beatriz', 'qualidade4@bagcleaner.com.br', '$2y$10$QPTrgCj68IR0GRr2mfBCzOXPCqeM6w6y02DRPFZcZ0FgUfYaAb5jC', 'comum', '2025-10-23 14:29:37', 0, 'Qualidade'),
(62, 'Viviane Neile Silva', 'qualidade1@bagcleaner.com.br', '$2y$10$zv0opG3gOEuyl/shQYOFseK/fiSeqg580mE6Vr35ZZmMa3Ui60IFy', 'comum', '2025-10-23 14:29:37', 0, 'Qualidade'),
(64, 'Vitor Sincler', 'qualidade03@bagcleaner.com.br', '$2y$10$WX7Fy0MWcksH4eFMosjBPOeezknm8i0HsXXl.vN9ffApgsmDedGXC', 'comum', '2025-10-23 14:29:37', 0, 'Qualidade'),
(65, 'calleri', 'teste@gmail.com', '$2y$10$scPQ.DUqRXYkSpEuHG7HVuQ6mcEhN.F0i4c6KlsUoX/tpOUbIggwC', 'comum', '2025-10-23 14:29:37', 0, 'Recepção'),
(75, 'Darielle Rodrigues Pavani', 'tst@engebag.com.br', '$2y$10$bIy/TSiPZsoBl2v5wG8eLu3qaopzLV.B6t7M6bFsN6LzKSa6s60LG', 'comum', '2025-10-23 14:29:37', 0, 'TST'),
(76, 'Darielle Rodrigues Pavani', 'tst@engbag.com.br', '$2y$10$6hV7Y0o37.WIfEyhIgd/B.avmjl7xcGc5gktCXM9e1o.ph2cuADkO', 'comum', '2025-10-23 14:29:37', 0, 'TST');

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
