import type {
  GoogleDocumentResponse,
  StructuralElement,
  ParagraphElement,
  Tab
} from "../../types/googleDocsTypes";

export async function readGoogleDoc(
  docId: string,
  accessToken: string
): Promise<string> {
  const response = await fetch(
    `https://docs.googleapis.com/v1/documents/${docId}?includeTabsContent=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to read Google Doc: ${errorText}`);
  }

  const document: GoogleDocumentResponse = await response.json();

  const parts: string[] = [];

  function readParagraphElement(element: ParagraphElement): string {
    return element.textRun?.content ?? "";
  }

  function readStructuralElements(elements: StructuralElement[] = []): string {
    let text = "";

    for (const element of elements) {
      if (element.paragraph?.elements) {
        for (const paragraphElement of element.paragraph.elements) {
          text += readParagraphElement(paragraphElement);
        }
        text += "\n";
      }

      if (element.table?.tableRows) {
        for (const row of element.table.tableRows) {
          for (const cell of row.tableCells ?? []) {
            text += readStructuralElements(cell.content ?? []);
            text += "\t";
          }
          text += "\n";
        }
      }

      if (element.tableOfContents?.content) {
        text += readStructuralElements(element.tableOfContents.content);
      }
    }

    return text;
  }

  function visitTab(tab: Tab): void {
    const title = tab.tabProperties?.title ?? "Untitled Tab";
    const bodyContent = tab.documentTab?.body?.content ?? [];
    const childTabs = tab.childTabs ?? [];

    parts.push(`\n[Tab: ${title}]\n`);
    parts.push(readStructuralElements(bodyContent));

    for (const childTab of childTabs) {
      visitTab(childTab);
    }
  }

  const tabs = document.tabs ?? [];

  if (tabs.length > 0) {
    for (const tab of tabs) {
      visitTab(tab);
    }
  } else if (document.body?.content) {
    parts.push(readStructuralElements(document.body.content));
  }

  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}