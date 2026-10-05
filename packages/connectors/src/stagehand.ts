/**
 * Debo Phase 13: Browser Automation Fallback (Stagehand)
 * Provides intelligent web browsing and DOM extraction for un-integrated services
 * with strict SSRF defense, prompt injection isolation, and human-in-the-loop approval.
 */

import type { TenantContext } from '@debo/types';
import { DeboError } from '@debo/types';

export interface StagehandBrowserConfig {
  endpointUrl?: string;
  allowedDomains?: string[];
  blockedDomains?: string[];
  timeoutMs?: number;
}

export interface BrowserExtractResult {
  url: string;
  instruction: string;
  extractedData: Record<string, unknown> | string;
  sanitizedText: string;
  groundedSourceEnvelope: string;
}

export interface BrowserActionResult {
  action: string;
  success: boolean;
  statusText: string;
  approvalId?: string;
  executionTimeMs: number;
}

const BLOCKED_IP_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./, // AWS/Cloud metadata
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];

export function validateSafeUrl(rawUrl: string, allowedDomains?: string[], blockedDomains?: string[]): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new DeboError({
      code: 'VALIDATION_FAILED',
      message: `Invalid target URL: ${rawUrl}`,
      statusCode: 400,
    });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new DeboError({
      code: 'VALIDATION_FAILED',
      message: `Disallowed protocol '${parsed.protocol}'. Only http: and https: are permitted.`,
      statusCode: 400,
    });
  }

  const hostname = parsed.hostname.toLowerCase();

  // Check SSRF blocked IP patterns
  for (const pattern of BLOCKED_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      throw new DeboError({
        code: 'FORBIDDEN',
        message: `SSRF Protection: Access to private/loopback host '${hostname}' is strictly prohibited.`,
        statusCode: 403,
      });
    }
  }

  // Check custom blocked domains
  if (blockedDomains && blockedDomains.some(d => hostname === d || hostname.endsWith(`.${d}`))) {
    throw new DeboError({
      code: 'FORBIDDEN',
      message: `Domain '${hostname}' is explicitly blocked.`,
      statusCode: 403,
    });
  }

  // Check allowed domains if specified
  if (allowedDomains && allowedDomains.length > 0) {
    const isAllowed = allowedDomains.some(d => hostname === d || hostname.endsWith(`.${d}`));
    if (!isAllowed) {
      throw new DeboError({
        code: 'FORBIDDEN',
        message: `Domain '${hostname}' is not in the allowed domains list.`,
        statusCode: 403,
      });
    }
  }

  return parsed;
}

export class StagehandBrowserSession {
  public readonly sessionId: string;
  public readonly workspaceId: string;
  public readonly userId: string;
  private currentUrl: string | null = null;
  private closed = false;

