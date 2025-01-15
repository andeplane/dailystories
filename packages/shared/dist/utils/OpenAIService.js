"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const openai_1 = __importDefault(require("openai"));
const buffer_1 = require("buffer");
const LLMService_1 = require("./LLMService");
// Make it globally available if needed:
window.Buffer = buffer_1.Buffer;
class OpenAIService extends LLMService_1.LLMService {
    constructor(apiKey) {
        super();
        this.openai = new openai_1.default({ apiKey: apiKey, dangerouslyAllowBrowser: true });
    }
    generateCompletion(userPrompt, model, max_tokens = 16384, systemPrompt) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const systemPromptRole = model === "o1-preview" ? "user" : "system";
                const maxTokensParamterName = model === "o1-preview" ? "max_completion_tokens" : "max_tokens";
                const temperature = model === "o1-preview" ? 1 : 0.7;
                const messages = [];
                if (systemPrompt) {
                    messages.push({ role: systemPromptRole, content: systemPrompt });
                }
                messages.push({ role: "user", content: userPrompt });
                const response = yield this.openai.chat.completions.create({
                    model: model,
                    temperature: temperature,
                    messages: messages,
                    [maxTokensParamterName]: max_tokens,
                });
                return ((_a = response.choices[0].message.content) === null || _a === void 0 ? void 0 : _a.trim()) || "";
            }
            catch (error) {
                console.error("Error generating completion:", ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
                throw error;
            }
        });
    }
    generateImage(prompt, options = { size: "1024x1024" }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.openai.images.generate({
                    prompt: prompt,
                    model: "dall-e-3",
                    n: 1,
                    size: options.size,
                    response_format: "b64_json",
                });
                const imageData = response.data[0].b64_json;
                const buffer = buffer_1.Buffer.from(imageData, "base64");
                return buffer;
            }
            catch (error) {
                console.error("Error generating image:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                throw error;
            }
        });
    }
}
exports.OpenAIService = OpenAIService;
