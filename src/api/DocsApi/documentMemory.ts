import type { DocumentChunk } from "../../types/documentTypes";
import { STORAGE_KEY } from "../../utils/config";

export type StoredDocument = {
  id: string;
  url: string;
  fullText: string;
  chunks: DocumentChunk[];
  addedAt: number;
};


export function saveDocument(doc: StoredDocument): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
}

export function getStoredDocument(): StoredDocument | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredDocument;
  } catch {
    return null;
  }
}