// src/utils/BookGenerator.ts

import { OpenAIService } from "./OpenAIService";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import path from "path";

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

export interface Page {
  text: string;
  illustrationBase64: string;
}

// Utility Function to Format ISO Date without Milliseconds
function formatISODate(date: Date): string {
  return date.toISOString().split(".")[0] + "Z";
}

/**
 * Sanitizes a string for XML by escaping special characters.
 * @param str The input string.
 * @returns The sanitized string.
 */
function sanitizeForXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateUUID(): string {
  return crypto.randomUUID();
}

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

  /**
   * Generates an EPUB file from the generated pages with embedded Base64 images.
   * @param pages Array of Page objects containing text and Base64-encoded illustrations.
   */
  async generateEPUB(pages: Page[]): Promise<Blob> {
    console.log("Starting EPUB generation...");

    const zip = new JSZip();

    // 1. Add mimetype file (must be the first file and uncompressed)
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

    // 2. META-INF/container.xml
    const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
  <container version="1.0"
             xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
     <rootfiles>
        <rootfile full-path="OEBPS/content.opf"
                  media-type="application/oebps-package+xml"/>
     </rootfiles>
  </container>`;
    zip.folder("META-INF")!.file("container.xml", containerXml);

    // 3. OEBPS/content.opf
    const formattedDate = formatISODate(new Date());
    const metadata = `<metadata xmlns="http://www.idpf.org/2007/opf"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:dcterms="http://purl.org/dc/terms/"
            xmlns:opf="http://www.idpf.org/2007/opf"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dc:title>${sanitizeForXML(this.bookSettings.title)}</dc:title>
    <dc:language>${sanitizeForXML(this.bookSettings.language)}</dc:language>
    <dc:identifier id="BookId">urn:uuid:${generateUUID()}</dc:identifier>
    <dc:creator>${sanitizeForXML(
      `${this.bookSettings.childName}'s Author`
    )}</dc:creator>
    <dc:date>${formattedDate}</dc:date>
    <meta property="dcterms:modified">${formattedDate}</meta>
  </metadata>`;

    const manifestItems = `
      <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
      <item id="css" href="styles.css" media-type="text/css"/>
      <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
    `;

    const spineItems = `<itemref idref="content"/>`;

    const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
  <package xmlns="http://www.idpf.org/2007/opf"
           unique-identifier="BookId"
           version="3.0">
    ${metadata}
    <manifest>${manifestItems}</manifest>
    <spine>${spineItems}</spine>
  </package>`;
    zip.folder("OEBPS")!.file("content.opf", contentOpf);

    // 4. OEBPS/nav.xhtml
    const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml"
        xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <title>Table of Contents</title>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>Table of Contents</h1>
      <ol>
        <li><a href="content.xhtml">Content</a></li>
      </ol>
    </nav>
  </body>
  </html>`;
    zip.folder("OEBPS")!.file("nav.xhtml", navXhtml);

    // 5. OEBPS/content.xhtml with the title page
    let contentXhtml = `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>${sanitizeForXML(this.bookSettings.title)}</title>
    <link rel="stylesheet" type="text/css" href="styles.css"/>
  </head>
  <body>
    <div class="title-page">
      <h1>${sanitizeForXML(this.bookSettings.title)}</h1>
    </div>
  `;

    // Append pages
    pages.forEach((page, i) => {
      contentXhtml += `
        <div class="section">
          <p>${sanitizeForXML(page.text).replace(/\n/g, "<br/>")}</p>
        </div>
        <div class="illustration">
          ${
            page.illustrationBase64
              ? `<img src="data:image/png;base64,${
                  page.illustrationBase64
                }" alt="Illustration for page ${i + 1}" />`
              : ""
          }
        </div>
      `;
    });

    contentXhtml += `
  </body>
  </html>`;
    zip.folder("OEBPS")!.file("content.xhtml", contentXhtml);

    // 6. CSS file
    const stylesCss = `
  body {
    font-family: Arial, sans-serif;
    margin: 20px;
    // background: linear-gradient(to bottom right, #f0f8ff, #e6e6fa);
    // // Soft Sunset
    // background: linear-gradient(to bottom right, #ffe5b4, #ff7e5f);
    // // Ocean Waves
    background: linear-gradient(to bottom right, #a1c4fd, #c2e9fb);
    // // Mint Green
    // background: linear-gradient(to bottom right, #d4fc79, #96e6a1);
    // // Lavender Dreams
    // background: linear-gradient(to bottom right, #e0c3fc, #8ec5fc);

  }
  h1 {
    font-size: 48px;
    font-weight: bold;
  }
  .title-page {
    text-align: center;
    margin-bottom: 40px;
  }
  .section {
    margin-bottom: 40px;
    font-size: 22px;
  }
  .illustration {
    text-align: center;
    margin-bottom: 40px;
  }

  .illustration img {
    width: 100% !important;
    max-width: none !important; /* Override the max-width from epub.js */
    height: auto; /* Maintain aspect ratio */
    display: block; /* Remove inline spacing issues */
    margin: 0; /* Remove any default margin */
    padding: 0; /* Remove any default padding */
  }`;

    zip.folder("OEBPS")!.file("styles.css", stylesCss);
    // 7. Generate the EPUB
    const epubBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    return epubBlob;
  }

  async generateBook(onProgress: (progress: number, message: string) => void) {
    onProgress(10, "Generating story outline...");
    const storyOutline = await this.generateStoryOutline();
    let storyHasFinished = false;
    let pageNumber = 1;
    let storySoFar = "";
    let storySummary = "";

    while (!storyHasFinished && pageNumber <= this.bookSettings.numPages) {
      console.log(
        `\n--- Generating Page ${pageNumber} of ${this.bookSettings.numPages} ---`
      );
      onProgress(
        10 + ((pageNumber - 1) / this.bookSettings.numPages) * 90,
        `Generating page ${pageNumber} of ${this.bookSettings.numPages}`
      );
      //   try {
      // Generate the next section
      let currentSection = await this.generateNextPage(
        storyOutline,
        storySoFar,
        pageNumber
      );
      console.log(`Page ${pageNumber} text generated.`);

      // Get feedback for the current section
      let feedback = await this.getFeedbackForPage(
        storyOutline,
        storySoFar,
        currentSection
      );

      // Iterate if feedback is not OK
      let iterations = 0;
      while (feedback.toLowerCase() !== "ok" && iterations < 10) {
        console.log(
          `Got feedback ${
            iterations + 1
          } for page ${pageNumber}. Attempting to revise...`
        );
        currentSection = await this.generateNextPage(
          storyOutline,
          storySoFar,
          pageNumber,
          feedback
        );
        console.log(`Page ${pageNumber} revised.`);
        feedback = await this.getFeedbackForPage(
          storyOutline,
          storySoFar,
          currentSection
        );
        iterations += 1;
      }

      if (feedback.toLowerCase() !== "ok") {
        console.log(
          `Failed to generate a satisfactory section after ${iterations} attempts. Ending story.`
        );
        break;
      } else {
        console.log(
          `Page ${pageNumber} approved after ${iterations} ${
            iterations === 1 ? "iteration" : "iterations"
          }.`
        );
      }

      // Check if the section indicates the end of the story
      if (/the end/i.test(currentSection)) {
        console.log(`"The end" detected in page ${pageNumber}. Ending story.`);
        storyHasFinished = true;
      }

      // Generate or update the story summary
      storySummary = await this.summarizeStory(
        storySoFar + "\n" + currentSection
      );

      // Update storySoFar
      storySoFar += `\n${currentSection}`;

      onProgress(
        10 + ((pageNumber - 0.5) / this.bookSettings.numPages) * 90,
        `Generating illustration for page ${pageNumber}`
      );
      // Generate illustration for the section
      const illustrationBase64 = await this.generateIllustrationForPage(
        pageNumber,
        storySummary,
        currentSection
      );

      // Add the section to the sections array with illustrationBase64
      this.pages.push({
        text: currentSection,
        illustrationBase64: illustrationBase64,
      });

      console.log(`Page ${pageNumber} completed.\n`);
      pageNumber += 1;
      //   } catch (error) {
      //     console.error(`Error generating page ${pageNumber}:`, error);
      //     break;
      //   }
    }

    // Generate EPUB
    const epubBlob = await this.generateEPUB(this.pages);
    saveAs(epubBlob, `${this.bookSettings.title}.epub`);
    return epubBlob;
  }
}
