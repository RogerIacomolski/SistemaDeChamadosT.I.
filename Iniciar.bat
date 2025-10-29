@echo off
title Iniciador de Servidores - Sistema de Chamados

echo Iniciando servidor Backend...
cd C:\Users\suporte\Desktop\Sistema_Chamados\meu-sistema-chamados-backend

REM Usa "cmd /k" para executar o comando E MANTER a janela aberta
START "Backend - Sistema de Chamados" cmd /k "node index.js"

echo Iniciando servidor Frontend...
cd C:\Users\suporte\Desktop\Sistema_Chamados\meu-sistema-chamados

REM O "cmd /k" também funciona perfeitamente para o comando do Vite
START "Frontend - Sistema de Chamados" cmd /k "npm run dev -- --host"

echo Servidores iniciados em novas janelas.
echo Esta janela pode ser fechada.
pause