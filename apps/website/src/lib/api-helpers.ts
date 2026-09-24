import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { workspaces, users } from "@debo/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthUser } from "@/lib/auth";
import { enforceRateLimit, RateLimitError } from "@/app/agents/lib/rate-limit";

export function apiError(message: string, status = 500, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function withErrorHandling<T>(handler: () => Promise<T>): Promise<T | NextResponse> {
  return handler().catch((err: unknown) => {
    const requestId = crypto.randomUUID();
    console.error("[api]", requestId, err);
    if (err instanceof RateLimitError) {
      return apiError("rate_limited", 429, { retryAfter: err.retryAfter, requestId });
    }
    return apiError("internal_error", 500, { requestId });
  });
}

export async function guardRateLimit(options: {
  key: string;
  limit: number;
  prefix: string;
  windowSeconds: number;
}): Promise<NextResponse | null> {
  try {
    await enforceRateLimit(options);
    return null;
  } catch (err) {
    if (err instanceof RateLimitError) {
      return apiError("rate_limited", 429, { retryAfter: err.retryAfter });
    }
    console.error("[rate-limit] unavailable; failing open", err);
    return null;
  }
}

export { newId } from "./new-id";

export async function requireSession(
  req: Request,
): Promise<{ user: AuthUser; workspaceId: string } | NextResponse> {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: user.id,
      email: user.email || `${user.id}@unknown.local`,
      name: user.name || "User",
      avatarUrl: user.imageUrl,
    });
  }

  const workspaceId = user.id;
  const existingWs = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (existingWs.length === 0) {
    await db.insert(workspaces).values({
      id: workspaceId,
      ownerUserId: user.id,
      name: `${user.name || "Personal"}'s Memory`,
      type: "personal",
    });
  }

  return { user, workspaceId };
}

export async function readJson<T>(req: Request): Promise<T | NextResponse> {
  try {
    return (await req.json()) as T;
  } catch {
    return apiError("invalid_json", 400);
  }
}
