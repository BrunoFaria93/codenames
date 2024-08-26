// src/components/Card/Card.js
import React from 'react';

const Card = ({ card }) => {
    return (
        <div className="p-4 border rounded shadow">
            <h2 className="text-lg font-bold">{card.word}</h2>
            {/* Adicione mais detalhes sobre o cartão aqui */}
        </div>
    );
};

export default Card;
