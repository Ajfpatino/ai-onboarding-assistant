import type { DocumentChunk } from "../../types/documentTypes";

export function chunkText(
  text: string,
  chunkSize = 2500,
  overlap = 300
): DocumentChunk[] {
  const clean = text.replace(/\r/g, "").trim();
  const chunks: DocumentChunk[] = [];

  let start = 0;
  let index = 0;

  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    const chunk = clean.slice(start, end).trim();

    if (chunk) {
      chunks.push({
        id: `chunk-${index}`,
        index,
        text: chunk,
      });
    }

    if (end >= clean.length) break;

    start = end - overlap;
    index++;
  }

  return chunks;
}