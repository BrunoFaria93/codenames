import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="h-screen w-screen relative overflow-hidden">
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
      {/* Overlay to ensure content visibility */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30 z-5"></div>

      <div className="w-full absolute h-20 bg-gradient-to-b from-black top-0 z-50 md:hidden"></div>
      <div className="flex relative flex-col items-center justify-center h-[60vh]">
        {/* No background here, content only */}
      </div>
      <div className="flex flex-col justify-center items-center h-[40vh] w-full relative">
        <Link
          href="/lobby"
          className="absolute bottom-32 z-50 px-14 py-4 mb-4 bg-slate-700 text-white font-bold text-xs uppercase shadow-md border-2 border-black transition-transform duration-300 hover:scale-105 font-free-pixel blink-animation"
        >
          jogar {" >"}
        </Link>
        <div className="w-full absolute h-20 bg-gradient-to-t from-black bottom-0 md:hidden"></div>
      </div>
    </div>
  );
}
