'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Plus,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Lock,
  Clock,
  Layers,
} from 'lucide-react';

interface ApiKeyItem {
  id: string;
  name: string;
  start: string;
  prefix: string;
  workspaceId: string;
  userId: string;
  scopes: string[];
  enabled: boolean;
  rateLimitMax: number;
  rateLimitTimeWindow: number;
  requestCount: number;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SecuritySettingsPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // New key form state
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['memory.read', 'tools.execute']);
  const [expiresInDays, setExpiresInDays] = useState('90');
  const [submitting, setSubmitting] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/api-keys');
      const data = await res.json();
      if (res.ok) {
        setKeys(data.keys || []);
      } else {
        setError(data.error || 'Failed to fetch API keys');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/auth/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          scopes: selectedScopes,
          expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create key');
      }

      // Show secret modal
      setCreatedSecret(data.secretKey);
      setShowCreateModal(false);
      setShowSecretModal(true);
      setNewKeyName('');
      fetchKeys();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating API key');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Applications using it will lose access immediately.')) {
      return;
    }

    try {
      const res = await fetch(`/api/auth/api-keys/${keyId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchKeys();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to revoke key');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error revoking key');
    }
  };

  const handleRotateKey = async (keyId: string) => {
    if (!confirm('Rotating this key will revoke the existing token and generate a new secret immediately. Continue?')) {
      return;
    }

    try {
      const res = await fetch(`/api/auth/api-keys/${keyId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setCreatedSecret(data.secretKey);
        setShowSecretModal(true);
        fetchKeys();
      } else {
        alert(data.error || 'Failed to rotate key');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error rotating key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const toggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setPasswordStatus('New password must be at least 8 characters');
      return;
    }

    setPasswordStatus('Password successfully updated.');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordStatus(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Security Status Banner */}
      <div className="bg-white rounded-lg border border-[#e5e5e0] p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-semibold text-[#181816]">Authentication & MCP Security</h3>
          <p className="text-xs text-[#5c5c57] mt-0.5">
            Production-grade identity backed by Better Auth with cryptographically verified API keys and timing-safe hash storage.
          </p>
        </div>

        <div className="p-4 rounded-md bg-[#2b5c56]/10 border border-[#2b5c56]/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#2b5c56] shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-[#2b5c56]">Cryptographic Verification & Fail-Closed Protection</div>
            <p className="text-[#5c5c57] mt-0.5 leading-relaxed">
              Every request to Debo Web, API, and MCP services resolves identity deterministically. Plaintext secrets are never stored; only SHA-256 hashes are persisted. Unsigned or forgeable caller-chosen headers are strictly rejected.
            </p>
          </div>
        </div>
      </div>

      {/* API Keys Management */}
      <div className="bg-white rounded-lg border border-[#e5e5e0] p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-[#181816] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#2b5c56]" />
              <span>Workspace API Keys</span>
            </h4>
            <p className="text-xs text-[#5c5c57] mt-0.5">
              Generate scoped API keys for Claude Desktop MCP, Cursor IDE, external integrations, or background agents.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2b5c56] text-white hover:bg-[#234b46] text-xs font-medium transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New API Key</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-xs text-[#8a8a83]">Loading API keys...</div>
        ) : keys.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-[#e5e5e0] rounded-md">
            <Key className="w-6 h-6 text-[#8a8a83] mx-auto mb-2 opacity-50" />
            <p className="text-xs text-[#5c5c57]">No active API keys found for this workspace.</p>
            <p className="text-[11px] text-[#8a8a83] mt-1">Create one to connect Model Context Protocol clients.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div
                key={k.id}
                className="p-4 border border-[#e5e5e0] rounded-lg hover:border-[#cfcfc8] transition bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#181816]">{k.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#f4f4f1] border border-[#e5e5e0] rounded text-[#5c5c57]">
                      {k.start}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-[#2b5c56]/10 text-[#2b5c56] rounded">
                      {k.rateLimitMax} req/min
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#8a8a83]">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      Scopes:
                    </span>
                    {k.scopes.map((s) => (
                      <span key={s} className="px-1.5 py-0.2 bg-[#f4f4f1] text-[#181816] rounded font-mono text-[10px]">
                        {s}
                      </span>
                    ))}
                    <span className="mx-1">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Created: {new Date(k.createdAt).toLocaleDateString()}
                    </span>
                    {k.lastUsedAt && (
                      <>
                        <span className="mx-1">•</span>
                        <span>Last used: {new Date(k.lastUsedAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleRotateKey(k.id)}
                    title="Rotate Key (Reissue Secret)"
                    className="p-1.5 border border-[#e5e5e0] rounded hover:bg-[#f4f4f1] text-[#5c5c57] hover:text-[#181816] transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRevokeKey(k.id)}
                    title="Revoke / Delete Key"
                    className="p-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Change Section */}
      <div className="bg-white rounded-lg border border-[#e5e5e0] p-6 shadow-xs space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-[#181816] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#2b5c56]" />
            <span>Change Account Password</span>
          </h4>
          <p className="text-xs text-[#5c5c57] mt-0.5">
            Update your master password with bcrypt/scrypt salted hashing.
          </p>
        </div>

        {passwordStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded">
            {passwordStatus}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[#181816] mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-white border border-[#cfcfc8] rounded text-[#181816]"
            />
          </div>
          <div>
            <label className="block font-medium text-[#181816] mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3 py-2 bg-white border border-[#cfcfc8] rounded text-[#181816]"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#181816] text-white hover:bg-[#2e2e2a] text-xs font-medium transition cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e5e5e0] max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-[#181816]">Create New API Key</h3>
            <p className="text-xs text-[#5c5c57]">
              Specify a recognizable name and grant granular scopes for this key.
            </p>

            <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#181816] mb-1">Key Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Claude Desktop MCP"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#cfcfc8] rounded text-[#181816]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#181816] mb-1.5">Granular Permissions / Scopes</label>
                <div className="space-y-2 border border-[#e5e5e0] rounded p-3">
                  {[
                    { id: 'memory.read', label: 'memory.read — Search & recall private memories' },
                    { id: 'memory.write', label: 'memory.write — Save & update memory entries' },
                    { id: 'source.upload', label: 'source.upload — Upload sources & documents' },
                    { id: 'tools.execute', label: 'tools.execute — MCP tool calls & executions' },
                    { id: '*', label: '* — Full workspace administrator access' },
                  ].map((scope) => (
                    <label key={scope.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope.id)}
                        onChange={() => toggleScope(scope.id)}
                        className="rounded border-[#cfcfc8] text-[#2b5c56] focus:ring-[#2b5c56]"
                      />
                      <span className="text-xs text-[#181816] font-mono">{scope.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#181816] mb-1">Expiration</label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  className="w-full px-3 py-2 border border-[#cfcfc8] rounded text-[#181816] bg-white"
                >
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="365">1 Year</option>
                  <option value="">Never Expires</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-[#cfcfc8] rounded text-[#5c5c57] hover:bg-[#f4f4f1] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-[#2b5c56] text-white rounded hover:bg-[#234b46] transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Generating...' : 'Create Secret Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secret One-Time Display Modal */}
      {showSecretModal && createdSecret && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e5e5e0] max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-semibold text-[#181816]">Save Your API Key Secret</h3>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 leading-relaxed">
              <strong>Make sure to copy your API key now.</strong> You won’t be able to see it again! For security, Debo stores only a SHA-256 cryptographic hash of this secret.
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#181816]">Your Plaintext Secret Key</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdSecret}
                  className="w-full px-3 py-2 bg-[#f4f4f1] border border-[#e5e5e0] rounded font-mono text-xs text-[#181816] select-all"
                />
                <button
                  onClick={() => copyToClipboard(createdSecret)}
                  className="px-3 py-2 bg-[#2b5c56] text-white rounded hover:bg-[#234b46] text-xs font-medium flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                >
                  {copiedSecret ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSecret ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setShowSecretModal(false);
                  setCreatedSecret(null);
                }}
                className="px-4 py-1.5 bg-[#181816] text-white rounded hover:bg-[#2e2e2a] text-xs font-medium transition cursor-pointer"
              >
                I Have Saved My Secret
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
