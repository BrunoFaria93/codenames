import { useEffect } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'https://hilarious-fishy-handle.glitch.me/';

const useSocket = (event, callback) => {
    useEffect(() => {
        console.log('Attempting to connect to:', SOCKET_URL);
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('Socket connected');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        socket.on(event, (data) => {
            console.log(`Received ${event}:`, data);
            callback(data);
        });

        return () => {
            console.log('Disconnecting socket');
            socket.off(event);
            socket.disconnect();
        };
    }, [event, callback]);
};

export default useSocket;
