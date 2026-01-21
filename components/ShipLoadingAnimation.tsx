
import React from 'react';

export const ShipLoadingAnimation: React.FC = () => {
  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4 flex flex-col items-center gap-8 overflow-hidden relative">
      <div className="relative w-full h-32">
        {/* Animated Waves */}
        <div className="absolute bottom-0 inset-x-0 h-4 bg-blue-500/20 rounded-full animate-wave-slow"></div>
        <div className="absolute bottom-1 inset-x-0 h-4 bg-blue-400/30 rounded-full animate-wave-fast opacity-50"></div>
        
        {/* Container Ship */}
        <div className="absolute bottom-2 left-0 w-24 h-12 text-orange-500 animate-ship-move">
          <svg viewBox="0 0 100 40" fill="currentColor">
            {/* Ship Hull */}
            <path d="M5 30 L95 30 L85 40 L15 40 Z" />
            {/* Containers */}
            <rect x="20" y="15" width="10" height="15" />
            <rect x="32" y="10" width="10" height="20" />
            <rect x="44" y="5" width="10" height="25" />
            <rect x="56" y="15" width="10" height="15" />
            <rect x="68" y="20" width="10" height="10" />
            {/* Bridge */}
            <path d="M75 10 L85 10 L85 30 L75 30 Z" />
          </svg>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-500/10 blur-xl rounded-full"></div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-xl font-black text-white tracking-tight animate-pulse">Navigating Global Manifests...</p>
        <div className="flex items-center justify-center gap-2 mt-2">
            <span className="h-1 w-1 bg-orange-500 rounded-full animate-bounce [animation-delay:0s]"></span>
            <span className="h-1 w-1 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="h-1 w-1 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
        </div>
      </div>

      <style>{`
        @keyframes ship-move {
          0% { transform: translateX(-100%) translateY(0px); }
          50% { transform: translateX(200%) translateY(-2px); }
          100% { transform: translateX(500%) translateY(0px); }
        }
        @keyframes wave-slow {
          0%, 100% { transform: scaleX(1); opacity: 0.2; }
          50% { transform: scaleX(1.1); opacity: 0.4; }
        }
        @keyframes wave-fast {
          0%, 100% { transform: translateX(-5%); }
          50% { transform: translateX(5%); }
        }
        .animate-ship-move {
          animation: ship-move 6s linear infinite;
        }
        .animate-wave-slow {
          animation: wave-slow 4s ease-in-out infinite;
        }
        .animate-wave-fast {
          animation: wave-fast 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
