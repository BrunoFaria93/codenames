import React, { createContext, useState, useContext } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [gameState, setGameState] = useState({
        roomId: '',
        players: [],
        cards: [], // Adicione os dados dos cards aqui
        // Outros estados
    });

    const joinRoom = (roomId) => {
        setGameState((prevState) => ({
            ...prevState,
            roomId
        }));
        // Lógica adicional para se conectar à sala
    };

    const addPlayer = (player) => {
        setGameState((prevState) => ({
            ...prevState,
            players: [...prevState.players, player]
        }));
    };

    const setCards = (cards) => {
        setGameState((prevState) => ({
            ...prevState,
            cards
        }));
    };

    return (
        <GameContext.Provider value={{ gameState, joinRoom, addPlayer, setCards }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    return useContext(GameContext);
};
