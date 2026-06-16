import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const openRouterKey = process.env.OPENROUTER_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

const isOR = !!openRouterKey && openRouterKey !== "MY_OPENROUTER_API_KEY" && openRouterKey !== "";
const isGemini = !!geminiKey && geminiKey !== "MY_GEMINI_API_KEY" && geminiKey !== "";

export function isAIEnabled(): boolean {
  return isOR || isGemini;
}

export async function generateJSON(prompt: string, schema?: any, maxTokens: number = 2000): Promise<any> {
  if (isOR) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openRouterKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "SalesPilot AI"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error("Invalid response structure from OpenRouter");
    }

    const text = data.choices[0].message.content;
    return JSON.parse(text.trim());
  } else if (isGemini) {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const config: any = {
      responseMimeType: "application/json",
      maxOutputTokens: maxTokens,
    };
    if (schema) {
      config.responseSchema = schema;
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    throw new Error("Empty response text from Gemini");
  } else {
    throw new Error("AI is not configured. Please set GEMINI_API_KEY or OPENROUTER_API_KEY in .env");
  }
}
