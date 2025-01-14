"use strict";
// src/utils/BookGenerator.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryGenerator = void 0;
var OpenAIService_1 = require("./OpenAIService");
var delay = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
var formatTime = function (ms) {
    var seconds = Math.floor(ms / 1000);
    var minutes = Math.floor(seconds / 60);
    return minutes > 0 ? "".concat(minutes, "m ").concat(seconds % 60, "s") : "".concat(seconds, "s");
};
var StoryGenerator = /** @class */ (function () {
    function StoryGenerator(bookSettings) {
        this.pages = [];
        this.storyOutline = "";
        this.storySoFar = "";
        this.storySummary = "";
        this.openai = new OpenAIService_1.OpenAIService(bookSettings.openAIApiKey);
        this.storySettings = bookSettings;
    }
    StoryGenerator.prototype.generateStoryOutline = function () {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var systemPrompt, prompt, outline;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        console.log("Generating story outline...");
                        systemPrompt = "You are an assistant that creates detailed story outlines for children's books. Ensure the outline includes the beginning, middle, and end, and is appropriate for the child's age and interests. Write the outline entirely in the specified language without any additional formatting or headers.";
                        prompt = "Create a detailed story outline for a children's book in **".concat(this.storySettings.language, "** based on the following settings:\n- **Child's Name**: ").concat(this.storySettings.childName, "\n- **Age**: ").concat(this.storySettings.childAge, "\n- **Preferences**: Colors - ").concat(((_a = this.storySettings.childPreferences.colors) === null || _a === void 0 ? void 0 : _a.join(", ")) || "None", ", Interests - ").concat(((_b = this.storySettings.childPreferences.interests) === null || _b === void 0 ? void 0 : _b.join(", ")) || "None", "\n- **Other Characters**: ").concat(((_c = this.storySettings.otherCharacters) === null || _c === void 0 ? void 0 : _c.map(function (c) { return "".concat(c.name, ": ").concat(c.description); }).join("; ")) || "None", "\n- **Theme**: ").concat(this.storySettings.bookTheme, "\n- **Storyline Instructions**: ").concat(this.storySettings.storylineInstructions || "None", "\n- **Total Number of Pages**: ").concat(this.storySettings.numPages, "\n\nThe outline should include the beginning, middle, and end of the story, ensuring it is appropriate for the child's age and interests. The pacing should be suitable for a book with **").concat(this.storySettings.numPages, "** pages. Write the outline entirely in **").concat(this.storySettings.language, "**.");
                        return [4 /*yield*/, this.openai.generateCompletion(prompt, this.storySettings.models.outlineModel, 16384, systemPrompt // Pass the system prompt
                            )];
                    case 1:
                        outline = _d.sent();
                        console.log("Story outline generated and saved to storyOutline.txt.");
                        return [2 /*return*/, outline];
                }
            });
        });
    };
    StoryGenerator.prototype.generateNextPage = function (storyOutline, storySoFar, pageNumber, feedback, previousPageText) {
        return __awaiter(this, void 0, void 0, function () {
            var systemPrompt, prompt, nextSection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Generating the next section...");
                        systemPrompt = "You are an assistant that writes text for sections of a children's book. Ensure that each section contains only the narrative text without any headers, titles, or additional formatting. Write in the specified language and style, appropriate for the target age.";
                        prompt = "Generate section ".concat(pageNumber, " of a children's book in **").concat(this.storySettings.language, "** based on the following settings:\n\n**Story Outline**:\n").concat(storyOutline, "\n\n**Story So Far**:\n").concat(storySoFar, "\n\nEnsure the language is appropriate for a ").concat(this.storySettings.childAge, "-year-old child.\n\nOnly write the text for this section, no metadata or other text.\n");
                        if (feedback && feedback.toLowerCase() !== "ok") {
                            console.log("Incorporating feedback into the next section generation...");
                            prompt += "Based on the following feedback, improve the section:\n\n**Feedback**:\n".concat(feedback, "\n\n**Previous Page Text Attempt**:\n").concat(previousPageText, "\n");
                        }
                        else {
                            console.log("No feedback to incorporate, generating the next section normally.");
                            prompt += "Provide the text for page ".concat(pageNumber, ":\n");
                        }
                        // Inform the model about the total number of sections and the current section
                        prompt += "\n**Page Information**:\n- **Current Page**: ".concat(pageNumber, "\n- **Total Pages**: ").concat(this.storySettings.numPages, " (if applicable)\n\nEnsure that the story progresses naturally towards the conclusion.");
                        return [4 /*yield*/, this.openai.generateCompletion(prompt, this.storySettings.models.generationModel, 16384, systemPrompt // Pass the system prompt
                            )];
                    case 1:
                        nextSection = _a.sent();
                        console.log("Next section generated.");
                        return [2 /*return*/, nextSection];
                }
            });
        });
    };
    StoryGenerator.prototype.generateIllustrationForPage = function (pageNumber, storySummary, currentPageText) {
        return __awaiter(this, void 0, void 0, function () {
            var combinedText, illustrationStylePrompt, prompt, imageBuffer, imageBase64;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Generating illustration for page ".concat(pageNumber, "..."));
                        combinedText = "Summary of the story so far: ".concat(storySummary, "\n\nCurrent page text: ").concat(currentPageText);
                        illustrationStylePrompt = "\n    Illustration style: ".concat(this.storySettings.illustrationStyle, "\n    Appealing to a ").concat(this.storySettings.childAge, "-year-old child.\n    NO TEXT IN THE IMAGE.\n    ");
                        prompt = "Generate an image for the current page of a children's book.\n".concat(combinedText, "\n").concat(illustrationStylePrompt);
                        return [4 /*yield*/, this.openai.generateImage(prompt, {
                                size: "1024x1024",
                            })];
                    case 1:
                        imageBuffer = _a.sent();
                        imageBase64 = imageBuffer.toString("base64");
                        console.log("Illustration for page ".concat(pageNumber, " generated as Base64 string."));
                        return [2 /*return*/, imageBase64];
                }
            });
        });
    };
    StoryGenerator.prototype.getFeedbackForPage = function (storyOutline, previousText, currentPage) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var systemPrompt, prompt, feedback;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("Requesting feedback for the current page...");
                        systemPrompt = "You are an assistant that provides constructive feedback on pages of a children's book. Ensure the feedback is clear, concise, and in the specified language. Do not include any additional text or formatting beyond the feedback.";
                        prompt = "You are an assistant that provides feedback on a page of a children's book written in **".concat(this.storySettings.language, "**.\nEnsure that:\n1. The page follows the overall story outline.\n2. The language is coherent and appropriate for the target age (").concat(this.storySettings.childAge, ").\n3. The concepts are neither too simple nor too complicated.\n4. The page engages the child's interests: ").concat(((_a = this.storySettings.childPreferences.interests) === null || _a === void 0 ? void 0 : _a.join(", ")) || "None", ".\n5. The introduction of the story is engaging and appropriate\n6. There is some excitement in the story\n7. The ending is good\n\n**Story Outline**:\n").concat(storyOutline, "\n\n**Previous Text**:\n").concat(previousText, "\n\n**Current Page Text**:\n").concat(currentPage, "\n\nProvide constructive feedback and suggest improvements if necessary. If the page is good, respond with \"OK\". All responses should be in **").concat(this.storySettings.language, "**.");
                        return [4 /*yield*/, this.openai.generateCompletion(prompt, this.storySettings.models.feedbackModel, 16384, systemPrompt // Pass the system prompt
                            )];
                    case 1:
                        feedback = _b.sent();
                        console.log("Feedback received: ".concat(feedback));
                        return [2 /*return*/, feedback];
                }
            });
        });
    };
    StoryGenerator.prototype.summarizeStory = function (storySoFar) {
        return __awaiter(this, void 0, void 0, function () {
            var systemPrompt, prompt, summary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Summarizing the story so far for image prompt...");
                        systemPrompt = "You are an assistant that summarizes stories concisely in the specified language without adding any additional information or formatting.";
                        prompt = "Summarize the following story up to this point in **".concat(this.storySettings.language, "** in a concise manner (maximum 200 words):\n\n").concat(storySoFar);
                        return [4 /*yield*/, this.openai.generateCompletion(prompt, this.storySettings.models.generationModel, 500, systemPrompt // Pass the system prompt
                            )];
                    case 1:
                        summary = _a.sent();
                        console.log("Story summary generated.");
                        return [2 /*return*/, summary];
                }
            });
        });
    };
    StoryGenerator.prototype.generateCoverImage = function (storyOutline) {
        return __awaiter(this, void 0, void 0, function () {
            var MAX_RETRIES, RETRY_DELAY, retryCount, lastError, storySummary, coverImagePrompt, imageBuffer, imageBase64, error_1, openAIError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Generating cover image...");
                        MAX_RETRIES = 3;
                        RETRY_DELAY = 1000;
                        retryCount = 0;
                        lastError = "";
                        _a.label = 1;
                    case 1:
                        if (!(retryCount < MAX_RETRIES)) return [3 /*break*/, 9];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 8]);
                        return [4 /*yield*/, this.openai.generateCompletion("Generate a summary of the story: ".concat(storyOutline, "\n          ").concat(lastError
                                ? "Previous attempt failed with error: ".concat(lastError, ". Please adjust the summary accordingly.")
                                : ""), this.storySettings.models.generationModel, 1000, "You will generate a summary of a story to be used as an image prompt for a cover image. \n          The model in use will be dall-e-3. The summary should be a single paragraph that captures \n          the essence of the story. Keep the language simple and safe for children.\n          ".concat(lastError
                                ? "Please ensure the summary avoids content that could trigger the previous error."
                                : ""))];
                    case 3:
                        storySummary = _a.sent();
                        coverImagePrompt = "Create a child-friendly book cover for \"".concat(this.storySettings.title, "\".\n        Style requirements:\n        - Create a warm, inviting book cover design\n        - Use illustration style: ").concat(this.storySettings.illustrationStyle, "\n        - Make text clear and readable\n        - Keep the imagery appropriate for children\n        Story essence: ").concat(storySummary);
                        // Cap to 1000 characters
                        coverImagePrompt = coverImagePrompt.slice(0, 1000);
                        console.log("coverImagePrompt", coverImagePrompt);
                        return [4 /*yield*/, this.openai.generateImage(coverImagePrompt, {
                                size: "1792x1024",
                            })];
                    case 4:
                        imageBuffer = _a.sent();
                        imageBase64 = imageBuffer.toString("base64");
                        console.log("Cover image generated as Base64 string.");
                        return [2 /*return*/, imageBase64];
                    case 5:
                        error_1 = _a.sent();
                        openAIError = error_1;
                        console.error("Error generating cover image (attempt ".concat(retryCount + 1, "):"), openAIError);
                        lastError = openAIError.message || "Unknown error occurred";
                        if (!(openAIError.status === 400 && retryCount < MAX_RETRIES - 1)) return [3 /*break*/, 7];
                        retryCount++;
                        console.log("Retrying cover generation with attempt ".concat(retryCount + 1, "..."));
                        return [4 /*yield*/, delay(RETRY_DELAY)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 7: 
                    // If we've exhausted retries or it's a different error, throw it
                    throw error_1;
                    case 8: return [3 /*break*/, 1];
                    case 9: throw new Error("Failed to generate cover image after maximum retries");
                }
            });
        });
    };
    StoryGenerator.prototype.generateStory = function (onProgress, onOutline, onPageUpdate, onCoverGenerated) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, pageTimings, MAX_RETRIES, RETRY_DELAY, storyOutline, coverImageBase64, storyHasFinished, pageNumber, storySoFar, storySummary, pageStartTime, baseProgress, retryCount, success, currentSection, feedback, iterations, illustrationBase64, pageDuration, error_2, openAIError, totalDuration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        pageTimings = [];
                        MAX_RETRIES = 3;
                        RETRY_DELAY = 1000;
                        onProgress(5, "Generating story outline...");
                        return [4 /*yield*/, this.generateStoryOutline()];
                    case 1:
                        storyOutline = _a.sent();
                        onOutline === null || onOutline === void 0 ? void 0 : onOutline(storyOutline);
                        // Generate cover image right after outline
                        onProgress(15, "Creating cover image...");
                        return [4 /*yield*/, this.generateCoverImage(storyOutline)];
                    case 2:
                        coverImageBase64 = _a.sent();
                        onCoverGenerated === null || onCoverGenerated === void 0 ? void 0 : onCoverGenerated(coverImageBase64);
                        storyHasFinished = false;
                        pageNumber = 1;
                        storySoFar = "";
                        storySummary = "";
                        _a.label = 3;
                    case 3:
                        if (!(!storyHasFinished && pageNumber <= this.storySettings.numPages)) return [3 /*break*/, 19];
                        pageStartTime = Date.now();
                        console.log("\n--- Generating Page ".concat(pageNumber, " of ").concat(this.storySettings.numPages, " ---"));
                        baseProgress = 10 + ((pageNumber - 1) / this.storySettings.numPages) * 90;
                        retryCount = 0;
                        success = false;
                        _a.label = 4;
                    case 4:
                        if (!(retryCount < MAX_RETRIES && !success)) return [3 /*break*/, 18];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 14, , 17]);
                        onProgress(baseProgress, retryCount > 0
                            ? "Retrying page ".concat(pageNumber, " (attempt ").concat(retryCount + 1, ")...")
                            : "Generating page ".concat(pageNumber, " of ").concat(this.storySettings.numPages));
                        return [4 /*yield*/, this.generateNextPage(storyOutline, storySoFar, pageNumber)];
                    case 6:
                        currentSection = _a.sent();
                        onPageUpdate === null || onPageUpdate === void 0 ? void 0 : onPageUpdate(currentSection, null);
                        onProgress(baseProgress + 30 / this.storySettings.numPages, "Getting feedback for page ".concat(pageNumber, "..."));
                        return [4 /*yield*/, this.getFeedbackForPage(storyOutline, storySoFar, currentSection)];
                    case 7:
                        feedback = _a.sent();
                        iterations = 0;
                        _a.label = 8;
                    case 8:
                        if (!(feedback.toLowerCase() !== "ok" && iterations < 10)) return [3 /*break*/, 11];
                        onProgress(baseProgress + 30 / this.storySettings.numPages, "Revising page ".concat(pageNumber, " based on feedback (attempt ").concat(iterations + 1, ")..."));
                        return [4 /*yield*/, this.generateNextPage(storyOutline, storySoFar, pageNumber, feedback)];
                    case 9:
                        currentSection = _a.sent();
                        onProgress(baseProgress + 45 / this.storySettings.numPages, "Getting feedback for revision of page ".concat(pageNumber, "..."));
                        return [4 /*yield*/, this.getFeedbackForPage(storyOutline, storySoFar, currentSection)];
                    case 10:
                        feedback = _a.sent();
                        iterations += 1;
                        return [3 /*break*/, 8];
                    case 11:
                        // Generate illustration
                        onProgress(baseProgress + 60 / this.storySettings.numPages, "Generating illustration for page ".concat(pageNumber));
                        return [4 /*yield*/, this.generateIllustrationForPage(pageNumber, storySummary, currentSection)];
                    case 12:
                        illustrationBase64 = _a.sent();
                        // Update the UI with both text and image
                        onPageUpdate === null || onPageUpdate === void 0 ? void 0 : onPageUpdate(currentSection, illustrationBase64);
                        // Add the section to the pages array
                        this.pages.push({
                            text: currentSection,
                            illustrationBase64: illustrationBase64,
                        });
                        // Update story state
                        storySoFar += "\n".concat(currentSection);
                        return [4 /*yield*/, this.summarizeStory(storySoFar)];
                    case 13:
                        storySummary = _a.sent();
                        if (/the end/i.test(currentSection)) {
                            storyHasFinished = true;
                        }
                        pageDuration = Date.now() - pageStartTime;
                        pageTimings.push({ pageNum: pageNumber, duration: pageDuration });
                        console.log("Page ".concat(pageNumber, " generated in ").concat(formatTime(pageDuration)));
                        success = true;
                        pageNumber += 1;
                        return [3 /*break*/, 17];
                    case 14:
                        error_2 = _a.sent();
                        openAIError = error_2;
                        console.error("Error on page ".concat(pageNumber, " (attempt ").concat(retryCount + 1, "):"), openAIError);
                        if (!(openAIError.status === 400 && retryCount < MAX_RETRIES - 1)) return [3 /*break*/, 16];
                        retryCount++;
                        onProgress(baseProgress, "Safety system triggered. Retrying with different phrasing (attempt ".concat(retryCount + 1, ")..."));
                        return [4 /*yield*/, delay(RETRY_DELAY)];
                    case 15:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 16:
                        // If we've exhausted retries or it's a different error, throw it
                        onProgress(baseProgress, "Error generating page ".concat(pageNumber, ". Please try again."));
                        throw error_2;
                    case 17: return [3 /*break*/, 4];
                    case 18:
                        if (!success) {
                            return [3 /*break*/, 19];
                        }
                        return [3 /*break*/, 3];
                    case 19:
                        totalDuration = Date.now() - startTime;
                        console.log("\n--- Book Generation Summary ---");
                        console.log("Total time: ".concat(formatTime(totalDuration)));
                        console.log("Page-by-page timing:");
                        pageTimings.forEach(function (_a) {
                            var pageNum = _a.pageNum, duration = _a.duration;
                            console.log("Page ".concat(pageNum, ": ").concat(formatTime(duration)));
                        });
                        console.log("Average time per page: ".concat(formatTime(pageTimings.reduce(function (acc, curr) { return acc + curr.duration; }, 0) /
                            pageTimings.length)));
                        onProgress(100, "Book generation complete!");
                        return [2 /*return*/, {
                                id: this.storySettings.title,
                                title: this.storySettings.title,
                                coverImageBase64: coverImageBase64,
                                pages: this.pages,
                            }];
                }
            });
        });
    };
    return StoryGenerator;
}());
exports.StoryGenerator = StoryGenerator;
