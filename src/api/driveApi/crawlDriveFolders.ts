// src/api/drive/crawlDriveFolder.ts
import { listFolderFiles, type DriveItem } from "./listFolderFiles";

const FOLDER_MIME = "application/vnd.google-apps.folder";
const SHORTCUT_MIME = "application/vnd.google-apps.shortcut";

export interface CrawledDriveFile extends DriveItem {
  path: string;
}

export async function crawlDriveFolder(
  folderId: string,
  accessToken: string,
  currentPath = ""
): Promise<CrawledDriveFile[]> {
  const items = await listFolderFiles(folderId, accessToken);
  const results: CrawledDriveFile[] = [];

  for (const item of items) {
    const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;

    if (item.mimeType === FOLDER_MIME) {
      const nested = await crawlDriveFolder(item.id, accessToken, itemPath);
      results.push(...nested);
      continue;
    }

    if (item.mimeType === SHORTCUT_MIME && item.shortcutDetails?.targetId) {
      // For now include shortcut metadata only.
      // Later you can resolve target files via files.get if you want.
      results.push({
        ...item,
        id: item.shortcutDetails.targetId,
        mimeType: item.shortcutDetails.targetMimeType || item.mimeType,
        path: itemPath,
      });
      continue;
    }

    results.push({
      ...item,
      path: itemPath,
    });
  }

  return results;
}