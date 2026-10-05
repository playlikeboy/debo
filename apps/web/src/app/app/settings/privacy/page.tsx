'use client';

import React, { useState } from 'react';
import { Download, Trash2, AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';

export default function PrivacySettingsPage() {
  const [purging, setPurging] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [purgeStatus, setPurgeStatus] = useState<string | null>(null);

  const handleExport = () => {
    window.location.href = '/api/privacy/export';
  };

  const handlePurge = async () => {
    if (confirmText !== 'DELETE') {
      alert('Please type DELETE to confirm.');
      return;
    }

    try {
      setPurging(true);
      const res = await fetch('/api/privacy/purge', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setPurgeStatus(`Successfully purged ${data.deletedEntries} entries from workspace.`);
        setShowPurgeModal(false);
        setConfirmText('');
      } else {
        alert(data.error || 'Failed to purge workspace');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error purging workspace');
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-[#e5e5e0] p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-semibold text-[#181816]">Privacy, Data Isolation & Retention</h3>
          <p className="text-xs text-[#5c5c57] mt-0.5">
            Strict tenant data isolation controls, export archives, and cryptographic retention policies.
          </p>
        </div>

        <div className="p-4 rounded-md bg-[#2b5c56]/10 border border-[#2b5c56]/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#2b5c56] shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-[#2b5c56]">Strict Workspace Tenancy Isolation</div>
            <p className="text-[#5c5c57] mt-0.5 leading-relaxed">
              Debo isolates all journal records, memories, and documents by workspace identifier. Cross-tenant leakage is prevented across database, R2 vector storage, MCP endpoints, and agent execution graphs.
            </p>
          </div>
        </div>

        {purgeStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{purgeStatus}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="p-4 border border-[#e5e5e0] rounded-md flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-[#181816]">Export Workspace Archive</h4>
              <p className="text-xs text-[#5c5c57] mt-0.5">
                Download all journal entries, structured content, and provenance metadata as a JSON bundle.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#cfcfc8] hover:bg-[#f9f9f8] text-xs font-medium text-[#181816] transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Archive</span>
            </button>
          </div>

          <div className="p-4 border border-[#b91c1c]/20 bg-[#fef2f2] rounded-md flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-[#b91c1c]">Purge Workspace Records</h4>
              <p className="text-xs text-[#b91c1c]/80 mt-0.5">
                Permanently delete all journal entries, memories, and indexed sources for this workspace. This action cannot be reversed.
              </p>
            </div>
            <button
              onClick={() => setShowPurgeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#b91c1c] text-white hover:bg-[#991b1b] text-xs font-medium transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e5e5e0] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-semibold text-[#181816]">Confirm Workspace Data Purge</h3>
            </div>

            <p className="text-xs text-[#5c5c57] leading-relaxed">
              This action will permanently delete all records, journal entries, and memory embeddings associated with this workspace. Type <strong>DELETE</strong> below to confirm.
            </p>

            <input
              type="text"
              placeholder="Type DELETE to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-[#cfcfc8] rounded text-xs text-[#181816]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPurgeModal(false);
                  setConfirmText('');
                }}
                className="px-3 py-1.5 border border-[#cfcfc8] rounded text-[#5c5c57] hover:bg-[#f4f4f1] text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmText !== 'DELETE' || purging}
                onClick={handlePurge}
                className="px-4 py-1.5 bg-[#b91c1c] text-white rounded hover:bg-[#991b1b] text-xs font-medium transition cursor-pointer disabled:opacity-50"
              >
                {purging ? 'Purging...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
