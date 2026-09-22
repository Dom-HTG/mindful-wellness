export interface ApiRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string | undefined>;
  body: unknown;
}

export interface ApiResponse {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
  stream?: ReadableStream<Uint8Array>;
}

export function json(
  status: number,
  body: unknown,
  headers?: Record<string, string>,
): ApiResponse {
  return {
    status,
    body,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  };
}

export function error(status: number, message: string): ApiResponse {
  return json(status, { error: message });
}

export function getHeader(
  req: ApiRequest,
  name: string,
): string | undefined {
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(req.headers)) {
    if (key.toLowerCase() === target) return value;
  }
  return undefined;
}

export function bearerToken(req: ApiRequest): string | null {
  const header = getHeader(req, "authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

export function normalizePath(path: string): string {
  let clean = path.split("?")[0].split("#")[0];
  if (clean.startsWith("/api")) clean = clean.slice(4);
  clean = clean.replace(/\/+$/, "");
  return clean === "" ? "/" : clean;
}
