// src/api/drive/crawlDriveFolder.ts
import { listFolderFiles, type DriveItem } from "./listFolderFiles";

const GOOGLE_FOLDER_MIME = "application/vnd.google-apps.folder";

export interface CrawledFile extends DriveItem {
  path: string;
}

export async function crawlDriveFolder(
  folderId: string,
  accessToken: string,
  currentPath = ""
): Promise<CrawledFile[]> {
  const items = await listFolderFiles(folderId, accessToken);
  const results: CrawledFile[] = [];

  for (const item of items) {
    const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;

    if (item.mimeType === GOOGLE_FOLDER_MIME) {
      const nestedFiles = await crawlDriveFolder(
        item.id,
        accessToken,
        itemPath
      );
      results.push(...nestedFiles);
    } else {
      results.push({
        ...item,
        path: itemPath,
      });
    }
  }

  return results;
}