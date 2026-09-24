"use client";

import { Suspense, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { CommandMenu } from "@/components/app-shell/command-menu";
import { MobileNav } from "@/components/app-shell/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandMenuOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <Suspense fallback={null}>
      <DashboardLayoutContent
        commandMenuOpen={commandMenuOpen}
        setCommandMenuOpen={setCommandMenuOpen}
      >
        {children}
      </DashboardLayoutContent>
    </Suspense>
  );
}

function DashboardLayoutContent({
  children,
  commandMenuOpen,
  setCommandMenuOpen,
}: {
  children: React.ReactNode;
  commandMenuOpen: boolean;
  setCommandMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFocused = searchParams.get("focus") === "true" && pathname === "/dashboard/journal";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {!isFocused && (
          <Topbar onCommandMenuOpen={() => setCommandMenuOpen(true)} />
        )}
        <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden pb-16 md:pb-0">
            {children}
          </div>
          {!isFocused && <MobileNav />}
        </div>
      </SidebarInset>

      <CommandMenu
        open={commandMenuOpen}
        onOpenChange={setCommandMenuOpen}
        onClose={() => setCommandMenuOpen(false)}
      />
    </SidebarProvider>
  );
}
