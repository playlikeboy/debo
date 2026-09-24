import { ArrowRight } from "lucide-react";
import { appUrl } from "@/lib/launch";

export function FinalCTA() {
  return (
    <section className="py-32 md:py-40 px-6 bg-landing-surface border-t border-landing-border-light">
      <div className="mx-auto max-w-2xl text-center space-y-10">
        <h2 className="font-heading text-landing-3xl md:text-landing-4xl font-semibold tracking-tight text-landing-text-primary">
          Build your memory system.
        </h2>
        <p className="text-landing-lg md:text-landing-xl font-medium text-landing-text-secondary leading-relaxed">
          Capture your journals, voice, documents, and connected-app context in one searchable personal memory layer.
        </p>
        <div className="pt-2">
          <a href={appUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-xl bg-landing-accent px-8 text-landing-sm font-semibold text-white transition-all hover:bg-landing-accent-hover hover:-translate-y-0.5 shadow-sm hover:shadow-md gap-2">
            Open Debo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <p className="mt-5 text-landing-xs font-medium text-landing-text-tertiary">
            Private by default. Source-backed retrieval. MCP-ready.
          </p>
        </div>
      </div>
    </section>
  );
}
