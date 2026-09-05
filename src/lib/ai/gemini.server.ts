import { buildSystemPrompt } from "./prompt";
import {
  ChatWithGeminiInputSchema,
  type ChatWithGeminiResult,
} from "./types";

const DEFAULT_MODEL = "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function getConfig() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  return { apiKey, model };
}

export async function chatWithGemini(input: unknown): Promise<ChatWithGeminiResult> {
  const parsed = ChatWithGeminiInputSchema.parse(input);
  const { apiKey, model } = getConfig();

  const contents = [
    ...parsed.history.map((message) => ({
      role: message.role,
      parts: [{ text: message.text }],
    })),
    {
      role: "user",
      parts: [{ text: parsed.message }],
    },
  ];

  const response = await fetch(
    `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemPrompt(parsed.context) }],
        },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1200,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error", response.status, errorText);
    throw new Error(`Gemini request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return { text, model };
}
