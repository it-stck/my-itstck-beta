"use client";

import { useMemo } from "react";
import type { Profile, Section } from "@prisma/client";
import { getTheme, getFont, getGoogleFontsUrl } from "@/lib/themes";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileSection } from "./ProfileSection";

interface ProfilePageProps {
  profile: Profile & {
    sections: Section[];
    user: { name: string | null; email: string; image: string | null; username: string | null };
  };
  isPreview?: boolean;
}

function buildStyleObject(
  themeVars: Record<string, string>,
  accentColor: string,
  fontFamily: string
): React.CSSProperties {
  // Build a style object mapping CSS custom property names to values.
  // React accepts --var-name keys in CSSProperties as of React 17+.
  const style: Record<string, string> = {};
  for (const [k, v] of Object.entries(themeVars)) {
    style[k] = v;
  }
  style["--profile-accent"] = accentColor;
  style["--profile-font"] = fontFamily;
  style["fontFamily"] = fontFamily;

  // Handle gradient backgrounds (glass theme etc.)
  const bg = themeVars["--profile-bg"] ?? "#ffffff";
  if (bg.startsWith("linear-gradient")) {
    style["background"] = bg;
  } else {
    style["backgroundColor"] = bg;
  }

  return style as React.CSSProperties;
}

export function ProfilePage({ profile, isPreview = false }: ProfilePageProps) {
  const theme = useMemo(() => getTheme(profile.theme ?? "default"), [profile.theme]);
  const font = useMemo(() => getFont(profile.font ?? "inter"), [profile.font]);
  const accentColor = profile.accentColor ?? "#6366f1";

  const styleObj = useMemo(
    () => buildStyleObject(theme.vars, accentColor, font.family),
    [theme.vars, accentColor, font.family]
  );

  const googleFontsUrl = useMemo(
    () => getGoogleFontsUrl([profile.font ?? "inter"]),
    [profile.font]
  );

  const visibleSections = useMemo(
    () => [...profile.sections].filter((s) => s.isVisible).sort((a, b) => a.order - b.order),
    [profile.sections]
  );

  const layout = (profile.layout as "centered" | "sidebar" | "columns") ?? "centered";

  return (
    <div
      className="profile-page min-h-full"
      style={styleObj}
    >
      {/* Google Fonts (preview mode uses inline style, not <link>) */}
      {googleFontsUrl && !isPreview && (
        <link rel="stylesheet" href={googleFontsUrl} />
      )}

      {/* ── Centered layout (default) ────────────────────────────────── */}
      {layout === "centered" && (
        <div className={isPreview ? "w-full" : "max-w-3xl mx-auto py-8 px-4"}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "var(--profile-card-bg)",
              boxShadow: "var(--profile-shadow)",
              border: "1px solid var(--profile-border)",
            }}
          >
            <ProfileHeader
              profile={profile}
              accentColor={accentColor}
              showAvatar={profile.showAvatar ?? true}
              showStats={profile.showStats ?? true}
              isPreview={isPreview}
            />
            <div className="px-6 pb-6">
              {visibleSections.map((section) => (
                <ProfileSection
                  key={section.id}
                  section={section}
                  accentColor={accentColor}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar layout ───────────────────────────────────────────── */}
      {layout === "sidebar" && (
        <div className={`flex gap-6 ${isPreview ? "h-full" : "max-w-5xl mx-auto py-8 px-4"}`}>
          <div
            className="w-60 shrink-0 rounded-2xl overflow-hidden h-fit sticky top-8"
            style={{
              backgroundColor: "var(--profile-card-bg)",
              boxShadow: "var(--profile-shadow)",
              border: "1px solid var(--profile-border)",
            }}
          >
            <ProfileHeader
              profile={profile}
              accentColor={accentColor}
              showAvatar={profile.showAvatar ?? true}
              showStats={profile.showStats ?? true}
              isPreview={isPreview}
            />
          </div>
          <div className="flex-1 min-w-0 space-y-4">
            {visibleSections.map((section) => (
              <div
                key={section.id}
                className="rounded-2xl overflow-hidden p-6"
                style={{
                  backgroundColor: "var(--profile-card-bg)",
                  boxShadow: "var(--profile-shadow)",
                  border: "1px solid var(--profile-border)",
                }}
              >
                <ProfileSection section={section} accentColor={accentColor} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Columns layout ───────────────────────────────────────────── */}
      {layout === "columns" && (
        <div className={isPreview ? "" : "max-w-5xl mx-auto py-8 px-4"}>
          <div
            className="rounded-2xl overflow-hidden mb-6"
            style={{
              backgroundColor: "var(--profile-card-bg)",
              boxShadow: "var(--profile-shadow)",
              border: "1px solid var(--profile-border)",
            }}
          >
            <ProfileHeader
              profile={profile}
              accentColor={accentColor}
              showAvatar={profile.showAvatar ?? true}
              showStats={profile.showStats ?? true}
              isPreview={isPreview}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {visibleSections.map((section, i) => (
              <div
                key={section.id}
                className={`rounded-2xl overflow-hidden p-6 ${
                  i === 0 && visibleSections.length % 2 !== 0 ? "col-span-2" : ""
                }`}
                style={{
                  backgroundColor: "var(--profile-card-bg)",
                  boxShadow: "var(--profile-shadow)",
                  border: "1px solid var(--profile-border)",
                }}
              >
                <ProfileSection section={section} accentColor={accentColor} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {visibleSections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg" style={{ color: "var(--profile-text-muted)" }}>
            No sections visible yet.
          </p>
          {isPreview && (
            <p className="text-sm mt-1" style={{ color: "var(--profile-text-muted)" }}>
              Add sections in the Content tab or toggle their visibility.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
