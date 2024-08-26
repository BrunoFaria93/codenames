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
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        setLoading(true)
        const socketInstance = io('https://hilarious-fishy-handle.glitch.me/', {
            transports: ['websocket', 'polling'],
        });
        setSocket(socketInstance);

        socketInstance.on('rooms-update', (data) => {
            console.log('Rooms update:', data);
            setRooms(data);
            setLoading(false)
        });

        return () => {
            setLoading(false)
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
      <div className="p-6 md:max-w-screen md:mx-0 mx-auto bg-slate-950 h-screen overflow-hidden">

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
        {loading ? (
          <div className="flex justify-center items-start min-h-screen">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          <ul className="space-y-2 overflow-y-auto h-[80%]">
            {rooms.map((room) => (
              <li
                key={room.roomId}
                className="flex items-center justify-between w-full md:w-1/2  rounded-lg p-4 shadow-md bg-gradient-to-r from-slate-600 to-slate-800 border border-transparent hover:shadow-lg transition-all duration-300"
              >
                <span className="text-white font-semibold text-lg">
                  {room.roomId.charAt(0).toUpperCase() + room.roomId.slice(1)}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleJoinRoom(room.roomId)}
                    className="bg-slate-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.roomId)}
                    className="text-red-500 font-medium px-2 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
};

export default Lobby;
