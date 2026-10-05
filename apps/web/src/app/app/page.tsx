import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, Clock, FolderArchive, Sparkles } from 'lucide-react';

export default function OverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Welcome Banner */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0f0ed] border border-[#e5e5e0] text-xs font-mono text-[#5c5c57] mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#2b5c56]" />
          <span>Tenant Scoped &bull; Private Memory Active</span>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#181816]">
          Workspace Overview
        </h1>
        <p className="text-sm text-[#5c5c57] mt-1">
          Your personal memory graph and context operating system.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <Link
          href="/app/journal"
          className="p-5 rounded-lg bg-white border border-[#e5e5e0] hover:border-[#2b5c56] shadow-xs transition group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded bg-[#2b5c56]/10 text-[#2b5c56] flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-[#181816] group-hover:text-[#2b5c56] transition">
              BlockNote Journal
            </h3>
            <p className="text-xs text-[#5c5c57] mt-1 leading-relaxed">
              Capture daily reflections, meeting notes, and decisions with rich text blocks and autosave.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#2b5c56]">
            <span>Open editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/app/ask"
          className="p-5 rounded-lg bg-white border border-[#e5e5e0] hover:border-[#c76a3a] shadow-xs transition group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded bg-[#c76a3a]/10 text-[#c76a3a] flex items-center justify-center mb-3">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-[#181816] group-hover:text-[#c76a3a] transition">
              Ask Debo
            </h3>
            <p className="text-xs text-[#5c5c57] mt-1 leading-relaxed">
              Query your indexed notes and documents with strict citation provenance.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#c76a3a]">
            <span>Start query</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/app/library"
          className="p-5 rounded-lg bg-white border border-[#e5e5e0] hover:border-[#181816] shadow-xs transition group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded bg-[#181816]/10 text-[#181816] flex items-center justify-center mb-3">
              <FolderArchive className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-[#181816] transition">
              Source Library
            </h3>
            <p className="text-xs text-[#5c5c57] mt-1 leading-relaxed">
              Upload PDFs and articles for Docling layout extraction and chunking.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#181816]">
            <span>Browse sources</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg border border-[#e5e5e0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#181816] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8a8a83]" />
              Recent Captures
            </h2>
            <Link href="/app/timeline" className="text-xs text-[#2b5c56] hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-[#f0f0ed] text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-medium text-[#181816]">Daily Journal Entry</div>
                <div className="text-[11px] text-[#8a8a83]">Auto-indexed via BlockNote</div>
              </div>
              <span className="font-mono text-[10px] text-[#8a8a83]">Today</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-medium text-[#181816]">Architecture Decision Records</div>
                <div className="text-[11px] text-[#8a8a83]">ADR-0001 through ADR-0015</div>
              </div>
              <span className="font-mono text-[10px] text-[#8a8a83]">Yesterday</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#e5e5e0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#181816] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2b5c56]" />
              System Status
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#2b5c56]/10 text-[#2b5c56]">
              All Services Operational
            </span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#5c5c57]">Memory Provider</span>
              <span className="font-mono font-medium text-[#181816]">Supermemory / Fallback</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5c5c57]">Agent Runtime</span>
              <span className="font-mono font-medium text-[#181816]">LangGraph JS</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5c5c57]">Durable Workflows</span>
              <span className="font-mono font-medium text-[#181816]">Trigger.dev 4.x</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5c5c57]">MCP Gateway</span>
              <span className="font-mono font-medium text-[#2b5c56]">HMAC Signed Auth (Secure)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
