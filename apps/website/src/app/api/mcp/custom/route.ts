import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { customMcpServers } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import { requireSession, withErrorHandling, newId, guardRateLimit } from "@/lib/api-helpers";
import { z } from "zod";
import { assertSafeOutboundUrl } from "@/lib/outbound-url";
import { encryptSecret } from "@/lib/secret-box";

export const runtime = "nodejs";

const CreateServerSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  headersJson: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  const rateLimitResponse = await guardRateLimit({ key: user.id, limit: 30, prefix: "mcp-config", windowSeconds: 60 });
  if (rateLimitResponse) return rateLimitResponse;

  return withErrorHandling(async () => {
    const servers = await db
      .select({
        id: customMcpServers.id,
        userId: customMcpServers.userId,
        workspaceId: customMcpServers.workspaceId,
        name: customMcpServers.name,
        url: customMcpServers.url,
        createdAt: customMcpServers.createdAt,
        updatedAt: customMcpServers.updatedAt,
      })
      .from(customMcpServers)
      .where(and(eq(customMcpServers.userId, user.id), eq(customMcpServers.workspaceId, workspaceId)));
    return NextResponse.json(servers);
  });
}

export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const parsed = CreateServerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body", details: parsed.error.format() }, { status: 400 });
    }

    const { name, url, headersJson } = parsed.data;

    let safeUrl: string;
    try {
      safeUrl = await assertSafeOutboundUrl(url);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "unsafe_outbound_url" }, { status: 422 });
    }

    let encryptedHeaders: string | null = null;
    if (headersJson) {
      try {
        const parsedHeaders: unknown = JSON.parse(headersJson);
        if (!parsedHeaders || Array.isArray(parsedHeaders) || typeof parsedHeaders !== "object") {
          return NextResponse.json({ error: "invalid_headers_json" }, { status: 400 });
        }
        const entries = Object.entries(parsedHeaders as Record<string, unknown>);
        if (entries.some(([, value]) => typeof value !== "string")) {
          return NextResponse.json({ error: "header_values_must_be_strings" }, { status: 400 });
        }
        encryptedHeaders = encryptSecret(JSON.stringify(Object.fromEntries(entries)));
      } catch {
        return NextResponse.json({ error: "invalid_headers_json" }, { status: 400 });
      }
    }

    const [newServer] = await db
      .insert(customMcpServers)
      .values({
        id: newId("mcp"),
        userId: user.id,
        workspaceId,
        name,
        url: safeUrl,
        headersJson: encryptedHeaders,
      })
      .returning();

    return NextResponse.json({
      id: newServer!.id,
      userId: newServer!.userId,
      workspaceId: newServer!.workspaceId,
      name: newServer!.name,
      url: newServer!.url,
      createdAt: newServer!.createdAt,
      updatedAt: newServer!.updatedAt,
    });
  });
}
