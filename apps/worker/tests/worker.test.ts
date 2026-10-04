import { describe, expect, it } from 'bun:test';
import { DegradedMemoryProvider, MemoryService } from '@debo/memory';
import { createDeboEvent } from '@debo/workflows';
import { DeboWorker } from '../src/worker';

describe('DeboWorker service', () => {
  it('responds to /health endpoint with healthy status', async () => {
    const worker = new DeboWorker();
    const req = new Request('http://localhost:8787/health');
    const res = await worker.fetchHandler(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('healthy');
    expect(body.service).toBe('debo-worker');
  });

  it('handles source.created event and indexes direct content into memory', async () => {
    const memoryService = new MemoryService(new DegradedMemoryProvider());
    const worker = new DeboWorker(memoryService);

    const event = createDeboEvent({
      name: 'source.created',
      workspaceId: 'ws_worker_test',
      userId: 'usr_alice',
      payload: {
        sourceId: 'src_journal_01',
        storageKey: 'ws_worker_test/src_journal_01/note.md',
        mimeType: 'text/markdown',
        byteSize: 256,
        initialContent: 'Today I designed the Debo distributed memory architecture.',
      },
    });

    const req = new Request('http://localhost:8787/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    const res = await worker.fetchHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.result.status).toBe('INDEXED');
    expect(body.result.indexedMemoryIds.length).toBe(1);

    // Verify memory is searchable in the tenant workspace
    const search = await memoryService.search(
      { workspaceId: 'ws_worker_test', userId: 'usr_alice', role: 'member' },
      { query: 'distributed memory' },
    );
    expect(search.length).toBe(1);
    expect(search[0]?.memory.content).toContain('Debo distributed memory');

    // Verify tenant isolation: not found in different workspace
    const crossSearch = await memoryService.search(
      { workspaceId: 'ws_other_tenant', userId: 'usr_alice', role: 'member' },
      { query: 'distributed memory' },
    );
    expect(crossSearch.length).toBe(0);
  });

  it('handles document.processed event and splits chunks', async () => {
    const memoryService = new MemoryService(new DegradedMemoryProvider());
    const worker = new DeboWorker(memoryService);

    const event = createDeboEvent({
      name: 'document.processed',
      workspaceId: 'ws_doc_test',
      userId: 'usr_bob',
      payload: {
        documentId: 'doc_annual_report',
        sourceId: 'src_annual_report',
        storageKey: 'ws_doc_test/docs/report.pdf',
        extractedMarkdown:
          'Paragraph 1: Revenue grew by 40%.\n\nParagraph 2: Operating costs declined.',
      },
    });

    const req = new Request('http://localhost:8787/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    const res = await worker.fetchHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result.chunksIndexed).toBe(2);
    expect(body.result.memoryIds.length).toBe(2);
  });

  it('handles idempotent re-dispatch gracefully without duplicating work', async () => {
    const worker = new DeboWorker();

    const event = createDeboEvent({
      name: 'connector.sync.requested',
      workspaceId: 'ws_sync',
      idempotencyKey: 'fixed_sync_key_999',
      payload: {
        connectionId: 'conn_github_1',
        provider: 'github',
      },
    });

    const req1 = new Request('http://localhost:8787/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    const res1 = await worker.fetchHandler(req1);
    expect(res1.status).toBe(200);
    const body1 = await res1.json();

    const req2 = new Request('http://localhost:8787/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    const res2 = await worker.fetchHandler(req2);
    expect(res2.status).toBe(200);
    const body2 = await res2.json();

    expect(body1.result).toEqual(body2.result);
  });

  it('returns 400 for unknown event names', async () => {
    const worker = new DeboWorker();

    const event = createDeboEvent({
      name: 'unknown.bogus.event',
      workspaceId: 'ws_sync',
      payload: {},
    });

    const req = new Request('http://localhost:8787/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    const res = await worker.fetchHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Unhandled event name');
  });
});
