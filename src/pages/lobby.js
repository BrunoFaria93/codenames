import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";
import Lottie from "lottie-react";
import loadingAnimation from "@/assets/loading-code.json";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faPlus,
  faTrash,
  faUsers,
  faGamepad,
  faDoorOpen,
  faSkull,
  faAnchor,
  faCompass,
  faTreasureChest,
  faShip,
} from "@fortawesome/free-solid-svg-icons";

const Lobby = () => {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    setLoading(true);
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket", "polling"],
    });
    setSocket(socketInstance);

    socketInstance.on("rooms-update", (data) => {
      console.log("Rooms update received:", data);
      setRooms(data);
      setLoading(false);
    });

    socketInstance.on("room-data", (data) => {
      if (data.roomId && data.message === "You joined the room!") {
        setIsCreatingRoom(false);
        router.push(`/room/${data.roomId}`);
      }
    });

    return () => {
      setLoading(false);
      socketInstance.disconnect();
    };
  }, [router]);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      setError("Digite um nome para a sala!");
      return;
    }

    setIsCreatingRoom(true);
    setError(null);

    try {
      socket.emit("create-room", newRoomName.trim());
      setNewRoomName("");
      // Removido o setTimeout - o redirect será feito pelo listener
    } catch (err) {
      setError("Erro ao criar sala. Tente novamente.");
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = (roomId) => {
    if (rooms.find((room) => room.roomId === roomId)) {
      socket.emit("join-room", roomId);
      setError(null);
      router.push(`/room/${roomId}`);
    } else {
      setError(`Sala ${roomId} não existe.`);
    }
  };

  const handleDeleteRoom = (roomId) => {
    socket.emit("delete-room", roomId);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCreateRoom();
    }
  };

  return (
    <div className="min-h-screen w-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-red-950 to-black">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/images/background.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div
        className="absolute top-0 left-0 w-full h-full z-5 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                    rgba(220, 38, 38, 0.3) 0%, 
                    rgba(0, 0, 0, 0.7) 50%, 
                    rgba(0, 0, 0, 0.9) 100%)`,
        }}
      ></div>

      {/* Floating Pirate Elements */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 opacity-20">
          <FontAwesomeIcon
            icon={faSkull}
            className="text-red-400 text-6xl animate-pulse"
            style={{ animationDelay: "0s" }}
          />
        </div>
        <div className="absolute top-40 right-16 w-24 h-24 opacity-15">
          <FontAwesomeIcon
            icon={faAnchor}
            className="text-amber-300 text-4xl animate-bounce"
            style={{ animationDelay: "1s", animationDuration: "3s" }}
          />
        </div>
        <div className="absolute bottom-32 left-20 w-28 h-28 opacity-20">
          <FontAwesomeIcon
            icon={faShip}
            className="text-blue-400 text-5xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>
        <div className="absolute top-60 left-1/2 w-20 h-20 opacity-15">
          <FontAwesomeIcon
            icon={faCompass}
            className="text-yellow-400 text-3xl animate-spin"
            style={{ animationDuration: "8s" }}
          />
        </div>
        <div className="absolute bottom-40 right-12 w-24 h-24 opacity-20">
          <FontAwesomeIcon
            icon={faTreasureChest}
            className="text-amber-500 text-4xl animate-pulse"
            style={{ animationDelay: "3s" }}
          />
        </div>
      </div>

      {/* Particle Effects */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/60 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Header */}
        <header className="text-center pt-8 pb-6 px-4 w-full">
          <div className="inline-flex items-center gap-3 mb-4">
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Game Lobby
            </h1>
          </div>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
            Crie ou entre em uma sala para começar a jogar
          </p>
        </header>

        {/* Create Room Section */}
        <div className="max-w-4xl mx-auto px-4 mb-8 w-full">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faPlus} className="text-white text-sm" />
              </div>
              <h2 className="text-2xl font-bold text-white">Criar Nova Sala</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite o nome da sala..."
                  className="w-full h-14 px-6 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  maxLength={50}
                />
              </div>
              <button
                onClick={handleCreateRoom}
                disabled={isCreatingRoom || !newRoomName.trim()}
                className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isCreatingRoom ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlus} />
                    Criar Sala
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-center">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Rooms Section */}
        <div className="flex-1 max-w-4xl mx-auto px-4 pb-8 w-full">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl min-h-96">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faDoorOpen}
                    className="text-white text-sm"
                  />
                </div>
                {/* <h2 className="text-2xl font-bold text-white">
                  Salas Disponíveis
                </h2> */}
              </div>
              <div className="text-slate-300 text-sm bg-white/10 px-3 py-1 rounded-full whitespace-nowrap">
                {rooms.length} {rooms.length === 1 ? "sala" : "salas"}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Lottie
                  animationData={loadingAnimation}
                  className="w-16 h-16 mb-4"
                  loop
                />
                <p className="text-slate-300 text-lg">Carregando salas...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-600/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="text-slate-400 text-2xl"
                  />
                </div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">
                  Nenhuma sala disponível
                </h3>
                <p className="text-slate-400">
                  Seja o primeiro a criar uma sala!
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:gap-6">
                {rooms.map((room, index) => (
                  <div
                    key={room.roomId}
                    className="group bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 hover:border-white/30 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <FontAwesomeIcon
                            icon={faGamepad}
                            className="text-white text-lg"
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {room.roomId.charAt(0).toUpperCase() +
                              room.roomId.slice(1)}
                          </h3>
                          <div className="flex items-center gap-2 text-slate-300">
                            <FontAwesomeIcon
                              icon={faUsers}
                              className="text-sm"
                            />
                            <span className="text-sm">Sala ativa</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleJoinRoom(room.roomId)}
                          className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon
                            icon={faDoorOpen}
                            className="text-sm"
                          />
                          Entrar
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.roomId)}
                          className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200 rounded-lg transition-all duration-300 transform hover:scale-105"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Custom Animations */}
      <style jsx>{`
        @keyframes treasure-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(245, 158, 11, 0.8),
              0 0 60px rgba(245, 158, 11, 0.3);
          }
        }

        .treasure-glow {
          animation: treasure-glow 3s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Lobby;
