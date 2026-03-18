// src/api/drive/listFolderFiles.ts
export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  modifiedTime?: string;
  webViewLink?: string;
  shortcutDetails?: {
    targetId?: string;
    targetMimeType?: string;
  };
}

interface DriveListResponse {
  files: DriveItem[];
  nextPageToken?: string;
}

export async function listFolderFiles(
  folderId: string,
  accessToken: string
): Promise<DriveItem[]> {
  const allFiles: DriveItem[] = [];
  let pageToken: string | undefined = undefined;

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      fields:
        "nextPageToken, files(id,name,mimeType,parents,modifiedTime,webViewLink,shortcutDetails)",
      pageSize: "1000",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });

    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to list folder files: ${errText}`);
    }

    const data: DriveListResponse = await res.json();
    allFiles.push(...(data.files ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return allFiles;
}