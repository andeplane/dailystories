import OpenAI from "openai";
import { Buffer } from "buffer";
import { LLMService, ImageGenerationOptions } from "./LLMService";

// Make it globally available if needed:
(window as any).Buffer = Buffer;

export class OpenAIService extends LLMService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    super(apiKey);
    this.openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });
  }

  async generateCompletion(
    userPrompt: string,
    model: string,
    max_tokens: number = 16384,
    systemPrompt?: string
  ): Promise<string> {
    try {
      const systemPromptRole = model === "o1-preview" ? "user" : "system";
      const maxTokensParamterName =
        model === "o1-preview" ? "max_completion_tokens" : "max_tokens";
      const temperature = model === "o1-preview" ? 1 : 0.7;

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      if (systemPrompt) {
        messages.push({ role: systemPromptRole, content: systemPrompt });
      }

      messages.push({ role: "user", content: userPrompt });

      const response = await this.openai.chat.completions.create({
        model: model,
        temperature: temperature,
        messages: messages,
        [maxTokensParamterName]: max_tokens,
      });
      return response.choices[0].message.content?.trim() || "";
    } catch (error: any) {
      console.error(
        "Error generating completion:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = { size: "1024x1024" }
  ): Promise<Buffer> {
    try {
      const response = await this.openai.images.generate({
        prompt: prompt,
        model: "dall-e-3",
        n: 1,
        size: options.size,
        response_format: "b64_json",
      });
      const imageData = response.data[0].b64_json;
      const buffer = Buffer.from(imageData!, "base64");
      return buffer;
    } catch (error: any) {
      console.error(
        "Error generating image:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}
