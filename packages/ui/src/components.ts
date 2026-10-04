import { COLOR_TOKENS, RADII, TYPOGRAPHY } from './tokens';

export interface CitationProps {
  chunkId: string;
  index: number;
  quote: string;
  sourceTitle?: string;
}

export function renderCitationBadge(props: CitationProps): string {
  const quoteEscaped = props.quote.replace(/"/g, '&quot;');
  return `<span class="debo-citation" data-chunk-id="${props.chunkId}" data-quote="${quoteEscaped}" style="display:inline-flex;align-items:center;padding:1px 6px;margin:0 2px;background:${COLOR_TOKENS.light.bgMuted};color:${COLOR_TOKENS.light.accentHighlight};font-family:${TYPOGRAPHY.fontMono};font-size:${TYPOGRAPHY.sizes.mono};border-radius:${RADII.input};cursor:pointer;border:1px solid ${COLOR_TOKENS.light.borderSubtle};" title="${quoteEscaped}">[^${props.index}]</span>`;
}

export interface ApprovalCardProps {
  approvalId: string;
  toolName: string;
  riskTier: 'READ' | 'LOW_WRITE' | 'EXTERNAL_WRITE' | 'DESTRUCTIVE';
  parameters: Record<string, unknown>;
}

export function renderApprovalCard(props: ApprovalCardProps): string {
  const paramsStr = JSON.stringify(props.parameters, null, 2);
  const isDestructive = props.riskTier === 'DESTRUCTIVE';
  const badgeColor = isDestructive ? '#b91c1c' : COLOR_TOKENS.light.accentHighlight;

  return `
<div class="debo-approval-card" style="border:1px solid ${COLOR_TOKENS.light.borderStrong};border-radius:${RADII.card};background:${COLOR_TOKENS.light.bgSurface};padding:16px;margin:12px 0;">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
    <span style="font-weight:600;font-size:14px;color:${COLOR_TOKENS.light.fgPrimary};">Action Approval Required</span>
    <span style="font-size:11px;font-family:${TYPOGRAPHY.fontMono};color:#fff;background:${badgeColor};padding:2px 8px;border-radius:${RADII.input};">${props.riskTier}</span>
  </div>
  <p style="font-size:13px;color:${COLOR_TOKENS.light.fgSecondary};margin:4px 0 8px 0;">The agent requested to execute <code>${props.toolName}</code>:</p>
  <pre style="background:${COLOR_TOKENS.light.bgMuted};padding:8px;border-radius:${RADII.input};font-size:12px;font-family:${TYPOGRAPHY.fontMono};overflow-x:auto;">${paramsStr}</pre>
  <div style="display:flex;gap:8px;margin-top:12px;">
    <button class="debo-btn-approve" data-approval-id="${props.approvalId}" style="background:${COLOR_TOKENS.light.accentPrimary};color:#fff;border:none;padding:6px 16px;border-radius:${RADII.button};font-size:13px;cursor:pointer;">Approve</button>
    <button class="debo-btn-reject" data-approval-id="${props.approvalId}" style="background:transparent;color:${COLOR_TOKENS.light.fgSecondary};border:1px solid ${COLOR_TOKENS.light.borderSubtle};padding:6px 16px;border-radius:${RADII.button};font-size:13px;cursor:pointer;">Reject</button>
  </div>
</div>`;
}

export interface SourceCardProps {
  id: string;
  title: string;
  mimeType: string;
  byteSize: number;
  status: string;
}

export function renderSourceCard(props: SourceCardProps): string {
  const sizeKb = (props.byteSize / 1024).toFixed(1);
  return `
<div class="debo-source-card" style="border:1px solid ${COLOR_TOKENS.light.borderSubtle};border-radius:${RADII.card};background:${COLOR_TOKENS.light.bgSurface};padding:14px;display:flex;justify-content:space-between;align-items:center;">
  <div>
    <h4 style="margin:0 0 4px 0;font-size:14px;color:${COLOR_TOKENS.light.fgPrimary};font-weight:500;">${props.title}</h4>
    <div style="font-size:12px;color:${COLOR_TOKENS.light.fgMuted};font-family:${TYPOGRAPHY.fontMono};">${props.mimeType} &bull; ${sizeKb} KB</div>
  </div>
  <span style="font-size:11px;font-family:${TYPOGRAPHY.fontMono};padding:2px 8px;border-radius:${RADII.input};background:${COLOR_TOKENS.light.bgMuted};color:${COLOR_TOKENS.light.fgSecondary};">${props.status}</span>
</div>`;
}

export function renderEmptyState(title: string, description: string, actionLabel?: string): string {
  return `
<div class="debo-empty-state" style="text-align:center;padding:48px 16px;border:1px dashed ${COLOR_TOKENS.light.borderSubtle};border-radius:${RADII.card};">
  <h3 style="font-size:16px;font-weight:500;color:${COLOR_TOKENS.light.fgPrimary};margin:0 0 6px 0;">${title}</h3>
  <p style="font-size:13px;color:${COLOR_TOKENS.light.fgSecondary};margin:0 0 16px 0;">${description}</p>
  ${actionLabel ? `<button style="background:${COLOR_TOKENS.light.accentPrimary};color:#fff;border:none;padding:8px 16px;border-radius:${RADII.button};font-size:13px;cursor:pointer;">${actionLabel}</button>` : ''}
</div>`;
}
