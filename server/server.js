const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const words = require('../src/resources/words.json'); // Atualize o caminho para o seu arquivo words.json

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
});

app.use(cors({
    origin: '*',
}));

const rooms = {}; // Armazenar salas como objetos
const colors = ['#60a5fa', '#f87171', '#d1d5db', '#000000']; // Cores diferentes para os jogadores

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Envia a lista de salas disponíveis ao conectar
    socket.emit('rooms-update', Object.keys(rooms).map((roomId) => ({ roomId })));

    // Manipula a criação de sala
    socket.on('create-room', (roomId) => {
        console.log(`Create room request: ${roomId}`);
        if (!rooms[roomId]) {
            rooms[roomId] = {
                board: createInitialBoard(),
                players: {},
                spymasters: { blue: null, red: null }, // Inicializa os Spymasters com valores nulos
                gameStatus: 'playing',
                blackWordRevealed: false,
                currentTeam: 'blue',
            };
            io.emit('rooms-update', Object.keys(rooms).map((id) => ({ roomId: id })));
            console.log(`Room created: ${roomId}`);
        }
        socket.join(roomId);
        const playerColor = assignPlayerColor(roomId);
        rooms[roomId].players[socket.id] = { color: playerColor, isSpymaster: false };
        socket.emit('room-data', {
            roomId,
            message: 'You joined the room!',
            board: rooms[roomId].board,
            playerColor,
            players: rooms[roomId].players,
            gameStatus: rooms[roomId].gameStatus,
            currentTeam: rooms[roomId].currentTeam,
            spymasters: rooms[roomId].spymasters,
        });
        socket.to(roomId).emit('room-data', {
            message: `Client ${socket.id} joined the room!`,
            board: rooms[roomId].board,
            players: rooms[roomId].players,
            gameStatus: rooms[roomId].gameStatus,
            currentTeam: rooms[roomId].currentTeam,
            spymasters: rooms[roomId].spymasters,
        });
    });
    socket.on('reset-board', (roomId, newBoard) => {
        // Envia o novo board para todos os jogadores na sala, exceto o que enviou
        socket.to(roomId).emit('reset-board', newBoard);
        
        // Se quiser enviar também para quem clicou no reset
        // io.in(roomId).emit('reset-board', newBoard);
    });
    // Manipula o ingresso na sala
    socket.on('join-room', (roomId) => {
        console.log(`Join room request: ${roomId}`);
        if (rooms[roomId]) {
            socket.join(roomId);
            console.log(`Client ${socket.id} joined room: ${roomId}`);
            const playerColor = assignPlayerColor(roomId);
            rooms[roomId].players[socket.id] = { color: playerColor, isSpymaster: false };
            socket.emit('room-data', {
                roomId,
                message: 'You joined the room!',
                board: rooms[roomId].board,
                playerColor,
                players: rooms[roomId].players,
                gameStatus: rooms[roomId].gameStatus,
                currentTeam: rooms[roomId].currentTeam,
                spymasters: rooms[roomId].spymasters,
            });
            socket.to(roomId).emit('room-data', {
                message: `Client ${socket.id} joined the room!`,
                board: rooms[roomId].board,
                players: rooms[roomId].players,
                gameStatus: rooms[roomId].gameStatus,
                currentTeam: rooms[roomId].currentTeam,
                spymasters: rooms[roomId].spymasters,
            });
        } else {
            console.log(`Room ${roomId} does not exist`);
            socket.emit('room-data', { message: 'Room does not exist' });
        }
    });

    // Manipula o pedido para ser Spymaster
    socket.on('set-spymaster', ({ roomId, team }) => {
        const room = rooms[roomId];
        if (room) {
            if (!room.spymasters[team]) {
                room.spymasters[team] = socket.id;
                room.players[socket.id].isSpymaster = true;
                io.to(roomId).emit('room-data', {
                    spymasters: room.spymasters,
                    players: room.players,
                    message: `Player ${socket.id} is now Spymaster for ${team}`,
                });
            } else {
                socket.emit('room-data', { message: 'Spymaster already assigned for this team.' });
            }
        } else {
            socket.emit('room-data', { message: 'Room does not exist' });
        }
    });
    socket.on('reset-game', (roomId) => {
        const room = rooms[roomId];
        if (room) {
            // Reseta o estado do jogo
            room.board = createInitialBoard(); // Certifique-se de que isso cria um tabuleiro com 25 cartas
            room.gameStatus = 'playing';
            room.blackWordRevealed = false;
            room.currentTeam = 'blue';
            
            // Notifica todos os jogadores na sala sobre o reset
            io.to(roomId).emit('room-data', {
                board: room.board,
                players: room.players,
                gameStatus: room.gameStatus,
                blackWordRevealed: room.blackWordRevealed,
                currentTeam: room.currentTeam,
            });
    
            console.log(`Game reset for room: ${roomId}`);
        } else {
            socket.emit('room-data', { message: 'Room does not exist' });
        }
    });
    
    
    // Manipula a renúncia de Spymaster
    socket.on('resign-spymaster', (roomId) => {
        const room = rooms[roomId];
        if (room) {
            const player = room.players[socket.id];
            if (player && player.isSpymaster) {
                const team = Object.keys(room.spymasters).find(team => room.spymasters[team] === socket.id);
                if (team) {
                    delete room.spymasters[team];
                    player.isSpymaster = false;
                    io.to(roomId).emit('room-data', {
                        spymasters: room.spymasters,
                        players: room.players,
                    });
                }
            }
        }
    });

    // Manipula atualizações do tabuleiro
    socket.on('update-board', (data) => {
        console.log('Update board received from socket:', data);
      
        if (rooms[data.roomId]) {
          const room = rooms[data.roomId];
          room.board = data.board;
          room.gameStatus = data.gameStatus;
          room.blackWordRevealed = data.blackWordRevealed;
          room.currentTeam = data.currentTeam;
      
          io.to(data.roomId).emit('room-data', {
            board: room.board,
            players: room.players,
            gameStatus: room.gameStatus,
            blackWordRevealed: room.blackWordRevealed,
            currentTeam: room.currentTeam,
          });
      
          console.log(`Board updated and emitted to room: ${data.roomId}`);
        }
      });

    // Manipula o clique nas células do tabuleiro
    // socket.on('cell-click', (data) => {
    //     const { roomId, row, col } = data;
    //     const room = rooms[roomId];
    //     if (!room) return;
    
    //     const cell = room.board[row][col];
    //     const player = room.players[socket.id];
        
    //     if (!player) return; // Verifica se o jogador está na sala
    
    //     if (!player.isSpymaster && cell.revealed) {
    //         // Se não for Spymaster e a célula já foi revelada, não faça nada
    //         return;
    //     }
    
    //     // Se o jogador for o Spymaster, revela a cor de todos os quadrados
    //     if (player.isSpymaster) {
    //         room.board = room.board.map((rowArr) =>
    //             rowArr.map((cell) => ({ ...cell, revealed: true }))
    //         );
    //     } else {
    //         // Se o jogador não for Spymaster, revela apenas o quadrado clicado
    //         const newBoard = room.board.map((rowArr, rowIndex) =>
    //             rowArr.map((cell, colIndex) =>
    //                 rowIndex === row && colIndex === col
    //                     ? { ...cell, revealed: true }
    //                     : cell
    //             )
    //         );
    
    //         // Atualiza o status do jogo com base no tipo de palavra
    //         let gameStatus = room.gameStatus;
    //         let blackWordRevealed = room.blackWordRevealed;
    //         if (cell.category === 'black') {
    //             gameStatus = 'lost';
    //             blackWordRevealed = true;
    //         } else if (cell.category === room.currentTeam) {
    //             room.currentTeam = room.currentTeam === 'blue' ? 'red' : 'blue';
    //         } else {
    //             room.currentTeam = room.currentTeam === 'blue' ? 'red' : 'blue';
    //         }
    
    //         // Atualiza o estado do jogo
    //         room.board = newBoard;
    //         room.gameStatus = gameStatus;
    //         room.blackWordRevealed = blackWordRevealed;
    //     }
    
    //     // Emite a atualização do tabuleiro para todos os jogadores na sala
    //     io.to(roomId).emit('room-data', {
    //         board: room.board,
    //         players: room.players,
    //         gameStatus: room.gameStatus,
    //         blackWordRevealed: room.blackWordRevealed,
    //         currentTeam: room.currentTeam,
    //     });
    
    //     if (room.gameStatus === 'lost') {
    //         io.to(roomId).emit('game-over', { message: 'Game over! Black word revealed.' });
    //     }
    // });
    socket.on('cell-click', (data) => {
        const { roomId, row, col } = data;
        const room = rooms[roomId];
        if (!room) return;
    
        const cell = room.board[row][col];
        const player = room.players[socket.id];
        
        if (!player) return; // Verifica se o jogador está na sala
    
        if (!player.isSpymaster && cell.revealed) {
            // Se não for Spymaster e a célula já foi revelada, não faça nada
            return;
        }
    
        // Se o jogador for o Spymaster, revela a cor de todos os quadrados
        if (player.isSpymaster) {
            room.board = room.board.map((rowArr) =>
                rowArr.map((cell) => ({ ...cell, revealed: true }))
            );
        } else {
            // Se o jogador não for Spymaster, revela apenas o quadrado clicado
            const newBoard = room.board.map((rowArr, rowIndex) =>
                rowArr.map((cell, colIndex) =>
                    rowIndex === row && colIndex === col
                        ? { ...cell, revealed: true }
                        : cell
                )
            );
    
            // Atualiza o status do jogo com base no tipo de palavra
            let gameStatus = room.gameStatus;
            let blackWordRevealed = room.blackWordRevealed;
            if (cell.category === 'black') {
                gameStatus = 'lost';
                blackWordRevealed = true;
            } else if (cell.category === room.currentTeam) {
                room.currentTeam = room.currentTeam === 'blue' ? 'red' : 'blue';
            } else {
                room.currentTeam = room.currentTeam === 'blue' ? 'red' : 'blue';
            }
    
            // Atualiza o estado do jogo
            room.board = newBoard;
            room.gameStatus = gameStatus;
            room.blackWordRevealed = blackWordRevealed;
        }
    
        // Emite a atualização do tabuleiro para todos os jogadores na sala
        io.to(roomId).emit('room-data', {
            board: room.board,
            players: room.players,
            gameStatus: room.gameStatus,
            blackWordRevealed: room.blackWordRevealed,
            currentTeam: room.currentTeam,
        });
    
        if (room.gameStatus === 'lost') {
            io.to(roomId).emit('game-over', { message: 'Game over! Black word revealed.' });
        }
    });
    
    // Limpa a sala quando o cliente desconecta
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        Object.keys(rooms).forEach((roomId) => {
            if (io.sockets.adapter.rooms.get(roomId)?.has(socket.id)) {
                const room = rooms[roomId];
                delete room.players[socket.id];
                io.to(roomId).emit('room-data', {
                    message: `Client ${socket.id} has left the room.`,
                    players: room.players,
                });

                // Se a sala estiver vazia, remova-a
                if (Object.keys(room.players).length === 0) {
                    delete rooms[roomId];
                    io.emit('rooms-update', Object.keys(rooms).map((id) => ({ roomId: id })));
                }
            }
        });
    });
});

