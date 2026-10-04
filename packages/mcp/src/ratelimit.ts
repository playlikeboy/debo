export interface RateLimiterOptions {
  limit?: number; // max requests
  windowMs?: number; // window duration
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export class MemoryRateLimiter {
  private readonly limit: number;
  private readonly windowMs: number;
  private counters = new Map<string, { count: number; resetAt: number }>();

  constructor(options: RateLimiterOptions = {}) {
    this.limit = options.limit ?? 60; // 60 requests per min default
    this.windowMs = options.windowMs ?? 60 * 1000;
  }

  check(key: string): RateLimitStatus {
    const now = Date.now();
    const record = this.counters.get(key);

    if (!record || now >= record.resetAt) {
      this.counters.set(key, { count: 1, resetAt: now + this.windowMs });
      return {
        allowed: true,
        remaining: this.limit - 1,
        resetMs: this.windowMs,
      };
    }

    if (record.count >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetMs: Math.max(0, record.resetAt - now),
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: this.limit - record.count,
      resetMs: Math.max(0, record.resetAt - now),
    };
  }

  reset(): void {
    this.counters.clear();
  }
}
