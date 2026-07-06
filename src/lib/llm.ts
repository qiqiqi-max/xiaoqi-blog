type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type LlmOptions = {
  model?: string;
  temperature?: number;
  responseFormat?: Record<string, unknown>;
};

export type LlmGatewayConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
};

export function getLlmConfig(): LlmGatewayConfig {
  return {
    baseUrl: import.meta.env.LLM_BASE_URL || "https://api.openai.com/v1",
    apiKey: import.meta.env.LLM_API_KEY || "",
    model: import.meta.env.LLM_MODEL || "gpt-5.2",
    timeoutMs: Number(import.meta.env.LLM_TIMEOUT_SECONDS || 120) * 1000
  };
}

export async function chatCompletion(messages: LlmMessage[], options: LlmOptions = {}) {
  const config = getLlmConfig();
  if (!config.apiKey) {
    throw new Error("LLM_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: options.model || config.model,
        messages,
        temperature: options.temperature ?? 0.2,
        response_format: options.responseFormat
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`LLM request failed: ${response.status} ${await response.text()}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}
