import { useEffect } from "react";
import io from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

const useSocket = (event, callback) => {
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on(event, (data) => {
      callback(data);
    });

    return () => {
      console.log("Disconnecting socket");
      socket.off(event);
      socket.disconnect();
    };
  }, [event, callback]);
};

export default useSocket;
