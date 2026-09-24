import { Metadata } from "next";
import { Shield, Lock, Eye, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we handle your data and memory engine privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="relative py-24 md:py-32 bg-landing-bg min-h-screen">
      <div className="mx-auto max-w-[800px] px-6 lg:px-8">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-landing-border bg-landing-surface px-4 py-1.5 text-landing-xs font-semibold uppercase tracking-wider text-landing-text-secondary shadow-sm">
            <Shield className="h-4 w-4 text-landing-accent" />
            Privacy First
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-semibold text-landing-text-primary leading-[1.1]">
            Your memories deserve <span className="text-landing-accent">clear boundaries.</span>
          </h1>
          <p className="mt-6 text-landing-lg font-medium text-landing-text-secondary max-w-2xl mx-auto leading-relaxed">
            We built Debo as a personal memory system. We do not sell your personal memory data, and the product is designed around account-level access controls and user-managed memory.
          </p>
        </div>

        <div className="space-y-8">
          <PrivacySection 
            number="1"
            title="Data Sovereignty"
            icon={<Lock className="w-5 h-5 text-landing-text-primary" />}
          >
            Debo is built around personal memory sovereignty. Your journals, reflections, and extracted memories are associated with your account and workspace. We do not sell your personal memory data or use it to train a shared Debo model.
          </PrivacySection>

          <PrivacySection 
            number="2"
            title="Memory Extraction"
            icon={<BrainIcon className="w-5 h-5 text-landing-text-primary" />}
          >
            When you journal, the engine can extract facts, tasks, and relationships into your personal memory graph. Database queries are scoped to the authenticated account and workspace, and connector credentials are protected with application-level authenticated encryption.
          </PrivacySection>

          <PrivacySection 
            number="3"
            title="AI Processing"
            icon={<Eye className="w-5 h-5 text-landing-text-primary" />}
          >
            Some features use external inference or transcription providers, such as configured OpenAI/NVIDIA-compatible models or Deepgram. Debo sends data required for the requested feature; each provider has its own retention and privacy terms. Debo does not use your content to train a shared Debo model.
          </PrivacySection>

          <PrivacySection 
            number="4"
            title="Security Practices"
            icon={<CheckCircle2 className="w-5 h-5 text-landing-text-primary" />}
          >
            We use TLS for network transport, account/workspace-scoped authorization, encrypted connector credentials, and private object-storage access patterns. We also avoid exposing private media through public upload directories. See the security architecture page for implementation details.
          </PrivacySection>
        </div>

        <div className="mt-16 p-8 rounded-[20px] border border-landing-border bg-landing-surface text-center shadow-sm">
          <p className="text-landing-xs font-bold text-landing-text-tertiary uppercase tracking-widest mb-2">Last Updated</p>
          <p className="text-landing-base font-semibold text-landing-text-primary">September 24, 2026</p>
        </div>
      </div>
    </div>
  );
}

function PrivacySection({ 
  number, 
  title, 
  icon, 
  children,
}: { 
  number: string; 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
}) {
  return (
    <div className="p-8 border border-landing-border rounded-[20px] bg-landing-surface shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-xl border border-landing-border bg-landing-bg flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-landing-xs font-bold uppercase tracking-widest text-landing-text-tertiary">Section {number}</span>
            <div className="h-px flex-1 bg-landing-border-light" />
          </div>
          <h2 className="text-landing-xl font-heading font-semibold text-landing-text-primary">{title}</h2>
          <div className="text-landing-base font-medium text-landing-text-secondary leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z"/>
    </svg>
  );
}
