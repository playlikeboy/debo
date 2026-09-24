import { after, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@debo/db";
import { sources, sourceFiles, voiceSessions, auditLogs, tasks, memoryItems } from "@debo/db/schema";
import {
  apiError,
  newId,
  requireSession,
  withErrorHandling,
  guardRateLimit,
} from "@/lib/api-helpers";
import { extractMemories } from "@/server/langgraph/graphs/extraction.graph";
import { indexSource } from "@/server/ingestion";
import path from "path";
import fs from "fs";
import { eq, and } from "drizzle-orm";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_PREFIXES = ["image/", "audio/", "video/"];
const ALLOWED_EXACT = new Set(["application/pdf"]);
const BLOCKED_MIME_TYPES = new Set(["image/svg+xml"]);
function hasValidSignature(mime: string, bytes: Uint8Array): boolean {
  const s = String.fromCharCode(...bytes.slice(0, 12));
  const is = (...values: string[]) => values.some((value) => s.startsWith(value));
  if (mime === "application/pdf") return s.startsWith("%PDF-");
  if (mime === "image/png") return is("\x89PNG");
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/gif") return is("GIF8");
  if (mime === "image/webp") return bytes.slice(0, 4).join(",") === "82,73,70,70" && s.slice(8, 12) === "WEBP";
  if (mime === "audio/wav" || mime === "audio/x-wav") return s.startsWith("RIFF") && s.slice(8, 12) === "WAVE";
  if (mime === "audio/mpeg") return s.startsWith("ID3") || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
  if (mime === "audio/ogg") return s.startsWith("OggS");
  if (mime === "audio/flac") return s.startsWith("fLaC");
  if (mime === "video/webm") return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  if (mime === "video/mp4" || mime === "video/quicktime" || mime === "video/3gpp") return s.slice(4, 8) === "ftyp";
  if (mime === "video/x-msvideo") return s.startsWith("RIFF") && s.slice(8, 12) === "AVI ";
  return true;
}

function isAllowedMime(mime: string): boolean {
  if (!mime || BLOCKED_MIME_TYPES.has(mime.toLowerCase())) return false;
  if (ALLOWED_EXACT.has(mime)) return true;
  return ALLOWED_PREFIXES.some((p) => mime.startsWith(p));
}

function inferSourceType(mime: string): "image" | "audio" | "video" | "file" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  return "file";
}

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

let cachedClient: S3Client | null = null;
function getR2Client(accountId: string, accessKeyId: string, secret: string): S3Client {
  if (cachedClient) return cachedClient;
  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey: secret },
  });
  return cachedClient;
}

// Background transcription & memory extraction worker
async function processVoiceOrAudio(opts: {
  sourceId: string;
  userId: string;
  workspaceId: string;
  fileBuffer: Uint8Array;
  mimeType: string;
  filename: string;
}) {
  const { sourceId, userId, workspaceId, fileBuffer, mimeType } = opts;
  try {
    let transcriptText = "";
    if (process.env.DEEPGRAM_API_KEY) {
      console.log(`[media-upload] transcribing audio for ${sourceId} via Deepgram...`);
      const response = await fetch("https://api.deepgram.com/v1/listen?smart_format=true&model=nova-2", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": mimeType || "application/octet-stream",
        },
        body: fileBuffer as any,
      });
      if (response.ok) {
        const data = await response.json();
        transcriptText = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
        console.log(`[media-upload] Deepgram transcription successful: "${transcriptText.slice(0, 60)}..."`);
      } else {
        console.error(`[media-upload] Deepgram request failed: ${response.status} ${response.statusText}`);
      }
    } else {
      console.warn(`[media-upload] DEEPGRAM_API_KEY not configured, skipping transcription.`);
    }

    if (transcriptText) {
      await db
        .update(sources)
        .set({ plainText: transcriptText, status: "ready" })
        .where(eq(sources.id, sourceId));
      
      // Index the plain text source
      await indexSource({
        sourceId,
        userId,
        workspaceId,
        plainText: transcriptText,
      });

      // Run LangGraph extractions
      console.log(`[media-upload] running memory extractions for source ${sourceId}...`);
      const extraction = await extractMemories({
        userId,
        sourceId,
        text: transcriptText,
      });

      // Insert extractions to database
      for (const memory of extraction.memories) {
        if (memory.type === "task_hint" || memory.type === "promise" || memory.type === "reminder") {
          const taskId = newId("task");
          await db.insert(tasks).values({
            id: taskId,
            userId,
            workspaceId,
            title: memory.title || "Extracted Task",
            description: memory.content,
            status: "inbox",
            extractionStatus: "extracted_pending",
            sourceId,
          }).catch((err) => console.error("[media-upload] failed to insert task:", err));
        } else {
          const memoryItemId = newId("mem");
          await db.insert(memoryItems).values({
            id: memoryItemId,
            userId,
            workspaceId,
            sourceId,
            type: memory.type === "summary" ? "summary" : (memory.type as any),
            title: memory.title || "Extracted Memory",
            content: memory.content,
            confidence: memory.confidence || 0.5,
            reviewStatus: "needs_review",
          }).catch((err) => console.error("[media-upload] failed to insert memory item:", err));
        }
      }
    }
  } catch (err) {
    console.error(`[media-upload] Error in background processing for source ${sourceId}:`, err);
  }
}