function createInitialBoard() {
    // Cria um array com a distribuição fixa de categorias
    const categories = [
        'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', // 9 vermelhas
        'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', // 8 azuis
        'neutral', 'neutral', 'neutral', 'neutral', 'neutral', 'neutral', 'neutral', 'neutral', // 8 cinzas
        'black' // 1 preta
    ];

    // Embaralha as categorias
    const shuffledCategories = categories.sort(() => Math.random() - 0.5);

    // Gera o tabuleiro 5x5
    const board = Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => ({
            word: words[row * 5 + col], // Supondo que você está usando palavras do seu arquivo words.json
            revealed: false,
            category: shuffledCategories[row * 5 + col] // Atribui a categoria embaralhada
        }))
    );

    return board;
}


function determineCategory(row, col) {
    // Adicione sua lógica para determinar a categoria de cada palavra
    // Exemplo simplificado
    const categories = ['blue', 'red', 'neutral', 'black'];
    return categories[Math.floor(Math.random() * categories.length)];
}

function assignPlayerColor(roomId) {
    const usedColors = Object.values(rooms[roomId].players).map(player => player.color);
    return colors.find(color => !usedColors.includes(color)) || '#FFFFFF'; // Retorna cor padrão se todas as cores estiverem em uso
}

server.listen(4000, () => console.log('Server listening on port 4000'));
