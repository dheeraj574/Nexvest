
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { InvestmentProfile, PortfolioAllocation, StockRecommendation, EquityBreakdown } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Real-world Historical Dataset for In-Context Training
const MARKET_HISTORY_DATASET = `
HISTORICAL PERFORMANCE DATASET (1990-2024):
- Equities (S&P 500 / Nifty 50): Avg 10-12% CAGR. High volatility (Std Dev 15%). 
  Notable Crashes: 2000 Dot-com (-45%), 2008 Financial Crisis (-50%), 2020 COVID (-30% initial).
- Debt (10-Yr Treasury / Long-term Bonds): Avg 5-7% CAGR. Low volatility (Std Dev 4%).
  Behavior: Inversely correlated to equities during crises (safe haven).
- Gold (Spot Price): Avg 8-9% CAGR. Medium volatility.
  Behavior: Acts as an inflation hedge and "Crisis Alpha" during extreme equity drawdowns.
- Inflation: Avg 3-6% globally over this period.
`;

export const generateAIExplanation = async (
  profile: InvestmentProfile,
  allocation: PortfolioAllocation,
  investorType: string,
  projectedCorpus: number,
  equityBreakdown?: EquityBreakdown
): Promise<string> => {
  
  let stocksContext = "";
  if (equityBreakdown) {
    const allAssets = [...equityBreakdown.etf, ...equityBreakdown.stocks];
    const assetDetails = allAssets.slice(0, 5).map(s => `${s.symbol} (${s.sector})`).join(', ');
    stocksContext = `Recommended Assets: ${assetDetails}`;
  }

  const prompt = `
    Act as a senior Quantitative Financial Analyst.
    
    GROUNDING DATASET:
    ${MARKET_HISTORY_DATASET}

    USER PROFILE:
    - Age: ${profile.age}
    - Goal: "${profile.financialGoal}"
    - Risk Profile: ${investorType}
    - Allocation: ${allocation.equity}% Equity, ${allocation.debt}% Debt, ${allocation.gold}% Gold.
    ${stocksContext}

    TASK:
    Analyze the user's plan by "training" your response on the GROUNDING DATASET provided.
    1. Evaluate how this specific ${allocation.equity}/${allocation.debt}/${allocation.gold} split would have survived the 2008 Financial Crisis.
    2. Provide a rationale based on historical sector trends for the recommended assets.

    STRICT OUTPUT FORMAT (4 bullet points):
    • **Strategy:** [Catchy name grounded in history]
    • **Historical Backtest:** [Briefly mention how this allocation mix traditionally handles major market drawdowns based on the dataset]
    • **Asset Spotlight:** [Rationale for 1-2 assets based on their sector's historical resilience or growth potential]
    • **Action:** [One precise next step]

    Use professional, authoritative language. Keep it under 110 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Using latest Gemini 3 Flash
      contents: prompt,
    });
    
    return response.text || "AI analysis unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI analysis is currently unavailable. Your plan follows historical best practices for asset diversification.";
  }
};

export const generateStockSuggestions = async (
  profile: InvestmentProfile,
  investorType: string
): Promise<{ 
  allocation: PortfolioAllocation,
  etf: Omit<StockRecommendation, 'amount'>[], 
  stocks: Omit<StockRecommendation, 'amount'>[] 
}> => {

  const prompt = `
    Act as a senior financial strategist. Use current real-world market data.
    
    1. Determine the optimal Asset Allocation (Equity %, Debt %, Gold %) for this user:
       - Profile: ${profile.age} years old, ${investorType} Risk Profile.
       - Goal: ${profile.financialGoal}.
       - Constraint: Equity + Debt + Gold must equal 100.
    
    2. Generate investment recommendations for a ${investorType} investor in currency '${profile.currency}'.
       - Provide TWO lists: 'etf' (3-4 items) and 'stocks' (4-5 items).
       - If currency is '₹', use NSE/BSE tickers. If '$', use US tickers.
       - The 'allocationPercent' in each list must sum up to 100.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      allocation: {
        type: Type.OBJECT,
        properties: {
            equity: { type: Type.NUMBER },
            debt: { type: Type.NUMBER },
            gold: { type: Type.NUMBER }
        },
        required: ["equity", "debt", "gold"]
      },
      etf: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING },
            name: { type: Type.STRING },
            sector: { type: Type.STRING },
            allocationPercent: { type: Type.NUMBER }
          },
          required: ["symbol", "name", "sector", "allocationPercent"]
        }
      },
      stocks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING },
            name: { type: Type.STRING },
            sector: { type: Type.STRING },
            allocationPercent: { type: Type.NUMBER }
          },
          required: ["symbol", "name", "sector", "allocationPercent"]
        }
      }
    },
    required: ["allocation", "etf", "stocks"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Gemini Stock Suggestion Error", error);
    throw error;
  }
};

export const createChatSession = (
  profile: InvestmentProfile,
  allocation: PortfolioAllocation,
  riskScore: number
): Chat => {
  const systemInstruction = `
    You are a friendly financial advisor.
    You are grounded in a 35-year historical market dataset.
    Plan: Goal "${profile.financialGoal}", Monthly ${profile.currency}${profile.monthlySavingsTarget}, Risk ${profile.riskTolerance} (${riskScore}/100).
    Allocation: Equity ${allocation.equity}%, Debt ${allocation.debt}%, Gold ${allocation.gold}%.
    
    Always explain your reasoning using historical context when asked.
  `;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction },
  });
};