/**
 * POST /api/media/upload
 * multipart/form-data with `file` field. Uploads to private Cloudflare R2 storage,
 * then creates source + source_files row.
 */
export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  const rateLimitResponse = await guardRateLimit({ key: user.id, limit: 20, prefix: "media-upload", windowSeconds: 60 });
  if (rateLimitResponse) return rateLimitResponse;

  return withErrorHandling(async () => {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return apiError("invalid_form_data", 400);
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return apiError("file_required", 400);
    }

    if (file.size > MAX_BYTES) {
      return apiError("file_too_large", 413, { maxBytes: MAX_BYTES });
    }

    const mimeType = (file.type || "application/octet-stream").toLowerCase();
    if (!isAllowedMime(mimeType)) {
      return apiError("unsupported_mime_type", 415, { mimeType });
    }

    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);
    if (!hasValidSignature(mimeType, body)) return apiError("file_signature_mismatch", 415);

    const requestedType = formData.get("type");
    const customType = typeof requestedType === "string" ? requestedType : null;
    const inferredType = inferSourceType(mimeType);
    const sourceType =
      inferredType === "audio" && customType === "voice"
        ? "voice"
        : inferredType;
    const voiceSessionId = formData.get("voiceSessionId") as string | null;

    const r2 = getR2Config();
    let r2BucketValue: string;
    let r2KeyValue: string;

    const sourceId = newId("src");
    const fileId = newId("file");
    const safeName = `${Date.now()}_${file.name.replace(/[^\w.\-]+/g, "_")}`;

    if (!r2 && process.env.NODE_ENV === "production") {
      return apiError("media_storage_unavailable", 503);
    }

    if (!r2) {
      // Development-only private filesystem fallback. Never write user media to a public directory.
      const uploadDir = path.join(process.cwd(), ".debo", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, safeName);
      fs.writeFileSync(filePath, body);

      r2BucketValue = "local-dev-fallback";
      r2KeyValue = `/uploads/${safeName}`;
    } else {
      r2BucketValue = r2.bucket;
      r2KeyValue = `users/${user.id}/${sourceId}/${safeName}`;

      const client = getR2Client(r2.accountId, r2.accessKeyId, r2.secretAccessKey);
      await client.send(
        new PutObjectCommand({
          Bucket: r2.bucket,
          Key: r2KeyValue,
          Body: body,
          ContentType: mimeType,
          ContentLength: file.size,
        }),
      );
    }

    const [createdSource] = await db
      .insert(sources)
      .values({
        id: sourceId,
        userId: user.id,
        workspaceId,
        type: sourceType as any,
        title: file.name,
        status: (sourceType === "audio" || sourceType === "voice" || sourceType === "video") ? "processing" : "ready",
        origin: "upload",
      })
      .returning();

    const [createdFile] = await db
      .insert(sourceFiles)
      .values({
        id: fileId,
        userId: user.id,
        workspaceId,
        sourceId,
        r2Bucket: r2BucketValue,
        r2Key: r2KeyValue,
        filename: file.name,
        mimeType,
        sizeBytes: file.size,
        uploadStatus: "uploaded",
      })
      .returning();

    if (sourceType === "audio" || sourceType === "voice" || sourceType === "video") {
      const nowStr = new Date().toISOString();
      if (voiceSessionId) {
        await db.update(voiceSessions)
          .set({
            sourceId,
            status: "completed",
            endedAt: nowStr,
          })
          .where(and(eq(voiceSessions.id, voiceSessionId), eq(voiceSessions.userId, user.id)))
          .catch((err) => console.error("[media-upload] voiceSessions update failed:", err));
      } else {
        await db.insert(voiceSessions).values({
          id: newId("vs"),
          userId: user.id,
          workspaceId,
          sourceId,
          roomName: file.name,
          status: "completed",
          startedAt: nowStr,
          endedAt: nowStr,
          durationSeconds: 0,
        }).catch((err) => console.error("[media-upload] voiceSessions insert failed:", err));
      }

      after(async () => {
        try {
          await processVoiceOrAudio({ sourceId, userId: user.id, workspaceId, fileBuffer: body, mimeType, filename: file.name });
        } catch (err) {
          console.error("[media-upload] background processing failed:", err);
        }
      });
    }

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "media.upload",
      targetType: "source",
      targetId: sourceId,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ mimeType, size: file.size, filename: file.name, r2Bucket: r2BucketValue }),
    });

    return NextResponse.json(
      {
        id: createdSource!.id,
        sourceId: createdSource!.id,
        fileId: createdFile!.id,
        mimeType,
        size: file.size,
      },
      { status: 201 },
    );
  });
}
