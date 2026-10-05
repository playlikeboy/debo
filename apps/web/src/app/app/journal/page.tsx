'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamic import with SSR disabled to ensure BlockNote loads cleanly in browser context
const JournalPageClient = dynamic(
  () => import('@/components/journal/journal-page-client').then(mod => mod.JournalPageClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-[#f9f9f8] text-[#5c5c57]">
        <div className="flex items-center gap-2 text-sm font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-[#2b5c56]" />
          <span>Loading BlockNote Rich Editor...</span>
        </div>
      </div>
    ),
  },
);

export default function JournalPage() {
  const [tenant, setTenant] = useState<{ workspaceId: string; userId: string }>({
    workspaceId: 'wsp_default',
    userId: 'usr_primary',
  });

  useEffect(() => {
    // Deterministic tenant resolution from URL search params or local storage
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const ws = url.searchParams.get('workspaceId') || 'wsp_default';
      const user = url.searchParams.get('userId') || 'usr_primary';
      setTenant({ workspaceId: ws, userId: user });
    }
  }, []);

  return (
    <div className="h-full w-full">
      <JournalPageClient workspaceId={tenant.workspaceId} userId={tenant.userId} />
    </div>
  );
}
