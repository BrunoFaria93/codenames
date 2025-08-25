// utils/socket.js
import io from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (!socket) {
    const url = typeof window !== "undefined" ? window.location.origin : "";

    console.log("Connecting to:", url);

    socket = io(url, {
      path: "/api/socket",
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    });
  }
  return socket;
};

export const getSocket = () => socket; // 🔴 garante que exista
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
