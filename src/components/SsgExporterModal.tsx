import React, { useState } from 'react';
import { Check, Copy, Download, FileCode, FileText, Globe, X } from 'lucide-react';
import { UserProfile } from '../types';
import {
  compileProfileToStaticHtml,
  compileProfileToReadmeMarkdown,
} from '../lib/markdown';

interface SsgExporterModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const SsgExporterModal: React.FC<SsgExporterModalProps> = ({
  profile,
  isOpen,
  onClose,
}) => {
  const [activeFormat, setActiveFormat] = useState<'html' | 'readme' | 'json'>('html');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const htmlOutput = compileProfileToStaticHtml(profile);
  const readmeOutput = compileProfileToReadmeMarkdown(profile);
  const jsonOutput = JSON.stringify(profile, null, 2);

  const currentCode =
    activeFormat === 'html'
      ? htmlOutput
      : activeFormat === 'readme'
      ? readmeOutput
      : jsonOutput;

  const byteSizeKb = (new Blob([currentCode]).size / 1024).toFixed(1);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const mimeMap = {
      html: 'text/html;charset=utf-8',
      readme: 'text/markdown;charset=utf-8',
      json: 'application/json;charset=utf-8',
    };
    const filenameMap = {
      html: `@${profile.username}-index.html`,
      readme: `README-${profile.username}.md`,
      json: `europass-${profile.username}.json`,
    };
    const blob = new Blob([currentCode], { type: mimeMap[activeFormat] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filenameMap[activeFormat];
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F17]">
          <div>
            <h2 className="font-display-syne text-lg font-bold text-slate-100">
              Deterministic SSG Compiler &amp; Export (@{profile.username})
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Active routes: my.itstck.com/@{profile.username} · my.itstck.com/u/{profile.username} · Compiled payload: {byteSizeKb} KB
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-[#0F172A] border-b border-slate-800">
          <div className="flex items-center gap-1 p-1 bg-[#0B0F17] rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveFormat('html')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeFormat === 'html'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Standalone HTML5 (.html)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFormat('readme')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeFormat === 'readme'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>GitHub README.md</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFormat('json')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeFormat === 'json'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Europass JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Code Copied' : 'Copy Source'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File ({byteSizeKb} KB)</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#090D16] font-mono text-xs text-slate-300 leading-relaxed">
          <pre className="whitespace-pre-wrap break-words">{currentCode}</pre>
        </div>

        <div className="px-6 py-3 bg-[#0B0F17] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>
            0 external JS dependencies · Inline critical CSS · JSON-LD Schema.org structured data included
          </span>
          <span className="font-mono text-slate-300">
            GET /api/export/html/{profile.username}
          </span>
        </div>
      </div>
    </div>
  );
};
