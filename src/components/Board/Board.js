// src/components/Board/Board.js
import React from 'react';
import Card from '../Card/Card';

const Board = ({ cards }) => {
    return (
        <div className="grid grid-cols-5 gap-4">
            {cards.map((card) => (
                <Card key={card.id} card={card} />
            ))}
        </div>
    );
};

export default Board;
