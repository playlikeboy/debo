import type { Metadata } from "next";
import { Lock, Network, ShieldCheck, Database, KeyRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Security Architecture",
  description: "How Debo protects personal memory, connector credentials, media, and outbound integrations.",
};

const items = [
  { icon: Lock, title: "Account and workspace isolation", text: "Sensitive application queries are scoped to the authenticated account and personal workspace before records are returned or changed." },
  { icon: KeyRound, title: "Connector credential protection", text: "Home Assistant access tokens and custom MCP headers are stored using authenticated application-level encryption rather than plaintext JSON." },
  { icon: Network, title: "Outbound request controls", text: "User-configured integration URLs are validated before server-side requests. Loopback, private-address, unsafe-hostname, credential-bearing, and non-HTTPS destinations are blocked by default." },
  { icon: Database, title: "Private media storage", text: "Production media uploads require configured private object storage. The development fallback writes outside the public web directory." },
  { icon: ShieldCheck, title: "Abuse controls and safe errors", text: "Expensive endpoints have shared request throttling, while unexpected server errors are represented to clients by generic error responses with a request ID." },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-landing-bg px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[920px]">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-landing-border bg-landing-surface px-4 py-1.5 text-landing-xs font-semibold uppercase tracking-wider text-landing-text-secondary">
            <ShieldCheck className="h-4 w-4 text-landing-accent" aria-hidden="true" />
            Security Architecture
          </div>
          <h1 className="text-4xl font-heading font-semibold leading-tight text-landing-text-primary md:text-6xl">
            Private memory needs explicit security boundaries.
          </h1>
          <p className="text-landing-lg font-medium leading-relaxed text-landing-text-secondary">
            Debo handles journals, files, voice recordings, and connected-app context. The implementation is designed so the highest-risk boundaries are explicit and auditable rather than hidden behind marketing language.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {items.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-[20px] border border-landing-border bg-landing-surface p-7 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-landing-border bg-landing-bg text-landing-accent">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-landing-lg font-bold text-landing-text-primary">{title}</h2>
              <p className="mt-2 text-landing-sm font-medium leading-relaxed text-landing-text-secondary">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[20px] border border-landing-border bg-landing-surface p-7">
          <h2 className="text-landing-lg font-bold text-landing-text-primary">What this page does not claim</h2>
          <p className="mt-2 text-landing-sm font-medium leading-relaxed text-landing-text-secondary">
            Debo is not presented here as end-to-end encrypted unless the full client-side encryption architecture is enabled for the relevant data path. External AI and transcription providers can process data required for the feature being used, subject to their own terms and retention policies.
          </p>
        </div>

        <p className="mt-10 text-landing-xs font-medium text-landing-text-tertiary">
          Last reviewed: September 24, 2026 · Security improvements in this release include connector-secret encryption, SSRF controls, private media handling, workspace scoping, rate limiting, and production-safe error responses.
        </p>
      </div>
    </main>
  );
}
