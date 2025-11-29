import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from "uuid";

export const COLLECTION_NAME = "website_docs";

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY || undefined,
});

// -------------------------------
// Create collection with dynamic vector size
// -------------------------------
export async function createCollectionIfNotExists(collectionName, vectorSize) {
  try {
    const collection = await qdrant.getCollection(collectionName).catch(() => null);

    if (!collection) {
      await qdrant.createCollection(collectionName, {
        vectors: {
          size: vectorSize,
          distance: "Cosine",
        },
        schema: {
          url: { type: "keyword" },
          text: { type: "text" },
        },
      });
      console.log(`🟢 Created collection: ${collectionName} with vectorSize=${vectorSize}`);
    } else {
      console.log(`Collection exists: ${collectionName} (vectorSize=${collection.vectors?.size})`);
    }
  } catch (e) {
    console.warn("createCollection error:", e.message);
  }
}

// -------------------------------
// Insert points
// -------------------------------
export async function upsertPoints(collectionName, points) {
  if (points.length === 0) return;

  // Dynamically get vector size from first point
  const vectorSize = points[0].vector.length;

  await createCollectionIfNotExists(collectionName, vectorSize);

  const formatted = points.map((p) => ({
    id: p.id || uuidv4(),
    vector: p.vector,
    payload: p.payload,
  }));

  await qdrant.upsert(collectionName, { points: formatted });

  console.log(`🟢 ${formatted.length} points upserted`);
}

// -------------------------------
// Search
// -------------------------------
export async function search(collectionName, vector, topK = 5) {
  // DO NOT create collection here!
  const res = await qdrant.search(collectionName, {
    vector,
    limit: topK,
  });

  return res.map((r) => ({
    payload: r.payload,
    score: r.score,
  }));
}
