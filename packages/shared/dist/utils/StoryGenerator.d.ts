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
export declare class StoryGenerator {
    private openai;
    private storySettings;
    private pages;
    private storyOutline;
    private storySoFar;
    private storySummary;
    constructor(bookSettings: StorySettings);
    generateStoryOutline(): Promise<string>;
    generateNextPage(storyOutline: string, storySoFar: string, pageNumber: number, feedback?: string, previousPageText?: string): Promise<string>;
    generateIllustrationForPage(pageNumber: number, storySummary: string, currentPageText: string): Promise<string>;
    getFeedbackForPage(storyOutline: string, previousText: string, currentPage: string): Promise<string>;
    summarizeStory(storySoFar: string): Promise<string>;
    generateCoverImage(storyOutline: string): Promise<string>;
    generateStory(onProgress: (progress: number, message: string) => void, onOutline?: (outline: string) => void, onPageUpdate?: (text: string, image: string | null) => void, onCoverGenerated?: (coverImage: string) => void): Promise<{
        id: string;
        title: string;
        coverImageBase64: string;
        pages: Page[];
    }>;
}
