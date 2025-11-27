// server/gemini_chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Set GEMINI_API_KEY in your .env file");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Load model
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export async function callGeminiChat(prompt) {
  try {
    // Gemini 1.5 requires a RAW STRING pattern
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const answer = await result.response.text();
    console.log(answer, "RESULTTTTT");
    return result.response.text();
  } catch (err) {
    console.error("GEMINI ERROR:", err);
    return "Gemini failed to respond.";
  }
}
