
import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { Background3D } from './Background3D';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 relative">
      <Background3D />
      
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                TradeMind AI
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                System Active
              </span>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      <footer className="border-t border-slate-900 py-8 mt-12 text-center text-slate-500 text-sm relative z-10 bg-slate-950/50 backdrop-blur-sm">
        <p>Disclaimer: This is an AI simulation for educational purposes only. Not financial advice.</p>
      </footer>
    </div>
  );
};
