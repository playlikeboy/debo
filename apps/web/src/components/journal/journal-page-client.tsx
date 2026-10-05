'use client';

import React, { useEffect, useState } from 'react';
import type { Block } from '@blocknote/core';
import type { JournalEntry } from '@debo/types';
import { FileText, Plus, Search } from 'lucide-react';
import { JournalEditor } from './journal-editor';

export interface JournalPageClientProps {
  workspaceId: string;
  userId: string;
  initialEntries?: JournalEntry[];
}

export function JournalPageClient({
  workspaceId,
  userId,
  initialEntries = [],
}: JournalPageClientProps) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(
    initialEntries[0]?.id || null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch entries from API
  const refreshEntries = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/journal?workspaceId=${workspaceId}&userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.error('Failed to load journal entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialEntries.length === 0) {
      refreshEntries();
    }
  }, [workspaceId, userId]);

  const selectedEntry = entries.find(e => e.id === selectedEntryId) || null;

  const handleCreateNew = () => {
    setSelectedEntryId(null);
  };

  const handleSaveEntry = async (entryData: {
    id?: string;
    title: string;
    contentJson: Block[];
    contentText: string;
    tags: string[];
  }) => {
    const isUpdate = !!entryData.id;
    const url = isUpdate ? `/api/journal/${entryData.id}` : '/api/journal';
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...entryData,
        workspaceId,
        userId,
      }),
    });

    if (!res.ok) {
      throw new Error(`Save failed: ${res.statusText}`);
    }

    const saved = await res.json();
    if (!isUpdate && saved.id) {
      setSelectedEntryId(saved.id);
    }
    await refreshEntries();
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;

    const res = await fetch(`/api/journal/${id}?workspaceId=${workspaceId}&userId=${userId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setSelectedEntryId(null);
      await refreshEntries();
    }
  };

  const filteredEntries = entries.filter(e => {
    const matchesQuery =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.contentText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9f9f8]">
      {/* Sidebar: Entry History */}
      <aside className="w-80 border-r border-[#e5e5e0] bg-[#fdfdfc] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#e5e5e0]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#181816] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2b5c56]" />
              Journal
            </h2>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-[#2b5c56] text-white hover:bg-[#234c47] font-medium transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8a8a83]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#f4f4f1] border border-[#e5e5e0] rounded text-[#181816] placeholder-[#8a8a83] outline-none focus:border-[#2b5c56]"
            />
          </div>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#f0f0ed]">
          {isLoading && entries.length === 0 ? (
            <div className="p-4 text-xs text-[#8a8a83] text-center">Loading journal...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8a8a83]">
              {searchQuery ? 'No matching entries found.' : 'No journal entries yet. Write your first thought!'}
            </div>
          ) : (
            filteredEntries.map(entry => {
              const isSelected = entry.id === selectedEntryId;
              const dateStr = new Date(entry.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntryId(entry.id)}
                  className={`w-full text-left p-3.5 transition flex flex-col gap-1 cursor-pointer ${
                    isSelected ? 'bg-[#f0f0ed] border-l-2 border-[#2b5c56]' : 'hover:bg-[#f9f9f8]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#181816] truncate max-w-[180px]">
                      {entry.title || 'Untitled Entry'}
                    </span>
                    <span className="text-[#8a8a83] font-mono text-[11px] shrink-0">{dateStr}</span>
                  </div>
                  <p className="text-xs text-[#5c5c57] line-clamp-2 leading-relaxed">
                    {entry.contentText || 'Empty entry...'}
                  </p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {entry.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono text-[#8a8a83] bg-white border border-[#e5e5e0] px-1.5 py-0.2 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Editor View */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedEntry ? (
          <JournalEditor
            key={selectedEntry.id}
            entryId={selectedEntry.id}
            initialTitle={selectedEntry.title}
            initialBlocks={selectedEntry.contentJson as Block[]}
            initialTags={selectedEntry.tags}
            workspaceId={workspaceId}
            userId={userId}
            onSave={handleSaveEntry}
            onDelete={handleDeleteEntry}
          />
        ) : (
          <JournalEditor
            key="new-entry"
            initialTitle=""
            initialBlocks={[]}
            initialTags={[]}
            workspaceId={workspaceId}
            userId={userId}
            onSave={handleSaveEntry}
          />
        )}
      </main>
    </div>
  );
}
