// src/api/drive/readAllDocsFromFolder.ts
import { extractDriveFolderId } from "./extractDriveFolder";
import { crawlDriveFolder } from "./crawlDriveFolder";
import { readGoogleDoc } from "../DocsApi/readGoogleDocs";

const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";

export interface ParsedGoogleDoc {
  id: string;
  name: string;
  path: string;
  text: string;
  link: string;
}

export async function readAllDocsFromFolder(
  folderLink: string,
  accessToken: string
): Promise<ParsedGoogleDoc[]> {
  const folderId = extractDriveFolderId(folderLink);

  if (!folderId) {
    throw new Error("Invalid Google Drive folder link.");
  }

  const allFiles = await crawlDriveFolder(folderId, accessToken);

  const googleDocs = allFiles.filter(
    (file) => file.mimeType === GOOGLE_DOC_MIME
  );

  const parsedDocs = await Promise.all(
    googleDocs.map(async (file) => {
      try {
        const text = await readGoogleDoc(file.id, accessToken);
        
        return {
          id: file.id,
          name: file.name,
          path: file.path,
          text,
          link: `https://docs.google.com/document/d/${file.id}/edit`,

        };
      } catch (error) {
        console.error(`Failed to read doc: ${file.name}`, error);
        return null;
      }
    })
  );

  console.log("parsedDocs:", parsedDocs);

  return parsedDocs.filter((doc): doc is ParsedGoogleDoc => doc !== null);
}