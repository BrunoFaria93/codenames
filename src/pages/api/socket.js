// pages/api/socket.ts
import { Server } from 'socket.io';

export default function handler(req, res) {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server);
        res.socket.server.io = io;

        io.on('connection', (socket) => {
            socket.on('join-room', (roomId) => {
                socket.join(roomId);
                // Enviar dados iniciais do jogo para o jogador
                io.to(roomId).emit('room-data', { words: generateWords() });
            });
        });
    }
    res.end();
}

const generateWords = () => {
    // Função para gerar palavras aleatórias para o jogo
    return ['word1', 'word2', 'word3', 'word4', 'word5']; // Substitua por sua lógica
}
