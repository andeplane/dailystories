"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MixpanelService = void 0;
// @ts-ignore
const mixpanel_browser_1 = __importDefault(require("mixpanel-browser"));
// Check if we're running on localhost
const isLocalhost = window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
// Initialize mixpanel only if not on localhost
if (!isLocalhost) {
    mixpanel_browser_1.default.init("dd4ba7a15b815dbd1ba0694aea50eab9");
}
// Generate or retrieve user ID
const getUserId = () => {
    const storageKey = "user_id";
    let userId = localStorage.getItem(storageKey);
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem(storageKey, userId);
    }
    return userId;
};
// Identify user on initialization only if not on localhost
const userId = getUserId();
if (!isLocalhost) {
    mixpanel_browser_1.default.identify(userId);
}
// Helper function to track events
const track = (eventName, properties) => {
    if (!isLocalhost) {
        mixpanel_browser_1.default.track(eventName, properties);
    }
    else {
        console.log("Mixpanel event (debug):", eventName, properties);
    }
};
exports.MixpanelService = {
    getCurrentUserId: () => getUserId(),
    trackNewStoryClick: () => {
        track("NewStory.Clicked");
    },
    trackSuggestionClick: (childAge, language) => {
        track("NewStory.GenerateSuggestion.Clicked", {
            childAge,
            language,
        });
    },
    trackStorySettingsSubmit: (settings) => {
        track("NewStory.Generate.Submitted", {
            childAge: settings.childAge,
            language: settings.language,
            numPages: settings.numPages,
            illustrationStyle: settings.illustrationStyle,
            hasInterests: Boolean(settings.interests),
            hasColors: Boolean(settings.colors),
        });
    },
    trackStorySettingsCancel: () => {
        track("NewStory.Generate.Cancelled");
    },
    trackStoryGeneration: (settings, metrics) => {
        track("NewStory.Generate.Completed", {
            totalTime: metrics.totalTime,
            averageTimePerPage: metrics.averageTimePerPage,
            numPages: metrics.numPages,
            language: settings.language,
            illustrationStyle: settings.illustrationStyle,
        });
    },
    trackStoryRead: (storyId, storyTitle) => {
        track("NewStory.Read", {
            storyId,
            storyTitle,
        });
    },
    trackAppLoad: () => {
        track("App.Loaded", {
            timestamp: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
    },
};
