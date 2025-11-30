
export enum TradeAction {
  BUY = 'BUY',
  SELL = 'SELL',
  WAIT = 'WAIT'
}

export type StrategyCategory = 'SMART_MONEY' | 'INDICATORS' | 'PRICE_ACTION' | 'VOLUME_L2' | 'MATH_FIB' | 'ALGO_QUANT';

export interface StrategyValidation {
  name: string; // e.g., "SMC/ICT", "Wyckoff", "Elliott Wave", "Harmonics", "VSA", etc.
  status: 'VALID' | 'INVALID' | 'INCONCLUSIVE';
  reasoning: string;
  category: StrategyCategory;
}

export interface NewsAnalysis {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string; // A brief summary of the news
  keyEvents?: string[]; // Specific headlines or events driving the sentiment
}

export interface EducationalContent {
  term: string;
  definition: string;
  relevance: string; // Why it matters in this specific trade
}

export interface TradeAnalysis {
  symbol: string;
  action: TradeAction;
  confidenceScore: number; // 0-100
  entryZone: string;
  stopLoss: string;
  takeProfit: string;
  strategyUsed: string;
  riskRewardRatio: string;
  analysisSummary: string;
  keyTechnicalFactors: string[];
  strategyValidations: StrategyValidation[];
  newsAnalysis?: NewsAnalysis;
  newsSources?: { title: string; uri: string }[];
  educationalContext?: EducationalContent[];
}

export interface TradeDetail {
  description: string;
  entryPrice: string;
  exitPrice: string;
  rMultiple: string; // e.g., "4.5R" or "-1.0R"
}

export interface TradeLogEntry {
  id: string;
  date: string;
  type: 'LONG' | 'SHORT';
  entryPrice: string;
  exitPrice: string;
  result: 'WIN' | 'LOSS';
  pnl: string; // e.g. +4.5% or -1.2%
}

export interface BacktestResult {
  symbol: string;
  strategyName: string;
  timeframe: string;
  periodAnalyzed: string;
  totalTrades: number;
  winRate: number; // percentage 0-100
  profitFactor: number; // e.g., 1.5, 2.0
  maxDrawdown: number; // percentage
  netProfit: string; // e.g. "+15%" or "+12R"
  performanceSummary: string;
  bestTrade: TradeDetail;
  worstTrade: TradeDetail;
  monthlyReturn?: number[]; // optional array for chart
  recentTrades?: TradeLogEntry[]; // List of simulated trades
}

export interface UserInput {
  mode: 'LIVE' | 'BACKTEST';
  symbol: string;
  timeframe: string;
  marketContext: string; // User describes the chart/price action
  image?: string; // Base64 data string of the uploaded chart
  riskLevel: string;
  accountBalance?: number;
  riskPercentage?: number;
  // Backtest specific
  strategyToTest?: string;
  backtestDuration?: string; // e.g., "Last 6 Months"
}

// Alerts & Market Watch
export type AlertCondition = 'PRICE_ABOVE' | 'PRICE_BELOW' | 'RSI_OVERBOUGHT' | 'RSI_OVERSOLD';

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: AlertCondition;
  targetValue: number;
  isActive: boolean;
  isTriggered: boolean;
  createdAt: number;
}
