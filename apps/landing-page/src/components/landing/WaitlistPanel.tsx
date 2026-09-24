import { ArrowUpRight, ShieldCheck } from "lucide-react";

import { appUrl } from "@/lib/launch";

export function WaitlistPanel({ className = "" }: { className?: string }) {
  return (
    <div className={`duo-card p-5 ${className}`}>
      <div className="mb-4 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Debo</div>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground">Public preview is live</h2>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-primary">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Open now
        </div>
      </div>
      <a href={appUrl} target="_blank" rel="noopener noreferrer" className="minimal-btn-primary px-6 py-2.5 text-sm flex w-full items-center justify-center">
        Open Debo
        <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  );
}
