import { describe, expect, it } from 'bun:test';
import { DegradedMemoryProvider, MemoryService } from '@debo/memory';
import { decodeStreamEvent, StreamEvent } from '@debo/ui';
import { DeboWebApp } from '../src/app';

describe('Debo Web Application (apps/web)', () => {
  const memoryService = new MemoryService(new DegradedMemoryProvider());
  const app = new DeboWebApp(memoryService);

  it('responds to /health with 200 and security headers', async () => {
    const req = new Request('http://localhost:3000/health');
    const res = await app.fetchHandler(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('healthy');
    expect(body.service).toBe('debo-web');

    // Verify security headers
    expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    expect(res.headers.get('Strict-Transport-Security')).toBeDefined();
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('renders all MVP product routes successfully', async () => {
    const routes = [
      '/',
      '/login',
      '/app',
      '/app/ask',
      '/app/journal',
      '/app/library',
      '/app/timeline',
    ];

    for (const route of routes) {
      const req = new Request(`http://localhost:3000${route}`);
      const res = await app.fetchHandler(req);
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain('<!DOCTYPE html>');
      expect(text).toContain('Debo');
    }
  });

  it('streams answers with citations via POST /api/chat', async () => {
    // Prime memory
    await memoryService.remember(
      { workspaceId: 'ws_web_test', userId: 'usr_alice', role: 'member' },
      { content: 'Debo OS architecture was established on October 4, 2026.' },
    );

    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debo-Workspace': 'ws_web_test',
        'X-Debo-User': 'usr_alice',
      },
      body: JSON.stringify({ query: 'When was Debo architecture established?' }),
    });

    const res = await app.fetchHandler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');

    const reader = res.body?.getReader();
    expect(reader).toBeDefined();

    const decoder = new TextDecoder();
    const events: StreamEvent[] = [];

    while (true) {
      const { value, done } = await reader!.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n\n');
      for (const line of lines) {
        const evt = decodeStreamEvent(line);
        if (evt) {
          events.push(evt);
        }
      }
    }

    expect(events.length).toBeGreaterThan(0);
    const finishEvt = events.find(e => e.type === 'finish');
    expect(finishEvt).toBeDefined();
    if (finishEvt && finishEvt.type === 'finish') {
      expect(finishEvt.finalText).toContain('Debo OS architecture was established');
    }
  });

  it('streams approval-requested event on high-risk destructive actions', async () => {
    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debo-Workspace': 'ws_web_test',
        'X-Debo-User': 'usr_alice',
      },
      body: JSON.stringify({ query: 'Please delete repo SH20RAJ/debo right now' }),
    });

    const res = await app.fetchHandler(req);
    expect(res.status).toBe(200);

    const text = await res.text();
    expect(text).toContain('approval-requested');
    expect(text).toContain('DESTRUCTIVE');
    expect(text).toContain('delete_resource');
  });
});
