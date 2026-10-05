'use client';

import React, { useState } from 'react';
import { User, CheckCircle, Shield } from 'lucide-react';

export default function ProfileSettingsPage() {
  const [name, setName] = useState('Primary User');
  const [email, setEmail] = useState('user@debo.life');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-lg border border-[#e5e5e0] p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#181816]">User Profile & Account</h3>
          <p className="text-xs text-[#5c5c57] mt-0.5">Manage your identity and personal preferences across workspaces.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#2b5c56]/10 text-[#2b5c56] flex items-center justify-center font-semibold text-sm">
          <User className="w-5 h-5" />
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Profile information successfully updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[#181816] mb-1.5">User ID (Deterministic)</label>
            <input
              type="text"
              readOnly
              value="usr_primary"
              className="w-full px-3 py-2 bg-[#f4f4f1] border border-[#e5e5e0] rounded font-mono text-[#5c5c57]"
            />
          </div>
          <div>
            <label className="block font-medium text-[#181816] mb-1.5">Active Workspace</label>
            <input
              type="text"
              readOnly
              value="wsp_default (Personal)"
              className="w-full px-3 py-2 bg-[#f4f4f1] border border-[#e5e5e0] rounded font-mono text-[#5c5c57]"
            />
          </div>
          <div>
            <label className="block font-medium text-[#181816] mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#cfcfc8] rounded text-[#181816]"
            />
          </div>
          <div>
            <label className="block font-medium text-[#181816] mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#cfcfc8] rounded text-[#181816]"
            />
          </div>
          <div>
            <label className="block font-medium text-[#181816] mb-1.5">Role Authority</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#f4f4f1] border border-[#e5e5e0] rounded">
              <Shield className="w-3.5 h-3.5 text-[#2b5c56]" />
              <span className="font-mono text-xs text-[#2b5c56] font-medium">owner (Full Administrative Authority)</span>
            </div>
          </div>
          <div>
            <label className="block font-medium text-[#181816] mb-1.5">Current Plan</label>
            <div className="flex items-center justify-between px-3 py-2 bg-[#f4f4f1] border border-[#e5e5e0] rounded">
              <span className="font-mono text-xs text-[#181816]">Free Tier</span>
              <span className="text-[10px] text-[#5c5c57]">3 Workspaces • 5 API Keys</span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#2b5c56] text-white hover:bg-[#234b46] text-xs font-medium transition cursor-pointer"
          >
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
}
