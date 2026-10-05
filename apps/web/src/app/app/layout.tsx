'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Brain,
  Clock,
  Compass,
  FolderArchive,
  Layers,
  LogOut,
  Menu,
  Settings,
  X,
} from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/app', icon: Compass },
    { name: 'Rich Journal', href: '/app/journal', icon: BookOpen },
    { name: 'Ask Memory', href: '/app/ask', icon: Brain },
    { name: 'Source Library', href: '/app/library', icon: FolderArchive },
    { name: 'Timeline', href: '/app/timeline', icon: Clock },
    { name: 'Settings', href: '/app/settings/profile', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#f9f9f8] text-[#181816] overflow-hidden">
      {/* Desktop Navigation Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#e5e5e0] bg-[#ffffff] shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#e5e5e0]">
          <Link href="/app" className="flex items-center gap-2.5">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#181816]">Debo</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#2b5c56] bg-[#2b5c56]/10 px-2 py-0.5 rounded">
              v0.1.0
            </span>
          </Link>
        </div>

        {/* Workspace context pill */}
        <div className="p-4 border-b border-[#f0f0ed]">
          <div className="bg-[#f9f9f8] border border-[#e5e5e0] rounded-md p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded bg-[#2b5c56] text-white flex items-center justify-center text-xs font-serif font-bold shrink-0">
                D
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-[#181816] truncate">Personal Workspace</span>
                <span className="text-[10px] font-mono text-[#8a8a83] truncate">wsp_default</span>
              </div>
            </div>
            <Layers className="w-3.5 h-3.5 text-[#8a8a83]" />
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map(item => {
            const Icon = item.icon;
            const isActive =
              item.href === '/app' ? pathname === '/app' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#f0f0ed] text-[#2b5c56] font-semibold'
                    : 'text-[#5c5c57] hover:text-[#181816] hover:bg-[#f9f9f8]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-[#2b5c56]' : 'text-[#8a8a83]'}`}
                />
                <span>{item.name}</span>
                {item.name === 'Rich Journal' && (
                  <span className="ml-auto text-[10px] font-mono bg-[#2b5c56]/10 text-[#2b5c56] px-1.5 py-0.2 rounded">
                    BlockNote
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-[#e5e5e0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#181816] text-white flex items-center justify-center text-xs font-medium">
              U
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-[#181816]">User Account</span>
              <span className="text-[10px] font-mono text-[#8a8a83]">usr_primary</span>
            </div>
          </div>
          <Link
            href="/login"
            className="text-[#8a8a83] hover:text-[#b91c1c] transition p-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-[#e5e5e0] bg-white">
          <Link href="/app" className="font-serif text-xl font-bold text-[#181816]">
            Debo
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#5c5c57]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#e5e5e0] bg-white px-4 py-2 space-y-1">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[#5c5c57]"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
