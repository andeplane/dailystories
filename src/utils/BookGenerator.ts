// src/utils/BookGenerator.ts

import { OpenAIService } from "./OpenAIService";
import { Page } from "../types/Book";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface OpenAIError extends Error {
  status?: number;
  message: string;
}

export interface BookSettings {
  title: string;
  childName: string;
  childAge: number;
  childPreferences: {
    colors?: string[];
    interests?: string[];
  };
  otherCharacters?: { name: string; age: number; description: string }[];
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

const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
};

export class BookGenerator {
  private openai: OpenAIService;
  private bookSettings: BookSettings;
  private pages: Page[] = [];
  private storyOutline: string = "";
  private storySoFar: string = "";
  private storySummary: string = "";

  constructor(bookSettings: BookSettings) {
    this.openai = new OpenAIService(bookSettings.openAIApiKey);
    this.bookSettings = bookSettings;
  }

  async generateStoryOutline() {
    console.log("Generating story outline...");

    // Define a system prompt for generating the story outline
    const systemPrompt = `You are an assistant that creates detailed story outlines for children's books. Ensure the outline includes the beginning, middle, and end, and is appropriate for the child's age and interests. Write the outline entirely in the specified language without any additional formatting or headers.`;

    const prompt = `Create a detailed story outline for a children's book in **${
      this.bookSettings.language
    }** based on the following settings:
- **Child's Name**: ${this.bookSettings.childName}
- **Age**: ${this.bookSettings.childAge}
- **Preferences**: Colors - ${
      this.bookSettings.childPreferences.colors?.join(", ") || "None"
    }, Interests - ${
      this.bookSettings.childPreferences.interests?.join(", ") || "None"
    }
- **Other Characters**: ${
      this.bookSettings.otherCharacters
        ?.map((c) => `${c.name}: ${c.description}`)
        .join("; ") || "None"
    }
- **Theme**: ${this.bookSettings.bookTheme}
- **Storyline Instructions**: ${
      this.bookSettings.storylineInstructions || "None"
    }
- **Total Number of Pages**: ${this.bookSettings.numPages}

The outline should include the beginning, middle, and end of the story, ensuring it is appropriate for the child's age and interests. The pacing should be suitable for a book with **${
      this.bookSettings.numPages
    }** pages. Write the outline entirely in **${
      this.bookSettings.language
    }**.`;

    const outline = await this.openai.generateCompletion(
      prompt,
      this.bookSettings.models.outlineModel,
      16384,
      systemPrompt // Pass the system prompt
    );

    console.log("Story outline generated and saved to storyOutline.txt.");
    return outline;
  }

