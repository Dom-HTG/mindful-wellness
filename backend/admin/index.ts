import { requireAdmin } from "./lib/auth";
import type { ApiContext } from "./lib/context";
import { isDevMode } from "./lib/config";
import {
  error,
  json,
  normalizePath,
  type ApiRequest,
  type ApiResponse,
} from "./lib/http";
import {
  createBooking,
  getBooking,
  listBookings,
  updateBooking,
} from "./handlers/bookings";
import { handleChat } from "../chatbot";

const BOOKING_PATH = /^\/admin\/bookings\/([^/]+)$/;

export async function routeApiRequest(
  req: ApiRequest,
  ctx: ApiContext,
): Promise<ApiResponse> {
  const method = (req.method || "GET").toUpperCase();
  const path = normalizePath(req.path);

  try {
    if (path === "/health" && method === "GET") {
      return json(200, { ok: true, devMode: isDevMode(ctx.env) });
    }

    if (path === "/bookings" && method === "POST") {
      return await createBooking(req, ctx);
    }

    if (path === "/chat" && method === "POST") {
      return await handleChat(req, ctx);
    }

    if (path === "/admin/me" && method === "GET") {
      const auth = await requireAdmin(req, ctx);
      if (auth.response) return auth.response;
      return json(200, { user: auth.user });
    }

    if (path === "/admin/bookings" && method === "GET") {
      const auth = await requireAdmin(req, ctx);
      if (auth.response) return auth.response;
      return await listBookings(req, ctx);
    }

    const match = BOOKING_PATH.exec(path);
    if (match) {
      const id = decodeURIComponent(match[1]);
      const auth = await requireAdmin(req, ctx);
      if (auth.response) return auth.response;

      if (method === "GET") return await getBooking(id, ctx);
      if (method === "PATCH")
        return await updateBooking(id, req, auth.user.email, ctx);
    }

    return error(404, "Not found.");
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error.";
    return error(500, message);
  }
}

export * from "./types";
export { routeApiRequest as default };
