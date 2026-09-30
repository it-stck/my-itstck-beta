"use client";

import { THEMES, FONTS } from "@/lib/themes";
import type { ProfileAppearance } from "@/types";
import { Check, Monitor, AlignCenter, Columns } from "lucide-react";
import { Label, Switch, Select } from "@/components/ui/index";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  appearance: ProfileAppearance;
  onChange: (updates: Partial<ProfileAppearance>) => void;
}

const LAYOUTS = [
  { id: "centered", label: "Centered", icon: AlignCenter, description: "Single column" },
  { id: "sidebar", label: "Sidebar", icon: Monitor, description: "With sidebar" },
  { id: "columns", label: "Columns", icon: Columns, description: "Two columns" },
] as const;

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
  "#64748b", // Slate
  "#171717", // Black
];

export function ThemeSelector({ appearance, onChange }: ThemeSelectorProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-3 py-2 bg-muted/30 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Appearance
        </span>
      </div>

      <div className="p-4 space-y-6">
        {/* ── Theme ─────────────────────────────────────────────────────── */}
        <section>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
            Theme
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onChange({ theme: theme.id })}
                title={theme.name}
                className={cn(
                  "relative rounded-lg overflow-hidden aspect-square border-2 transition-all",
                  appearance.theme === theme.id
                    ? "border-brand-500 shadow-md shadow-brand-500/20"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <div
                  className="w-full h-full"
                  style={{ background: theme.preview }}
                />
                <span className="absolute bottom-0 left-0 right-0 text-[10px] font-medium py-0.5 px-1 bg-black/40 text-white text-center truncate">
                  {theme.name}
                </span>
                {appearance.theme === theme.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-brand-500 rounded-full p-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ── Font ──────────────────────────────────────────────────────── */}
        <section>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
            Font
          </Label>
          <div className="grid grid-cols-1 gap-1.5">
            {FONTS.map((font) => (
              <button
                key={font.id}
                onClick={() => onChange({ font: font.id })}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-left",
                  appearance.font === font.id
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-border hover:border-muted-foreground hover:bg-muted/50"
                )}
              >
                <div>
                  <span className="text-sm font-medium">{font.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {font.isMonospace ? "Mono" : "Sans"}
                  </span>
                </div>
                <span
                  className="text-sm text-muted-foreground"
                  style={{ fontFamily: font.family }}
                >
                  Aa
                </span>
                {appearance.font === font.id && (
                  <Check className="w-4 h-4 text-brand-500 ml-2" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ── Accent color ───────────────────────────────────────────────── */}
        <section>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
            Accent Color
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onChange({ accentColor: color })}
                className={cn(
                  "w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                  appearance.accentColor === color
                    ? "border-white shadow-lg scale-110"
                    : "border-transparent"
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Custom:</span>
            <input
              type="color"
              value={appearance.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              className="h-7 w-12 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-xs font-mono text-muted-foreground">
              {appearance.accentColor}
            </span>
          </div>
        </section>

        {/* ── Layout ────────────────────────────────────────────────────── */}
        <section>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
            Layout
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {LAYOUTS.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => onChange({ layout: id })}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border transition-all",
                  appearance.layout === id
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-border hover:border-muted-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("w-5 h-5", appearance.layout === id ? "text-brand-500" : "text-muted-foreground")} />
                <span className="text-xs font-medium">{label}</span>
                <span className="text-[10px] text-muted-foreground text-center">{description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Options ────────────────────────────────────────────────────── */}
        <section>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
            Options
          </Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Avatar</p>
                <p className="text-xs text-muted-foreground">Display profile picture</p>
              </div>
              <Switch
                checked={appearance.showAvatar}
                onCheckedChange={(v) => onChange({ showAvatar: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Stats</p>
                <p className="text-xs text-muted-foreground">Show view count & followers</p>
              </div>
              <Switch
                checked={appearance.showStats}
                onCheckedChange={(v) => onChange({ showStats: v })}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
