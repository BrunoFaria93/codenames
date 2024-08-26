import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

const Lobby = () => {
    const router = useRouter();
    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [socket, setSocket] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const socketInstance = io('https://hilarious-fishy-handle.glitch.me/', {
            transports: ['websocket', 'polling'],
        });
        setSocket(socketInstance);

        socketInstance.on('rooms-update', (data) => {
            console.log('Rooms update:', data);
            setRooms(data);
        });

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const handleCreateRoom = () => {
        if (newRoomName.trim()) {
            socket.emit('create-room', newRoomName);
            setNewRoomName('');
        }
    };

    const handleJoinRoom = (roomId) => {
        if (rooms.find(room => room.roomId === roomId)) {
            socket.emit('join-room', roomId);
            console.log('Joining room:', roomId);
            setError(null);
            router.push(`/room/${roomId}`);
        } else {
            setError(`Room ${roomId} does not exist.`);
        }
    };

    const handleDeleteRoom = (roomId) => {
        socket.emit('delete-room', roomId);
    };

    return (
      <div className="p-6 max-w-3xl mx-auto bg-slate-950 h-screen">
        <h1 className="text-3xl font-bold mb-4 text-white">Lobby</h1>
        <div className="mb-6">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Nome da sala..."
            className="border border-gray-300 p-2 rounded mr-2 w-2/3"
          />
          <button
            onClick={handleCreateRoom}
            className="bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-600"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        {error && <p className="text-[#E63946] mb-4">{error}</p>}
        <ul className="space-y-2">
          {rooms.map((room) => (
            <li
              key={room.roomId}
              className="flex items-center justify-between rounded-lg p-2 border border-gray-300 bg-slate-500"
            >
              <span className="text-white">
                {room.roomId.charAt(0).toUpperCase() + room.roomId.slice(1)}
              </span>
              <div>
                <button
                  onClick={() => handleJoinRoom(room.roomId)}
                  className="bg-teal-600 text-white px-3 py-1 rounded mr-2 hover:bg-teal-700"
                >
                  Entrar
                </button>
                <button
                  onClick={() => handleDeleteRoom(room.roomId)}
                  className="bg-[#f87171] text-white px-3 py-1 rounded hover:bg-[#f42727]"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
};

export default Lobby;
