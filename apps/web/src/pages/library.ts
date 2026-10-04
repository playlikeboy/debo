import { renderSourceCard } from '@debo/ui';
import { renderPageLayout } from './layout';

export function renderLibraryPage(workspaceId: string, userId: string): string {
  const content = `
<div style="margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end;">
  <div>
    <h2 style="font-size:26px;font-weight:600;margin-bottom:6px;">Source Library</h2>
    <p style="color:#5c5c57;font-size:15px;">Original documents, PDFs, audio recordings, and notes stored in Cloudflare R2.</p>
  </div>
  <button style="background:#2b5c56;color:#fff;border:none;padding:10px 18px;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;">+ Upload Document</button>
</div>

<div style="display:grid;gap:12px;">
  ${renderSourceCard({
    id: 'src_research_paper',
    title: 'Docling: Advanced Document Layout & Table Parser.pdf',
    mimeType: 'application/pdf',
    byteSize: 2450000,
    status: 'PROCESSED',
  })}
  ${renderSourceCard({
    id: 'src_notes_oct4',
    title: 'Engineering Notes — October 4 Rebuild.md',
    mimeType: 'text/markdown',
    byteSize: 34000,
    status: 'INDEXED',
  })}
  ${renderSourceCard({
    id: 'src_meeting_audio',
    title: 'Strategy Session Recording.mp3',
    mimeType: 'audio/mpeg',
    byteSize: 18200000,
    status: 'TRANSCRIBED',
  })}
</div>
`;

  return renderPageLayout(content, {
    title: 'Library',
    activePath: '/app/library',
    workspaceId,
    userId,
  });
}
