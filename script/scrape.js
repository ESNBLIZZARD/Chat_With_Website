import puppeteer from "puppeteer";
import { embedText } from "../vectorize/embed.js";
import {
  upsertPoints,
  createCollectionIfNotExists,
  COLLECTION_NAME,
} from "../db/qdrant.js";
import { chunkText } from "../utils/chunk.js";
import { qdrant } from "../db/qdrant.js";

export default async function scrapeWebsite(TARGET_URL) {
  console.log("🚀 Launching browser...");

  // CLEAR OLD WEBSITE BEFORE INDEXING NEW ONE
  try {
    await qdrant.deleteCollection(COLLECTION_NAME);
    console.log("🧹 Old collection cleared.");
  } catch {
    console.log("No previous collection to delete.");
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  });

  console.log("🔍 Visiting:", TARGET_URL);

  try {
    await page.goto(TARGET_URL, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
  } catch (err) {
    await browser.close();
    return { error: "Failed to load website: " + err.message };
  }

  try {
    await page.waitForSelector("body", { timeout: 10000 });
  } catch {
    await browser.close();
    return { error: "Website loaded but no <body> found" };
  }

  await new Promise((res) => setTimeout(res, 1500));

  let text = "";
  try {
    text = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );

      let output = "";
      let node;

      while ((node = walker.nextNode())) {
        const t = node.textContent.trim();
        if (t.length > 0) output += t + " ";
      }

      return output.replace(/\s+/g, " ").trim();
    });
  } catch (err) {
    await browser.close();
    return { error: "Text extraction failed" };
  }

  console.log("📄 Extracted chars:", text.length);

  if (text.length < 30) {
    await browser.close();
    return { error: "Website has too little readable content." };
  }

  const chunks = chunkText(text, 300, 50);

  const points = [];

  for (let chunk of chunks) {
    const vector = await embedText(chunk);

    points.push({
      vector,
      payload: {
        url: TARGET_URL,
        text: chunk,
      },
    });
  }

  await createCollectionIfNotExists(COLLECTION_NAME, points[0].vector.length);
  await upsertPoints(COLLECTION_NAME, points);

  await browser.close();

  console.log("✅ Indexed:", points.length, "chunks");

  return {
    success: true,
    chunks: points.length,
    url: TARGET_URL,
  };
}
