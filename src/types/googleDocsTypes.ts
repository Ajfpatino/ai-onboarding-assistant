export type TextRun = {
  content?: string;
};

export type ParagraphElement = {
  textRun?: TextRun;
};

export type Paragraph = {
  elements?: ParagraphElement[];
};

export type TableCell = {
  content?: StructuralElement[];
};

export type TableRow = {
  tableCells?: TableCell[];
};

export type Table = {
  tableRows?: TableRow[];
};

export type TableOfContents = {
  content?: StructuralElement[];
};

export type StructuralElement = {
  paragraph?: Paragraph;
  table?: Table;
  tableOfContents?: TableOfContents;
};

export type DocumentBody = {
  content?: StructuralElement[];
};

export type TabProperties = {
  title?: string;
};

export type DocumentTab = {
  body?: DocumentBody;
};

export type Tab = {
  tabProperties?: TabProperties;
  documentTab?: DocumentTab;
  childTabs?: Tab[];
};

export type GoogleDocumentResponse = {
  body?: DocumentBody;
  tabs?: Tab[];
};