import { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";

// URL do socket baseada no ambiente
const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? typeof window !== "undefined"
      ? window.location.origin
      : ""
    : "http://localhost:3000";

let socket = null;

const useGameSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    // Conecta apenas uma vez
    if (!socket) {
      socket = io(SOCKET_URL, {
        path: "/api/socket",
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("connect_error", (error) => {
        setIsConnected(false);
      });

      // Eventos específicos do jogo
      socket.on("rooms-update", (data) => {
        setRooms(data);
      });

      socket.on("room-data", (data) => {
        setRoomData(data);
      });

      socket.on("game-over", (data) => {
        alert(data.message);
      });

      socket.on("reset-board", (newBoard, newStatus) => {
        console.log("Board reset:", newBoard, newStatus);
        // Você pode adicionar lógica específica aqui
      });
    }

    return () => {
      // Cleanup apenas quando o componente for desmontado completamente
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
        setIsConnected(false);
      }
    };
  }, []);

  // Funções para interagir com o socket
  const createRoom = useCallback(
    (roomId) => {
      if (socket && isConnected) {
        socket.emit("create-room", roomId);
      }
    },
    [isConnected]
  );

  const joinRoom = useCallback(
    (roomId) => {
      if (socket && isConnected) {
        socket.emit("join-room", roomId);
      }
    },
    [isConnected]
  );

  const setSpymaster = useCallback(
    (roomId, team) => {
      if (socket && isConnected) {
        socket.emit("set-spymaster", { roomId, team });
      }
    },
    [isConnected]
  );

  const resignSpymaster = useCallback(
    (roomId) => {
      if (socket && isConnected) {
        socket.emit("resign-spymaster", roomId);
      }
    },
    [isConnected]
  );

  const resetGame = useCallback(
    (roomId) => {
      if (socket && isConnected) {
        socket.emit("reset-game", roomId);
      }
    },
    [isConnected]
  );

  const cellClick = useCallback(
    (roomId, row, col) => {
      if (socket && isConnected) {
        socket.emit("cell-click", { roomId, row, col });
      }
    },
    [isConnected]
  );

  const updateBoard = useCallback(
    (data) => {
      if (socket && isConnected) {
        socket.emit("update-board", data);
      }
    },
    [isConnected]
  );

  const resetBoard = useCallback(
    (roomId, newBoard) => {
      if (socket && isConnected) {
        socket.emit("reset-board", roomId, newBoard);
      }
    },
    [isConnected]
  );

  return {
    isConnected,
    rooms,
    roomData,
    socket,
    // Funções
    createRoom,
    joinRoom,
    setSpymaster,
    resignSpymaster,
    resetGame,
    cellClick,
    updateBoard,
    resetBoard,
  };
};

export default useGameSocket;
