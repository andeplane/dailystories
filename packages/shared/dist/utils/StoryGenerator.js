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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryGenerator = void 0;
const OpenAIService_1 = require("./OpenAIService");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
};
class StoryGenerator {
    constructor(bookSettings) {
        this.pages = [];
        this.storyOutline = "";
        this.storySoFar = "";
        this.storySummary = "";
        this.openai = new OpenAIService_1.OpenAIService(bookSettings.openAIApiKey);
        this.storySettings = bookSettings;
    }
    generateStoryOutline() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Generating story outline...");
            // Define a system prompt for generating the story outline
            const systemPrompt = `You are an assistant that creates detailed story outlines for children's books. Ensure the outline includes the beginning, middle, and end, and is appropriate for the child's age and interests. Write the outline entirely in the specified language without any additional formatting or headers.`;
            const prompt = `Create a detailed story outline for a children's book in **${this.storySettings.language}** based on the following settings:
- **Child's Name**: ${this.storySettings.childName}
- **Age**: ${this.storySettings.childAge}
- **Preferences**: Colors - ${((_a = this.storySettings.childPreferences.colors) === null || _a === void 0 ? void 0 : _a.join(", ")) || "None"}, Interests - ${((_b = this.storySettings.childPreferences.interests) === null || _b === void 0 ? void 0 : _b.join(", ")) || "None"}
- **Other Characters**: ${((_c = this.storySettings.otherCharacters) === null || _c === void 0 ? void 0 : _c.map((c) => `${c.name}: ${c.description}`).join("; ")) || "None"}
- **Theme**: ${this.storySettings.bookTheme}
- **Storyline Instructions**: ${this.storySettings.storylineInstructions || "None"}
- **Total Number of Pages**: ${this.storySettings.numPages}

The outline should include the beginning, middle, and end of the story, ensuring it is appropriate for the child's age and interests. The pacing should be suitable for a book with **${this.storySettings.numPages}** pages. Write the outline entirely in **${this.storySettings.language}**.`;
            const outline = yield this.openai.generateCompletion(prompt, this.storySettings.models.outlineModel, 16384, systemPrompt // Pass the system prompt
            );
            console.log("Story outline generated and saved to storyOutline.txt.");
            return outline;
        });
    }
    generateNextPage(storyOutline, storySoFar, pageNumber, feedback, previousPageText) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Generating the next section...");
            // Define a system prompt for generating section text
            const systemPrompt = `You are an assistant that writes text for sections of a children's book. Ensure that each section contains only the narrative text without any headers, titles, or additional formatting. Write in the specified language and style, appropriate for the target age.`;
            let prompt = `Generate section ${pageNumber} of a children's book in **${this.storySettings.language}** based on the following settings:

**Story Outline**:
${storyOutline}

**Story So Far**:
${storySoFar}

Ensure the language is appropriate for a ${this.storySettings.childAge}-year-old child.

Only write the text for this section, no metadata or other text.
`;
            if (feedback && feedback.toLowerCase() !== "ok") {
                console.log("Incorporating feedback into the next section generation...");
                prompt += `Based on the following feedback, improve the section:

**Feedback**:
${feedback}

**Previous Page Text Attempt**:
${previousPageText}
`;
            }
            else {
                console.log("No feedback to incorporate, generating the next section normally.");
                prompt += `Provide the text for page ${pageNumber}:
`;
            }
            // Inform the model about the total number of sections and the current section
            prompt += `\n**Page Information**:
- **Current Page**: ${pageNumber}
- **Total Pages**: ${this.storySettings.numPages} (if applicable)

Ensure that the story progresses naturally towards the conclusion.`;
            const nextSection = yield this.openai.generateCompletion(prompt, this.storySettings.models.generationModel, 16384, systemPrompt // Pass the system prompt
            );
            console.log("Next section generated.");
            return nextSection;
        });
    }
    generateIllustrationForPage(pageNumber, storySummary, currentPageText) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Generating illustration for page ${pageNumber}...`);
            // Combine the story summary and current section text
            const combinedText = `Summary of the story so far: ${storySummary}\n\nCurrent page text: ${currentPageText}`;
            const illustrationStylePrompt = `
    Illustration style: ${this.storySettings.illustrationStyle}
    Appealing to a ${this.storySettings.childAge}-year-old child.
    NO TEXT IN THE IMAGE.
    `;
            let prompt = `Generate an image for the current page of a children's book.
