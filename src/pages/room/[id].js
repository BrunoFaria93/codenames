import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";
import words from "../../resources/words.json";
import Lottie from "lottie-react";
import loadingAnimation from "@/assets/loading-code.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { faEye, faRefresh } from "@fortawesome/free-solid-svg-icons";
import {
  faSkull,
  faAnchor,
  faCompass,
  faTreasureChest,
  faShip,
  faCrown,
  faFlag,
  faForward,
} from "@fortawesome/free-solid-svg-icons";

const generateBoard = (words) => {
  const cardCounts = {
    red: 9,
    blue: 8,
    gray: 7,
    black: 1,
  };

  // Garantir palavras únicas
  const uniqueWords = Array.from(new Set(words));
  if (uniqueWords.length < 25) {
    throw new Error(
      "O array de palavras deve conter pelo menos 25 palavras únicas."
    );
  }

  const shuffledWords = uniqueWords
    .sort(() => Math.random() - 0.5)
    .slice(0, 25);

  const cards = [
    ...Array(cardCounts.red).fill({ category: "red" }),
    ...Array(cardCounts.blue).fill({ category: "blue" }),
    ...Array(cardCounts.gray).fill({ category: "neutral" }),
    { category: "black" },
  ];

  // Gerar índices únicos para as imagens
  const redIndices = Array.from({ length: 9 }, (_, i) => i).sort(
    () => Math.random() - 0.5
  );
  const blueIndices = Array.from({ length: 8 }, (_, i) => i).sort(
    () => Math.random() - 0.5
  );

  let redIndexCounter = 0;
  let blueIndexCounter = 0;

  const shuffledCards = cards
    .sort(() => Math.random() - 0.5)
    .map((card) => {
      if (card.category === "red") {
        return { ...card, imageIndex: redIndices[redIndexCounter++] };
      } else if (card.category === "blue") {
        return { ...card, imageIndex: blueIndices[blueIndexCounter++] };
      } else {
        return { ...card, imageIndex: 0 };
      }
    });

  const board = [];
  for (let i = 0; i < 5; i++) {
    board.push(
      shuffledCards.slice(i * 5, i * 5 + 5).map((card, index) => ({
        word: shuffledWords[i * 5 + index],
        revealed: false,
        category: card.category,
        imageIndex: card.imageIndex,
      }))
    );
  }
  return board;
};

