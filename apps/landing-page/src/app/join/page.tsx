import { Metadata } from "next";

import { WaitlistPanel } from "@/components/landing/WaitlistPanel";

export const metadata: Metadata = {
  title: "Open Debo",
  description: "Open the Debo public preview and access your personal AI memory workspace.",
};

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
            Public Preview
          </div>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
            Your personal memory layer is ready.
          </h1>
          <p className="text-lg font-medium leading-relaxed text-muted-foreground">
            Open Debo to capture journals, retrieve past context, and connect your private memory to AI assistants.
          </p>
        </div>
        <WaitlistPanel />
      </div>
    </div>
  );
}
