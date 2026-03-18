import type { DocumentChunk } from "../../types/documentTypes";

type ScoredChunk = {
  chunk: DocumentChunk;
  score: number;
};

export function searchChunks(
  chunks: DocumentChunk[],
  query: string,
  topK = 5
): DocumentChunk[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  const scored: ScoredChunk[] = chunks.map((chunk) => {
    const lowerText = chunk.text.toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (lowerText.includes(term)) {
        score += 1;
      }
    }

    return { chunk, score };
  });

  const matches = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item) => item.chunk);

  return matches.length > 0 ? matches : chunks.slice(0, topK);
}