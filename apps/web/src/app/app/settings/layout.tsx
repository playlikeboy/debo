'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Shield, User } from 'lucide-react';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Profile', href: '/app/settings/profile', icon: User },
    { name: 'Security & Auth', href: '/app/settings/security', icon: Lock },
    { name: 'Privacy & Retention', href: '/app/settings/privacy', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#181816]">Settings</h1>
        <p className="text-sm text-[#5c5c57] mt-1">
          Manage identity, cryptographic security, and privacy export controls.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e5e0] mb-8 gap-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition ${
                isActive
                  ? 'border-[#2b5c56] text-[#2b5c56]'
                  : 'border-transparent text-[#5c5c57] hover:text-[#181816]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      <div>{children}</div>
    </div>
  );
}
