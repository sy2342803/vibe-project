export type AiProviderName = "groq";

export interface AiGenerateInput {
  prompt: string;
  useJson: boolean;
}

export interface AiGenerateResult {
  text: string;
  model: string;
  provider: string;
}

type AiProviderErrorCode =
  | "missing_api_key"
  | "rate_limit"
  | "unauthorized"
  | "provider_error"
  | "bad_response";

export class AiProviderError extends Error {
  code: AiProviderErrorCode;
  status: number;
  userMessage: string;

  constructor({
    code,
    status,
    message,
    userMessage,
  }: {
    code: AiProviderErrorCode;
    status: number;
    message: string;
    userMessage: string;
  }) {
    super(message);
    this.name = "AiProviderError";
    this.code = code;
    this.status = status;
    this.userMessage = userMessage;
  }
}

export interface AiProvider {
  name: string;
  model: string;
  keysActive: number;
  generate(input: AiGenerateInput): Promise<AiGenerateResult>;
}

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

let currentGroqKeyIndex = 0;

function getGroqApiKeys() {
  return [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY,
  ].filter((key): key is string => Boolean(key));
}

function getErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const error = record.error;
  if (!error || typeof error !== "object") return null;
  const message = (error as Record<string, unknown>).message;
  return typeof message === "string" ? message : null;
}

async function readJsonSafely(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

class GroqProvider implements AiProvider {
  name = "Groq";
  model = GROQ_MODEL;

  get keysActive() {
    return getGroqApiKeys().length;
  }

  async generate({ prompt, useJson }: AiGenerateInput): Promise<AiGenerateResult> {
    const keys = getGroqApiKeys();
    if (keys.length === 0) {
      throw new AiProviderError({
        code: "missing_api_key",
        status: 503,
        message: "Groq API key is missing.",
        userMessage:
          "AI 연결에 필요한 API 키가 아직 설정되지 않았습니다. 배포 환경의 GROQ_API_KEY 값을 확인해주세요.",
      });
    }

    const apiKey = keys[currentGroqKeyIndex];
    currentGroqKeyIndex = (currentGroqKeyIndex + 1) % keys.length;

    const body: Record<string, unknown> = {
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.55,
      max_tokens: 8000,
    };

    if (useJson) {
      body.response_format = { type: "json_object" };
    }

    let response: Response;
    try {
      response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new AiProviderError({
        code: "provider_error",
        status: 502,
        message: error instanceof Error ? error.message : "Network request failed.",
        userMessage:
          "AI 서버와 연결하는 중 문제가 생겼습니다. 인터넷 연결이나 배포 환경의 네트워크 상태를 확인한 뒤 다시 시도해주세요.",
      });
    }

    const data = await readJsonSafely(response);

    if (!response.ok) {
      const providerMessage = getErrorMessage(data) || `Groq API failed with ${response.status}.`;

      if (response.status === 429) {
        throw new AiProviderError({
          code: "rate_limit",
          status: 429,
          message: providerMessage,
          userMessage:
            "지금 AI 요청이 잠시 몰렸습니다. 10초 정도 뒤에 다시 시도하면 대부분 해결됩니다.",
        });
      }

      if (response.status === 401 || response.status === 403) {
        throw new AiProviderError({
          code: "unauthorized",
          status: 503,
          message: providerMessage,
          userMessage:
            "AI API 키가 유효하지 않거나 권한이 부족합니다. 배포 환경의 키 설정을 확인해주세요.",
        });
      }

      throw new AiProviderError({
        code: "provider_error",
        status: response.status >= 500 ? 502 : 500,
        message: providerMessage,
        userMessage:
          "AI 응답을 받아오는 중 문제가 생겼습니다. 입력을 조금 줄이거나 잠시 후 다시 시도해주세요.",
      });
    }

    const record = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
    const choices = Array.isArray(record?.choices) ? record.choices : [];
    const firstChoice = choices[0] && typeof choices[0] === "object" ? (choices[0] as Record<string, unknown>) : null;
    const message = firstChoice?.message && typeof firstChoice.message === "object"
      ? (firstChoice.message as Record<string, unknown>)
      : null;
    const text = message?.content;

    if (typeof text !== "string" || text.trim().length === 0) {
      throw new AiProviderError({
        code: "bad_response",
        status: 502,
        message: "AI response content is empty.",
        userMessage:
          "AI가 빈 응답을 보냈습니다. 같은 내용을 한 번 더 시도하거나 아이디어를 조금 더 구체적으로 적어주세요.",
      });
    }

    return {
      text,
      model: typeof record?.model === "string" ? record.model : this.model,
      provider: this.name,
    };
  }
}

export function createAiProvider(): AiProvider {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();

  if (provider !== "groq") {
    console.warn(`[ai] Unsupported provider "${provider}", falling back to Groq.`);
  }

  return new GroqProvider();
}
