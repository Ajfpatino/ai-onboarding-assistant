// src/tools/getGoogleDrivePrompt.ts
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

   localStorage.setItem("Drive Files", JSON.stringify(docs)); 

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