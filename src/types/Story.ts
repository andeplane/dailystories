// src/types/Story.ts
export interface Page {
  text: string;
  illustrationBase64: string;
}

export interface Story {
  id: string;
  title: string;
  summary?: string;
  coverImageBase64: string;
  pages: Page[];
  createdAt?: Date;
  isPreinstalled?: boolean;
}
