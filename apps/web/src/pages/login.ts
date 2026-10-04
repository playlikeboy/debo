import { COLOR_TOKENS, RADII, TYPOGRAPHY } from '@debo/ui';

export function renderLoginPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Sign In | Debo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${TYPOGRAPHY.fontSans};
      background: ${COLOR_TOKENS.light.bgCanvas};
      color: ${COLOR_TOKENS.light.fgPrimary};
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .login-box {
      width: 100%;
      max-width: 400px;
      background: ${COLOR_TOKENS.light.bgSurface};
      border: 1px solid ${COLOR_TOKENS.light.borderSubtle};
      border-radius: ${RADII.card};
      padding: 36px 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }
    h2 { font-size: 24px; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.02em; }
    p.sub { font-size: 14px; color: ${COLOR_TOKENS.light.fgSecondary}; margin-bottom: 24px; }
    .form-group { margin-bottom: 16px; }
    label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; }
    input {
      width: 100%;
      padding: 10px 12px;
      font-size: 14px;
      border: 1px solid ${COLOR_TOKENS.light.borderStrong};
      border-radius: ${RADII.input};
      background: ${COLOR_TOKENS.light.bgCanvas};
      font-family: inherit;
    }
    button {
      width: 100%;
      padding: 12px;
      background: ${COLOR_TOKENS.light.accentPrimary};
      color: #fff;
      border: none;
      border-radius: ${RADII.button};
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="login-box">
    <h2>Sign in to Debo</h2>
    <p class="sub">Access your private personal memory context.</p>
    <form action="/app" method="GET">
      <div class="form-group">
        <label>Workspace ID</label>
        <input type="text" name="workspaceId" value="ws_default" required />
      </div>
      <div class="form-group">
        <label>User ID</label>
        <input type="text" name="userId" value="usr_primary" required />
      </div>
      <button type="submit">Continue to Workspace</button>
    </form>
  </div>
</body>
</html>`;
}
