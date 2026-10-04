import { COLOR_TOKENS, RADII, TYPOGRAPHY } from '@debo/ui';

export function renderLandingPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Debo — Private Personal AI Memory & Context OS</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${TYPOGRAPHY.fontSans};
      background: ${COLOR_TOKENS.light.bgCanvas};
      color: ${COLOR_TOKENS.light.fgPrimary};
      line-height: 1.6;
    }
    .hero {
      max-width: 800px;
      margin: 120px auto 60px auto;
      text-align: center;
      padding: 0 24px;
    }
    h1 {
      font-size: 52px;
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 24px;
    }
    p.lead {
      font-size: 20px;
      color: ${COLOR_TOKENS.light.fgSecondary};
      margin-bottom: 36px;
      line-height: 1.5;
    }
    .cta-btn {
      display: inline-block;
      background: ${COLOR_TOKENS.light.accentPrimary};
      color: #fff;
      font-size: 16px;
      font-weight: 500;
      padding: 12px 28px;
      border-radius: ${RADII.button};
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .cta-btn:hover { opacity: 0.9; }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      max-width: 960px;
      margin: 80px auto;
      padding: 0 24px;
    }
    .feature-card {
      background: ${COLOR_TOKENS.light.bgSurface};
      border: 1px solid ${COLOR_TOKENS.light.borderSubtle};
      border-radius: ${RADII.card};
      padding: 24px;
    }
    .feature-card h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .feature-card p {
      font-size: 14px;
      color: ${COLOR_TOKENS.light.fgSecondary};
    }
  </style>
</head>
<body>
  <div class="hero">
    <h1>Capture anything.<br/>Ask your past.<br/>Trust every answer.</h1>
    <p class="lead">Debo is your private, source-grounded personal AI memory operating system. Connect your documents, journals, and tools with zero hallucinated quotes and deterministic tenant security.</p>
    <a href="/login" class="cta-btn">Enter Workspace</a>
  </div>

  <div class="features">
    <div class="feature-card">
      <h3>Source-Grounded Memory</h3>
      <p>Every factual answer cites exact provenance: PDF bounding boxes, journal character spans, and timecoded transcripts.</p>
    </div>
    <div class="feature-card">
      <h3>Non-LLM Authority</h3>
      <p>Permissions and destructive actions are governed by strict code, never entrusted to arbitrary model decisions.</p>
    </div>
    <div class="feature-card">
      <h3>Official MCP Gateway</h3>
      <p>Expose your personal context seamlessly to Claude Desktop, Cursor, and external agents via Streamable HTTP.</p>
    </div>
  </div>
</body>
</html>`;
}
