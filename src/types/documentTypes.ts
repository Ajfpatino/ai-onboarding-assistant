export type DocumentChunk = {
  id: string;
  index: number;
  text: string;
};

export type StoredDocument = {
  id: string;
  url: string;
  fullText: string;
  chunks: DocumentChunk[];
  addedAt: number;
};