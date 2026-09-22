import type { ServerResponse } from "node:http";
import { loadEnv, type Connect, type Plugin } from "vite";
import { routeApiRequest } from "./index";
import { createNodeContext } from "./lib/context-node";
import type { EnvRecord } from "./lib/config";
import { sendApiResponse, toApiRequest } from "./lib/node-adapter";

const API_PREFIX = "/api";

function isApiRequest(req: Connect.IncomingMessage): boolean {
  const url = req.url ?? "";
  return url === API_PREFIX || url.startsWith(`${API_PREFIX}/`);
}

function resolveEnv(config: { mode: string; root: string }): EnvRecord {
  return {
    ...loadEnv(config.mode, config.root, ""),
    ...(globalThis as { process?: { env?: EnvRecord } }).process?.env,
  };
}

function apiMiddleware(getEnv: () => EnvRecord) {
  return async (
    req: Connect.IncomingMessage,
    res: ServerResponse,
    next: Connect.NextFunction,
  ): Promise<void> => {
    if (!isApiRequest(req)) return next();
    try {
      const apiRequest = await toApiRequest(req);
      const apiResponse = await routeApiRequest(
        apiRequest,
        createNodeContext(getEnv()),
      );
      sendApiResponse(res, apiResponse);
    } catch (err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          error:
            err instanceof Error ? err.message : "Unexpected server error.",
        }),
      );
    }
  };
}

export function adminApiPlugin(): Plugin {
  return {
    name: "mindfulwellness-admin-api",
    configureServer(server) {
      const env = resolveEnv(server.config);
      server.middlewares.use(apiMiddleware(() => env));
    },
    configurePreviewServer(server) {
      const env = resolveEnv(server.config);
      server.middlewares.use(apiMiddleware(() => env));
    },
  };
}
