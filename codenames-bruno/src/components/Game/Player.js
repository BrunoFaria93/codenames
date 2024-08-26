// src/components/Game/Player.js
import React from 'react';

const Player = ({ player }) => {
    return (
        <div className="p-4 border border-gray-300 rounded mb-2">
            <span className="text-lg font-medium">{player.name}</span>
        </div>
    );
};

export default Player;
