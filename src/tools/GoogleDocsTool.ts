import { readGoogleDoc } from "../api/DocsApi/readGoogleDocs";
import { saveDocument, getStoredDocument } from "../api/DocsApi/documentMemory";
import { chunkText } from "../api/DocsApi/chunkText";
import { searchChunks } from "../api/DocsApi/searchChunk";

function removeGoogleDocUrl(message: string): string {
  return message
    .replace(/https?:\/\/docs\.google\.com\/document\/d\/[^\s]+/g, "")
    .trim();
}

export async function getGoogleDocPrompt(userMessage: string, accessToken: string): Promise<string> {
  const hasGoogleDocLink = userMessage.includes("docs.google.com/document");
  const cleanQuestion = removeGoogleDocUrl(userMessage);

  if (hasGoogleDocLink) {
    const docIdMatch = userMessage.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    if (!docIdMatch) {
      throw new Error("Invalid Google Docs URL");
    }

    const urlMatch = userMessage.match(
      /https?:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+\/?[^\s]*/,
    );

    const docId = docIdMatch[1];
    const docUrl = urlMatch?.[0] ?? "";

    
    const docText = await readGoogleDoc(docId, accessToken);
    const chunks = chunkText(docText, 2500, 300);

    saveDocument({
      id: docId,
      url: docUrl,
      fullText: docText,
      chunks,
      addedAt: Date.now(),
    });

    const relevantChunks = searchChunks(chunks, cleanQuestion, 5);

    const context = relevantChunks
      .map((chunk) => `Chunk ${chunk.index}:\n${chunk.text}`)
      .join("\n\n---\n\n");

    return `
    The user provided a Google Document and it has been processed for retrieval-based question answering.
    You are answering questions about the document.
    Use only the provided context.
    If the answer is not in the context, say you could not find it in the loaded document.

    Document URL: ${docUrl}
    Total chunks: ${chunks.length}

    CONTEXT:
    ${context}

    USER QUESTION:
    ${cleanQuestion}
    `.trim();
  }

  // No new doc link, use previously stored doc
  const storedDoc = getStoredDocument();

  if (storedDoc) {
    const relevantChunks = searchChunks(storedDoc.chunks, userMessage, 5);

    const context = relevantChunks
      .map((chunk) => `Chunk ${chunk.index}:\n${chunk.text}`)
      .join("\n\n---\n\n");

    return `
    You are answering questions about a previously loaded Google Document.
    Use only the provided context.
    If the answer is not in the context, say you could not find it in the loaded document.

    DOCUMENT URL:
    ${storedDoc.url}

    CONTEXT:
    ${context}

    USER QUESTION:
    ${cleanQuestion}
    `.trim();
  }

  return userMessage;
}
