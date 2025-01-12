// src/types/Book.ts
export interface Book {
  id: string;
  title: string;
  summary?: string;
  coverImageBase64?: string;
  pages: Page[];
}

export interface Page {
  text: string;
  illustrationBase64: string;
  isCover?: boolean;
}
