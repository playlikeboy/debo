import { renderPageLayout } from './layout';

export function renderAskPage(workspaceId: string, userId: string): string {
  const content = `
<div style="margin-bottom:24px;">
  <h2 style="font-size:26px;font-weight:600;margin-bottom:6px;">Ask Your Past</h2>
  <p style="color:#5c5c57;font-size:15px;">Ask factual questions across your documents, journals, and life context. Every claim cites exact sources.</p>
</div>

<div style="background:#fff;border:1px solid #e5e5e0;border-radius:10px;padding:24px;min-height:400px;display:flex;flex-direction:column;justify-content:space-between;">
  <div id="chat-stream" style="display:flex;flex-direction:column;gap:16px;overflow-y:auto;max-height:450px;">
    <div style="background:#f0f0ed;padding:12px 16px;border-radius:8px;font-size:14px;color:#5c5c57;max-width:80%;">
      Hello! Ask me anything from your personal history or uploaded documents.
    </div>
  </div>

  <div style="margin-top:24px;">
    <form id="ask-form" style="display:flex;gap:10px;">
      <input id="ask-input" type="text" placeholder="e.g. When did I design the Debo architecture?" required style="flex:1;padding:12px 16px;border:1px solid #cfcfc8;border-radius:6px;font-size:15px;" />
      <button type="submit" id="ask-btn" style="background:#2b5c56;color:#fff;border:none;padding:12px 24px;border-radius:6px;font-weight:500;font-size:15px;cursor:pointer;">Ask</button>
    </form>
  </div>
</div>

<script>
  const form = document.getElementById('ask-form');
  const input = document.getElementById('ask-input');
  const chatStream = document.getElementById('chat-stream');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    // Append user message
    const userBubble = document.createElement('div');
    userBubble.style = "align-self:flex-end;background:#2b5c56;color:#fff;padding:10px 16px;border-radius:8px;font-size:14px;max-width:80%;";
    userBubble.textContent = query;
    chatStream.appendChild(userBubble);
    input.value = '';

    // Create assistant bubble
    const assistantBubble = document.createElement('div');
    assistantBubble.style = "background:#f9f9f8;border:1px solid #e5e5e0;padding:14px 18px;border-radius:8px;font-size:14px;max-width:85%;line-height:1.6;";
    assistantBubble.textContent = "Thinking...";
    chatStream.appendChild(assistantBubble);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debo-Workspace': '${workspaceId}',
          'X-Debo-User': '${userId}'
        },
        body: JSON.stringify({ query })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.replace('data: ', ''));
            if (data.type === 'text-delta') {
              accumulatedText += data.text;
              assistantBubble.innerHTML = accumulatedText;
            } else if (data.type === 'finish') {
              accumulatedText = data.finalText;
              assistantBubble.innerHTML = accumulatedText;
            } else if (data.type === 'approval-requested') {
              const card = document.createElement('div');
              card.innerHTML = \`<div style="margin-top:12px;padding:12px;border:1px solid #c76a3a;border-radius:6px;background:#fff;">
                <strong>Action Approval Required:</strong> \${data.toolName} (\${data.riskTier})
                <br/><button onclick="alert('Action approved')" style="margin-top:6px;background:#2b5c56;color:#fff;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;">Approve</button>
              </div>\`;
              assistantBubble.appendChild(card);
            }
          }
        }
      }
    } catch (err) {
      assistantBubble.textContent = "Error communicating with Debo agent.";
    }
  });
</script>
`;

  return renderPageLayout(content, {
    title: 'Ask Past',
    activePath: '/app/ask',
    workspaceId,
    userId,
  });
}
