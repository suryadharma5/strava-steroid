import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in the environment variables.");
}

// Initializing the new Google Gen AI SDK
export const ai = new GoogleGenAI({ 
  apiKey: apiKey || "" 
});

export const GEMINI_MODEL = "gemini-3-flash-preview";
