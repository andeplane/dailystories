export declare const MixpanelService: {
    getCurrentUserId: () => string;
    trackNewStoryClick: () => void;
    trackSuggestionClick: (childAge: number, language: string) => void;
    trackStorySettingsSubmit: (settings: any) => void;
    trackStorySettingsCancel: () => void;
    trackStoryGeneration: (settings: any, metrics: {
        totalTime: number;
        averageTimePerPage: number;
        numPages: number;
    }) => void;
    trackStoryRead: (storyId: string, storyTitle: string) => void;
    trackAppLoad: () => void;
};
