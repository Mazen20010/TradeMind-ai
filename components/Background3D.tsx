
import React, { useMemo } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export const Background3D: React.FC = () => {
  const elements = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // Horizontal position %
      delay: Math.random() * -40, // Random start time (negative for immediate fill)
      duration: Math.random() * 20 + 20, // Duration between 20-40s
      scale: Math.random() * 0.5 + 0.5, // Depth scale
      isUp: Math.random() > 0.5, // Direction
      opacity: Math.random() * 0.1 + 0.02, // Very subtle opacity
      rotX: Math.random() * 40 - 20,
      rotY: Math.random() * 40 - 20,
      rotZ: Math.random() * 20 - 10,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <style>{`
        @keyframes floatUp3D {
          0% {
            transform: translateY(110vh) translateZ(-100px) rotateX(0deg);
            opacity: 0;
          }
          10% { opacity: var(--arrow-opacity); }
          90% { opacity: var(--arrow-opacity); }
          100% {
            transform: translateY(-20vh) translateZ(200px) rotateX(20deg);
            opacity: 0;
          }
        }
        @keyframes floatDown3D {
          0% {
            transform: translateY(-20vh) translateZ(-100px) rotateX(0deg);
            opacity: 0;
          }
          10% { opacity: var(--arrow-opacity); }
          90% { opacity: var(--arrow-opacity); }
          100% {
            transform: translateY(110vh) translateZ(200px) rotateX(20deg);
            opacity: 0;
          }
        }
        .scene-3d {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
      `}</style>
      
      {/* Base Background Color */}
      <div className="absolute inset-0 bg-[#020617]" />
      
      {/* Radial Gradient for Spotlight Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(30,41,59,0.3)_0%,_#020617_80%)]" />

      {/* 3D Scene Container */}
      <div className="absolute inset-0 scene-3d">
        {elements.map((el) => (
          <div
            key={el.id}
            className="absolute top-0 will-change-transform"
            style={{
              left: `${el.x}%`,
              animationName: el.isUp ? 'floatUp3D' : 'floatDown3D',
              animationDuration: `${el.duration}s`,
              animationDelay: `${el.delay}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              '--arrow-opacity': el.opacity,
            } as React.CSSProperties}
          >
            <div 
               style={{
                 transform: `scale(${el.scale}) rotateX(${el.rotX}deg) rotateY(${el.rotY}deg) rotateZ(${el.rotZ}deg)`,
               }}
               className="relative"
            >
              {/* Shadow/Thickness Layer */}
              <div className={`absolute top-1 left-1 ${el.isUp ? 'text-emerald-900' : 'text-rose-900'} opacity-30 blur-[1px]`}>
                 {el.isUp ? <ArrowUp size={80} strokeWidth={4} /> : <ArrowDown size={80} strokeWidth={4} />}
              </div>
              
              {/* Main Arrow */}
              <div className={`${el.isUp ? 'text-emerald-500' : 'text-rose-500'} drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                 {el.isUp ? <ArrowUp size={80} strokeWidth={2} /> : <ArrowDown size={80} strokeWidth={2} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
