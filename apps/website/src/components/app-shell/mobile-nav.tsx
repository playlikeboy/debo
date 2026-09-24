"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  MessageSquare,
  Plus,
  Brain,
  MoreHorizontal,
  BookOpen,
  Mic,
  CheckSquare,
  Link2,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";

const more = [
  { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
  { href: "/dashboard/voice", label: "Voice", icon: Mic },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/connectors", label: "Connections", icon: Link2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const focusCapture = () => {
    setOpen(false);
    if (pathname === "/dashboard") {
      window.dispatchEvent(new Event("debo:focus-capture"));
    } else {
      router.push("/dashboard?capture=1");
    }
  };

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className="debo-safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 px-2 pt-2 backdrop-blur-xl md:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 items-end gap-1">
          <button type="button" onClick={() => navigate("/dashboard")}
            className="debo-touch-target flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold text-muted-foreground active:bg-accent"
            aria-current={pathname === "/dashboard" ? "page" : undefined}>
            <Home className={pathname === "/dashboard" ? "size-5 text-foreground" : "size-5"} />
            <span>Home</span>
          </button>

          <button type="button" onClick={() => navigate("/dashboard/chat")}
            className="debo-touch-target flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold text-muted-foreground active:bg-accent"
            aria-current={pathname.startsWith("/dashboard/chat") ? "page" : undefined}>
            <MessageSquare className={pathname.startsWith("/dashboard/chat") ? "size-5 text-foreground" : "size-5"} />
            <span>Ask</span>
          </button>

          <button type="button" onClick={focusCapture}
            className="debo-touch-target -mt-5 flex flex-col items-center justify-center gap-0.5 rounded-2xl border border-primary/25 bg-primary p-2 text-primary-foreground shadow-lg shadow-primary/15 active:scale-95"
            aria-label="Capture">
            <Plus className="size-6" />
            <span className="sr-only">Capture</span>
          </button>

          <button type="button" onClick={() => navigate("/dashboard/inbox")}
            className="debo-touch-target flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold text-muted-foreground active:bg-accent"
            aria-current={pathname.startsWith("/dashboard/inbox") ? "page" : undefined}>
            <Brain className={pathname.startsWith("/dashboard/inbox") ? "size-5 text-foreground" : "size-5"} />
            <span>Memory</span>
          </button>

          <button type="button" onClick={() => setOpen(true)}
            className="debo-touch-target flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold text-muted-foreground active:bg-accent"
            aria-expanded={open} aria-controls="debo-mobile-more">
            {open ? <X className="size-5" /> : <MoreHorizontal className="size-5" />}
            <span>More</span>
          </button>
        </div>
      </nav>

      {open && (
        <div id="debo-mobile-more" className="fixed inset-0 z-[60] md:hidden">
          <button type="button" className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="debo-safe-bottom absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-card p-4 shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <div className="grid grid-cols-2 gap-2">
              {more.map(({ href, label, icon: Icon }) => (
                <button key={href} type="button" onClick={() => navigate(href)}
                  className="debo-touch-target flex items-center gap-3 rounded-2xl border border-border bg-background px-4 text-sm font-semibold active:bg-accent">
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
