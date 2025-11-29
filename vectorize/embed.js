// vectorize/embed.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.GEMINI_API_KEY) throw new Error("Set GEMINI_API_KEY in .env");

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Recommended Gemini embedding model
const embeddingModel = genai.getGenerativeModel({
  model: "text-embedding-004",
});

export async function embedText(text, retry = 3) {
  try {
    const result = await embeddingModel.embedContent({
      content: { parts: [{ text }] },
    });

    return result.embedding.values;
  } catch (err) {
    if (retry > 0) {
      console.warn("❗ Embed failed. Retrying...", retry);
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));
      return embedText(text, retry - 1);
    }
    console.error("❌ Embed failed permanently:", err);
    throw err;
  }
}

