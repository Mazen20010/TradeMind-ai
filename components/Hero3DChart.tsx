
import React, { useMemo } from 'react';

export const Hero3DChart: React.FC = () => {
  // Generate a grid of 3D bars
  // 4x4 Grid = 16 positions
  const bars = useMemo(() => {
    return [
      { x: 0, z: 0, h: 40, c: 'g', d: 0.1 },
      { x: 1, z: 0, h: 60, c: 'g', d: 0.2 },
      { x: 2, z: 0, h: 30, c: 'r', d: 0.3 },
      { x: 3, z: 0, h: 80, c: 'g', d: 0.4 },
      
      { x: 0, z: 1, h: 50, c: 'r', d: 0.5 },
      { x: 1, z: 1, h: 90, c: 'g', d: 0.6 },
      { x: 2, z: 1, h: 40, c: 'r', d: 0.7 },
      { x: 3, z: 1, h: 70, c: 'g', d: 0.8 },

      { x: 0, z: 2, h: 30, c: 'r', d: 0.9 },
      { x: 1, z: 2, h: 100, c: 'g', d: 1.0 },
      { x: 2, z: 2, h: 20, c: 'r', d: 1.1 },
      { x: 3, z: 2, h: 60, c: 'g', d: 1.2 },

      { x: 0, z: 3, h: 80, c: 'g', d: 1.3 },
      { x: 1, z: 3, h: 50, c: 'r', d: 1.4 },
      { x: 2, z: 3, h: 110, c: 'g', d: 1.5 },
      { x: 3, z: 3, h: 40, c: 'r', d: 1.6 },
    ];
  }, []);

  return (
    <div className="w-full flex justify-center h-[320px] overflow-visible perspective-[1200px] select-none pointer-events-none mb-8">
      <style>{`
        @keyframes rotate-iso {
          0% { transform: rotateX(60deg) rotateZ(0deg) translateZ(-50px); }
          100% { transform: rotateX(60deg) rotateZ(360deg) translateZ(-50px); }
        }
        @keyframes grow-bar {
          0% { transform: scaleY(0); opacity: 0; }
          100% { transform: scaleY(1); opacity: 0.9; }
        }
      `}</style>

      {/* Rotating Platform */}
      <div 
        className="relative w-64 h-64 [transform-style:preserve-3d] mt-12"
        style={{ animation: 'rotate-iso 25s linear infinite' }}
      >
        {/* Base Grid */}
        <div className="absolute inset-0 bg-slate-900/80 border-2 border-slate-700/50 grid grid-cols-4 grid-rows-4 shadow-[0_0_100px_rgba(16,185,129,0.1)]">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="border border-slate-700/30" />
          ))}
        </div>

        {/* 3D Bars */}
        {bars.map((bar, i) => {
          const isGreen = bar.c === 'g';
          // Calculate face colors
          const colorFront = isGreen ? 'bg-emerald-500' : 'bg-rose-500';
          const colorSide = isGreen ? 'bg-emerald-600' : 'bg-rose-600';
          const colorTop = isGreen ? 'bg-emerald-400' : 'bg-rose-400';
          
          const barWidth = 32; // px (approx 25% of 64px grid cell minus padding)
          const offset = 16; // half width for centering transforms

          return (
            <div
              key={i}
              className="absolute [transform-style:preserve-3d]"
              style={{
                left: `${bar.x * 25}%`,
                top: `${bar.z * 25}%`,
                width: '25%',
                height: '25%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* The 3D Column Wrapper */}
              <div 
                className="relative w-8 h-8 [transform-style:preserve-3d]"
              >
                 {/* The Scalable Bar Content */}
                 {/* Pivot must be bottom for scaleY to work upwards */}
                 <div 
                   className="absolute bottom-0 w-full [transform-style:preserve-3d]"
                   style={{ 
                     height: `${bar.h}px`,
                     transformOrigin: 'bottom center',
                     animation: `grow-bar 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${bar.d}s forwards`,
                     opacity: 0
                   }}
                 >
                    {/* Front Face */}
                    <div className={`absolute bottom-0 w-8 ${colorFront} opacity-90`} 
                         style={{ height: '100%', transform: `translateZ(${offset}px)` }} />
                    
                    {/* Back Face */}
                    <div className={`absolute bottom-0 w-8 ${colorFront} opacity-90`} 
                         style={{ height: '100%', transform: `translateZ(-${offset}px) rotateY(180deg)` }} />
                    
                    {/* Right Face */}
                    <div className={`absolute bottom-0 w-8 ${colorSide} opacity-90`} 
                         style={{ height: '100%', transform: `translateX(${offset}px) rotateY(90deg)` }} />
                    
                    {/* Left Face */}
                    <div className={`absolute bottom-0 w-8 ${colorSide} opacity-90`} 
                         style={{ height: '100%', transform: `translateX(-${offset}px) rotateY(-90deg)` }} />
                    
                    {/* Top Face (Lid) */}
                    <div className={`absolute w-8 h-8 ${colorTop} shadow-[0_0_15px_rgba(255,255,255,0.4)]`} 
                         style={{ bottom: '100%', transform: `rotateX(90deg) translateZ(${offset}px) translateY(${offset}px)` }} />
                 </div>
                 
                 {/* Shadow on Grid */}
                 <div className="absolute inset-0 bg-black/50 blur-md transform translate-z-[-2px]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
