// src/app/page.tsx
import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
     <div className='w-full absolute h-20 bg-gradient-to-b from-black top-0 z-50 md:hidden'></div>
      <div className="flex relative flex-col items-center justify-center h-[60vh] bg-slate-950 bg-[url('/images/logocode.png')] bg-center bg-contain bg-no-repeat"></div>
      <div className="flex flex-col justify-center items-center h-[40vh] w-full bg-slate-950">
        <Link
          href="/lobby"
          className="px-14 py-4 mb-4 bg-slate-700 text-white font-bold text-xs uppercase shadow-md border-2 border-black transition-transform duration-300 hover:scale-105 font-free-pixel blink-animation"
        >
          jogar {" >"}
        </Link>
        <div className='w-full absolute h-20 bg-gradient-to-t from-black bottom-0 md:hidden'></div>
      </div>
    </>
  );
}
