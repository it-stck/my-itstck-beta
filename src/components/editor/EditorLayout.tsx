"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Profile, Section } from "@prisma/client";
import { SectionManager } from "./SectionManager";
import { MarkdownEditor } from "./MarkdownEditor";
import { ThemeSelector } from "./ThemeSelector";
import { ProfilePage } from "@/components/profile/ProfilePage";
import {
  Save, Eye, SplitSquareHorizontal, PenSquare,
  Globe, Lock, Loader2, Check, Settings, Palette,
  ChevronLeft, ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProfileAppearance } from "@/types";
import { getProfileUrl } from "@/lib/utils";

type ProfileWithSections = Profile & {
  sections: Section[];
  user: { name: string | null; email: string; image: string | null; username: string | null };
};

type EditorTab = "content" | "appearance";
type PreviewMode = "editor" | "split" | "preview";

interface EditorLayoutProps {
  profile: ProfileWithSections;
}

export function EditorLayout({ profile: initialProfile }: EditorLayoutProps) {
  const { toast } = useToast();

  // Profile state
  const [profile, setProfile] = useState(initialProfile);
  const [sections, setSections] = useState<Section[]>(initialProfile.sections);
  const [selectedSection, setSelectedSection] = useState<Section | null>(
    initialProfile.sections[0] ?? null
  );

  // Editor state
  const [editorTab, setEditorTab] = useState<EditorTab>("content");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("split");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Appearance state (synced with profile)
  const [appearance, setAppearance] = useState<ProfileAppearance>({
    theme: profile.theme as ProfileAppearance["theme"],
    font: profile.font as ProfileAppearance["font"],
    accentColor: profile.accentColor,
    layout: profile.layout as ProfileAppearance["layout"],
    showAvatar: profile.showAvatar,
    showStats: profile.showStats,
  });

  // Auto-save ref
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // ─── Auto-save ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveAll();
    }, 5000); // 5 second debounce
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [isDirty, sections, appearance]);

  // ─── Save all changes ─────────────────────────────────────────────────────
  const saveAll = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveStatus("saving");
    try {
      // Save each modified section
      await Promise.all(
        sections.map((s) =>
          fetch(`/api/sections/${s.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: s.title,
              content: s.content,
              isVisible: s.isVisible,
              order: s.order,
            }),
          })
        )
      );

      // Save appearance
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appearance),
      });

      setIsDirty(false);
      setLastSaved(new Date());
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      toast({ title: "Save failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [sections, appearance, isSaving, toast]);

  // ─── Section handlers ─────────────────────────────────────────────────────
  const handleSectionUpdate = useCallback((updated: Section) => {
    setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedSection(updated);
    setIsDirty(true);
  }, []);

  const handleSectionCreate = useCallback(async (type: string) => {
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: type.charAt(0) + type.slice(1).toLowerCase(),
          content: `## ${type.charAt(0) + type.slice(1).toLowerCase()}\n\nWrite your content here...`,
          isVisible: true,
          order: sections.length,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSections((prev) => [...prev, json.data]);
      setSelectedSection(json.data);
      toast({ title: "Section created" });
    } catch {
      toast({ title: "Failed to create section", variant: "destructive" });
    }
  }, [sections.length, toast]);

  const handleSectionDelete = useCallback(async (id: string) => {
    try {
      await fetch(`/api/sections/${id}`, { method: "DELETE" });
      setSections((prev) => prev.filter((s) => s.id !== id));
      if (selectedSection?.id === id) {
        setSelectedSection(sections.find((s) => s.id !== id) ?? null);
      }
      toast({ title: "Section deleted" });
    } catch {
      toast({ title: "Failed to delete section", variant: "destructive" });
    }
  }, [selectedSection, sections, toast]);

  const handleSectionsReorder = useCallback(async (reordered: Section[]) => {
    setSections(reordered);
    setIsDirty(true);
    // Persist order
    await fetch("/api/sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sections: reordered.map((s, i) => ({ id: s.id, order: i })),
      }),
    });
  }, []);

  const handleAppearanceChange = useCallback((updates: Partial<ProfileAppearance>) => {
    setAppearance((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const handlePublishToggle = useCallback(async () => {
    const newPublic = !profile.isPublic;
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: newPublic }),
      });
      if (!res.ok) throw new Error();
      setProfile((prev) => ({ ...prev, isPublic: newPublic }));
      toast({
        title: newPublic ? "🌐 Profile published!" : "🔒 Profile set to private",
        description: newPublic
          ? `Your profile is now live at ${getProfileUrl(profile.user.username ?? "")}`
          : "Only you can see your profile",
      });
    } catch {
      toast({ title: "Failed to update visibility", variant: "destructive" });
    }
  }, [profile, toast]);

  // ─── Build preview profile ────────────────────────────────────────────────
  const previewProfile = {
    ...profile,
    ...appearance,
    sections: sections.filter((s) => s.isVisible),
  };

  const profileUrl = profile.user.username
    ? getProfileUrl(profile.user.username)
    : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Toolbar */}
      <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 gap-4 shrink-0 z-10">
        {/* Left */}
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </a>
          <div className="h-5 w-px bg-border" />

          {/* Tab switcher */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setEditorTab("content")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                editorTab === "content"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PenSquare className="w-3.5 h-3.5" />
              Content
            </button>
            <button
              onClick={() => setEditorTab("appearance")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                editorTab === "appearance"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Appearance
            </button>
          </div>
        </div>

        {/* Center - Preview mode */}
        <div className="flex bg-muted rounded-lg p-1">
          {(["editor", "split", "preview"] as PreviewMode[]).map((mode) => {
            const icons = {
              editor: PenSquare,
              split: SplitSquareHorizontal,
              preview: Eye,
            };
            const Icon = icons[mode];
            return (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                className={`p-1.5 rounded-md transition-colors ${
                  previewMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Save status */}
          <div className="text-xs text-muted-foreground mr-1">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1 text-green-500">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-destructive">Save failed</span>
            )}
            {lastSaved && saveStatus === "idle" && (
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={saveAll}
            disabled={isSaving || !isDirty}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>

          {/* Publish toggle */}
          <button
            onClick={handlePublishToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              profile.isPublic
                ? "bg-green-500/10 hover:bg-green-500/20 text-green-600"
                : "bg-brand-500 hover:bg-brand-600 text-white"
            }`}
          >
            {profile.isPublic ? (
              <><Globe className="w-4 h-4" /> Published</>
            ) : (
              <><Lock className="w-4 h-4" /> Publish</>
            )}
          </button>

          {/* View live */}
          {profileUrl && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </header>

      {/* Editor body */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left panel - Content or Appearance editor */}
        {previewMode !== "preview" && (
          <div className="w-96 shrink-0 border-r border-border flex flex-col overflow-hidden">
            {editorTab === "content" ? (
              <>
                {/* Section list */}
                <SectionManager
                  sections={sections}
                  selectedId={selectedSection?.id ?? null}
                  onSelect={setSelectedSection}
                  onCreate={handleSectionCreate}
                  onDelete={handleSectionDelete}
                  onReorder={handleSectionsReorder}
                  onToggleVisible={(id) => {
                    const s = sections.find((sec) => sec.id === id);
                    if (s) handleSectionUpdate({ ...s, isVisible: !s.isVisible });
                  }}
                />
                {/* Markdown editor for selected section */}
                {selectedSection && (
                  <MarkdownEditor
                    section={selectedSection}
                    onChange={handleSectionUpdate}
                  />
                )}
              </>
            ) : (
              <ThemeSelector
                appearance={appearance}
                onChange={handleAppearanceChange}
              />
            )}
          </div>
        )}

        {/* Right panel - Preview */}
        {previewMode !== "editor" && (
          <div className="flex-1 overflow-auto bg-muted/30">
            <div className={previewMode === "preview" ? "max-w-4xl mx-auto py-8 px-4" : "h-full"}>
              <ProfilePage
                profile={previewProfile as any}
                isPreview
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
