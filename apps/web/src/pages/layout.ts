import { COLOR_TOKENS, RADII, TYPOGRAPHY } from '@debo/ui';

export interface PageLayoutOptions {
  title: string;
  activePath?: string;
  workspaceId?: string;
  userId?: string;
}

export function renderPageLayout(content: string, options: PageLayoutOptions): string {
  const links = [
    { href: '/app', label: 'Overview' },
    { href: '/app/ask', label: 'Ask Past' },
    { href: '/app/journal', label: 'Journal' },
    { href: '/app/library', label: 'Library' },
    { href: '/app/timeline', label: 'Timeline' },
  ];

  const navHtml = links
    .map(link => {
      const isActive = options.activePath === link.href;
      const weight = isActive ? '600' : '400';
      const color = isActive ? COLOR_TOKENS.light.accentPrimary : COLOR_TOKENS.light.fgSecondary;
      return `<a href="${link.href}" style="text-decoration:none;color:${color};font-weight:${weight};font-size:14px;padding:6px 12px;border-radius:${RADII.input};">${link.label}</a>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${options.title} | Debo Personal AI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${TYPOGRAPHY.fontSans};
      background: ${COLOR_TOKENS.light.bgCanvas};
      color: ${COLOR_TOKENS.light.fgPrimary};
      font-size: ${TYPOGRAPHY.sizes.body};
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    header {
      background: ${COLOR_TOKENS.light.bgSurface};
      border-bottom: 1px solid ${COLOR_TOKENS.light.borderSubtle};
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .brand {
      font-weight: 700;
      font-size: 18px;
      letter-spacing: -0.02em;
      color: ${COLOR_TOKENS.light.fgPrimary};
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-tag {
      font-family: ${TYPOGRAPHY.fontMono};
      font-size: 11px;
      padding: 2px 6px;
      background: ${COLOR_TOKENS.light.bgMuted};
      color: ${COLOR_TOKENS.light.accentPrimary};
      border-radius: ${RADII.input};
      font-weight: 500;
    }
    nav { display: flex; gap: 4px; }
    main { max-width: 960px; margin: 32px auto; padding: 0 24px; }
  </style>
</head>
<body>
  <header>
    <a href="/app" class="brand">
      <span>Debo</span>
      <span class="brand-tag">OS</span>
    </a>
    <nav>
      ${navHtml}
    </nav>
    <div style="font-family:${TYPOGRAPHY.fontMono};font-size:12px;color:${COLOR_TOKENS.light.fgMuted};">
      ${options.workspaceId ? `ws:${options.workspaceId}` : '<a href="/login" style="color:inherit;">Login</a>'}
    </div>
  </header>
  <main>
    ${content}
  </main>
</body>
</html>`;
}
