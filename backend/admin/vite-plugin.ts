import type { Connect, Plugin } from "vite";
import { routeApiRequest } from "./index";
import { createNodeContext } from "./lib/context-node";
import { sendApiResponse, toApiRequest } from "./lib/node-adapter";

const API_PREFIX = "/api";

function isApiRequest(req: Connect.IncomingMessage): boolean {
  const url = req.url ?? "";
  return url === API_PREFIX || url.startsWith(`${API_PREFIX}/`);
}

export function adminApiPlugin(): Plugin {
  return {
    name: "mindfulwellness-admin-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!isApiRequest(req)) return next();
        try {
          const apiRequest = await toApiRequest(req);
          const apiResponse = await routeApiRequest(apiRequest, createNodeContext());
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
      });
    },
  };
}
