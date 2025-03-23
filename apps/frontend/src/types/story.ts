export interface ChildPreferences {
  interests?: string[];
  colors?: string[];
}

export interface StorySettings {
  title: string;
  language: string;
  childName: string;
  childAge: number;
  childPreferences: ChildPreferences;
  otherCharacters?: Array<{ name: string; description: string }>;
  bookTheme: string;
  theme: string;  // Keep this since it's used in the frontend
  storylineInstructions?: string;
  numPages: number;
  illustrationStyle: string;
  models?: {
    outlineModel: string;
    generationModel: string;
    feedbackModel: string;
    imageModel: string;
  };
  generate_images?: boolean;
}

export interface Page {
  text: string;
  illustrationBase64?: string;
  illustrationUrl?: string;
}

export interface Story {
  id: string;
  title: string;
  summary?: string;
  coverImageBase64?: string;
  coverImageUrl?: string;
  pages: Page[];
  created_at?: string;
  status?: string;
} 