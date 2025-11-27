import scrapeWebsite from "../script/scrape.js";
import express from "express";
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
// -------------------------------------

import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { embedText } from "../vectorize/embed.js";
import { search } from "../db/qdrant.js";
import { callGeminiChat } from "./gemini_chat.js";

app.use(express.json());
app.use(bodyParser.json());

app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"] }));

app.get("/", (req, res) => {
  res.json({ status: "Backend running" });
});

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) return res.status(400).json({ error: "question required" });

    // Embed question → search vector DB
    const vector = await embedText(question);
    const hits = await search("website_docs", vector, 5);

    const context = hits
      .map(
        (h, i) => `
[CHUNK ${i + 1}]
Source: ${h.payload.url}

Content:
${h.payload.text}
`
      )
      .join("\n\n");
    console.log("===== DEBUG CONTEXT START =====");
    console.log(context);
    console.log("===== DEBUG CONTEXT END =====");

    const prompt = `
You are a helpful assistant for questions about my website content.

Use ONLY the context below. 
If answer is not found, say: "I don't have enough information."

====================
CONTEXT:
${context}
====================

QUESTION: ${question}

Answer in detail:
`;

    const answer = await callGeminiChat(prompt);

    res.json({
      answer,
      sources: hits.map((h) => h.payload.url),
    });
  } catch (e) {
    console.error("ASK ERROR:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/scrape", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) return res.status(400).json({ error: "url required" });

    const result = await scrapeWebsite(url);

    res.json({
      message: "Website scraped and indexed",
      chunks: result.chunks,
    });

  } catch (e) {
    console.error("SCRAPE ERROR:", e);
    res.status(500).json({ error: e.message || "Failed to scrape website" });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🔥 Backend running at http://localhost:${PORT}`)
);
