
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { InputForm } from './components/InputForm';
import { AnalysisResult } from './components/AnalysisResult';
import { BacktestResultDisplay } from './components/BacktestResult';
import { ComparativeSummary } from './components/ComparativeSummary';
import { Pricing } from './components/Pricing';
import { AlertsPanel } from './components/AlertsPanel';
import { PaymentModal } from './components/PaymentModal';
import { Hero3DChart } from './components/Hero3DChart';
import { analyzeMarket, performBacktest } from './services/geminiService';
import { UserInput, TradeAnalysis, BacktestResult } from './types';
import { AlertCircle, WifiOff, ServerCrash, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(false);
  // Store arrays to support multiple comparisons
  const [analyses, setAnalyses] = useState<TradeAnalysis[] | null>(null);
  const [backtests, setBacktests] = useState<BacktestResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string} | null>(null);

  const handleAnalyze = async (input: UserInput) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setAnalyses(null);
    setBacktests(null);
    
    try {
      // Split symbols by comma and trim whitespace
      const symbols = input.symbol.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);

      if (input.mode === 'BACKTEST') {
        // Execute backtests in parallel
        const results = await Promise.all(
          symbols.map(s => performBacktest({ ...input, symbol: s }))
        );
        setBacktests(results);
      } else {
        // Execute live analysis in parallel
        const results = await Promise.all(
          symbols.map(s => analyzeMarket({ ...input, symbol: s }))
        );
        setAnalyses(results);
      }
    } catch (err: any) {
      console.error("App Error Handler:", err);
      let errorMessage = "Failed to process request. Please try again.";
      
      const errString = err?.toString() || "";
      const msg = err?.message || "";

      // Determine specific error type
      if (errString.includes("429") || msg.includes("429")) {
        errorMessage = "High traffic detected. Please wait a moment before trying again (Rate Limit).";
      } else if (errString.includes("503") || errString.includes("500") || msg.includes("Overloaded")) {
        errorMessage = "The AI service is currently unavailable/overloaded. Please try again in a few seconds.";
      } else if (errString.includes("safety") || errString.includes("blocked") || msg.includes("safety")) {
        errorMessage = "The analysis was blocked by safety filters. Please ensure your inputs are appropriate.";
      } else if (errString.includes("JSON") || msg.includes("parse")) {
        errorMessage = "Received an invalid format from the AI. Please retry.";
      } else if (errString.includes("fetch") || msg.includes("network")) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (name: string, price: string) => {
    setSelectedPlan({ name, price });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setSuccessMsg(`Welcome to TradeMind ${selectedPlan?.name}! Your subscription is active.`);
    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Intro with 3D Chart */}
        {!analyses && !backtests && !loading && (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-1000">
               <Hero3DChart />
            </div>
            <div className="text-center space-y-4 mb-12 animate-in fade-in duration-1000 delay-300 relative z-10 -mt-8">
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-2xl">
                Trade Smarter with <span className="text-emerald-500">AI</span>
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto drop-shadow-md bg-slate-950/30 backdrop-blur-sm p-2 rounded-xl">
                Get institutional-grade market analysis, precise stop-loss levels, and strategy backtesting powered by Gemini.
              </p>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className={`transition-all duration-500 ease-in-out ${analyses || backtests ? 'opacity-100' : 'translate-y-0'}`}>
          <InputForm onAnalyze={handleAnalyze} isLoading={loading} />
        </div>

        {/* Alerts & Watchlist Section (Always visible below input for easy access) */}
        <div className="grid grid-cols-1 gap-6">
           <AlertsPanel />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 rounded-xl p-4 flex items-center gap-3 text-rose-200 animate-in fade-in slide-in-from-top-2">
            <div className="bg-rose-500/20 p-2 rounded-full shrink-0">
               {error.includes("Network") ? <WifiOff className="w-5 h-5" /> : 
                error.includes("safety") ? <ShieldAlert className="w-5 h-5" /> :
                error.includes("service") ? <ServerCrash className="w-5 h-5" /> :
                <AlertCircle className="w-5 h-5" />
               }
            </div>
            <div>
              <p className="font-medium text-rose-100">Operation Failed</p>
              <p className="text-sm text-rose-300/90">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-4 flex items-center gap-3 text-emerald-200 animate-in fade-in slide-in-from-top-2 sticky top-20 z-40 shadow-lg shadow-emerald-900/20 backdrop-blur-md">
            <div className="bg-emerald-500/20 p-2 rounded-full shrink-0">
               <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-emerald-100">Success</p>
              <p className="text-sm text-emerald-300/90">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Live Analysis Results */}
        {analyses && (
          <div className="mt-8 border-t border-slate-800/50 pt-8">
            {/* Show comparative summary if multiple symbols */}
            {analyses.length > 1 && (
              <ComparativeSummary analyses={analyses} />
            )}
            
            {/* Render individual reports */}
            <div className="space-y-12">
              {analyses.map((analysis, index) => (
                 <div key={index} id={`analysis-${analysis.symbol}`}>
                    {analyses.length > 1 && (
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-px bg-slate-800 flex-1"></div>
                        <span className="text-slate-500 font-mono text-sm uppercase tracking-widest">{analysis.symbol} Report</span>
                        <div className="h-px bg-slate-800 flex-1"></div>
                      </div>
                    )}
                    <AnalysisResult data={analysis} />
                 </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Backtest Results */}
        {backtests && (
          <div className="mt-8 border-t border-slate-800/50 pt-8 space-y-12">
            {backtests.map((backtest, index) => (
              <div key={index}>
                {backtests.length > 1 && (
                   <div className="flex items-center gap-4 mb-4">
                      <div className="h-px bg-slate-800 flex-1"></div>
                      <span className="text-slate-500 font-mono text-sm uppercase tracking-widest">{backtest.symbol} Backtest</span>
                      <div className="h-px bg-slate-800 flex-1"></div>
                   </div>
                )}
                <BacktestResultDisplay data={backtest} />
              </div>
            ))}
          </div>
        )}

        {/* Pricing Section - Only show when not analyzing or after results */}
        {!loading && (
           <Pricing onPlanSelect={handlePlanSelect} />
        )}
      </div>

      {/* Global Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)}
        planName={selectedPlan?.name || ''}
        planPrice={selectedPlan?.price || ''}
        onSuccess={handlePaymentSuccess}
      />
    </Layout>
  );
}
