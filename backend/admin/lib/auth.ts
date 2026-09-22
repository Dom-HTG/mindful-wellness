import type { AdminUser } from "../types";
import { isAdminEmail, isDevMode, type EnvRecord } from "./config";
import { bearerToken, error, type ApiRequest, type ApiResponse } from "./http";

export interface AuthDeps {
  env: EnvRecord;
  verifyToken(token: string): Promise<AdminUser | null>;
}

export interface AuthSuccess {
  user: AdminUser;
  response?: undefined;
}

export interface AuthFailure {
  user?: undefined;
  response: ApiResponse;
}

export type AuthResult = AuthSuccess | AuthFailure;

async function verifyWithFirebase(
  token: string,
  deps: AuthDeps,
): Promise<AdminUser | null> {
  return deps.verifyToken(token);
}

function devUserFromToken(token: string): AdminUser | null {
  if (!token.startsWith("dev:")) return null;
  const email = token.slice(4).trim().toLowerCase();
  if (!email) return null;
  return { uid: `dev-${email}`, email, name: email, picture: "" };
}

export async function requireAdmin(
  req: ApiRequest,
  deps: AuthDeps,
): Promise<AuthResult> {
  const token = bearerToken(req);
  if (!token) {
    return { response: error(401, "Authentication required.") };
  }

  let user: AdminUser | null = null;
  if (isDevMode(deps.env)) {
    user = devUserFromToken(token);
  }
  if (!user) {
    try {
      user = await verifyWithFirebase(token, deps);
    } catch {
      return { response: error(401, "Invalid or expired session.") };
    }
  }

  if (!user || !user.email) {
    return { response: error(401, "Invalid or expired session.") };
  }

  if (!isAdminEmail(user.email, deps.env)) {
    return {
      response: error(403, "This account is not authorized for admin access."),
    };
  }

  return { user };
}
