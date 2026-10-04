import { renderPageLayout } from './layout';

export function renderJournalPage(workspaceId: string, userId: string): string {
  const content = `
<div style="margin-bottom:24px;">
  <h2 style="font-size:26px;font-weight:600;margin-bottom:6px;">Daily Journal</h2>
  <p style="color:#5c5c57;font-size:15px;">Capture thoughts, notes, and events. Debo indexes entries automatically into your private memory graph.</p>
</div>

<div style="background:#fff;border:1px solid #e5e5e0;border-radius:10px;padding:24px;">
  <form action="/app/journal" method="POST">
    <div style="margin-bottom:16px;">
      <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px;">What's on your mind today?</label>
      <textarea name="content" rows="6" placeholder="Write anything... meetings attended, decisions made, people met, ideas contemplated." required style="width:100%;padding:14px;border:1px solid #cfcfc8;border-radius:6px;font-size:15px;font-family:inherit;line-height:1.6;"></textarea>
    </div>
    <div style="display:flex;justify-content:flex-end;">
      <button type="submit" style="background:#2b5c56;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-weight:500;font-size:14px;cursor:pointer;">Save Entry</button>
    </div>
  </form>
</div>
`;

  return renderPageLayout(content, {
    title: 'Journal',
    activePath: '/app/journal',
    workspaceId,
    userId,
  });
}
