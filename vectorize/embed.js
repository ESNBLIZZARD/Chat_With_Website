// vectorize/embed.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.GEMINI_API_KEY) throw new Error("Set GEMINI_API_KEY in .env");

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genai.getGenerativeModel({ model: "text-embedding-004" });

export async function embedText(text) {
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }] },
  });
  return result.embedding.values;
}
