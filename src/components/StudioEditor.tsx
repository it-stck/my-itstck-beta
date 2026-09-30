import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Code,
  Columns,
  Eye,
  EyeOff,
  FileCode,
  Globe,
  Heading2,
  Layout,
  Palette,
  Plus,
  Save,
  Sparkles,
  Table,
  Trash2,
  Type,
  User,
} from 'lucide-react';
import {
  UserProfile,
  ProfileSection,
  SectionType,
  ThemeId,
  FontPairingId,
  LayoutMode,
  DensityMode,
  AvailabilityStatus,
} from '../types';
import { THEMES, FONT_PAIRINGS, SECTION_TYPE_CATALOG } from '../lib/themes';
import { MarkdownRenderer, compileProfileToStaticHtml } from '../lib/markdown';

interface StudioEditorProps {
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onViewLiveProfile: () => void;
  onOpenSsgModal: () => void;
}

export const StudioEditor: React.FC<StudioEditorProps> = ({
  profile,
  onSaveProfile,
  onViewLiveProfile,
  onOpenSsgModal,
}) => {
  const [draft, setDraft] = useState<UserProfile>(() => JSON.parse(JSON.stringify(profile)));
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    profile.sections[0]?.id || ''
  );
  const [activeStudioTab, setActiveStudioTab] = useState<'sections' | 'styles' | 'identity'>('sections');
  const [showAddSectionPicker, setShowAddSectionPicker] = useState(false);
  const [newTechInput, setNewTechInput] = useState('');
  const [saveFeedback, setSaveFeedback] = useState(false);

  const sortedSections = [...draft.sections].sort((a, b) => a.order - b.order);
  const activeSection =
    sortedSections.find((s) => s.id === selectedSectionId) || sortedSections[0];

  const activeTheme = THEMES[draft.themeId] || THEMES['obsidian-slate'];
  const activeFont = FONT_PAIRINGS[draft.fontPairingId] || FONT_PAIRINGS['jakarta-jetbrains'];

  const handlePublishChanges = () => {
    const htmlStr = compileProfileToStaticHtml(draft);
    const sizeKb = Number((new Blob([htmlStr]).size / 1024).toFixed(1));
    const randomHash = Math.random().toString(16).substring(2, 9);
    const updated: UserProfile = {
      ...draft,
      sections: sortedSections.map((s, idx) => ({ ...s, order: idx })),
      staticBundleSizeKb: sizeKb,
      staticBuildHash: randomHash,
      lastPublishedAt: new Date().toISOString(),
    };
    setDraft(updated);
    onSaveProfile(updated);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2400);
  };

  const updateActiveSection = (patch: Partial<ProfileSection>) => {
    if (!activeSection) return;
    const today = new Date().toISOString().slice(0, 10);
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === activeSection.id ? { ...s, ...patch, updatedAt: today } : s
      ),
    }));
  };

  const handleAddSection = (type: SectionType) => {
    const template =
      SECTION_TYPE_CATALOG.find((c) => c.type === type) || SECTION_TYPE_CATALOG[0];
    const newSec: ProfileSection = {
      id: `sec-${Date.now()}`,
      type: template.type,
      title: template.defaultTitle,
      subtitle: template.defaultSubtitle,
      content: template.templateContent,
      order: draft.sections.length,
      isVisible: true,
      span: 'full',
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setDraft((prev) => ({
      ...prev,
      sections: [...prev.sections, newSec],
    }));
    setSelectedSectionId(newSec.id);
    setShowAddSectionPicker(false);
  };

  const handleMoveSection = (secId: string, direction: 'up' | 'down') => {
    const ordered = [...sortedSections];
    const idx = ordered.findIndex((s) => s.id === secId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= ordered.length) return;
    const temp = ordered[idx];
    ordered[idx] = ordered[targetIdx];
    ordered[targetIdx] = temp;
    const reassigned = ordered.map((s, i) => ({ ...s, order: i }));
    setDraft((prev) => ({ ...prev, sections: reassigned }));
  };

  const handleDeleteSection = (secId: string) => {
    if (draft.sections.length <= 1) return;
    const remaining = draft.sections
      .filter((s) => s.id !== secId)
      .map((s, idx) => ({ ...s, order: idx }));
    setDraft((prev) => ({ ...prev, sections: remaining }));
    if (selectedSectionId === secId && remaining[0]) {
      setSelectedSectionId(remaining[0].id);
    }
  };

  const handleInsertMarkdownSnippet = (snippetType: string) => {
    if (!activeSection) return;
    const snippets: Record<string, string> = {
      h3: `\n\n### Sub-Architecture Focus\nTechnical breakdown and engineering outcomes.\n`,
      callout: `\n\n> [!NOTE]\n> Production verified specifications and SLAs.\n`,
      table: `\n\n| Component | Technology | Target SLA |\n| :--- | :--- | :--- |\n| Core Engine | Rust / TypeScript | < 15 ms P99 |\n| Database | PostgreSQL 17 | 99.995% SLA |\n`,
      europass_job: `\n\n### Position Title · Company Name\n**Month Year – Present** · *City, Country · Industry Domain*\n\n- Quantifiable engineering achievement with measurable business impact.\n- Leadership of technical RFCs and production software architecture.\n`,
      code: `\n\n\`\`\`typescript\nexport async function verifySignature(hash: string): Promise<boolean> {\n  return hash.length === 64;\n}\n\`\`\`\n`,
    };
    const snippet = snippets[snippetType] || '';
    updateActiveSection({ content: activeSection.content + snippet });
  };

  const handleAddStackItem = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTechInput.trim();
    if (!clean || draft.primaryStack.includes(clean)) return;
    setDraft((prev) => ({
      ...prev,
      primaryStack: [...prev.primaryStack, clean],
    }));
    setNewTechInput('');
  };

  const handleRemoveStackItem = (tech: string) => {
    setDraft((prev) => ({
      ...prev,
      primaryStack: prev.primaryStack.filter((t) => t !== tech),
    }));
  };

  const wordCount = activeSection
    ? activeSection.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[#0B0F17] text-slate-100 flex flex-col">
      {/* Studio Top Action Bar */}
      <div className="border-b border-slate-800 bg-[#0F172A] px-6 py-3">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-[#0B0F17] rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveStudioTab('sections')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeStudioTab === 'sections'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>1. Sections &amp; Markdown ({draft.sections.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStudioTab('styles')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeStudioTab === 'styles'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>2. Themes, Fonts &amp; Layout</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStudioTab('identity')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeStudioTab === 'identity'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>3. Identity, Slug &amp; Stack</span>
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Static Route:</span>
              <span className="text-blue-400">my.itstck.com/@{draft.username}</span>
              <span>·</span>
              <span>Theme: {activeTheme.name}</span>
            </div>

            <button
              type="button"
              onClick={onOpenSsgModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-xs font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Export HTML / README</span>
            </button>

            <button
              type="button"
              onClick={onViewLiveProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-xs font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Page View</span>
            </button>

            <button
              type="button"
              onClick={handlePublishChanges}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {saveFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Compiled &amp; Deployed!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish Changes (SSG)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Preview Panes */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12">
        {/* Controls Column */}
        <div className="lg:col-span-5 border-r border-slate-800 flex flex-col bg-[#0B0F17]">
          {activeStudioTab === 'sections' && (
            <div className="flex flex-col h-full">
              {/* Section Selector */}
              <div className="p-4 border-b border-slate-800 bg-[#0F172A]/60">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-xs font-semibold text-slate-200">
                      Curriculum Section Outline
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Select a section to write markdown or reorder blocks
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddSectionPicker(!showAddSectionPicker)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Section</span>
                  </button>
                </div>

                {showAddSectionPicker && (
                  <div className="mb-3 p-3 rounded-lg bg-[#111827] border border-slate-700 space-y-2 max-h-64 overflow-y-auto">
                    <div className="text-xs font-semibold text-blue-400 mb-1">
                      Choose a standardized Europass / Markdown template:
                    </div>
                    {SECTION_TYPE_CATALOG.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => handleAddSection(item.type)}
                        className="w-full text-left p-2.5 rounded-md bg-[#0B0F17] hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer block"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-100">
                          <span>{item.label}</span>
                          <span className="font-mono text-[11px] text-blue-400">{item.europassCode}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {sortedSections.map((sec, idx) => {
                    const isSelected = activeSection?.id === sec.id;
                    return (
                      <div
                        key={sec.id}
                        onClick={() => setSelectedSectionId(sec.id)}
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-950/50 border-blue-500/70 text-white'
                            : 'bg-[#111827]/70 border-slate-800/90 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                            0{idx + 1}.
                          </span>
                          <span className="font-medium truncate">{sec.title}</span>
                          {!sec.isVisible && (
                            <span className="text-[10px] font-mono text-amber-400">(Hidden)</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleMoveSection(sec.id, 'up')}
                            disabled={idx === 0}
                            title="Move section up"
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSection(sec.id, 'down')}
                            disabled={idx === sortedSections.length - 1}
                            title="Move section down"
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                sections: prev.sections.map((s) =>
                                  s.id === sec.id ? { ...s, isVisible: !s.isVisible } : s
                                ),
                              }))
                            }
                            title={sec.isVisible ? 'Hide section' : 'Show section'}
                            className="p-1 text-slate-400 hover:text-white cursor-pointer"
                          >
                            {sec.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(sec.id)}
                            disabled={sortedSections.length <= 1}
                            title="Delete section"
                            className="p-1 text-slate-400 hover:text-rose-400 disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section Editor */}
              {activeSection && (
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Section Heading
                      </label>
                      <input
                        type="text"
                        value={activeSection.title}
                        onChange={(e) => updateActiveSection({ title: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#111827] border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Subtitle / Europass Descriptor
                      </label>
                      <input
                        type="text"
                        value={activeSection.subtitle || ''}
                        onChange={(e) => updateActiveSection({ subtitle: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#111827] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-lg bg-[#111827] border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 px-1.5">Insert:</span>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdownSnippet('europass_job')}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 cursor-pointer whitespace-nowrap"
                    >
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      <span>Europass Job</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdownSnippet('table')}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 cursor-pointer whitespace-nowrap"
                    >
                      <Table className="w-3 h-3 text-blue-400" />
                      <span>Stack Table</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdownSnippet('callout')}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 cursor-pointer whitespace-nowrap"
                    >
                      <span>Alert [!NOTE]</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdownSnippet('code')}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 cursor-pointer whitespace-nowrap"
                    >
                      <Code className="w-3 h-3 text-blue-400" />
                      <span>Code Block</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdownSnippet('h3')}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 cursor-pointer whitespace-nowrap"
                    >
                      <Heading2 className="w-3 h-3" />
                      <span>Heading H3</span>
                    </button>
                  </div>

                  {/* Markdown Textarea */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                      <span>Markdown Editor (GFM + Tables)</span>
                      <span className="tabular-nums">
                        {wordCount} words · {activeSection.content.length} characters
                      </span>
                    </div>
                    <textarea
                      value={activeSection.content}
                      onChange={(e) => updateActiveSection({ content: e.target.value })}
                      rows={16}
                      spellCheck={false}
                      className="w-full flex-1 p-4 rounded-xl bg-[#090D16] border border-slate-800 font-mono text-xs sm:text-sm text-slate-100 leading-relaxed focus:outline-none focus:border-blue-500 resize-y"
                      placeholder="Write your experience, projects, or competence tables in Markdown..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeStudioTab === 'styles' && (
            <div className="p-5 space-y-6 overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Palette className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-white">
                    Static Landing Page Theme
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Select a color palette for your public route <code className="text-blue-400">/@{draft.username}</code>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.values(THEMES).map((themeItem) => {
                    const isSelected = draft.themeId === themeItem.id;
                    return (
                      <button
                        key={themeItem.id}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({ ...prev, themeId: themeItem.id as ThemeId }))
                        }
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 ring-1 ring-blue-500 bg-slate-900'
                            : 'border-slate-800 bg-[#111827]/70 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-100">
                            {themeItem.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              style={{ backgroundColor: themeItem.bgCanvas }}
                              className="w-3.5 h-3.5 rounded-full border border-slate-600"
                            />
                            <span
                              style={{ backgroundColor: themeItem.accentPrimary }}
                              className="w-3.5 h-3.5 rounded-full"
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {themeItem.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <Type className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-white">
                    Typography Pairings (2+1 Constitution)
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Pair characterful display headings with readable body text and tabular monospace numerals
                </p>

                <div className="space-y-2">
                  {Object.values(FONT_PAIRINGS).map((fp) => {
                    const isSelected = draft.fontPairingId === fp.id;
                    return (
                      <button
                        key={fp.id}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            fontPairingId: fp.id as FontPairingId,
                          }))
                        }
                        className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-950/30'
                            : 'border-slate-800 bg-[#111827]/70 hover:border-slate-700'
                        }`}
                      >
                        <div
                          style={{ fontFamily: fp.headingFontFamily }}
                          className="text-sm font-bold text-slate-100 mb-0.5"
                        >
                          {fp.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{fp.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Layout className="w-4 h-4 text-blue-400" />
                    <h2 className="text-sm font-semibold text-white">
                      Layout Mode
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'split-cv', label: 'Split Europass' },
                      { id: 'readme-stream', label: 'README Stream' },
                      { id: 'bento-portfolio', label: 'Bento Portfolio' },
                    ].map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            layoutMode: l.id as LayoutMode,
                          }))
                        }
                        className={`px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer ${
                          draft.layoutMode === l.id
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-[#111827] border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2">
                    Document Spatial Density
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'compact', label: 'Compact' },
                      { id: 'comfortable', label: 'Balanced' },
                      { id: 'spacious', label: 'Spacious' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            densityMode: d.id as DensityMode,
                          }))
                        }
                        className={`px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer ${
                          draft.densityMode === d.id
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-[#111827] border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <label className="inline-flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.showEuropassHeader}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          showEuropassHeader: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-700"
                    />
                    <span>Show Europass Passport Header Strip</span>
                  </label>

                  <label className="inline-flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.showTableOfContents}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          showTableOfContents: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-700"
                    />
                    <span>Show Document Navigation Outline (TOC)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeStudioTab === 'identity' && (
            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Canonical Handle (my.itstck.com/@user &amp; /u/user)
                </label>
                <div className="flex items-center rounded-lg bg-[#111827] border border-slate-800 px-3 py-1.5">
                  <span className="text-xs font-mono text-slate-500">my.itstck.com/@</span>
                  <input
                    type="text"
                    value={draft.username}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                      }))
                    }
                    className="bg-transparent text-xs font-mono text-blue-400 focus:outline-none flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={draft.displayName}
                    onChange={(e) => setDraft((prev) => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#111827] border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Availability Status
                  </label>
                  <select
                    value={draft.availability}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        availability: e.target.value as AvailabilityStatus,
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-[#111827] border border-slate-800 text-xs text-white"
                  >
                    <option value="open_to_work">Available for Staff / Principal Roles</option>
                    <option value="consulting">Open to Architecture Consulting</option>
                    <option value="hiring">Hiring Engineers</option>
                    <option value="focused">Focused on Current Work</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={draft.headline}
                  onChange={(e) => setDraft((prev) => ({ ...prev, headline: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#111827] border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Short Technical Bio
                </label>
                <textarea
                  rows={3}
                  value={draft.bio}
                  onChange={(e) => setDraft((prev) => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#111827] border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={draft.company}
                    onChange={(e) => setDraft((prev) => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#111827] border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={draft.location}
                    onChange={(e) => setDraft((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#111827] border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Primary IT Stack Technologies
                </label>
                <form onSubmit={handleAddStackItem} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTechInput}
                    onChange={(e) => setNewTechInput(e.target.value)}
                    placeholder="Add technology (e.g. Rust, Kafka, eBPF)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#111827] border border-slate-800 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer"
                  >
                    Add
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  {draft.primaryStack.map((tech) => (
                    <div
                      key={tech}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111827] border border-slate-800 text-slate-200"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStackItem(tech)}
                        className="text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Pane */}
        <div
          style={{
            backgroundColor: activeTheme.bgCanvas,
            color: activeTheme.textPrimary,
            fontFamily: activeFont.bodyFontFamily,
          }}
          className="lg:col-span-7 overflow-y-auto p-6 sm:p-10 transition-colors duration-200"
        >
          <div className="max-w-3xl mx-auto">
            <div
              style={{
                borderColor: activeTheme.borderSubtle,
                backgroundColor: activeTheme.bgSurface,
                color: activeTheme.textMuted,
              }}
              className="mb-8 px-4 py-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs font-mono"
            >
              <span>LIVE PREVIEW · my.itstck.com/@{draft.username}</span>
              <span style={{ color: activeTheme.accentText }}>
                {activeTheme.name} · {activeFont.name.split('+')[0]}
              </span>
            </div>

            <div style={{ borderColor: activeTheme.borderSubtle }} className="pb-8 mb-8 border-b">
              <div style={{ color: activeTheme.accentText }} className="text-xs font-mono mb-1.5">
                @{draft.username} · {draft.company} · {draft.location}
              </div>
              <h1
                style={{
                  fontFamily: activeFont.headingFontFamily,
                  color: activeTheme.textPrimary,
                }}
                className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
              >
                {draft.displayName}
              </h1>
              <p style={{ color: activeTheme.textSecondary }} className="text-base font-medium mb-2">
                {draft.headline}
              </p>
              <p style={{ color: activeTheme.textMuted }} className="text-sm leading-relaxed mb-4">
                {draft.bio}
              </p>
              <div style={{ color: activeTheme.accentText }} className="text-xs font-mono">
                Stack: {draft.primaryStack.join(' · ')}
              </div>
            </div>

            <div className="space-y-10">
              {sortedSections
                .filter((s) => s.isVisible)
                .map((sec, idx) => {
                  const isCurrentlyEditing = activeSection?.id === sec.id;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      style={{
                        borderColor: isCurrentlyEditing
                          ? activeTheme.accentPrimary
                          : activeTheme.borderSubtle,
                      }}
                      className={`pb-8 border-b last:border-b-0 transition-all cursor-pointer ${
                        isCurrentlyEditing ? 'pl-4 border-l-2' : ''
                      }`}
                    >
                      <div style={{ color: activeTheme.textMuted }} className="text-xs font-mono mb-1 tabular-nums">
                        0{idx + 1}. {sec.type.replace('_', ' ').toUpperCase()}
                        {isCurrentlyEditing ? ' · [ACTIVE EDITOR]' : ''}
                      </div>
                      <h2
                        style={{
                          fontFamily: activeFont.headingFontFamily,
                          color: activeTheme.textPrimary,
                        }}
                        className="text-xl font-bold mb-1"
                      >
                        {sec.title}
                      </h2>
                      {sec.subtitle && (
                        <p style={{ color: activeTheme.textMuted }} className="text-xs mb-4">
                          {sec.subtitle}
                        </p>
                      )}
                      <MarkdownRenderer
                        content={sec.content}
                        theme={activeTheme}
                        fontPairing={activeFont}
                        density={draft.densityMode}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
