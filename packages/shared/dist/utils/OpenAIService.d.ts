import { Buffer } from "buffer";
import { LLMService, ImageGenerationOptions } from "./LLMService";
export declare class OpenAIService extends LLMService {
    private openai;
    constructor(apiKey: string);
    generateCompletion(userPrompt: string, model: string, max_tokens?: number, systemPrompt?: string): Promise<string>;
    generateImage(prompt: string, options?: ImageGenerationOptions): Promise<Buffer>;
}
