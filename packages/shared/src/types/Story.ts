export interface StorySettings {
  title: string;
  childName: string;
  childAge: number;
  childPreferences: {
    colors?: string[];
    interests?: string[];
  };
  otherCharacters?: {
    name: string;
    age: number;
    description: string;
  }[];
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
  openAIApiKey: string;
}

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
