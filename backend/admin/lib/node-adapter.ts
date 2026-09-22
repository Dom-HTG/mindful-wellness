import type { IncomingMessage, ServerResponse } from "node:http";
import { normalizePath, type ApiRequest, type ApiResponse } from "./http";

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  if (chunks.length === 0) return undefined;
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return undefined;
  const contentType = String(req.headers["content-type"] ?? "");
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  return raw;
}

export async function toApiRequest(req: IncomingMessage): Promise<ApiRequest> {
  const url = new URL(req.url ?? "/", "http://localhost");
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const headers: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    headers[key] = Array.isArray(value) ? value.join(", ") : value;
  }

  return {
    method: req.method ?? "GET",
    path: normalizePath(url.pathname),
    query,
    headers,
    body: await readBody(req),
  };
}

export function sendApiResponse(
  res: ServerResponse,
  response: ApiResponse,
): void {
  res.statusCode = response.status;
  for (const [key, value] of Object.entries(response.headers ?? {})) {
    res.setHeader(key, value);
  }

  if (response.stream) {
    void pumpStream(res, response.stream);
    return;
  }

  if (response.body === undefined) {
    res.end();
    return;
  }
  res.setHeader(
    "Content-Type",
    response.headers?.["Content-Type"] ?? "application/json; charset=utf-8",
  );
  res.end(
    typeof response.body === "string"
      ? response.body
      : JSON.stringify(response.body),
  );
}

async function pumpStream(
  res: ServerResponse,
  stream: ReadableStream<Uint8Array>,
): Promise<void> {
  const reader = stream.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  } finally {
    res.end();
    reader.releaseLock();
  }
}
