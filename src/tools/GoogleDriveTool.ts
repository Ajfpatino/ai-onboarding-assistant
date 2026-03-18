// src/tools/getGoogleDrivePrompt.ts
import { readAllDocsFromFolder } from "../api/driveApi/readAllDocsFromFolder";

export async function getGoogleDrivePrompt(
  folderLink: string,
  accessToken: string,
  userQuestion?: string
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
You are an onboarding assistant and teacher.

Use the documentation below to answer the user's question clearly and simply.

Rules:
- Explain like the user is new to the project.
- Use only the provided documents.
- Mention file names when relevant.
- If the answer is not in the docs, say so.

${userQuestion ? `USER QUESTION:\n${userQuestion}\n` : ""}

DOCUMENTS:
${combinedDocs}
`.trim();
}