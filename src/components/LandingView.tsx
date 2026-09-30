import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Code2,
  FileCode,
  Github,
  Globe,
  Layers,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../types';
import { THEMES } from '../lib/themes';
import { HERO_WORKSPACE_IMAGE } from '../lib/seedData';
import { ResilientImage } from './ResilientImage';
import { AppView } from './Navbar';

interface LandingViewProps {
  profiles: UserProfile[];
  currentUser: UserProfile | null;
  onNavigate: (view: AppView, username?: string) => void;
  onOpenAuthModal: () => void;
  onOpenSsgModal: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  profiles,
  currentUser,
  onNavigate,
  onOpenAuthModal,
  onOpenSsgModal,
}) => {
  const [claimHandle, setClaimHandle] = useState('');
  const [previewThemeId, setPreviewThemeId] = useState<string>('obsidian-slate');

  const demoTheme = THEMES[previewThemeId] || THEMES['obsidian-slate'];

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenAuthModal();
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100">
      {/* 1. Split-Screen Hero Section */}
      <section className="max-w-[1280px] mx-auto px-6 pt-12 pb-20 lg:py-20 border-b border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs font-mono text-blue-400 tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>my.itstck.com · Verified GitHub Developer Portfolios</span>
            </div>

            <h1
              style={{ textWrap: 'balance' }}
              className="font-display-syne text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.08]"
            >
              Your Europass resume with the power of a GitHub README.md.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Authenticate via <strong>GitHub</strong>. Author your technical experience and portfolio in modular Markdown blocks, select curated visual themes, and publish an autonomous static HTML page at <code className="text-blue-400 font-mono">my.itstck.com/@user</code> or <code className="text-blue-400 font-mono">/u/user</code>.
            </p>

            {/* Handle Claim Form */}
            <form
              onSubmit={handleClaimSubmit}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl"
            >
              <div className="flex-1 flex items-center rounded-xl bg-[#111827] border border-slate-700 px-4 py-3 focus-within:border-blue-500">
                <span className="font-mono text-xs sm:text-sm text-slate-400 select-none">
                  my.itstck.com/@
                </span>
                <input
                  type="text"
                  value={claimHandle}
                  onChange={(e) =>
                    setClaimHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                  }
                  placeholder="your-github-username"
                  aria-label="Claim your username handle"
                  className="bg-transparent font-mono text-xs sm:text-sm text-white font-semibold focus:outline-none flex-1"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Github className="w-4 h-4" />
                <span>Claim Page via GitHub</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Action Links */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400">
              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate('editor')}
                    className="text-slate-200 hover:text-blue-400 underline underline-offset-4 cursor-pointer"
                  >
                    Open Your Studio Editor →
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('profile', currentUser.username)}
                    className="text-slate-200 hover:text-blue-400 underline underline-offset-4 cursor-pointer"
                  >
                    View Your Page (/@{currentUser.username}) →
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onOpenAuthModal}
                    className="text-slate-200 hover:text-blue-400 underline underline-offset-4 cursor-pointer"
                  >
                    Sign In with GitHub →
                  </button>
                  <span>1 GitHub Account = 1 Verified Portfolio</span>
                </>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#111827]">
              <ResilientImage
                src={HERO_WORKSPACE_IMAGE}
                alt="ItStack engineering workspace display"
                className="w-full aspect-video object-cover"
              />
              <div className="inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/40 to-transparent p-5 flex flex-col justify-end">
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-300">
                  <span>Deterministic SSG Engine</span>
                  <span className="text-emerald-400 tabular-nums">11.4 KB HTML5 · 0 KB JS Runtime</span>
                </div>
              </div>
            </div>

            {/* Theme Selector Demo Card */}
            <div
              style={{
                backgroundColor: demoTheme.bgCanvas,
                borderColor: demoTheme.borderSubtle,
                color: demoTheme.textPrimary,
              }}
              className="p-5 rounded-2xl border transition-colors duration-200 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span style={{ color: demoTheme.accentText }} className="font-mono text-xs font-semibold">
                  my.itstck.com/@{currentUser?.username || 'developer'}
                </span>
                <div className="flex items-center gap-1.5">
                  {(['obsidian-slate', 'paper-editorial', 'github-dark', 'europass-swiss'] as const).map((tId) => {
                    const tObj = THEMES[tId];
                    return (
                      <button
                        key={tId}
                        type="button"
                        onClick={() => setPreviewThemeId(tId)}
                        title={`Preview theme: ${tObj.name}`}
                        style={{
                          backgroundColor: tObj.bgCanvas,
                          borderColor: previewThemeId === tId ? tObj.accentPrimary : tObj.borderSubtle,
                        }}
                        className="w-5 h-5 rounded-full border-2 cursor-pointer transition-transform hover:scale-110"
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-base font-bold">
                  {currentUser?.displayName || 'Principal Distributed Systems Engineer'}
                </div>
                <div style={{ color: demoTheme.textSecondary }} className="text-xs">
                  {currentUser?.headline || 'High-throughput SaaS & Cloud Architecture'}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: demoTheme.bgSurface,
                  borderColor: demoTheme.borderSubtle,
                  color: demoTheme.textSecondary,
                }}
                className="p-3 rounded-lg border font-mono text-[11px] space-y-1 tabular-nums"
              >
                <div style={{ color: demoTheme.textPrimary }} className="font-semibold">
                  01. README.md &amp; Europass Passport
                </div>
                <div>Stack: TypeScript · Rust · PostgreSQL 16 · Docker · Linux</div>
                <div style={{ color: demoTheme.accentText }}>
                  Active Theme: {demoTheme.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Numbered Capabilities 01 - 04 */}
      <section className="max-w-[1280px] mx-auto px-6 py-20 border-b border-slate-800/80">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono text-blue-400 mb-2">
            Architecture Highlights · From Markdown to Autonomous HTML5
          </div>
          <h2 className="font-display-syne text-3xl font-bold text-white tracking-tight">
            Engineered for developers who demand documentary rigor and static speed
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-7 rounded-2xl border border-slate-800 bg-[#111827] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-blue-400">
              <span>01. Modular Europass + GitHub GFM Blocks</span>
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Official European CV structure rendered in clean Markdown
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Standardized sections for Employment Record, EQF Degree Frameworks, and CEFR Language Passports (A1–C2) combined with GitHub alerts, syntax-highlighted code blocks, and markdown tables.
            </p>
          </div>

          <div className="p-7 rounded-2xl border border-slate-800 bg-[#111827] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-blue-400">
              <span>02. Live Theme, Typography &amp; Layout Studio</span>
              <Palette className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-white">
              8 curated palettes with zero-pill typography pairings
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Switch seamlessly between dark engineering consoles (Obsidian Slate, Primer Dark), archival editorial paper (Paper Editorial, Europass Institutional), and layouts (Split CV, README Stream, Bento Grid).
            </p>
          </div>

          <div className="p-7 rounded-2xl border border-slate-800 bg-[#111827] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-blue-400">
              <span>03. SSG Compiler &amp; Dual Canonical Routes</span>
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Autonomous 11 KB HTML5 documents with zero runtime JS
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every profile compiles into self-contained HTML ready for CDN edge delivery at <code className="text-slate-200 font-mono">my.itstck.com/@user</code> and <code className="text-slate-200 font-mono">my.itstck.com/u/user</code> with single-click .html, .md, and PDF export.
            </p>
          </div>

          <div className="p-7 rounded-2xl border border-slate-800 bg-[#111827] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-blue-400">
              <span>04. GitHub Identity &amp; Strict Profile Ownership</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-white">
              One GitHub Account = One Verified Profile
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Authenticate via GitHub OAuth. Each user strictly edits only their own page. Profiles can be modified, re-compiled, exported, or permanently deleted at any time with full data control.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Action Section */}
      <section className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="p-8 sm:p-12 rounded-2xl border border-slate-800 bg-[#111827] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Production-Ready SaaS with PostgreSQL &amp; Cloudflare Tunnel</span>
            </div>
            <h2 className="font-display-syne text-2xl sm:text-3xl font-bold text-white">
              Host your verified technical curriculum on my.itstck.com
            </h2>
            <p className="text-sm text-slate-400">
              Sign in with your GitHub account now to initialize your portfolio, format your experience in Markdown, and compile your static landing page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenSsgModal}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700 bg-[#0B0F17] hover:bg-slate-800 text-xs font-semibold text-slate-200 cursor-pointer whitespace-nowrap"
            >
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>Inspect Static HTML</span>
            </button>
            <button
              type="button"
              onClick={currentUser ? () => onNavigate('editor') : onOpenAuthModal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap"
            >
              <Github className="w-4 h-4" />
              <span>{currentUser ? 'Open Studio Editor' : 'Sign in with GitHub'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-xs text-slate-500 font-mono">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            my.itstck.com — IT Stack Technical Resume &amp; Portfolio SaaS
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="hover:text-slate-300 cursor-pointer"
            >
              Directory
            </button>
            <button
              type="button"
              onClick={onOpenSsgModal}
              className="hover:text-slate-300 cursor-pointer"
            >
              SSG Exporter
            </button>
            <button
              type="button"
              onClick={currentUser ? () => onNavigate('dashboard') : onOpenAuthModal}
              className="hover:text-slate-300 cursor-pointer"
            >
              {currentUser ? 'Account Settings' : 'GitHub Sign In'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
