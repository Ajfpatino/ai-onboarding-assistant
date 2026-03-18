import { readGoogleDoc } from "../api/DocsApi/readGoogleDocs";
import { chunkText } from "../api/DocsApi/chunkText";
import { searchChunks } from "../api/DocsApi/searchChunk";


function getGoogleDocId(url: string): string{
  const parts = url.split("/");
  const dIndex = parts.indexOf("d");
  return parts[dIndex + 1];
}

export async function getGoogleDocPrompt(source: string, userMessage: string, accessToken: string): Promise<string> {

 
  //if no link in message, check if we have stored document for context
  if (source != null) {
    
    const docId = getGoogleDocId(source);
    const docText = await readGoogleDoc(docId, accessToken);
    const chunks = chunkText(docText, 2500, 300);
    const relevantChunks = searchChunks(chunks, userMessage, 5);

    const context = relevantChunks
      .map((chunk) => `Chunk ${chunk.index}:\n${chunk.text}`)
      .join("\n\n---\n\n");

    return `

    DOCUMENT URL: ${source}
    Total chunks: ${chunks.length}


    CONTEXT:
    ${context}

    `.trim();
  }

  return userMessage;
}
