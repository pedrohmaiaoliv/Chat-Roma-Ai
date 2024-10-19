const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve os arquivos estáticos (como chat.html, login.html e socket.io.js)
app.use(express.static(path.join(__dirname)));

// Lista para manter os usuários online
let onlineUsers = {};

// Gerenciar a conexão de novos usuários
io.on('connection', (socket) => {
    console.log('Um usuário se conectou');

    // Evento disparado quando um usuário se conecta e envia o nome de usuário
    socket.on('userConnected', (username) => {
        onlineUsers[socket.id] = username;  // Associar o ID do socket ao nome de usuário
        io.emit('onlineUsers', Object.values(onlineUsers));  // Enviar a lista atualizada de usuários online
        console.log(`${username} se conectou. Usuários online:`, onlineUsers);
    });

    // Evento disparado quando o usuário envia uma mensagem
    socket.on('chat message', (msgData) => {
        io.emit('chat message', msgData); // Envia a mensagem para todos os usuários conectados
    });

    // Evento disparado quando o usuário se desconecta
    socket.on('disconnect', () => {
        const disconnectedUser = onlineUsers[socket.id];
        delete onlineUsers[socket.id];  // Remover o usuário da lista pelo ID do socket
        io.emit('onlineUsers', Object.values(onlineUsers));  // Enviar a lista atualizada de usuários online
        console.log(`${disconnectedUser} se desconectou. Usuários online:`, onlineUsers);
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
