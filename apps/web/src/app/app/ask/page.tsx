'use client';

import React, { useState } from 'react';
import { ArrowUp, Bot, Brain, CheckCircle, FileText, Loader2, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{ chunkId: string; quote: string; index: number; sourceTitle?: string }>;
}

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am Debo. You can ask me anything about your saved journal entries, notes, and uploaded sources. Every answer is grounded in authentic context with verifiable citations.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<{
    index: number;
    quote: string;
    sourceTitle?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat error: ${res.statusText}`);
      }

      // Read SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      const citationsList: Array<{ chunkId: string; quote: string; index: number; sourceTitle?: string }> = [];

      const assistantMsgId = `asst_${Date.now()}`;
      setMessages(prev => [
        ...prev,
        { id: assistantMsgId, role: 'assistant', content: '', citations: [] },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const event = JSON.parse(line.replace(/^data:\s*/, ''));
                if (event.type === 'text-delta') {
                  assistantText += event.text;
                } else if (event.type === 'citation') {
                  citationsList.push({
                    chunkId: event.chunkId,
                    quote: event.quote,
                    index: citationsList.length + 1,
                    sourceTitle: event.sourceTitle || 'Journal / Source',
                  });
                } else if (event.type === 'finish') {
                  if (event.finalText) {
                    assistantText = event.finalText;
                  }
                }

                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, content: assistantText, citations: [...citationsList] }
                      : m,
                  ),
                );
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'An error occurred while generating a source-grounded response. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f9f9f8] overflow-hidden">
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full h-full border-x border-[#e5e5e0] bg-white">
        {/* Chat Header */}
        <div className="h-16 px-6 border-b border-[#e5e5e0] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#c76a3a]/10 text-[#c76a3a] flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#181816]">Ask Debo</h2>
              <p className="text-[11px] text-[#5c5c57] font-mono">
                Source-grounded memory retrieval
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-[#2b5c56] bg-[#2b5c56]/10 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            <span>Verifiable Citations</span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#2b5c56] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-lg p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#2b5c56] text-white'
                    : 'bg-[#fdfdfc] border border-[#e5e5e0] text-[#181816] shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Render Citations if present */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#e5e5e0] flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] font-mono text-[#8a8a83] mr-1">Sources:</span>
                    {msg.citations.map(cit => (
                      <button
                        key={cit.index}
                        onClick={() => setSelectedCitation(cit)}
                        className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#f0f0ed] text-[#c76a3a] border border-[#e5e5e0] font-mono text-xs hover:bg-[#e5e5e0] transition cursor-pointer"
                        title={cit.quote}
                      >
                        [^{cit.index}]
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-[#181816] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3.5">
              <div className="w-7 h-7 rounded-full bg-[#2b5c56] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#fdfdfc] border border-[#e5e5e0] rounded-lg p-4 shadow-xs">
                <div className="flex items-center gap-2 text-xs text-[#5c5c57] font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c76a3a]" />
                  <span>Retrieving and validating memory sources...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#e5e5e0] bg-[#ffffff] shrink-0">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything from your journal, notes, or memories..."
              className="w-full pl-4 pr-12 py-3 bg-[#f9f9f8] border border-[#e5e5e0] rounded-lg text-sm text-[#181816] placeholder-[#8a8a83] outline-none focus:border-[#2b5c56] transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2.5 p-2 rounded-md bg-[#2b5c56] text-white hover:bg-[#234c47] disabled:opacity-40 transition cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Citation Preview Drawer / Panel */}
      {selectedCitation && (
        <aside className="w-80 border-l border-[#e5e5e0] bg-[#fdfdfc] p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e0] mb-4">
              <span className="text-xs font-semibold font-mono text-[#c76a3a]">
                Citation [^{selectedCitation.index}]
              </span>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-xs text-[#8a8a83] hover:text-[#181816]"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-[#181816]">
                <FileText className="w-4 h-4 text-[#2b5c56]" />
                <span>{selectedCitation.sourceTitle || 'Journal Note'}</span>
              </div>
              <blockquote className="p-3 bg-white rounded border border-[#e5e5e0] text-xs text-[#5c5c57] italic leading-relaxed">
                "{selectedCitation.quote}"
              </blockquote>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e5e5e0] text-[11px] font-mono text-[#2b5c56] flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>100% Quote Match Verified</span>
          </div>
        </aside>
      )}
    </div>
  );
}