  async generateNextPage(
    storyOutline: string,
    storySoFar: string,
    pageNumber: number,
    feedback?: string,
    previousPageText?: string
  ): Promise<string> {
    console.log("Generating the next section...");

    // Define a system prompt for generating section text
    const systemPrompt = `You are an assistant that writes text for sections of a children's book. Ensure that each section contains only the narrative text without any headers, titles, or additional formatting. Write in the specified language and style, appropriate for the target age.`;

    let prompt = `Generate section ${pageNumber} of a children's book in **${this.bookSettings.language}** based on the following settings:

**Story Outline**:
${storyOutline}

**Story So Far**:
${storySoFar}

Ensure the language is appropriate for a ${this.bookSettings.childAge}-year-old child.

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
    } else {
      console.log(
        "No feedback to incorporate, generating the next section normally."
      );
      prompt += `Provide the text for page ${pageNumber}:
`;
    }

    // Inform the model about the total number of sections and the current section
    prompt += `\n**Page Information**:
- **Current Page**: ${pageNumber}
- **Total Pages**: ${this.bookSettings.numPages} (if applicable)

Ensure that the story progresses naturally towards the conclusion.`;

    const nextSection = await this.openai.generateCompletion(
      prompt,
      this.bookSettings.models.generationModel,
      16384,
      systemPrompt // Pass the system prompt
    );
    console.log("Next section generated.");
    return nextSection;
  }

  async generateIllustrationForPage(
    pageNumber: number,
    storySummary: string,
    currentPageText: string
  ): Promise<string> {
    console.log(`Generating illustration for page ${pageNumber}...`);

    // Combine the story summary and current section text
    const combinedText = `Summary of the story so far: ${storySummary}\n\nCurrent page text: ${currentPageText}`;

    const illustrationStylePrompt = `The illustration should be in the **${this.bookSettings.illustrationStyle}** style, colorful, and appealing to a ${this.bookSettings.childAge}-year-old child`;

    let prompt = `Generate an image for the current page of a children's book. Only generate image as the user cannot read.
${combinedText}
${illustrationStylePrompt}`;

    // Generate the image using the description
    const imageBuffer = await this.openai.generateImage(prompt, "1024x1024");

    // Convert image buffer to Base64 string
    const imageBase64 = imageBuffer.toString("base64");
    console.log(
      `Illustration for page ${pageNumber} generated as Base64 string.`
    );
    return imageBase64;
  }

  async getFeedbackForPage(
    storyOutline: string,
    previousText: string,
    currentPage: string
  ): Promise<string> {
    console.log("Requesting feedback for the current page...");

    // Define a system prompt for providing feedback
    const systemPrompt = `You are an assistant that provides constructive feedback on pages of a children's book. Ensure the feedback is clear, concise, and in the specified language. Do not include any additional text or formatting beyond the feedback.`;

    const prompt = `You are an assistant that provides feedback on a page of a children's book written in **${
      this.bookSettings.language
    }**.
Ensure that:
1. The page follows the overall story outline.
2. The language is coherent and appropriate for the target age (${
      this.bookSettings.childAge
    }).
3. The concepts are neither too simple nor too complicated.
4. The page engages the child's interests: ${
      this.bookSettings.childPreferences.interests?.join(", ") || "None"
    }.
5. The introduction of the story is engaging and appropriate
6. There is some excitement in the story
7. The ending is good

**Story Outline**:
${storyOutline}

**Previous Text**:
${previousText}

**Current Page Text**:
${currentPage}

Provide constructive feedback and suggest improvements if necessary. If the page is good, respond with "OK". All responses should be in **${
      this.bookSettings.language
    }**.`;

    const feedback = await this.openai.generateCompletion(
      prompt,
      this.bookSettings.models.feedbackModel,
      16384,
      systemPrompt // Pass the system prompt
    );
    console.log(`Feedback received: ${feedback}`);
    return feedback;
  }

  async summarizeStory(storySoFar: string): Promise<string> {
    console.log("Summarizing the story so far for image prompt...");

    // Define a system prompt for summarizing the story
    const systemPrompt = `You are an assistant that summarizes stories concisely in the specified language without adding any additional information or formatting.`;

    const prompt = `Summarize the following story up to this point in **${this.bookSettings.language}** in a concise manner (maximum 200 words):

${storySoFar}`;

    const summary = await this.openai.generateCompletion(
      prompt,
      this.bookSettings.models.generationModel,
      500,
      systemPrompt // Pass the system prompt
    );
    console.log(`Story summary generated.`);
    return summary;
  }

  async generateCoverImage(storyOutline: string): Promise<string> {
    console.log("Generating cover image...");

    // Get full story text and generate a summary
    const storySummary = await this.openai.generateCompletion(
      `Generate a summary of the story: ${storyOutline}`,
      this.bookSettings.models.generationModel,
      1000,
      `You will generate a summary of a story to be used as an image prompt for a cover image. 
      The model in use will be dall-e-3. The summary should be a single paragraph that captures 
      the essence of the story.`
    );

    // Create the cover image prompt
    let coverImagePrompt = `Generate a cover image for the children's book titled "${this.bookSettings.title}".
    Style requirements:
    - Generate image as a book cover, including the book itself
    - Illustration style: ${this.bookSettings.illustrationStyle}
    - Make it colorful and appealing to a ${this.bookSettings.childAge}-year-old child
    - Should be eye-catching and suitable for a book cover
    - Include visual elements that represent key themes from the story
    - Text should be clear and readable
    Story summary: ${storySummary}`;

    // Cap to 1000 characters
    coverImagePrompt = coverImagePrompt.slice(0, 1000);

    const imageBuffer = await this.openai.generateImage(
      coverImagePrompt,
      "1792x1024"
    );
    const imageBase64 = imageBuffer.toString("base64");
    console.log("Cover image generated as Base64 string.");
    return imageBase64;
  }

