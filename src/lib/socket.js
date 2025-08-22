// lib/socket.ts
import { io } from "socket.io-client";

console.log(
  "process.env.NEXT_PUBLIC_SOCKET_URL ",
  process.env.NEXT_PUBLIC_SOCKET_URL
);
const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"
);

export default socket;
