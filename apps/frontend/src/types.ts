// src/types.ts
export interface OtherCharacter {
  name: string;
  description: string;
}

export interface BookSettings {
  childName: string;
  childAge: number;
  childPreferences: {
    colors?: string[];
    interests?: string[];
  };
  otherCharacters?: OtherCharacter[];
  bookTheme: string;
  storylineInstructions?: string;
  language: string;
  illustrationStyle: string;
  numPages: number;
  models: {
    outlineModel: string;
    generationModel: string;
    feedbackModel: string;
    imageModel?: string;
  };
}

export interface BookPage {
  text: string;
  illustration: string;
}

export interface BookData {
  title: string;
  author: string;
  pages: BookPage[];
}
