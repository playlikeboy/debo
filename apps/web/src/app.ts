import { DegradedMemoryProvider, MemoryService } from '@debo/memory';
import { createChatStreamHandler } from './api/chat';
import { renderAskPage } from './pages/ask';
import { renderHomePage } from './pages/home';
import { renderJournalPage } from './pages/journal';
import { renderLandingPage } from './pages/landing';
import { renderLibraryPage } from './pages/library';
import { renderLoginPage } from './pages/login';
import { renderTimelinePage } from './pages/timeline';

export class DeboWebApp {
  public readonly memoryService: MemoryService;
  private readonly chatHandler: (req: Request) => Promise<Response>;

  constructor(memoryService?: MemoryService) {
    this.memoryService = memoryService ?? new MemoryService(new DegradedMemoryProvider());
    this.chatHandler = createChatStreamHandler(this.memoryService);
  }

  fetchHandler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);

    // Apply security headers helper
    const withSecurityHeaders = (res: Response): Response => {
      res.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
      );
      res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.headers.set('X-Content-Type-Options', 'nosniff');
      res.headers.set('X-Frame-Options', 'DENY');
      return res;
    };

    if (url.pathname === '/health') {
      return withSecurityHeaders(
        new Response(
          JSON.stringify({
            status: 'healthy',
            service: 'debo-web',
            version: '0.1.0',
            timestamp: new Date().toISOString(),
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    }

    if (url.pathname === '/') {
      return withSecurityHeaders(
        new Response(renderLandingPage(), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      );
    }

    if (url.pathname === '/login') {
      return withSecurityHeaders(
        new Response(renderLoginPage(), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      );
    }

    // Authenticated workspace resolution
    const workspaceId = url.searchParams.get('workspaceId') || 'ws_default';
    const userId = url.searchParams.get('userId') || 'usr_primary';

    if (url.pathname === '/app') {
      return withSecurityHeaders(
        new Response(renderHomePage(workspaceId, userId), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      );
    }

    if (url.pathname === '/app/ask') {
      return withSecurityHeaders(
        new Response(renderAskPage(workspaceId, userId), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      );
    }

    if (url.pathname === '/app/journal') {
      if (req.method === 'POST') {
        try {
          const formData = await req.formData();
          const content = String(formData.get('content') || '');
          if (content) {
            await this.memoryService.remember(
              { workspaceId, userId, role: 'member' },
              { content, metadata: { source: 'journal' } },
            );
          }
          return Response.redirect(`${url.origin}/app?captured=true`, 303);
        } catch {
          // fall through
        }
      }

      return withSecurityHeaders(
        new Response(renderJournalPage(workspaceId, userId), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      );
    }

    if (url.pathname === '/app/library') {
      return withSecurityHeaders(
        new Response(renderLibraryPage(workspaceId, userId), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      );
    }

    if (url.pathname === '/app/timeline') {
      return withSecurityHeaders(
        new Response(renderTimelinePage(workspaceId, userId), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      );
    }

    if (url.pathname === '/api/chat' && req.method === 'POST') {
      const response = await this.chatHandler(req);
      return withSecurityHeaders(response);
    }

    return withSecurityHeaders(
      new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain' } }),
    );
  };
}
