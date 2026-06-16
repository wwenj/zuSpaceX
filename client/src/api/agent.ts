import { http } from "./request";

// const PROD_API_BASE_URL = "https://api.example.com";
const PROD_API_BASE_URL = "/";
const API_BASE_URL = import.meta.env.DEV ? "" : PROD_API_BASE_URL;

export type AgentMessageRole = "user" | "assistant";

export interface AgentMessage {
  id: string;
  userId: string;
  role: AgentMessageRole;
  content: string;
  skill: string;
  model: string;
  inputToken: number;
  outputToken: number;
  createdAt: string;
  updatedAt: string;
}

export type SseEventType = "meta" | "delta" | "done" | "error";

export interface SseMetaData {
  skill: string;
  model: string;
}

export interface SseDeltaData {
  content: string;
}

export interface SseDoneData {
  content: string;
  usage: { inputToken: number; outputToken: number };
}

export interface SseErrorData {
  code: string;
  msg: string;
}

type SseEventDataMap = {
  meta: SseMetaData;
  delta: SseDeltaData;
  done: SseDoneData;
  error: SseErrorData;
};

export interface SseHandlers {
  onMeta?: (data: SseMetaData) => void;
  onDelta?: (data: SseDeltaData) => void;
  onDone?: (data: SseDoneData) => void;
  onError?: (data: SseErrorData) => void;
}

function buildUrl(endpoint: string) {
  const base = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  return `${base}${endpoint}`;
}

async function streamAgent(
  content: string,
  skill: string | undefined,
  handlers: SseHandlers,
  signal?: AbortSignal,
) {
  const response = await fetch(buildUrl("/api/agent/stream"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, skill }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`请求失败: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const lines = part.split("\n");
      let eventType = "";
      let dataLine = "";

      for (const line of lines) {
        if (line.startsWith("event: ")) eventType = line.slice(7).trim();
        if (line.startsWith("data: ")) dataLine = line.slice(6).trim();
      }

      if (!eventType || !dataLine) continue;

      try {
        const parsed = JSON.parse(dataLine);
        const handler =
          handlers[
            `on${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}` as keyof SseHandlers
          ];
        if (handler) {
          (handler as (d: SseEventDataMap[keyof SseEventDataMap]) => void)(
            parsed,
          );
        }
      } catch {
        // ignore malformed SSE chunks
      }
    }
  }
}

export const agentApi = {
  history: () => http.get<AgentMessage[]>("/api/agent/history"),
  clearHistory: () => http.delete<void>("/api/agent/history"),
  stream: streamAgent,
};
