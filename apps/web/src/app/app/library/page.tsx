import React from 'react';
import { FileCode, FileText, UploadCloud } from 'lucide-react';

export default function LibraryPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#181816]">
            Source Library
          </h1>
          <p className="text-sm text-[#5c5c57] mt-1">
            Documents, research papers, and web clips stored in Cloudflare R2 and indexed by Docling.
          </p>
        </div>

        <button className="flex items-center gap-2 px-3.5 py-2 rounded bg-[#2b5c56] text-white hover:bg-[#234c47] text-xs font-medium transition cursor-pointer">
          <UploadCloud className="w-4 h-4" />
          <span>Upload Source</span>
        </button>
      </div>

      {/* Sources Table / List */}
      <div className="bg-white rounded-lg border border-[#e5e5e0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#e5e5e0] flex items-center justify-between bg-[#fdfdfc]">
          <span className="text-xs font-semibold text-[#181816]">Workspace Sources</span>
          <span className="text-[11px] font-mono text-[#8a8a83]">3 indexed items</span>
        </div>

        <div className="divide-y divide-[#f0f0ed]">
          <div className="p-4 flex items-center justify-between hover:bg-[#f9f9f8] transition">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#2b5c56]/10 text-[#2b5c56] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#181816]">ADR-0003-memory-engine.pdf</div>
                <div className="text-[11px] font-mono text-[#8a8a83]">
                  application/pdf &bull; 42.1 KB &bull; 8 chunks
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono bg-[#2b5c56]/10 text-[#2b5c56] px-2 py-0.5 rounded">
              READY
            </span>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-[#f9f9f8] transition">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#c76a3a]/10 text-[#c76a3a] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#181816]">Debo Agent Architecture Specification</div>
                <div className="text-[11px] font-mono text-[#8a8a83]">
                  text/markdown &bull; 18.4 KB &bull; 4 chunks
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono bg-[#2b5c56]/10 text-[#2b5c56] px-2 py-0.5 rounded">
              READY
            </span>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-[#f9f9f8] transition">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#181816]/10 text-[#181816] flex items-center justify-center">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#181816]">Product Requirements Document (PRD)</div>
                <div className="text-[11px] font-mono text-[#8a8a83]">
                  application/pdf &bull; 89.2 KB &bull; 14 chunks
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono bg-[#2b5c56]/10 text-[#2b5c56] px-2 py-0.5 rounded">
              READY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
