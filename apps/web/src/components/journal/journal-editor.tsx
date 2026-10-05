'use client';

import React, { useEffect, useRef, useState } from 'react';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import type { Block } from '@blocknote/core';
import { Check, Clock, Cloud, Loader2, Save, Tag, Trash2 } from 'lucide-react';

export interface JournalEditorProps {
  entryId?: string;
  initialTitle?: string;
  initialBlocks?: Block[];
  initialTags?: string[];
  workspaceId: string;
  userId: string;
  onSave?: (entry: { id?: string; title: string; contentJson: Block[]; contentText: string; tags: string[] }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function JournalEditor({
  entryId: initialEntryId,
  initialTitle = '',
  initialBlocks,
  initialTags = [],
  workspaceId,
  userId,
  onSave,
  onDelete,
}: JournalEditorProps) {
  const [entryId, setEntryId] = useState<string | undefined>(initialEntryId);
  const [title, setTitle] = useState(initialTitle || `Journal — ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty' | 'error'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const [wordCount, setWordCount] = useState(0);

  // Initialize BlockNote editor
  const editor = useCreateBlockNote({
    initialContent: initialBlocks && initialBlocks.length > 0 ? initialBlocks : undefined,
  });

  const dirtyRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract plain text helper from BlockNote blocks
  const extractPlainText = (blocks: Block[]): string => {
    return blocks
      .map(b => {
        if (Array.isArray(b.content)) {
          return b.content.map(c => ('text' in c ? c.text : '')).join('');
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  };

  const handleEditorChange = () => {
    dirtyRef.current = true;
    setSaveStatus('dirty');

    const blocks = editor.document;
    const text = extractPlainText(blocks);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);

    // Debounced autosave (1.5s delay)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      triggerSave();
    }, 1500);
  };

  const triggerSave = async () => {
    if (!editor) return;
    setSaveStatus('saving');
    try {
      const blocks = editor.document;
      const text = extractPlainText(blocks);

      if (onSave) {
        await onSave({
          id: entryId,
          title: title.trim() || 'Untitled Journal Entry',
          contentJson: blocks,
          contentText: text,
          tags,
        });
      } else {
        // Direct API call
        const method = entryId ? 'PUT' : 'POST';
        const url = entryId ? `/api/journal/${entryId}` : '/api/journal';
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspaceId,
            userId,
            title: title.trim() || 'Untitled Journal Entry',
            contentJson: blocks,
            contentText: text,
            tags,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to save: ${res.statusText}`);
        }

        const data = await res.json();
        if (data.id && !entryId) {
          setEntryId(data.id);
        }
      }

      dirtyRef.current = false;
      setSaveStatus('saved');
      setLastSavedAt(new Date());
    } catch (err) {
      console.error('Autosave error:', err);
      setSaveStatus('error');
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (!tags.includes(newTag)) {
        const nextTags = [...tags, newTag];
        setTags(nextTags);
        dirtyRef.current = true;
        setSaveStatus('dirty');
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const nextTags = tags.filter(t => t !== tagToRemove);
    setTags(nextTags);
    dirtyRef.current = true;
    setSaveStatus('dirty');
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#f9f9f8] text-[#181816]">
      {/* Top action header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e0] bg-white">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              setSaveStatus('dirty');
              if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
              saveTimeoutRef.current = setTimeout(triggerSave, 1500);
            }}
            placeholder="Journal Title..."
            className="text-xl font-serif font-semibold text-[#181816] placeholder-[#8a8a83] bg-transparent border-none outline-none focus:ring-0 w-80 md:w-96"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-[#5c5c57]">
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 font-mono">
            {saveStatus === 'saved' && (
              <>
                <Check className="w-3.5 h-3.5 text-[#2b5c56]" />
                <span className="text-[#2b5c56]">Saved</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c76a3a]" />
                <span className="text-[#c76a3a]">Saving to memory...</span>
              </>
            )}
            {saveStatus === 'dirty' && (
              <>
                <Cloud className="w-3.5 h-3.5 text-[#8a8a83]" />
                <span className="text-[#8a8a83]">Unsaved changes</span>
              </>
            )}
            {saveStatus === 'error' && (
              <span className="text-[#b91c1c] font-semibold">Save failed</span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3 border-l border-[#e5e5e0] pl-4">
            <span className="font-mono">{wordCount} words</span>
            {lastSavedAt && (
              <span className="flex items-center gap-1 text-[#8a8a83]">
                <Clock className="w-3 h-3" />
                {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <button
            onClick={triggerSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2b5c56] text-white hover:bg-[#234c47] font-medium transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {entryId && onDelete && (
            <button
              onClick={() => onDelete(entryId)}
              className="p-1.5 text-[#8a8a83] hover:text-[#b91c1c] rounded transition"
              title="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tags Bar */}
      <div className="flex items-center gap-2 px-6 py-2 bg-[#f4f4f1] border-b border-[#e5e5e0] text-xs">
        <Tag className="w-3.5 h-3.5 text-[#8a8a83]" />
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map(t => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#e5e5e0] text-[#5c5c57] font-mono"
            >
              #{t}
              <button
                onClick={() => removeTag(t)}
                className="text-[#8a8a83] hover:text-[#181816] ml-1 font-bold"
              >
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="Add tag and press Enter..."
            className="bg-transparent border-none outline-none text-xs text-[#181816] placeholder-[#8a8a83] w-48"
          />
        </div>
      </div>

      {/* BlockNote Rich-Text Editor Container */}
      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-4xl w-full mx-auto">
        <div className="bg-white rounded-lg border border-[#e5e5e0] shadow-xs min-h-[600px] p-6">
          <BlockNoteView
            editor={editor}
            onChange={handleEditorChange}
            theme="light"
          />
        </div>
      </div>
    </div>
  );
}
