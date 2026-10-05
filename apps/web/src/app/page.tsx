import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, CheckCircle2, Lock, ShieldCheck, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f9f9f8] text-[#181816] flex flex-col">
      {/* Navigation */}
      <header className="border-b border-[#e5e5e0] bg-[#ffffff]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#181816]">Debo</span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#2b5c56] bg-[#2b5c56]/10 px-2 py-0.5 rounded">
              Memory OS
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[#5c5c57] hover:text-[#181816] transition"
            >
              Sign In
            </Link>
            <Link
              href="/app"
              className="text-sm font-medium px-4 py-2 rounded bg-[#2b5c56] text-white hover:bg-[#234c47] transition flex items-center gap-1.5 shadow-xs"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f0ed] border border-[#e5e5e0] text-xs text-[#5c5c57] mb-8 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#c76a3a]" />
          <span>Calm Editorial Precision &bull; Verifiable Grounding</span>
        </div>

        <h1 className="font-serif text-5xl md:text-6xl font-normal tracking-tight text-[#181816] max-w-3xl leading-[1.15] mb-6">
          A private memory OS that remembers everything with{' '}
          <span className="italic underline decoration-[#c76a3a] decoration-2 underline-offset-4">
            verifiable proof.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[#5c5c57] max-w-2xl leading-relaxed mb-10">
          Debo indexes your journals, notes, research papers, and conversations into a deterministic
          memory graph. Every agent answer links directly to authentic provenance.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/app/journal"
            className="px-6 py-3 rounded bg-[#2b5c56] text-white font-medium hover:bg-[#234c47] transition flex items-center gap-2 text-base shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open Rich Journal</span>
          </Link>
          <Link
            href="/app/ask"
            className="px-6 py-3 rounded bg-white border border-[#cfcfc8] text-[#181816] font-medium hover:bg-[#f0f0ed] transition flex items-center gap-2 text-base"
          >
            <Brain className="w-4 h-4 text-[#c76a3a]" />
            <span>Ask Memory</span>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mt-6">
          <div className="bg-white p-6 rounded-lg border border-[#e5e5e0] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded bg-[#2b5c56]/10 flex items-center justify-center text-[#2b5c56] mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-[#181816] mb-2">BlockNote Rich Journal</h3>
              <p className="text-sm text-[#5c5c57] leading-relaxed">
                Full block-based editing experience with slash commands, checklists, and automatic
                debounced vector indexing into your private memory space.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#f0f0ed] text-xs font-mono text-[#2b5c56]">
              Auto-persisted to Neon PostgreSQL
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#e5e5e0] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded bg-[#c76a3a]/10 flex items-center justify-center text-[#c76a3a] mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-[#181816] mb-2">Strict Source Grounding</h3>
              <p className="text-sm text-[#5c5c57] leading-relaxed">
                Interactive numeric citation badges ([^1]) showing verified quotes, page numbers, and
                character offsets. Hallucinated quotes are strictly rejected.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#f0f0ed] text-xs font-mono text-[#c76a3a]">
              LangGraph validation node
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#e5e5e0] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded bg-[#181816]/10 flex items-center justify-center text-[#181816] mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-[#181816] mb-2">Deterministic Security</h3>
              <p className="text-sm text-[#5c5c57] leading-relaxed">
                Tenant isolation enforced unconditionally. Cryptographic signed HMAC bearer tokens and
                SHA-256 hashed keys for Model Context Protocol (MCP).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#f0f0ed] text-xs font-mono text-[#181816]">
              Fail-closed authorization
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e0] bg-white py-8 text-center text-xs text-[#8a8a83]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2b5c56]" />
            <span>Debo Private Memory OS &bull; Production Architecture</span>
          </div>
          <div className="font-mono text-[11px]">
            Cloudflare R2 &bull; Neon PostgreSQL &bull; Trigger.dev &bull; LangGraph JS
          </div>
        </div>
      </footer>
    </div>
  );
}
