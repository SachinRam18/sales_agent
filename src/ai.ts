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

function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim();
  
  // 1. Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
    cleaned = cleaned.trim();
  }

  // 2. Extract first JSON object block if there is leading/trailing text
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const firstOpen = cleaned.indexOf("{");
    const lastClose = cleaned.lastIndexOf("}");
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
      cleaned = cleaned.substring(firstOpen, lastClose + 1);
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (e: any) {
    throw new Error(`JSON parse failure: ${e.message} (Raw snippet: "${cleaned.substring(0, 200)}")`);
  }
}

export async function generateJSON(prompt: string, schema?: any, maxTokens: number = 2000): Promise<any> {
  const maxAttempts = 2;
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (isOR) {
        try {
          const finalPrompt = prompt + "\nReturn ONLY valid JSON. Do not wrap in markdown fences or explain your answer.";
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
                { role: "user", content: finalPrompt }
              ],
              response_format: { type: "json_object" },
              max_tokens: maxTokens
            })
          });

          let rawText = "";
          try {
            rawText = await response.text();
          } catch (e) {
            throw new Error("Failed to read raw response text from OpenRouter");
          }

          if (!rawText || rawText.trim() === "") {
            throw new Error("Empty response body received from OpenRouter");
          }

          let data: any;
          try {
            data = JSON.parse(rawText);
          } catch (e) {
            throw new Error(`Malformed JSON response from OpenRouter: ${rawText.substring(0, 200)}`);
          }

          if (data.error) {
            throw new Error(`OpenRouter API error: ${data.error.message || JSON.stringify(data.error)}`);
          }

          if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
            throw new Error("Invalid response structure from OpenRouter");
          }

          const content = data.choices[0].message.content;
          if (content === undefined || content === null) {
            throw new Error("Model returned empty content");
          }

          return cleanAndParseJSON(content);
        } catch (e: any) {
          console.warn(`[AI System] OpenRouter attempt ${attempt}/${maxAttempts} failed: ${e.message}`);
          lastError = e;
          if (!isGemini) {
            if (attempt < maxAttempts) {
              console.log("[AI System] Retrying OpenRouter API request...");
              continue;
            }
            throw e;
          }
        }
      }

      if (isGemini) {
        try {
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

          const responseText = response.text;
          if (responseText) {
            return cleanAndParseJSON(responseText);
          }
          throw new Error("Empty response text from Gemini");
        } catch (geminiError: any) {
          console.warn(`[AI System] Gemini attempt ${attempt}/${maxAttempts} failed: ${geminiError.message}`);
          lastError = geminiError;
          if (attempt < maxAttempts) {
            console.log("[AI System] Retrying Gemini API request...");
            continue;
          }
          throw geminiError;
        }
      }
    } catch (outerError: any) {
      lastError = outerError;
      if (attempt < maxAttempts) {
        continue;
      }
    }
  }

  throw lastError || new Error("AI is not configured. Please set GEMINI_API_KEY or OPENROUTER_API_KEY in .env");
}


