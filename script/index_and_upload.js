//script/index_and_upload.js
import dotenv from "dotenv";
dotenv.config();

import { crawlSite } from "../crawler/crawl.js";
import { chunkText } from "../utils/chunk.js";
import { embedText } from "../vectorize/embed.js";
import { createCollectionIfNotExists, upsertPoints, COLLECTION_NAME } from "../db/qdrant.js";

async function main() {
  const startUrl = process.env.START_URL;
  const pages = await crawlSite(startUrl, 500);

  const chunks = [];
  for (const p of pages) {
    const cs = chunkText(p.text, 500, 50).map((text) => ({
      url: p.url,
      title: p.title,
      text,
    }));
    chunks.push(...cs);
  }

  if (chunks.length === 0) return console.log("No chunks");

  // Embed in batches
  const batchSize = 8;
  const points = [];
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const embeddings = await Promise.all(batch.map((c) => embedText(c.text)));
    embeddings.forEach((vec, j) => {
      points.push({
        id: `${i + j}`,
        vector: vec,
        payload: {
          url: batch[j].url,
          title: batch[j].title,
          text: batch[j].text.slice(0, 1000),
        },
      });
    });
    console.log(`Embedded ${Math.min(i + batchSize, chunks.length)} / ${chunks.length}`);
  }

  // Create collection dynamically
  await createCollectionIfNotExists(COLLECTION_NAME, points[0].vector.length);
  await upsertPoints(COLLECTION_NAME, points);

  console.log("Uploaded vectors:", points.length);
}

main().catch(console.error);
