export function chunkText(text, maxTokensApprox = 500, overlap = 50) {
  // Simple word-based chunker (approximate token counts)
  const words = text.split(/\s+/);
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const slice = words.slice(i, i + maxTokensApprox);
    chunks.push(slice.join(' '));
    i += maxTokensApprox - overlap;
  }
  return chunks;
}
