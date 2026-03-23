// src/tools/getGoogleDrivePrompt.ts
import { fileSummaryAgent } from "../api/chatApi/FIleSummaryAgent";
import { readAllDocsFromFolder } from "../api/driveApi/readAllDocsFromFolder";
import { readAllSheetsFromFolder } from "../api/sheetsApi/readAllSheetsFromFolder";

export async function getGoogleDrivePrompt(
  folderLink: string,
  accessToken: string,
): Promise<string> {
  const [docs, sheets] = await Promise.all([
    readAllDocsFromFolder(folderLink, accessToken),
    readAllSheetsFromFolder(folderLink, accessToken),
  ]) 

  if (!docs.length && !sheets.length) {
    return "No Google Docs or sheets were found in that Drive folder.";
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

    const combinedSheets = sheets
        .map(
        (sheet) => `
    FILE: ${sheet.name}
    PATH: ${sheet.path}

    ${sheet.text}
    `
        )
        .join("\n\n====================\n\n");


  return `

  
    DOCUMENTS:
    ${combinedDocs || "None"}

    ====================

    SHEETS:
    ${combinedSheets || "None"}
    `.trim();
}

export async function getFilesFromDriveTool(
  folderLink: string,
  accessToken: string,
): Promise<string> {
  const [docs, sheets] = await Promise.all([
    readAllDocsFromFolder(folderLink, accessToken),
    readAllSheetsFromFolder(folderLink, accessToken),
  ]) 

  if (!docs.length && !sheets.length) {
    return "No Google Docs or sheets were found in that Drive folder.";
  }

  const combinedDocs = docs
    .map(
      (doc) => `
      FILE: ${doc.name}
      ID: ${doc.id}
      PATH: ${doc.path}

      ${doc.text}
      `
    )
    .join("\n\n====================\n\n");

    const combinedSheets = sheets
        .map(
        (sheet) => `
    FILE: ${sheet.name}
    ID: ${sheet.id}

    PATH: ${sheet.path}

    ${sheet.text}
    `
        )
        .join("\n\n====================\n\n");

  const driveContext =`

  For each document and sheet provided below, create a summary for each file (combine all file types)
  that includes:

  - name (file name)
  - type (Document or Sheet)
  - link (direct URL to file)
  - path (folder or logical path)
  - summary (brief summary of content)

  **Output format:**  
  Return the result as a valid **JSON array of objects** exactly like this example:

  [
    {
      "name": "company_overview",
      "type": "Document",
      "link": "https://docs.google.com/document/d/FILE_ID/edit",
      "path": "company_overview",
      "summary": "Brief summary here."
    }
  ]

  Return the result as a **valid JSON array only**. Do **not** include any explanations, text, markdown, or tables outside the JSON. 
  The JSON must start with [ and end with ].
  
    DOCUMENTS:
    ${combinedDocs || "None"}

    ====================

    SHEETS:
    ${combinedSheets || "None"}
    `.trim();

    const aiText = await fileSummaryAgent(driveContext);

    return aiText; 
}