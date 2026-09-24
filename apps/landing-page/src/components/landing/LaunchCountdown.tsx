import { ArrowUpRight } from "lucide-react";
import { appUrl } from "@/lib/launch";

export function LaunchCountdown({ compact = false }: { compact?: boolean }) {
  return (
    <a href={appUrl} target="_blank" rel="noopener noreferrer" className={`${compact ? "px-5 py-4" : "px-6 py-5"} flex items-center justify-between rounded-2xl border-2 border-primary/20 bg-primary/10 text-sm font-bold text-primary transition-colors hover:bg-primary/15`}>
      <span>Public preview is live. Open Debo.</span>
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}
