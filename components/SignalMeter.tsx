import React from 'react';
import { TradeAction } from '../types';

interface SignalMeterProps {
  action: TradeAction;
  confidence: number;
}

export const SignalMeter: React.FC<SignalMeterProps> = ({ action, confidence }) => {
  let colorClass = "text-slate-400";
  let bgClass = "bg-slate-500";
  
  if (action === TradeAction.BUY) {
    colorClass = "text-emerald-400";
    bgClass = "bg-emerald-500";
  } else if (action === TradeAction.SELL) {
    colorClass = "text-rose-400";
    bgClass = "bg-rose-500";
  } else {
    colorClass = "text-amber-400";
    bgClass = "bg-amber-500";
  }

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Outer Ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-800"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={552}
            strokeDashoffset={552 - (552 * confidence) / 100}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Inner Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black tracking-tighter text-white">
            {action}
          </span>
          <span className={`text-sm font-medium ${colorClass} uppercase tracking-wider mt-1`}>
            {confidence}% Confidence
          </span>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className={`h-2 w-2 rounded-full ${bgClass} animate-pulse`} />
        <span className="text-xs text-slate-400 font-mono">AI MODEL CONFIRMED</span>
      </div>
    </div>
  );
};