${combinedText}
${illustrationStylePrompt}`;
            // Generate the image using the description
            const imageBuffer = yield this.openai.generateImage(prompt, {
                size: "1024x1024",
            });
            // Convert image buffer to Base64 string
            const imageBase64 = imageBuffer.toString("base64");
            console.log(`Illustration for page ${pageNumber} generated as Base64 string.`);
            return imageBase64;
        });
    }
    getFeedbackForPage(storyOutline, previousText, currentPage) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Requesting feedback for the current page...");
            // Define a system prompt for providing feedback
            const systemPrompt = `You are an assistant that provides constructive feedback on pages of a children's book. Ensure the feedback is clear, concise, and in the specified language. Do not include any additional text or formatting beyond the feedback.`;
            const prompt = `You are an assistant that provides feedback on a page of a children's book written in **${this.storySettings.language}**.
Ensure that:
1. The page follows the overall story outline.
2. The language is coherent and appropriate for the target age (${this.storySettings.childAge}).
3. The concepts are neither too simple nor too complicated.
4. The page engages the child's interests: ${((_a = this.storySettings.childPreferences.interests) === null || _a === void 0 ? void 0 : _a.join(", ")) || "None"}.
5. The introduction of the story is engaging and appropriate
6. There is some excitement in the story
7. The ending is good

**Story Outline**:
${storyOutline}

**Previous Text**:
${previousText}

**Current Page Text**:
${currentPage}

Provide constructive feedback and suggest improvements if necessary. If the page is good, respond with "OK". All responses should be in **${this.storySettings.language}**.`;
            const feedback = yield this.openai.generateCompletion(prompt, this.storySettings.models.feedbackModel, 16384, systemPrompt // Pass the system prompt
            );
            console.log(`Feedback received: ${feedback}`);
            return feedback;
        });
    }
    summarizeStory(storySoFar) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Summarizing the story so far for image prompt...");
            // Define a system prompt for summarizing the story
            const systemPrompt = `You are an assistant that summarizes stories concisely in the specified language without adding any additional information or formatting.`;
            const prompt = `Summarize the following story up to this point in **${this.storySettings.language}** in a concise manner (maximum 200 words):

${storySoFar}`;
            const summary = yield this.openai.generateCompletion(prompt, this.storySettings.models.generationModel, 500, systemPrompt // Pass the system prompt
            );
            console.log(`Story summary generated.`);
            return summary;
        });
    }
    generateCoverImage(storyOutline) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Generating cover image...");
            const MAX_RETRIES = 3;
            const RETRY_DELAY = 1000;
            let retryCount = 0;
            let lastError = "";
            while (retryCount < MAX_RETRIES) {
                try {
                    // Get full story text and generate a summary
                    const storySummary = yield this.openai.generateCompletion(`Generate a summary of the story: ${storyOutline}
          ${lastError
                        ? `Previous attempt failed with error: ${lastError}. Please adjust the summary accordingly.`
                        : ""}`, this.storySettings.models.generationModel, 1000, `You will generate a summary of a story to be used as an image prompt for a cover image. 
          The model in use will be dall-e-3. The summary should be a single paragraph that captures 
          the essence of the story. Keep the language simple and safe for children.
          ${lastError
                        ? "Please ensure the summary avoids content that could trigger the previous error."
                        : ""}`);
                    // Create the cover image prompt with safer language
                    let coverImagePrompt = `Create a child-friendly book cover for "${this.storySettings.title}".
        Style requirements:
        - Create a warm, inviting book cover design
        - Use illustration style: ${this.storySettings.illustrationStyle}
        - Make text clear and readable
        - Keep the imagery appropriate for children
        Story essence: ${storySummary}`;
                    // Cap to 1000 characters
                    coverImagePrompt = coverImagePrompt.slice(0, 1000);
                    console.log("coverImagePrompt", coverImagePrompt);
                    const imageBuffer = yield this.openai.generateImage(coverImagePrompt, {
                        size: "1792x1024",
                    });
                    const imageBase64 = imageBuffer.toString("base64");
                    console.log("Cover image generated as Base64 string.");
                    return imageBase64;
                }
                catch (error) {
                    const openAIError = error;
                    console.error(`Error generating cover image (attempt ${retryCount + 1}):`, openAIError);
                    lastError = openAIError.message || "Unknown error occurred";
                    if (openAIError.status === 400 && retryCount < MAX_RETRIES - 1) {
                        retryCount++;
                        console.log(`Retrying cover generation with attempt ${retryCount + 1}...`);
                        yield delay(RETRY_DELAY);
                        continue;
                    }
                    // If we've exhausted retries or it's a different error, throw it
                    throw error;
                }
            }
            throw new Error("Failed to generate cover image after maximum retries");
        });
    }
    generateStory(onProgress, onOutline, onPageUpdate, onCoverGenerated) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            const pageTimings = [];
            const MAX_RETRIES = 3;
            const RETRY_DELAY = 1000;
            onProgress(5, "Generating story outline...");
            const storyOutline = yield this.generateStoryOutline();
            onOutline === null || onOutline === void 0 ? void 0 : onOutline(storyOutline);
            // Generate cover image right after outline
            onProgress(15, "Creating cover image...");
            const coverImageBase64 = yield this.generateCoverImage(storyOutline);
            onCoverGenerated === null || onCoverGenerated === void 0 ? void 0 : onCoverGenerated(coverImageBase64);
            let storyHasFinished = false;
            let pageNumber = 1;
            let storySoFar = "";
            let storySummary = "";
            // Generate all story pages first
            while (!storyHasFinished && pageNumber <= this.storySettings.numPages) {
                const pageStartTime = Date.now();
                console.log(`\n--- Generating Page ${pageNumber} of ${this.storySettings.numPages} ---`);
                const baseProgress = 10 + ((pageNumber - 1) / this.storySettings.numPages) * 90;
                let retryCount = 0;
                let success = false;
                while (retryCount < MAX_RETRIES && !success) {
                    try {
                        onProgress(baseProgress, retryCount > 0
                            ? `Retrying page ${pageNumber} (attempt ${retryCount + 1})...`
                            : `Generating page ${pageNumber} of ${this.storySettings.numPages}`);
                        // Generate the next section
                        let currentSection = yield this.generateNextPage(storyOutline, storySoFar, pageNumber);
                        onPageUpdate === null || onPageUpdate === void 0 ? void 0 : onPageUpdate(currentSection, null);
                        onProgress(baseProgress + 30 / this.storySettings.numPages, `Getting feedback for page ${pageNumber}...`);
                        // Get feedback for the current section
                        let feedback = yield this.getFeedbackForPage(storyOutline, storySoFar, currentSection);
                        // Iterate if feedback is not OK
                        let iterations = 0;
                        while (feedback.toLowerCase() !== "ok" && iterations < 10) {
                            onProgress(baseProgress + 30 / this.storySettings.numPages, `Revising page ${pageNumber} based on feedback (attempt ${iterations + 1})...`);
                            currentSection = yield this.generateNextPage(storyOutline, storySoFar, pageNumber, feedback);
                            onProgress(baseProgress + 45 / this.storySettings.numPages, `Getting feedback for revision of page ${pageNumber}...`);
                            feedback = yield this.getFeedbackForPage(storyOutline, storySoFar, currentSection);
                            iterations += 1;
                        }
                        // Generate illustration
                        onProgress(baseProgress + 60 / this.storySettings.numPages, `Generating illustration for page ${pageNumber}`);
                        const illustrationBase64 = yield this.generateIllustrationForPage(pageNumber, storySummary, currentSection);
                        // Update the UI with both text and image
                        onPageUpdate === null || onPageUpdate === void 0 ? void 0 : onPageUpdate(currentSection, illustrationBase64);
                        // Add the section to the pages array
                        this.pages.push({
                            text: currentSection,
                            illustrationBase64: illustrationBase64,
                        });
                        // Update story state
                        storySoFar += `\n${currentSection}`;
                        storySummary = yield this.summarizeStory(storySoFar);
                        if (/the end/i.test(currentSection)) {
                            storyHasFinished = true;
                        }
                        const pageDuration = Date.now() - pageStartTime;
                        pageTimings.push({ pageNum: pageNumber, duration: pageDuration });
                        console.log(`Page ${pageNumber} generated in ${formatTime(pageDuration)}`);
                        success = true;
                        pageNumber += 1;
                    }
                    catch (error) {
                        const openAIError = error;
                        console.error(`Error on page ${pageNumber} (attempt ${retryCount + 1}):`, openAIError);
                        if (openAIError.status === 400 && retryCount < MAX_RETRIES - 1) {
                            retryCount++;
                            onProgress(baseProgress, `Safety system triggered. Retrying with different phrasing (attempt ${retryCount + 1})...`);
                            yield delay(RETRY_DELAY);
                            continue;
                        }
                        // If we've exhausted retries or it's a different error, throw it
                        onProgress(baseProgress, `Error generating page ${pageNumber}. Please try again.`);
                        throw error;
                    }
                }
                if (!success) {
                    break;
                }
            }
            // Final progress update
            const totalDuration = Date.now() - startTime;
            console.log("\n--- Book Generation Summary ---");
            console.log(`Total time: ${formatTime(totalDuration)}`);
            console.log("Page-by-page timing:");
            pageTimings.forEach(({ pageNum, duration }) => {
                console.log(`Page ${pageNum}: ${formatTime(duration)}`);
            });
            console.log(`Average time per page: ${formatTime(pageTimings.reduce((acc, curr) => acc + curr.duration, 0) /
                pageTimings.length)}`);
            onProgress(100, "Book generation complete!");
            return {
                id: this.storySettings.title,
                title: this.storySettings.title,
                coverImageBase64: coverImageBase64,
                pages: this.pages,
            };
        });
    }
}
exports.StoryGenerator = StoryGenerator;
