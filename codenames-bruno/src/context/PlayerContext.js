import React, { createContext, useState, useContext } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);

    const addPlayer = (player) => {
        setPlayers((prevPlayers) => [...prevPlayers, player]);
    };

    const removePlayer = (playerId) => {
        setPlayers((prevPlayers) => prevPlayers.filter(player => player.id !== playerId));
    };

    return (
        <PlayerContext.Provider value={{ players, addPlayer, removePlayer }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayers = () => {
    return useContext(PlayerContext);
};
