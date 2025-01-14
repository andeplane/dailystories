"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
var openai_1 = __importDefault(require("openai"));
var buffer_1 = require("buffer");
var LLMService_1 = require("./LLMService");
// Make it globally available if needed:
window.Buffer = buffer_1.Buffer;
var OpenAIService = /** @class */ (function (_super) {
    __extends(OpenAIService, _super);
    function OpenAIService(apiKey) {
        var _this = _super.call(this) || this;
        _this.openai = new openai_1.default({ apiKey: apiKey, dangerouslyAllowBrowser: true });
        return _this;
    }
    OpenAIService.prototype.generateCompletion = function (userPrompt, model, max_tokens, systemPrompt) {
        var _a, _b;
        if (max_tokens === void 0) { max_tokens = 16384; }
        return __awaiter(this, void 0, void 0, function () {
            var systemPromptRole, maxTokensParamterName, temperature, messages, response, error_1;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        systemPromptRole = model === "o1-preview" ? "user" : "system";
                        maxTokensParamterName = model === "o1-preview" ? "max_completion_tokens" : "max_tokens";
                        temperature = model === "o1-preview" ? 1 : 0.7;
                        messages = [];
                        if (systemPrompt) {
                            messages.push({ role: systemPromptRole, content: systemPrompt });
                        }
                        messages.push({ role: "user", content: userPrompt });
                        return [4 /*yield*/, this.openai.chat.completions.create((_c = {
                                    model: model,
                                    temperature: temperature,
                                    messages: messages
                                },
                                _c[maxTokensParamterName] = max_tokens,
                                _c))];
                    case 1:
                        response = _d.sent();
                        return [2 /*return*/, ((_a = response.choices[0].message.content) === null || _a === void 0 ? void 0 : _a.trim()) || ""];
                    case 2:
                        error_1 = _d.sent();
                        console.error("Error generating completion:", ((_b = error_1.response) === null || _b === void 0 ? void 0 : _b.data) || error_1.message);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OpenAIService.prototype.generateImage = function (prompt, options) {
        var _a;
        if (options === void 0) { options = { size: "1024x1024" }; }
        return __awaiter(this, void 0, void 0, function () {
            var response, imageData, buffer, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.openai.images.generate({
                                prompt: prompt,
                                model: "dall-e-3",
                                n: 1,
                                size: options.size,
                                response_format: "b64_json",
                            })];
                    case 1:
                        response = _b.sent();
                        imageData = response.data[0].b64_json;
                        buffer = buffer_1.Buffer.from(imageData, "base64");
                        return [2 /*return*/, buffer];
                    case 2:
                        error_2 = _b.sent();
                        console.error("Error generating image:", ((_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) || error_2.message);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return OpenAIService;
}(LLMService_1.LLMService));
exports.OpenAIService = OpenAIService;
