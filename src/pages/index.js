import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faSkull,
  faAnchor,
  faCompass,
  faTreasureChest,
  faShip,
  faSwords,
} from "@fortawesome/free-solid-svg-icons";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeVideo, setActiveVideo] = useState(1);
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

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

  // Configuração do crossfade para loop suave
  useEffect(() => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    if (!video1 || !video2) return;

    const handleVideo1End = () => {
      setActiveVideo(2);
      video2.currentTime = 0;
      video2.play();
    };

    const handleVideo2End = () => {
      setActiveVideo(1);
      video1.currentTime = 0;
      video1.play();
    };

    video1.addEventListener("ended", handleVideo1End);
    video2.addEventListener("ended", handleVideo2End);

    // Inicia o primeiro vídeo
    video1.play();

    return () => {
      video1.removeEventListener("ended", handleVideo1End);
      video2.removeEventListener("ended", handleVideo2End);
    };
  }, []);

  return (
    <div className="min-h-screen w-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-red-950 to-black">
      {/* Video Background com Crossfade */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <video
          ref={video1Ref}
          muted
          playsInline
          preload="auto"
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${
            activeVideo === 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/images/background.mp4" type="video/mp4" />
        </video>
        <video
          ref={video2Ref}
          muted
          playsInline
          preload="auto"
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${
            activeVideo === 2 ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/images/background.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Dynamic Gradient Overlay */}
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

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo/Title Section */}
        <div
          className={`text-center mb-12 transition-all duration-1000 transform ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
        >
          <div className="relative mb-8">
            {/* Skull Icon */}

            {/* Main Title */}

            {/* Decorative Swords */}
            <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 hidden md:block">
              <FontAwesomeIcon
                icon={faSwords}
                className="text-amber-400/30 text-3xl rotate-45"
              />
            </div>
            <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 hidden md:block">
              <FontAwesomeIcon
                icon={faSwords}
                className="text-amber-400/30 text-3xl -rotate-45"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div className="mb-8"></div>
        </div>

        {/* Play Button */}
        <div
          className={`transition-all duration-1000 delay-500 transform ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
        >
          <Link href="/lobby" className="group relative inline-block">
            {/* Button Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-amber-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Button Text */}
            <div className="relative z-10">
              <span className="block text-2xl whitespace-nowrap text-yellow-50 blink-animation font-free-pixel">
                TOQUE PARA INICIAR
              </span>
            </div>

            {/* Ripple Effect */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          </Link>
        </div>

        {/* Bottom decoration for mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:hidden z-5"></div>
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

        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0.7;
          }
        }

        .blink-animation {
          animation: blink 2s infinite;
        }
      `}</style>
    </div>
  );
}
