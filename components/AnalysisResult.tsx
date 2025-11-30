
import React, { useState } from 'react';
import { TradeAnalysis, TradeAction, StrategyValidation, StrategyCategory } from '../types';
import { SignalMeter } from './SignalMeter';
import { RiskVisualizer } from './RiskVisualizer';
import { 
  ShieldCheck, Target, TrendingUp, TrendingDown, BrainCircuit, CheckCircle2, XCircle, HelpCircle, 
  Layers, Fingerprint, Activity, BarChart2, Hash, Newspaper, Globe, ExternalLink, Cpu, Zap, 
  ArrowUpCircle, ArrowDownCircle, MinusCircle, BookOpen, Lightbulb, ChevronDown, ChevronUp, Info 
} from 'lucide-react';

interface AnalysisResultProps {
  data: TradeAnalysis;
}

const CATEGORY_INFO: Record<StrategyCategory, { title: string; desc: string }> = {
  SMART_MONEY: {
    title: "Smart Money & ICT",
    desc: "Analyzes institutional footprints like Order Blocks and Fair Value Gaps to align with bank-level trading activity."
  },
  INDICATORS: {
    title: "Technical Indicators",
    desc: "Uses mathematical calculations (RSI, MACD) to gauge momentum, trend strength, and potential reversals."
  },
  PRICE_ACTION: {
    title: "Price Action Patterns",
    desc: "Focuses on raw price movement, candlestick formations, and classic chart patterns to identify market sentiment."
  },
  VOLUME_L2: {
    title: "Volume & Market Depth",
    desc: "Examines trading volume and order flow to confirm the strength of a move or spot hidden accumulation/distribution."
  },
  MATH_FIB: {
    title: "Geometry & Fibonacci",
    desc: "Applies mathematical ratios and geometric patterns to predict natural support and resistance levels."
  },
  ALGO_QUANT: {
    title: "Algorithmic & Quant",
    desc: "Utilizes statistical models (Standard Deviation, VWAP) commonly used by automated trading systems."
  }
};

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ data }) => {
  const [showDefinitions, setShowDefinitions] = useState(false);
  const isWait = data.action === TradeAction.WAIT;

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'VALID': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'INVALID': return <XCircle className="w-4 h-4 text-rose-400" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getValidationColor = (status: string) => {
    switch (status) {
      case 'VALID': return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-100';
      case 'INVALID': return 'border-rose-500/30 bg-rose-500/5 text-rose-100';
      default: return 'border-slate-800 bg-slate-900/50 text-slate-400';
    }
  };

  const getCategoryIcon = (cat: StrategyCategory) => {
    switch (cat) {
      case 'SMART_MONEY': return <BrainCircuit className="w-4 h-4 text-purple-400" />;
      case 'INDICATORS': return <Activity className="w-4 h-4 text-blue-400" />;
      case 'PRICE_ACTION': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'VOLUME_L2': return <BarChart2 className="w-4 h-4 text-amber-400" />;
      case 'MATH_FIB': return <Hash className="w-4 h-4 text-pink-400" />;
      case 'ALGO_QUANT': return <Cpu className="w-4 h-4 text-cyan-400" />;
      default: return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryLabel = (cat: StrategyCategory) => {
    switch (cat) {
      case 'SMART_MONEY': return 'Smart Money & ICT';
      case 'INDICATORS': return 'Technical Indicators';
      case 'PRICE_ACTION': return 'Patterns & Structure';
      case 'VOLUME_L2': return 'Volume & Depth';
      case 'MATH_FIB': return 'Fibonacci & Math';
      case 'ALGO_QUANT': return 'Algo & Quant Models';
      default: return 'Other Factors';
    }
  };

  // Group validations by category
  const groupedValidations: Record<string, StrategyValidation[]> = {};
  data.strategyValidations?.forEach(val => {
    const cat = val.category || 'OTHER';
    if (!groupedValidations[cat]) groupedValidations[cat] = [];
    groupedValidations[cat].push(val);
  });

  const categoriesOrder: StrategyCategory[] = ['SMART_MONEY', 'PRICE_ACTION', 'ALGO_QUANT', 'INDICATORS', 'VOLUME_L2', 'MATH_FIB'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Signal Card */}
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800/20 rounded-bl-full -mr-8 -mt-8" />
          <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider flex items-center gap-2">
            <Fingerprint className="w-4 h-4" />
            AI Confidence Model
          </h3>
          <SignalMeter action={data.action} confidence={data.confidenceScore} />
        </div>

        {/* Trade Setup Card */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
           {/* Background Decoration */}
           <div className={`absolute inset-0 opacity-5 ${data.action === TradeAction.BUY ? 'bg-emerald-500' : data.action === TradeAction.SELL ? 'bg-rose-500' : 'bg-amber-500'}`} />
           
           <div>
             <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <div className="flex-1">
                  <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Primary Strategy</h3>
                  <p className="text-xl font-semibold text-white mt-1 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-400" />
                    {data.strategyUsed}
                  </p>
                </div>
                
                {/* Integrated News Sentiment Badge (Small) */}
                {data.newsAnalysis && (
                  <div className="flex-1 border-l border-slate-800 md:pl-6">
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Sentiment Bias</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={`text-lg font-bold ${
                         data.newsAnalysis.sentiment === 'BULLISH' ? 'text-emerald-400' : 
                         data.newsAnalysis.sentiment === 'BEARISH' ? 'text-rose-400' : 'text-slate-300'
                       }`}>
                         {data.newsAnalysis.sentiment}
                       </span>
                    </div>
                  </div>
                )}

                <div className="text-right border-l border-slate-800 pl-6 hidden md:block">
                   <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">R:R Ratio</h3>
                   <p className="text-xl font-mono text-emerald-400">{data.riskRewardRatio}</p>
                </div>
             </div>

             {/* Order Levels */}
             {!isWait && (
               <div className="grid grid-cols-3 gap-4">
                 <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <TrendingUp className="w-3 h-3" /> Entry
                    </div>
                    <div className="text-lg font-mono text-white">{data.entryZone}</div>
                 </div>
                 <div className="bg-slate-950/50 rounded-xl p-3 border border-rose-900/30">
                    <div className="flex items-center gap-2 text-rose-400 text-xs mb-1">
                      <ShieldCheck className="w-3 h-3" /> Stop
                    </div>
                    <div className="text-lg font-mono text-rose-400">{data.stopLoss}</div>
                 </div>
                 <div className="bg-slate-950/50 rounded-xl p-3 border border-emerald-900/30">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
                      <Target className="w-3 h-3" /> Target
                    </div>
                    <div className="text-lg font-mono text-emerald-400">{data.takeProfit}</div>
                 </div>
               </div>
             )}
             {isWait && (
               <div className="bg-amber-900/20 border border-amber-900/50 rounded-xl p-4 text-amber-200 flex items-center justify-center font-medium">
                 Conditions unfavorable. Patience recommended.
               </div>
             )}
           </div>

           {/* Risk Chart */}
           {!isWait && (
             <RiskVisualizer 
               entry={data.entryZone} 
               stopLoss={data.stopLoss} 
               takeProfit={data.takeProfit} 
               action={data.action} 
             />
           )}
        </div>
      </div>

      {/* Concise Sentiment & Impact Overview */}
      {data.newsAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between relative overflow-hidden">
             <div className={`absolute inset-0 opacity-5 ${
               data.newsAnalysis.sentiment === 'BULLISH' ? 'bg-emerald-500' :
               data.newsAnalysis.sentiment === 'BEARISH' ? 'bg-rose-500' : 'bg-slate-500'
             }`} />
             <div>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">News Sentiment</p>
               <div className="flex items-center gap-2">
                 <span className={`text-2xl font-black ${
                   data.newsAnalysis.sentiment === 'BULLISH' ? 'text-emerald-400' :
                   data.newsAnalysis.sentiment === 'BEARISH' ? 'text-rose-400' : 'text-slate-300'
                 }`}>
                   {data.newsAnalysis.sentiment}
                 </span>
               </div>
             </div>
             <div className={`p-3 rounded-xl border ${
               data.newsAnalysis.sentiment === 'BULLISH' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
               data.newsAnalysis.sentiment === 'BEARISH' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
               'bg-slate-800 border-slate-700 text-slate-400'
             }`}>
               {data.newsAnalysis.sentiment === 'BULLISH' ? <TrendingUp className="w-6 h-6" /> :
                data.newsAnalysis.sentiment === 'BEARISH' ? <TrendingDown className="w-6 h-6" /> :
                <MinusCircle className="w-6 h-6" />}
             </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between relative overflow-hidden">
             <div className={`absolute inset-0 opacity-5 ${
               data.newsAnalysis.impact === 'HIGH' ? 'bg-amber-500' :
               data.newsAnalysis.impact === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-500'
             }`} />
             <div>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Market Impact</p>
               <div className="flex items-center gap-2">
                 <span className={`text-2xl font-black ${
                   data.newsAnalysis.impact === 'HIGH' ? 'text-amber-400' :
                   data.newsAnalysis.impact === 'MEDIUM' ? 'text-blue-400' : 'text-slate-300'
                 }`}>
                   {data.newsAnalysis.impact}
                 </span>
               </div>
             </div>
             <div className={`p-3 rounded-xl border ${
               data.newsAnalysis.impact === 'HIGH' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
               data.newsAnalysis.impact === 'MEDIUM' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
               'bg-slate-800 border-slate-700 text-slate-400'
             }`}>
               <Zap className="w-6 h-6" />
             </div>
          </div>
        </div>
      )}

      {/* Fundamental & News Section */}
      {data.newsAnalysis && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Background Highlight based on impact/sentiment */}
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br rounded-bl-full -mr-16 -mt-16 opacity-5 pointer-events-none
            ${data.newsAnalysis.sentiment === 'BULLISH' ? 'from-emerald-500 to-transparent' : 
              data.newsAnalysis.sentiment === 'BEARISH' ? 'from-rose-500 to-transparent' : 
              'from-blue-500 to-transparent'}`} 
          />

          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20 animate-pulse">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Fundamental & News Radar</h3>
            </div>
            
            <div className="flex items-center gap-2 md:ml-auto">
              <span className="text-xs text-slate-500 uppercase">Live Analysis</span>
              {data.newsAnalysis.impact === 'HIGH' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500 text-amber-400 flex items-center gap-1.5 animate-pulse">
                  <Zap className="w-3 h-3 fill-current" />
                  HIGH VOLATILITY EXPECTED
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="prose prose-invert prose-slate max-w-none text-slate-300 text-sm leading-relaxed">
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Executive Briefing</h4>
              <p>{data.newsAnalysis.summary}</p>
            </div>

            {/* Key Events */}
            {data.newsAnalysis.keyEvents && data.newsAnalysis.keyEvents.length > 0 && (
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Newspaper className="w-3 h-3" /> Key Drivers Detected
                </h4>
                <ul className="space-y-2">
                  {data.newsAnalysis.keyEvents.map((event, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {event}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sources List */}
          {data.newsSources && data.newsSources.length > 0 && (
            <div className="border-t border-slate-800/50 pt-3 mt-4">
              <span className="text-xs font-medium text-slate-500 uppercase mb-2 block flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Verified Live Sources
              </span>
              <div className="flex flex-wrap gap-2">
                {data.newsSources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-blue-400 hover:text-blue-300 hover:border-blue-500/30 transition-all truncate max-w-[200px]"
                  >
                    <span className="truncate">{source.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deep Spectrum Analysis Matrix */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 pl-1">
          <Layers className="w-5 h-5 text-indigo-400" />
          Deep Spectrum Confluence Matrix
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categoriesOrder.map((cat) => {
            const validations = groupedValidations[cat] || [];
            if (validations.length === 0) return null;

            return (
              <div key={cat} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
                <div className="bg-slate-950/50 px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                  {getCategoryIcon(cat)}
                  <span className="font-semibold text-slate-200 text-sm tracking-wide">
                    {getCategoryLabel(cat)}
                  </span>
                </div>
                <div className="p-2 space-y-2 flex-grow">
                  {validations.map((val, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg border text-sm transition-all ${getValidationColor(val.status)}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{val.name}</span>
                        <div className="shrink-0">{getValidationIcon(val.status)}</div>
                      </div>
                      <p className="text-xs opacity-80 leading-snug">{val.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Collapsible Strategy Definitions */}
        <div className="pt-2">
          <button
            onClick={() => setShowDefinitions(!showDefinitions)}
            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-400 transition-colors mx-auto px-4 py-2 rounded-full border border-transparent hover:border-slate-800 hover:bg-slate-900/50"
          >
            {showDefinitions ? (
              <>
                <ChevronUp className="w-4 h-4" /> Hide Strategy Definitions
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> Understand these Strategy Categories
              </>
            )}
          </button>

          {showDefinitions && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 animate-in slide-in-from-top-2 fade-in duration-300">
              {(Object.keys(CATEGORY_INFO) as StrategyCategory[]).map((cat) => (
                <div key={cat} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 flex gap-3">
                  <div className="mt-1 shrink-0">
                    {getCategoryIcon(cat)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 mb-1">{CATEGORY_INFO[cat].title}</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">{CATEGORY_INFO[cat].desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Educational Context Section */}
      {data.educationalContext && data.educationalContext.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Strategy Logic & Education
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.educationalContext.map((item, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/30 transition-all">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-indigo-500/10 p-1.5 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">{item.term}</h4>
                    <p className="text-xs text-slate-400 mb-2 italic">"{item.definition}"</p>
                    <p className="text-sm text-slate-300 leading-snug">
                      <span className="text-emerald-400 font-medium">Why it matters: </span>
                      {item.relevance}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Text */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
           <h3 className="text-xl font-bold text-white mb-4">Executive Summary</h3>
           <div className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed font-light text-base">
             <p>{data.analysisSummary}</p>
           </div>
        </div>

        <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-indigo-400" />
            Core Drivers
          </h3>
          <ul className="space-y-4">
            {data.keyTechnicalFactors.map((factor, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="leading-snug">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
