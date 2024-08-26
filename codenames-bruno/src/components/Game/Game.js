// src/components/Game/Game.js
import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { usePlayers } from '../../context/PlayerContext';
import Board from '../Board/Board';
import Player from './Player';
import useSocket from '../../hooks/useSocket';

const Game = () => {
    const { gameState, setCards } = useGame();
    const { players } = usePlayers();
    const { roomId, cards } = gameState;

    // Use o hook para receber dados da sala
    useSocket('room-data', (data) => {
        console.log('Received room-data in component:', data);
        // Atualize o estado do jogo com os dados recebidos
        if (data.roomId === roomId) {
            setCards(data.cards || []); // Supondo que data.cards é a lista de cartões
        }
    });

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Codenames</h1>
            <Board cards={cards} />
            <div className="mt-4">
                {players.map((player) => (
                    <Player key={player.id} player={player} />
                ))}
            </div>
        </div>
    );
};

export default Game;
