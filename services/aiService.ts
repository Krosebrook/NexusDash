import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { DashboardMetric, AuditLog, CostRecord, CostForecastResult } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Existing Insight Logic ---
export interface InsightReport {
  htmlContent: string;
  generatedAt: Date;
}

export const generateDashboardInsights = async (
  metrics: DashboardMetric[],
  logs: AuditLog[],
  costs: CostRecord[]
): Promise<InsightReport> => {
  const snapshot = {
    metrics: metrics.map(m => ({
      label: m.label,
      value: m.value,
      trend: m.trend,
      error: m.error ? { code: m.error.code, cause: m.error.cause } : null
    })),
    recentLogs: logs.slice(0, 10).map(l => ({
      status: l.status,
      source: l.source,
      action: l.action,
      details: l.details
    })),
    costSummary: costs
  };

  const prompt = `
    Analyze the following JSON snapshot of the Nexus Dashboard.
    Data Snapshot: ${JSON.stringify(snapshot, null, 2)}
    Your goal is to act as a Senior DevOps & Business Intelligence Analyst.
    Provide a concise, professional report in HTML format.
    Structure the report with the following sections using specific Tailwind CSS classes for styling:
    1. <div class="mb-6"><h3 class="text-lg font-bold text-white mb-2">Executive Summary</h3><p class="text-slate-300 text-sm leading-relaxed">...</p></div>
    2. <div class="mb-6"><h3 class="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">Critical Attention Needed</h3>...</div>
    3. <div><h3 class="text-lg font-bold text-blue-400 mb-2">Operational Trends</h3>...</div>
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.2 }
    });
    const text = response.text || "<p class='text-red-400'>Unable to generate analysis.</p>";
    return { htmlContent: text.replace(/```html/g, '').replace(/```/g, ''), generatedAt: new Date() };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      htmlContent: `<div class="p-4 bg-red-900/20 border border-red-900/50 rounded-lg"><h3 class="text-red-400 font-bold mb-2">Analysis Failed</h3><p class="text-red-300 text-sm">Unable to connect to the Insight Engine.</p></div>`,
      generatedAt: new Date()
    };
  }
};

// --- Predictive Forecasting Logic ---

export const predictCostTrends = async (history: CostRecord[]): Promise<CostForecastResult | null> => {
  const prompt = `
    Analyze the following historical cloud cost data:
    ${JSON.stringify(history, null, 2)}

    Predict the costs for the NEXT TWO months (e.g., if data ends in Dec, forecast Jan and Feb).
    Analyze trends for each source (HubSpot, Gemini, Slack, Jira, etc.).
    
    Return a strictly formatted JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Executive summary of the 2-month forecast." },
            forecasts: {
              type: Type.ARRAY,
              description: "Array containing forecasts for exactly two months.",
              items: {
                type: Type.OBJECT,
                properties: {
                  monthLabel: { type: Type.STRING, description: "The label for the projected month (e.g. '2024-01')" },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                         source: { type: Type.STRING, enum: ["hubspot", "gemini", "freshdesk", "stripe", "github", "slack", "jira", "system"] },
                         cost: { type: Type.NUMBER },
                         reasoning: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CostForecastResult;
    }
    return null;
  } catch (e) {
    console.error("Forecasting Error", e);
    return null;
  }
};

// --- Existing Chat Logic ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  isToolUse?: boolean;
}

const resolveIssueTool: FunctionDeclaration = {
  name: 'resolve_integration_issue',
  description: 'Fixes a failing integration source (e.g. github, stripe) by applying automated remediation strategies like key rotation or rate limit backoff adjustment.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      source: {
        type: Type.STRING,
        description: 'The ID of the integration source to fix (e.g., "stripe", "github").'
      }
    },
    required: ['source']
  }
};

export class DashboardChatSession {
  private history: any[] = [];
  private onToolCall: (toolName: string, args: any) => Promise<any>;

  constructor(
    initialMetrics: DashboardMetric[], 
    onToolCall: (toolName: string, args: any) => Promise<any>
  ) {
    this.onToolCall = onToolCall;
    
    // System instruction setup
    const context = JSON.stringify(initialMetrics.map(m => ({
      source: m.source,
      label: m.label,
      value: m.value,
      error: m.error ? m.error.cause : 'None'
    })));

    this.history.push({
      role: 'user',
      parts: [{ text: `System Context: You are Nexus, an intelligent DevOps assistant. You have access to the current dashboard metrics: ${context}. 
      
      You can answer questions about the system status and you have the ability to FIX issues using the 'resolve_integration_issue' tool. 
      If a user asks to fix an error (like Stripe or GitHub), USE THE TOOL. Do not just say you can do it, actually call the function.` }]
    });
    
    // Prime the model response to the system context
    this.history.push({
      role: 'model',
      parts: [{ text: "Understood. I am ready to assist with dashboard operations and remediation." }]
    });
  }

  async sendMessage(userMessage: string): Promise<string> {
    // 1. Add User Message
    this.history.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    try {
      // 2. Call Model
      let response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: this.history,
        config: {
          tools: [{ functionDeclarations: [resolveIssueTool] }]
        }
      });

      // 3. Handle Function Calls (Multi-turn loop)
      const functionCalls = response.functionCalls;
      
      if (functionCalls && functionCalls.length > 0) {
        // Append the model's tool call request to history
        this.history.push({
          role: 'model',
          parts: response.candidates?.[0]?.content?.parts || []
        });

        // Execute tools
        const functionResponses = await Promise.all(functionCalls.map(async (call) => {
          console.log("Executing tool:", call.name, call.args);
          const result = await this.onToolCall(call.name, call.args);
          return {
            id: call.id,
            name: call.name,
            response: { result: JSON.stringify(result) }
          };
        }));

        // Append tool results to history
        this.history.push({
          role: 'function',
          parts: functionResponses.map(fr => ({
            functionResponse: fr
          }))
        });

        // Call model again with tool results
        response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: this.history,
          config: {
            tools: [{ functionDeclarations: [resolveIssueTool] }]
          }
        });
      }

      const text = response.text || "I processed that action.";
      
      // Append final response to history
      this.history.push({
        role: 'model',
        parts: [{ text: text }]
      });

      return text;
    } catch (e) {
      console.error("Chat Error", e);
      return "I'm having trouble connecting to the Nexus core right now. Please try again.";
    }
  }
}