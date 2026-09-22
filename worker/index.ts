import { routeApiRequest } from "../backend/admin/index";
import { createEdgeContext } from "../backend/admin/lib/context-edge";
import type { EnvRecord } from "../backend/admin/lib/config";
import type { ApiRequest, ApiResponse } from "../backend/admin/lib/http";

interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface WorkerEnv {
  ASSETS: AssetsBinding;
  [key: string]: unknown;
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
};

function isApiRequest(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}

async function readBody(request: Request): Promise<unknown> {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD") return undefined;

  const text = await request.text();
  if (!text.trim()) return undefined;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  }
  return text;
}

async function toApiRequest(request: Request): Promise<ApiRequest> {
  const url = new URL(request.url);

  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const headers: Record<string, string | undefined> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    method: request.method,
    path: url.pathname,
    query,
    headers,
    body: await readBody(request),
  };
}

function toResponse(api: ApiResponse): Response {
  const headers = new Headers(api.headers ?? {});
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }

  const body =
    api.body === undefined
      ? null
      : typeof api.body === "string"
        ? api.body
        : JSON.stringify(api.body);

  return new Response(body, { status: api.status, headers });
}

function envRecord(env: WorkerEnv): EnvRecord {
  const record: EnvRecord = {};
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string") record[key] = value;
  }
  return record;
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (isApiRequest(url.pathname)) {
      try {
        const apiRequest = await toApiRequest(request);
        const apiResponse = await routeApiRequest(
          apiRequest,
          createEdgeContext(envRecord(env)),
        );
        return toResponse(apiResponse);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unexpected server error.";
        return toResponse({
          status: 500,
          body: { error: message },
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
