import { renderSourceCard } from '@debo/ui';
import { renderPageLayout } from './layout';

export function renderHomePage(workspaceId: string, userId: string): string {
  const content = `
<div style="margin-bottom:32px;">
  <h2 style="font-size:26px;font-weight:600;margin-bottom:8px;">Workspace Overview</h2>
  <p style="color:#5c5c57;font-size:15px;">Welcome back. Debo is actively indexing and grounding your memories.</p>
</div>

<div style="display:grid;grid-template-columns:1fr;gap:24px;">
  <div style="background:#fff;border:1px solid #e5e5e0;border-radius:10px;padding:24px;">
    <h3 style="font-size:16px;font-weight:600;margin-bottom:12px;">Quick Capture</h3>
    <form action="/app/journal" method="POST" style="display:flex;gap:12px;">
      <input type="text" name="content" placeholder="Remember something new today..." required style="flex:1;padding:10px 14px;border:1px solid #cfcfc8;border-radius:6px;font-size:14px;" />
      <button type="submit" style="background:#2b5c56;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-weight:500;cursor:pointer;">Capture</button>
    </form>
  </div>

  <div>
    <h3 style="font-size:16px;font-weight:600;margin-bottom:12px;">Recent Source Containers</h3>
    <div style="display:grid;gap:10px;">
      ${renderSourceCard({
        id: 'src_debo_arch',
        title: 'Debo Architecture Specification (Phase 1 Baseline)',
        mimeType: 'text/markdown',
        byteSize: 14200,
        status: 'INDEXED',
      })}
      ${renderSourceCard({
        id: 'src_journal_today',
        title: 'Daily Journal — October 4, 2026',
        mimeType: 'text/plain',
        byteSize: 2048,
        status: 'INDEXED',
      })}
    </div>
  </div>
</div>
`;

  return renderPageLayout(content, {
    title: 'Overview',
    activePath: '/app',
    workspaceId,
    userId,
  });
}
