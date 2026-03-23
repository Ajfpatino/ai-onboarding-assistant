// src/api/drive/readAllSheetsFromFolder.ts
import { extractDriveFolderId } from "../driveApi/extractDriveFolder";
import { crawlDriveFolder } from "../driveApi/crawlDriveFolder";
import { readGoogleSheet } from "./readGoogleSheets";

const GOOGLE_SHEET_MIME = "application/vnd.google-apps.spreadsheet";

export interface ParsedGoogleSheet {
  id: string;
  name: string;
  path: string;
  text: string;
  link: string;
}

export async function readAllSheetsFromFolder(
  folderLink: string,
  accessToken: string
): Promise<ParsedGoogleSheet[]> {
  const folderId = extractDriveFolderId(folderLink);

  if (!folderId) {
    throw new Error("Invalid Google Drive folder link.");
  }

  const allFiles = await crawlDriveFolder(folderId, accessToken);

  const googleSheets = allFiles.filter(
    (file) => file.mimeType === GOOGLE_SHEET_MIME
  );

  const parsedSheets = await Promise.all(
    googleSheets.map(async (file) => {
      try {
        const text = await readGoogleSheet(file.id, accessToken);

        return {
          id: file.id,
          name: file.name,
          path: file.path,
          text,
          link: `https://docs.google.com/spreadsheets/d/${file.id}/edit`,

        };
      } catch (error) {
        console.error(`Failed to read sheet: ${file.name}`, error);
        return null;
      }
    })
  );

  console.log("parsedSheets:", parsedSheets);

  return parsedSheets.filter(
    (sheet): sheet is ParsedGoogleSheet => sheet !== null
  );
}