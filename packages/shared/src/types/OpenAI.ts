export interface OpenAIError extends Error {
  status?: number;
  message: string;
}