  async generateBook(
    onProgress: (progress: number, message: string) => void,
    onOutline?: (outline: string) => void,
    onPageUpdate?: (text: string, image: string | null) => void,
    onCoverGenerated?: (coverImage: string) => void
  ) {
    const startTime = Date.now();
    const pageTimings: { pageNum: number; duration: number }[] = [];

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    onProgress(5, "Generating story outline...");
    const storyOutline = await this.generateStoryOutline();
    onOutline?.(storyOutline);

    // Generate cover image right after outline
    onProgress(15, "Creating cover image...");
    const coverImageBase64 = await this.generateCoverImage(storyOutline);
    onCoverGenerated?.(coverImageBase64);

    let storyHasFinished = false;
    let pageNumber = 1;
    let storySoFar = "";
    let storySummary = "";

    // Generate all story pages first
    while (!storyHasFinished && pageNumber <= this.bookSettings.numPages) {
      const pageStartTime = Date.now();

      console.log(
        `\n--- Generating Page ${pageNumber} of ${this.bookSettings.numPages} ---`
      );
      const baseProgress =
        10 + ((pageNumber - 1) / this.bookSettings.numPages) * 90;

      let retryCount = 0;
      let success = false;

      while (retryCount < MAX_RETRIES && !success) {
        try {
          onProgress(
            baseProgress,
            retryCount > 0
              ? `Retrying page ${pageNumber} (attempt ${retryCount + 1})...`
              : `Generating page ${pageNumber} of ${this.bookSettings.numPages}`
          );

          // Generate the next section
          let currentSection = await this.generateNextPage(
            storyOutline,
            storySoFar,
            pageNumber
          );

          onPageUpdate?.(currentSection, null);

          onProgress(
            baseProgress + 30 / this.bookSettings.numPages,
            `Getting feedback for page ${pageNumber}...`
          );

          // Get feedback for the current section
          let feedback = await this.getFeedbackForPage(
            storyOutline,
            storySoFar,
            currentSection
          );

          // Iterate if feedback is not OK
          let iterations = 0;
          while (feedback.toLowerCase() !== "ok" && iterations < 10) {
            onProgress(
              baseProgress + 30 / this.bookSettings.numPages,
              `Revising page ${pageNumber} based on feedback (attempt ${
                iterations + 1
              })...`
            );

            currentSection = await this.generateNextPage(
              storyOutline,
              storySoFar,
              pageNumber,
              feedback
            );

            onProgress(
              baseProgress + 45 / this.bookSettings.numPages,
              `Getting feedback for revision of page ${pageNumber}...`
            );

            feedback = await this.getFeedbackForPage(
              storyOutline,
              storySoFar,
              currentSection
            );
            iterations += 1;
          }

          // Generate illustration
          onProgress(
            baseProgress + 60 / this.bookSettings.numPages,
            `Generating illustration for page ${pageNumber}`
          );

          const illustrationBase64 = await this.generateIllustrationForPage(
            pageNumber,
            storySummary,
            currentSection
          );

          // Update the UI with both text and image
          onPageUpdate?.(currentSection, illustrationBase64);

          // Add the section to the pages array
          this.pages.push({
            text: currentSection,
            illustrationBase64: illustrationBase64,
          });

          // Update story state
          storySoFar += `\n${currentSection}`;
          storySummary = await this.summarizeStory(storySoFar);

          if (/the end/i.test(currentSection)) {
            storyHasFinished = true;
          }

          const pageDuration = Date.now() - pageStartTime;
          pageTimings.push({ pageNum: pageNumber, duration: pageDuration });
          console.log(
            `Page ${pageNumber} generated in ${formatTime(pageDuration)}`
          );

          success = true;
          pageNumber += 1;
        } catch (error) {
          const openAIError = error as OpenAIError;
          console.error(
            `Error on page ${pageNumber} (attempt ${retryCount + 1}):`,
            openAIError
          );

          if (openAIError.status === 400 && retryCount < MAX_RETRIES - 1) {
            retryCount++;
            onProgress(
              baseProgress,
              `Safety system triggered. Retrying with different phrasing (attempt ${
                retryCount + 1
              })...`
            );
            await delay(RETRY_DELAY);
            continue;
          }

          // If we've exhausted retries or it's a different error, throw it
          onProgress(
            baseProgress,
            `Error generating page ${pageNumber}. Please try again.`
          );
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
    console.log(
      `Average time per page: ${formatTime(
        pageTimings.reduce((acc, curr) => acc + curr.duration, 0) /
          pageTimings.length
      )}`
    );

    onProgress(100, "Book generation complete!");

    return {
      id: this.bookSettings.title,
      title: this.bookSettings.title,
      coverImageBase64: coverImageBase64,
      pages: this.pages,
    };
  }
}