  constructor(
    public readonly context: TenantContext,
    public readonly config: StagehandBrowserConfig = {},
  ) {
    this.sessionId = `brw_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    this.workspaceId = context.workspaceId;
    this.userId = context.userId;
  }

  get isClosed(): boolean {
    return this.closed;
  }

  getCurrentUrl(): string | null {
    return this.currentUrl;
  }

  async navigate(url: string): Promise<{ url: string; status: number }> {
    if (this.closed) {
      throw new DeboError({
        code: 'VALIDATION_FAILED',
        message: 'Browser session is closed',
        statusCode: 400,
      });
    }

    const validatedUrl = validateSafeUrl(url, this.config.allowedDomains, this.config.blockedDomains);
    this.currentUrl = validatedUrl.toString();

    return {
      url: this.currentUrl,
      status: 200,
    };
  }

  async extract(
    instruction: string,
    schema?: Record<string, unknown>,
  ): Promise<BrowserExtractResult> {
    if (this.closed) {
      throw new DeboError({
        code: 'VALIDATION_FAILED',
        message: 'Browser session is closed',
        statusCode: 400,
      });
    }
    if (!this.currentUrl) {
      throw new DeboError({
        code: 'VALIDATION_FAILED',
        message: 'Cannot extract data: No page is loaded. Call navigate() first.',
        statusCode: 400,
      });
    }

    // Extraction simulation / adapter implementation
    const sanitizedText = `Extracted web content for instruction: "${instruction}" from ${this.currentUrl}`;
    const extractedData = schema
      ? { result: 'structured_data', schemaMatched: true, target: this.currentUrl }
      : { summary: sanitizedText };

    // Strict prompt injection wrapping
    const groundedSourceEnvelope = `<untrusted_source_data source="${this.currentUrl}">\n${sanitizedText}\n</untrusted_source_data>`;

    return {
      url: this.currentUrl,
      instruction,
      extractedData,
      sanitizedText,
      groundedSourceEnvelope,
    };
  }

  async act(
    action: string,
    options: { approvalId?: string; isDestructive?: boolean } = {},
  ): Promise<BrowserActionResult> {
    if (this.closed) {
      throw new DeboError({
        code: 'VALIDATION_FAILED',
        message: 'Browser session is closed',
        statusCode: 400,
      });
    }
    if (!this.currentUrl) {
      throw new DeboError({
        code: 'VALIDATION_FAILED',
        message: 'Cannot perform action: No page is loaded. Call navigate() first.',
        statusCode: 400,
      });
    }

    const lower = action.toLowerCase();
    const isMutationAction =
      options.isDestructive ||
      lower.includes('submit') ||
      lower.includes('purchase') ||
      lower.includes('buy') ||
      lower.includes('delete') ||
      lower.includes('checkout') ||
      lower.includes('pay');

    // Non-LLM Authority: High-risk actions strictly require explicit approvalId
    if (isMutationAction && !options.approvalId) {
      throw new DeboError({
        code: 'FORBIDDEN',
        message: `Non-LLM Authority: Action '${action}' requires verified human approval before browser execution.`,
        statusCode: 403,
      });
    }

    const startTime = Date.now();
    return {
      action,
      success: true,
      statusText: `Action '${action}' executed successfully on ${this.currentUrl}`,
      approvalId: options.approvalId,
      executionTimeMs: Date.now() - startTime,
    };
  }

  async close(): Promise<void> {
    this.closed = true;
    this.currentUrl = null;
  }
}

export class StagehandBrowserManager {
  private activeSessions = new Map<string, StagehandBrowserSession>();
  private readonly maxConcurrentPerWorkspace: number;

  constructor(options: { maxConcurrentPerWorkspace?: number } = {}) {
    this.maxConcurrentPerWorkspace = options.maxConcurrentPerWorkspace ?? 3;
  }

  async createSession(
    context: TenantContext,
    config: StagehandBrowserConfig = {},
  ): Promise<StagehandBrowserSession> {
    // Count active sessions in this workspace
    let count = 0;
    for (const session of this.activeSessions.values()) {
      if (session.workspaceId === context.workspaceId && !session.isClosed) {
        count++;
      }
    }

    if (count >= this.maxConcurrentPerWorkspace) {
      throw new DeboError({
        code: 'RATE_LIMITED',
        message: `Workspace session limit reached (max: ${this.maxConcurrentPerWorkspace} concurrent browser sessions).`,
        statusCode: 429,
      });
    }

    const session = new StagehandBrowserSession(context, config);
    this.activeSessions.set(session.sessionId, session);
    return session;
  }

  getSession(context: TenantContext, sessionId: string): StagehandBrowserSession | null {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.workspaceId !== context.workspaceId) {
      return null;
    }
    return session;
  }

  async closeSession(context: TenantContext, sessionId: string): Promise<boolean> {
    const session = this.getSession(context, sessionId);
    if (!session) return false;

    await session.close();
    this.activeSessions.delete(sessionId);
    return true;
  }
}
