// src/api/drive/extractDriveFolderId.ts
export function extractDriveFolderId(link: string): string | null {
  const patterns = [
    /\/drive\/folders\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = link.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}