// @ts-ignore
import mixpanel from "mixpanel-browser";

// Initialize mixpanel
mixpanel.init("dd4ba7a15b815dbd1ba0694aea50eab9");

export const MixpanelService = {
  trackNewBookClick: () => {
    mixpanel.track("NewStory.Clicked");
  },

  trackSuggestionClick: (childAge: number, language: string) => {
    mixpanel.track("NewStory.GenerateSuggestion.Clicked", {
      childAge,
      language,
    });
  },

  trackBookSettingsSubmit: (settings: any) => {
    mixpanel.track("NewStory.Generate.Submitted", {
      childAge: settings.childAge,
      language: settings.language,
      numPages: settings.numPages,
      illustrationStyle: settings.illustrationStyle,
      hasInterests: Boolean(settings.interests),
      hasColors: Boolean(settings.colors),
    });
  },

  trackBookSettingsCancel: () => {
    mixpanel.track("NewStory.Generate.Cancelled");
  },

  trackBookGeneration: (
    settings: any,
    metrics: {
      totalTime: number;
      averageTimePerPage: number;
      numPages: number;
    }
  ) => {
    mixpanel.track("NewStory.Generate.Completed", {
      totalTime: metrics.totalTime,
      averageTimePerPage: metrics.averageTimePerPage,
      numPages: metrics.numPages,
      language: settings.language,
      illustrationStyle: settings.illustrationStyle,
    });
  },

  trackBookRead: (bookId: string, bookTitle: string) => {
    mixpanel.track("NewStory.Book.Read", {
      bookId,
      bookTitle,
    });
  },
};
