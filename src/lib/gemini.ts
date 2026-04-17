import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getFinancialAdvice = async (expenses: any[], goals: any[], query: string) => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are NextSpend AI, a world-class financial advisor.
    Your goal is to provide clear, actionable financial advice based on user data.
    
    Current User Data:
    Expenses: ${JSON.stringify(expenses)}
    Goals: ${JSON.stringify(goals)}
    
    Guidelines:
    1. Be concise and encouraging.
    2. Identify waste (unused subscriptions, impulsive spending).
    3. Suggest immediate actions (e.g., "Pay electricity bill", "You can spend ₹800 today").
    4. Use the user's currency (default INR).
    5. If asked "Can I afford this?", analyze current cash flow and goals.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble analyzing your finances right now. Please try again later.";
  }
};

export const getFinancialHealthScore = async (expenses: any[]) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze these expenses and provide a financial health score (0-100) and a brief summary.
    Expenses: ${JSON.stringify(expenses)}
    
    Return JSON format: { "score": number, "summary": string, "recommendations": string[] }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "summary", "recommendations"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Score Error:", error);
    return { score: 50, summary: "Unable to calculate score.", recommendations: [] };
  }
};

export const detectSubscriptionWaste = async (subscriptions: any[]) => {
  const model = "gemini-3-flash-preview";
  
  if (subscriptions.length < 2) return null;

  const prompt = `
    Analyze these subscriptions and find potential waste (overlapping services, unused ones).
    Subscriptions: ${JSON.stringify(subscriptions)}
    
    Return JSON format: { "savings": number, "reason": string } or null if no waste found.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT, // Fixed to Type.OBJECT as required by skill
          properties: {
            savings: { type: Type.NUMBER },
            reason: { type: Type.STRING }
          },
          required: ["savings", "reason"]
        }
      }
    });
    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Waste Detector Error:", error);
    return null;
  }
};

export const getFinancialFuture = async (expenses: any[], balance: number, goals: any[]) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Based on these expenses: ${JSON.stringify(expenses.slice(0, 20))}
    And current balance: ${balance}
    And goals: ${JSON.stringify(goals)}
    
    Predict the financial situation in 1 month, 1 year, and 5 years.
    Also provide a "Future You Simulator" analysis:
    1. If they continue current spending habits.
    2. If they cut impulsive spending by 50%.
    
    Return JSON format: {
      "predictions": [{ "period": string, "balance": number, "status": string }],
      "simulator": {
        "currentTrend": { "futureWorth5yr": number, "consequence": string },
        "improvedTrend": { "futureWorth5yr": number, "benefit": string }
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  period: { type: Type.STRING },
                  balance: { type: Type.NUMBER },
                  status: { type: Type.STRING }
                },
                required: ["period", "balance", "status"]
              }
            },
            simulator: {
              type: Type.OBJECT,
              properties: {
                currentTrend: {
                  type: Type.OBJECT,
                  properties: {
                    futureWorth5yr: { type: Type.NUMBER },
                    consequence: { type: Type.STRING }
                  },
                  required: ["futureWorth5yr", "consequence"]
                },
                improvedTrend: {
                  type: Type.OBJECT,
                  properties: {
                    futureWorth5yr: { type: Type.NUMBER },
                    benefit: { type: Type.STRING }
                  },
                  required: ["futureWorth5yr", "benefit"]
                }
              },
              required: ["currentTrend", "improvedTrend"]
            }
          },
          required: ["predictions", "simulator"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Future Prediction Error:", error);
    return null;
  }
};

export const checkTransactionImpact = async (amount: number, description: string, balance: number, goals: any[]) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    The user wants to spend ${amount} on "${description}".
    Current Balance: ${balance}
    Goals: ${JSON.stringify(goals)}
    
    Should they do it? Is there a "Regret Alert"?
    Warn them if it drops balance below a safe 20% cushion or delays a goal.
    
    Return JSON: { "shouldProceed": boolean, "alert": string | null, "severity": "low" | "medium" | "high" }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shouldProceed: { type: Type.BOOLEAN },
            alert: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ["low", "medium", "high"] }
          },
          required: ["shouldProceed", "severity"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Impact Check Error:", error);
    return { shouldProceed: true, alert: null, severity: "low" };
  }
};