const Room = () => {
  const router = useRouter();
  const { id: roomId } = router.query;
  const [board, setBoard] = useState([]);
  const [playerColor, setPlayerColor] = useState("");
  const [players, setPlayers] = useState({});
  const [socket, setSocket] = useState(null);
  const [gameStatus, setGameStatus] = useState("playing");
  const [winnerTeam, setWinnerTeam] = useState(null);
  const [blackWordRevealed, setBlackWordRevealed] = useState(false);
  const [isSpymaster, setIsSpymaster] = useState(false);
  const [revealedBySpymaster, setRevealedBySpymaster] = useState(false);
  const [redCardsRemaining, setRedCardsRemaining] = useState(0);
  const [blueCardsRemaining, setBlueCardsRemaining] = useState(0);
  const [clickedCards, setClickedCards] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTurn, setCurrentTurn] = useState("red");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    setSocket(socketInstance);
    socketInstance.emit("join-room", roomId);

    socketInstance.on("room-data", (data) => {
      if (data.board) {
        setBoard(data.board);
      }
      if (data.playerColor) setPlayerColor(data.playerColor);
      if (data.players) setPlayers(data.players);
      if (data.gameStatus) setGameStatus(data.gameStatus);
      if (data.currentTeam !== undefined) setCurrentTurn(data.currentTeam); // Mudança aqui
      if (data.blackWordRevealed !== undefined)
        setBlackWordRevealed(data.blackWordRevealed);
      if (data.redCardsRemaining !== undefined)
        setRedCardsRemaining(data.redCardsRemaining);
      if (data.blueCardsRemaining !== undefined)
        setBlueCardsRemaining(data.blueCardsRemaining);

      if (data.gameStatus === "finished" && !data.blackWordRevealed) {
        if (data.redCardsRemaining === 0) {
          setWinnerTeam("red");
        } else if (data.blueCardsRemaining === 0) {
          setWinnerTeam("blue");
        } else {
          setWinnerTeam(data.winnerTeam || null);
        }
      } else {
        setWinnerTeam(data.winnerTeam || null);
      }
    });

    socketInstance.on("turn-changed", ({ newTurn }) => {
      setCurrentTurn(newTurn);
    });

    socketInstance.on(
      "reset-board",
      (newBoard, newStatus, newRedCardsRemaining, newBlueCardsRemaining) => {
        // REMOVI toda a correção automática de imageIndex aqui
        setBoard(newBoard); // Apenas esta linha - SEM correção
        setGameStatus(newStatus);
        setWinnerTeam(null);
        setCurrentTurn("red");
        setBlackWordRevealed(false);
        setRedCardsRemaining(newRedCardsRemaining);
        setBlueCardsRemaining(newBlueCardsRemaining);
      }
    );

    return () => {
      socketInstance.off("turn-changed");
      socketInstance.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    const countCards = () => {
      let redCount = 0;
      let blueCount = 0;
      board.forEach((row) => {
        row.forEach((cell) => {
          if (cell && !cell.revealed) {
            if (cell.category === "red") redCount++;
            else if (cell.category === "blue") blueCount++;
          }
        });
      });
      setRedCardsRemaining(redCount);
      setBlueCardsRemaining(blueCount);

      if (redCount === 0 && gameStatus === "playing") {
        setGameStatus("finished");
        setWinnerTeam("red");
        if (socket) {
          socket.emit("game-won", { roomId, winnerTeam: "red" });
        }
      } else if (blueCount === 0 && gameStatus === "playing") {
        setGameStatus("finished");
        setWinnerTeam("blue");
        if (socket) {
          socket.emit("game-won", { roomId, winnerTeam: "blue" });
        }
      }
    };
    countCards();
  }, [board, gameStatus, socket, roomId]);

  useEffect(() => {
    if (socket) {
      socket.off("card-clicked");
      socket.on("card-clicked", ({ roomId, cardPosition }) => {
        setClickedCards((prevClickedCards) => {
          const isCardAlreadyClicked = prevClickedCards.some(
            (card) =>
              card.row === cardPosition.row && card.col === cardPosition.col
          );
          if (!isCardAlreadyClicked) {
            return [...prevClickedCards, cardPosition];
          }
          return prevClickedCards;
        });
      });

      socket.on("game-won", ({ winnerTeam }) => {
        setGameStatus("finished");
        setWinnerTeam(winnerTeam);
      });
    }
    return () => {
      if (socket) {
        socket.off("card-clicked");
        socket.off("game-won");
      }
    };
  }, [socket]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) router.push("/lobby");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  const handleRevealAllClick = () => {
    setRevealedBySpymaster(!revealedBySpymaster);
    if (socket) socket.emit("reveal-all-clicked", roomId);
  };

  const handleCellClick = (row, col) => {
    if (revealedBySpymaster || gameStatus !== "playing" || blackWordRevealed)
      return;

    const clickedCell = board[row][col];
    if (clickedCell.revealed) return;

    const newBoard = board.map((rowArr, rowIndex) =>
      rowArr.map((cell, colIndex) => {
        if (rowIndex === row && colIndex === col && cell && !cell.revealed) {
          return { ...cell, revealed: true };
        }
        return cell;
      })
    );

    let updatedGameStatus = gameStatus;
    let updatedBlackWordRevealed = blackWordRevealed;
    let updatedWinnerTeam = winnerTeam;
    let newCurrentTurn = currentTurn;

    if (clickedCell.category === "black") {
      updatedGameStatus = "finished";
      updatedBlackWordRevealed = true;
      updatedWinnerTeam = currentTurn === "red" ? "blue" : "red";
    } else if (clickedCell.category !== currentTurn) {
      // Se clicou em carta que NÃO é da equipe atual, passa a vez
      newCurrentTurn = currentTurn === "red" ? "blue" : "red";
    }
    // Se clicou em carta da própria equipe, continua o turno

    setBoard(newBoard);
    setGameStatus(updatedGameStatus);
    setBlackWordRevealed(updatedBlackWordRevealed);
    setWinnerTeam(updatedWinnerTeam);
    setCurrentTurn(newCurrentTurn);
    setClickedCards((prevClickedCards) => [...prevClickedCards, { row, col }]);

    if (socket) {
      socket.emit("card-clicked", { roomId, cardPosition: { row, col } });
      socket.emit("update-board", {
        roomId,
        board: newBoard,
        gameStatus: updatedGameStatus,
        blackWordRevealed: updatedBlackWordRevealed,
        winnerTeam: updatedWinnerTeam,
        currentTurn: newCurrentTurn,
      });

      if (updatedWinnerTeam) {
        socket.emit("game-won", { roomId, winnerTeam: updatedWinnerTeam });
      }
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on(
        "reset-board",
        (
          newBoard,
          newGameStatus,
          newRedCardsRemaining,
          newBlueCardsRemaining
        ) => {
          setClickedCards([]);
          setBoard(newBoard);
          setGameStatus(newGameStatus);
          setRevealedBySpymaster(false);
          setBlackWordRevealed(false);
          setWinnerTeam(null);
          setCurrentTurn("red");
          setRedCardsRemaining(newRedCardsRemaining);
          setBlueCardsRemaining(newBlueCardsRemaining);
        }
      );
    }
    return () => {
      if (socket) socket.off("reset-board");
    };
  }, [socket]);

  const handleResetGame = () => {
    setClickedCards([]);
    const newBoard = generateBoard(words);
    setBoard(newBoard);
    setRevealedBySpymaster(false);
    setGameStatus("playing");
    setBlackWordRevealed(false);
    setWinnerTeam(null);
    setCurrentTurn("red");
    setRedCardsRemaining(9);
    setBlueCardsRemaining(8);

    if (socket) {
      socket.emit("reset-game", roomId); // Mudança aqui: usar "reset-game" em vez de "reset-board"
    }
  };

  const handlePassTurn = () => {
    if (gameStatus !== "playing") return;

    const newTurn = currentTurn === "red" ? "blue" : "red";
    setCurrentTurn(newTurn);

    if (socket) {
      socket.emit("pass-turn", { roomId, newTurn });
    }
  };

  return (
    <div className="p-0 md:p-4 h-screen w-screen relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/images/background.mp4" type="video/mp4" />
      </video>

      <div
        className="absolute top-0 left-0 w-full h-full z-5 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                    rgba(220, 38, 38, 0.3) 0%, 
                    rgba(0, 0, 0, 0.7) 50%, 
                    rgba(0, 0, 0, 0.9) 100%)`,
        }}
      ></div>

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

      <div className="flex flex-col w-full gap-x-4 relative z-10 h-full">
        <div className="flex flex-col w-full justify-center items-center mt-6 md:mt-10 px-4">
          <div className="flex items-center justify-between w-full max-w-4xl mb-4">
            <button
              onClick={() => router.push("/lobby")}
              className="flex items-center text-white/90 hover:text-white transition-colors bg-black/30 hover:bg-blue-600/40 backdrop-blur-sm rounded-full p-3 md:p-4 shadow-lg"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
            </button>
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/10">
              <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
                Sala:{" "}
                <span className="text-blue-300">
                  {roomId || "Carregando..."}
                </span>
              </h1>
            </div>
            <div className="w-10"></div>
          </div>

          {gameStatus === "playing" && (
            <div className="flex items-center gap-3 mb-3 bg-black/30 backdrop-blur-sm rounded-xl px-6 py-2 border border-white/10 shadow-lg">
              <FontAwesomeIcon
                icon={faFlag}
                className={`text-lg ${
                  currentTurn === "red" ? "text-red-400" : "text-blue-400"
                }`}
              />
              <span className="text-white font-semibold">
                Vez do Time{" "}
                <span
                  className={
                    currentTurn === "red" ? "text-red-300" : "text-blue-300"
                  }
                >
                  {currentTurn === "red" ? "Vermelho" : "Azul"}
                </span>
              </span>
            </div>
          )}

          {gameStatus == "playing" && (
            <div className="flex items-center gap-4 bg-black/30 backdrop-blur-sm rounded-xl px-6 py-3 mb-2 border border-white/10 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <p className="text-red-300 font-bold text-xl md:text-2xl">
                  {redCardsRemaining}
                </p>
              </div>

              <span className="text-white/70 text-xl">|</span>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <p className="text-blue-300 font-bold text-xl md:text-2xl">
                  {blueCardsRemaining}
                </p>
              </div>
            </div>
          )}

          {gameStatus !== "playing" && (
            <div
              className={`mt-4 backdrop-blur-sm rounded-xl px-6 py-3 border shadow-lg ${
                winnerTeam === "red"
                  ? "bg-red-500/90 border-red-300/30"
                  : winnerTeam === "blue"
                  ? "bg-blue-500/90 border-blue-300/30"
                  : "bg-gray-500/90 border-gray-300/30"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <FontAwesomeIcon
                  icon={faCrown}
                  className={`text-2xl ${
                    winnerTeam === "red"
                      ? "text-yellow-300"
                      : winnerTeam === "blue"
                      ? "text-yellow-300"
                      : "text-gray-300"
                  }`}
                />
                <h2 className="text-white font-bold text-xl md:text-2xl animate-pulse">
                  {winnerTeam
                    ? `🏆 Time ${
                        winnerTeam === "red" ? "Vermelho" : "Azul"
                      } Venceu!`
                    : "Fim de Jogo"}
                </h2>
                <FontAwesomeIcon
                  icon={faCrown}
                  className={`text-2xl ${
                    winnerTeam === "red"
                      ? "text-yellow-300"
                      : winnerTeam === "blue"
                      ? "text-yellow-300"
                      : "text-gray-300"
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        <div className="w-full h-full flex justify-center items-center mt-6 md:mt-8 px-4">
          {board.length > 0 ? (
            <div className="grid grid-cols-5 gap-2 md:gap-4 max-w-4xl">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`w-16 md:w-32 h-16 md:h-32 perspective transition-all duration-300 ease-out ${
                      clickedCards.some(
                        (card) =>
                          card.row === rowIndex &&
                          card.col === colIndex &&
                          revealedBySpymaster
                      )
                        ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-black/50 rounded-lg"
                        : "hover:scale-105"
                    }`}
                  >
                    <div
                      className={`w-full h-full relative transform-style-preserve-3d transition-transform duration-500 ${
                        cell.revealed || revealedBySpymaster
                          ? "rotate-y-180"
                          : ""
                      }`}
                    >
                      <div
                        className={`absolute w-full h-full backface-hidden flex items-center justify-center border-2 border-gray-400/30 cursor-pointer rounded-lg bg-white/95 shadow-md ${
                          cell.revealed || revealedBySpymaster
                            ? "shadow-inner"
                            : ""
                        }`}
                      >
                        <span className="text-gray-800 font-bold text-xs md:text-sm text-center px-1 leading-tight">
                          {cell.word.charAt(0).toUpperCase() +
                            cell.word.slice(1)}
                        </span>
                      </div>

                      <div
                        className={`absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center cursor-pointer rounded-lg overflow-hidden ${
                          cell.revealed || revealedBySpymaster ? "" : "bg-white"
                        }`}
                        style={getCellColor(cell.category, cell.imageIndex)}
                      >
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute bottom-0 w-full py-1 bg-gradient-to-t from-black/90 to-transparent flex justify-center items-end">
                          <span
                            className={`text-white font-bold text-xs md:text-sm mb-1 ${
                              cell.category === "black" ? "text-white" : ""
                            }`}
                          >
                            {cell.word.charAt(0).toUpperCase() +
                              cell.word.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[50vh]">
              <Lottie
                animationData={loadingAnimation}
                className="w-20 h-20"
                loop
              />
            </div>
          )}
        </div>

        <div className="flex justify-center items-center gap-2 md:gap-4 mt-6 md:mt-8 pb-6 md:pb-8 px-2">
          {gameStatus === "playing" && (
            <button
              onClick={handlePassTurn}
              className="bg-gradient-to-r bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-300 px-3 md:px-6 py-2 md:py-3 text-white font-semibold rounded-xl shadow-lg flex items-center gap-1 md:gap-2 text-sm md:text-base"
            >
              <FontAwesomeIcon
                icon={faForward}
                className="text-sm md:text-base"
              />
              <span className="whitespace-nowrap">Passar Vez</span>
            </button>
          )}

          <button
            onClick={handleResetGame}
            className="bg-gradient-to-r bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-300 px-3 md:px-6 py-2 md:py-3 text-white font-semibold rounded-xl shadow-lg flex items-center gap-1 md:gap-2 text-sm md:text-base"
          >
            <FontAwesomeIcon
              icon={faRefresh}
              className="text-sm md:text-base"
            />
            <span className="whitespace-nowrap">Reiniciar</span>
          </button>
          <button
            onClick={handleRevealAllClick}
            className="bg-gradient-to-r bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-lg border border-amber-400/30 transition-all duration-300 px-3 md:px-6 py-2 md:py-3 text-amber-200 hover:text-amber-100 font-semibold rounded-xl shadow-lg flex items-center gap-1 md:gap-2 text-sm md:text-base"
          >
            <FontAwesomeIcon icon={faEye} className="text-sm md:text-base" />
            <span className="whitespace-nowrap">Capitão</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const getCellColor = (category, imageIndex) => {
  console.log(`Category: ${category}, ImageIndex: ${imageIndex}`); // Debug line

  const redCards = Array.from(
    { length: 9 },
    (_, i) => `/images/redCard${i + 1}.png`
  );
  const blueCards = Array.from(
    { length: 8 },
    (_, i) => `/images/blueCard${i + 1}.png`
  );

  switch (category) {
    case "red":
      const redIndex =
        imageIndex !== undefined && imageIndex !== null && imageIndex >= 0
          ? imageIndex
          : 0;
      console.log(
        `Red card using index: ${redIndex}, image: ${redCards[redIndex]}`
      ); // Debug
      return {
        backgroundImage: `url(${redCards[redIndex]})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      };
    case "blue":
      const blueIndex =
        imageIndex !== undefined && imageIndex !== null && imageIndex >= 0
          ? imageIndex
          : 0;
      console.log(
        `Blue card using index: ${blueIndex}, image: ${blueCards[blueIndex]}`
      ); // Debug
      return {
        backgroundImage: `url(${blueCards[blueIndex]})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      };
    case "black":
      return {
        backgroundImage: `url(/images/deathCard.png)`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      };
    default:
      return {
        backgroundImage: `url(/images/grayCard.png)`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      };
  }
};

export default Room;
