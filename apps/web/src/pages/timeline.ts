import { renderPageLayout } from './layout';

export function renderTimelinePage(workspaceId: string, userId: string): string {
  const content = `
<div style="margin-bottom:24px;">
  <h2 style="font-size:26px;font-weight:600;margin-bottom:6px;">Episodic Timeline</h2>
  <p style="color:#5c5c57;font-size:15px;">Chronological stream of memories, interactions, and milestones.</p>
</div>

<div style="position:relative;padding-left:24px;border-left:2px solid #e5e5e0;display:flex;flex-direction:column;gap:24px;">
  <div style="position:relative;">
    <div style="position:absolute;left:-31px;top:4px;width:12px;height:12px;border-radius:50%;background:#2b5c56;"></div>
    <div style="font-size:12px;font-family:monospace;color:#8a8a83;margin-bottom:4px;">Today, October 4, 2026 &bull; 13:00</div>
    <div style="background:#fff;border:1px solid #e5e5e0;border-radius:8px;padding:14px;">
      <h4 style="font-size:15px;font-weight:600;margin-bottom:4px;">Production Monorepo & Architecture Verification</h4>
      <p style="font-size:13px;color:#5c5c57;">Verified clean-room baseline across @debo/types, @debo/db, @debo/auth, @debo/storage, @debo/memory, @debo/citations, @debo/workflows, @debo/connectors, @debo/agent, and @debo/mcp.</p>
    </div>
  </div>

  <div style="position:relative;">
    <div style="position:absolute;left:-31px;top:4px;width:12px;height:12px;border-radius:50%;background:#cfcfc8;"></div>
    <div style="font-size:12px;font-family:monospace;color:#8a8a83;margin-bottom:4px;">Yesterday, October 3, 2026 &bull; 18:30</div>
    <div style="background:#fff;border:1px solid #e5e5e0;border-radius:8px;padding:14px;">
      <h4 style="font-size:15px;font-weight:600;margin-bottom:4px;">Cloudflare Ingress & Domain Setup</h4>
      <p style="font-size:13px;color:#5c5c57;">Migrated Tunnel ingress to debo.life, app.debo.life, mcp.debo.life, worker.debo.life.</p>
    </div>
  </div>
</div>
`;

  return renderPageLayout(content, {
    title: 'Timeline',
    activePath: '/app/timeline',
    workspaceId,
    userId,
  });
}
