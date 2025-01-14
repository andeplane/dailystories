import { Buffer } from "buffer";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ImageGenerationOptions {
  size: "1024x1024" | "1792x1024" | "1024x1792";
}

export abstract class LLMService {
  abstract generateCompletion(
    userPrompt: string,
    model: string,
    max_tokens?: number,
    systemPrompt?: string
  ): Promise<string>;

  abstract generateImage(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<Buffer>;
}
