// src/tools/getGoogleDrivePrompt.ts
import { readAllDocsFromFolder } from "../api/driveApi/readAllDocsFromFolder";

export async function getGoogleDrivePrompt(
  folderLink: string,
  accessToken: string,
): Promise<string> {
  const docs = await readAllDocsFromFolder(folderLink, accessToken);

  if (!docs.length) {
    return "No Google Docs were found in that Drive folder.";
  }

  const combinedDocs = docs
    .map(
      (doc) => `
      FILE: ${doc.name}
      PATH: ${doc.path}

      ${doc.text}
      `
    )
    .join("\n\n====================\n\n");

  return `

  DOCUMENTS:
  ${combinedDocs}
  `.trim();
}