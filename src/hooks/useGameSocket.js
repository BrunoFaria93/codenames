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
      console.log("Connecting to socket at:", SOCKET_URL);
      socket = io(SOCKET_URL, {
        path: "/api/socket",
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
      });

      // Eventos específicos do jogo
      socket.on("rooms-update", (data) => {
        console.log("Rooms updated:", data);
        setRooms(data);
      });

      socket.on("room-data", (data) => {
        console.log("Room data received:", data);
        setRoomData(data);
      });

      socket.on("game-over", (data) => {
        console.log("Game over:", data);
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
        console.log("Creating room:", roomId);
        socket.emit("create-room", roomId);
      }
    },
    [isConnected]
  );

  const joinRoom = useCallback(
    (roomId) => {
      if (socket && isConnected) {
        console.log("Joining room:", roomId);
        socket.emit("join-room", roomId);
      }
    },
    [isConnected]
  );

  const setSpymaster = useCallback(
    (roomId, team) => {
      if (socket && isConnected) {
        console.log("Setting spymaster:", roomId, team);
        socket.emit("set-spymaster", { roomId, team });
      }
    },
    [isConnected]
  );

  const resignSpymaster = useCallback(
    (roomId) => {
      if (socket && isConnected) {
        console.log("Resigning spymaster:", roomId);
        socket.emit("resign-spymaster", roomId);
      }
    },
    [isConnected]
  );

  const resetGame = useCallback(
    (roomId) => {
      if (socket && isConnected) {
        console.log("Resetting game:", roomId);
        socket.emit("reset-game", roomId);
      }
    },
    [isConnected]
  );

  const cellClick = useCallback(
    (roomId, row, col) => {
      if (socket && isConnected) {
        console.log("Cell clicked:", roomId, row, col);
        socket.emit("cell-click", { roomId, row, col });
      }
    },
    [isConnected]
  );

  const updateBoard = useCallback(
    (data) => {
      if (socket && isConnected) {
        console.log("Updating board:", data);
        socket.emit("update-board", data);
      }
    },
    [isConnected]
  );

  const resetBoard = useCallback(
    (roomId, newBoard) => {
      if (socket && isConnected) {
        console.log("Resetting board:", roomId);
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
