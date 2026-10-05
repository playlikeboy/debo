import React from 'react';

export default function TimelinePage() {
  const events = [
    {
      id: 'e1',
      date: 'Today, 10:15 AM',
      type: 'journal',
      title: 'Morning Architectural Alignment',
      snippet: 'Reconciled BlockNote rich-text editor and Neon PostgreSQL schema for journal entries.',
    },
    {
      id: 'e2',
      date: 'Yesterday, 4:30 PM',
      type: 'doc',
      title: 'ADR-0006 Agentic UI Layer',
      snippet: 'Selected AG-UI 1.0 as the Agent ↔ User interaction protocol boundary.',
    },
    {
      id: 'e3',
      date: 'Oct 3, 2026',
      type: 'mcp',
      title: 'MCP HMAC Cryptographic Authentication',
      snippet: 'Enforced unforgeable signed bearer tokens across all MCP server endpoints.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#181816]">Timeline</h1>
        <p className="text-sm text-[#5c5c57] mt-1">
          Chronological index of memories, journal reflections, and ingested knowledge.
        </p>
      </div>

      <div className="relative pl-6 border-l-2 border-[#e5e5e0] space-y-8">
        {events.map(ev => (
          <div key={ev.id} className="relative group">
            {/* Timeline bullet */}
            <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#2b5c56]" />

            <div className="bg-white p-5 rounded-lg border border-[#e5e5e0] shadow-xs">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-[#8a8a83]">{ev.date}</span>
                <span className="font-mono uppercase text-[10px] bg-[#f0f0ed] px-2 py-0.5 rounded text-[#5c5c57]">
                  {ev.type}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-[#181816] mb-1">{ev.title}</h3>
              <p className="text-xs text-[#5c5c57] leading-relaxed">{ev.snippet}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
