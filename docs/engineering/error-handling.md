# Error Handling & Resilience Specification

To prevent silent failures, cryptic 500 status codes, and corrupted agent states, Debo enforces an explicit, typed error architecture across all layers.

---

## 1. Typed Error Hierarchy

All custom errors inherit from a base `DeboError`:

```typescript
export abstract class DeboError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  abstract readonly isRetryable: boolean;

  constructor(
    message: string,
    public readonly details?: Record<string, unknown>,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
```

### Core Error Classes:
1. **`ValidationError`** (`code: 'VALIDATION_ERROR'`, `status: 400`, `retryable: false`):
   - Thrown when input payloads fail Zod schema validation.
2. **`AuthenticationError`** (`code: 'UNAUTHENTICATED'`, `status: 401`, `retryable: false`):
   - Missing or expired session tokens / API keys.
3. **`AuthorizationError`** (`code: 'FORBIDDEN'`, `status: 403`, `retryable: false`):
   - Attempting to access resources outside the authenticated `workspaceId` or lacking role permissions.
4. **`ResourceNotFoundError`** (`code: 'NOT_FOUND'`, `status: 404`, `retryable: false`):
   - Missing memory, source, or task.
5. **`ProviderTimeoutError`** (`code: 'PROVIDER_TIMEOUT'`, `status: 504`, `retryable: true`):
   - LLM provider or external vector store took longer than deadline (e.g. 5000ms).
6. **`RateLimitError`** (`code: 'RATE_LIMITED'`, `status: 429`, `retryable: true`):
   - Exceeded API limits; includes `retryAfterSeconds` metadata.
7. **`ToolExecutionError`** (`code: 'TOOL_ERROR'`, `status: 502`, `retryable: false`):
   - External connector action failed during execution.

---

## 2. Resilience, Retries & Compensation

1. **Idempotency Keys**:
   - All state-mutating requests (uploading files, executing external actions, updating memory) accept an `idempotencyKey`.
   - Re-transmitting a request with the same idempotency key returns the original result without duplicate execution.
2. **Exponential Backoff**:
   - Retryable errors (`isRetryable === true`) are automatically retried up to 3 times using jittered exponential backoff:
     $$\text{Delay} = \min(1000 \times 2^{\text{attempt}} + \text{random}(0, 200), 10000)$$
3. **Workflow Compensation**:
   - If a multi-step background job fails permanently halfway through (e.g. Docling parses a PDF, but vector storage fails), Trigger.dev executes a compensation cleanup step to purge orphaned chunks from R2/PostgreSQL.
