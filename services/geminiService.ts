
import { GoogleGenAI } from "@google/genai";
import { UserInput, TradeAnalysis, BacktestResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash"; // Supports multimodal input & tools

export const analyzeMarket = async (input: UserInput): Promise<TradeAnalysis> => {
  let riskInstructions = "";
  if (input.riskLevel === 'Conservative') {
    riskInstructions = "RISK PROFILE: CONSERVATIVE. Prioritize capital preservation. Tight stops. High confluence required.";
  } else if (input.riskLevel === 'Aggressive') {
    riskInstructions = "RISK PROFILE: AGGRESSIVE. Maximize returns. Wider stops allowed. Target high R:R.";
  } else {
    riskInstructions = "RISK PROFILE: MODERATE. Balance risk/reward. Standard technical stops.";
  }

  let moneyContext = "";
  if (input.accountBalance && input.riskPercentage) {
    const riskAmount = (input.accountBalance * input.riskPercentage) / 100;
    moneyContext = `User Risk: $${riskAmount.toFixed(2)} (${input.riskPercentage}%). Ensure Stop Loss fits this risk.`;
  }

  let promptText = `
    Act as a High-Frequency Algorithmic Strategist.
    Analyze the following market scenario RAPIDLY.
    
    Symbol: ${input.symbol}
    Timeframe: ${input.timeframe}
    ${riskInstructions}
    ${moneyContext}
  `;

  if (input.marketContext) {
    promptText += `\nContext: "${input.marketContext}"`;
  }

  promptText += `
    PERFORM A DEEP SPECTRUM ANALYSIS.
    Scan against these categories:
    1. SMART_MONEY (ICT, FVG, Order Blocks)
    2. INDICATORS (RSI, MACD, EMA)
    3. PRICE_ACTION (Patterns, Candles)
    4. VOLUME_L2 (VSA, Profile)
    5. MATH_FIB (Fibonacci, Harmonics)
    6. ALGO_QUANT (VWAP, StdDev)

    CRITICAL INSTRUCTION FOR SPEED:
    - Return ONLY the TOP 1-2 most significant validations per category.
    - Keep "reasoning" extremely CONCISE (max 10-15 words).
    - If >70% confluence, High Confidence.

    FUNDAMENTAL CHECK:
    Use Google Search to find REAL-TIME news (last 24h).
    - If no major news, state "Technical driven".
    - Keep summary brief.

    EDUCATIONAL GLOSSARY:
    Select 2 critical terms. Define briefly.
    
    OUTPUT JSON FORMAT (Strict):
    {
      "symbol": "${input.symbol}",
      "action": "BUY" | "SELL" | "WAIT",
      "confidenceScore": number (0-100),
      "entryZone": "string",
      "stopLoss": "string",
      "takeProfit": "string",
      "strategyUsed": "string",
      "riskRewardRatio": "string",
      "analysisSummary": "string (Max 2 sentences)",
      "keyTechnicalFactors": ["string", "string", "string"],
      "strategyValidations": [
        {
          "name": "string",
          "status": "VALID" | "INVALID" | "INCONCLUSIVE",
          "reasoning": "string (Concise)",
          "category": "SMART_MONEY" | "INDICATORS" | "PRICE_ACTION" | "VOLUME_L2" | "MATH_FIB" | "ALGO_QUANT"
        }
      ],
      "newsAnalysis": {
        "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
        "impact": "HIGH" | "MEDIUM" | "LOW",
        "summary": "string",
        "keyEvents": ["string"]
      },
      "educationalContext": [
        {
          "term": "string",
          "definition": "string",
          "relevance": "string"
        }
      ],
      "strategyDetail": {
        "name": "string",
        "principles": ["string", "string"],
        "application": "string"
      }
    }
  `;

  const parts: any[] = [];

  // Handle Image Input
  if (input.image) {
    const [meta, data] = input.image.split(',');
    const mimeType = meta.split(':')[1].split(';')[0];
    
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: data
      }
    });
  }

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a high-speed trading engine. Output strictly valid JSON. Be extremely concise to maximize speed. Prioritize accuracy but do not be verbose.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    let analysisData: TradeAnalysis;

    try {
      analysisData = JSON.parse(cleanText) as TradeAnalysis;
    } catch (e) {
      console.error("JSON Parse Error:", text);
      throw new Error("Failed to parse AI response. The model output was not valid JSON.");
    }

    // Extract Grounding Metadata (Source URLs)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const newsSources: { title: string; uri: string }[] = [];

    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          newsSources.push({
            title: chunk.web.title || "News Source",
            uri: chunk.web.uri
          });
        }
      });
    }

    if (newsSources.length > 0) {
      const uniqueSources = Array.from(new Map(newsSources.map(item => [item.uri, item])).values());
      analysisData.newsSources = uniqueSources.slice(0, 3); // Limit to top 3 for speed/cleanliness
    }

    return analysisData;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const performBacktest = async (input: UserInput): Promise<BacktestResult> => {
  const promptText = `
    Act as a Quantitative Researcher.
    Perform a RAPID HISTORICAL BACKTEST SIMULATION.
    
    Symbol: ${input.symbol}
    Timeframe: ${input.timeframe}
    Strategy: ${input.strategyToTest || "Price Action"}
    Duration: ${input.backtestDuration || "Last 6 Months"}

    Task:
    1. Simulate strategy performance based on typical ${input.symbol} behavior.
    2. Estimate: Win Rate, Profit Factor, Max Drawdown.
    3. Generate "recentTrades": A log of the last 5 significant simulated trades.
    
    OUTPUT JSON FORMAT (Strict):
    {
      "symbol": "${input.symbol}",
      "strategyName": "${input.strategyToTest}",
      "timeframe": "${input.timeframe}",
      "periodAnalyzed": "string",
      "totalTrades": number,
      "winRate": number,
      "profitFactor": number,
      "maxDrawdown": number,
      "netProfit": "string",
      "performanceSummary": "string (Concise)",
      "bestTrade": {
        "description": "string (Short)",
        "entryPrice": "string",
        "exitPrice": "string",
        "rMultiple": "string"
      },
      "worstTrade": {
        "description": "string (Short)",
        "entryPrice": "string",
        "exitPrice": "string",
        "rMultiple": "string"
      },
      "monthlyReturn": [number, number, number, number, number, number],
      "recentTrades": [
        {
          "id": "string",
          "date": "string (YYYY-MM-DD)",
          "type": "LONG" | "SHORT",
          "entryPrice": "string",
          "exitPrice": "string",
          "result": "WIN" | "LOSS",
          "pnl": "string"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: promptText }] },
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a Quantitative Backtesting Engine. Provide realistic simulations. Be concise and fast.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanText) as BacktestResult;

  } catch (error) {
    console.error("Backtest Error:", error);
    throw error;
  }
};
