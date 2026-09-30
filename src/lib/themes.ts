import type { ThemeConfig, FontConfig, ThemeId, FontId } from "@/types";

// ─── Themes ───────────────────────────────────────────────────────────────────

export const THEMES: ThemeConfig[] = [
  {
    id: "default",
    name: "Light",
    description: "Clean white background, perfect for professional CVs",
    preview: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
    isDark: false,
    vars: {
      "--profile-bg": "#ffffff",
      "--profile-surface": "#f8fafc",
      "--profile-border": "#e2e8f0",
      "--profile-text": "#0f172a",
      "--profile-text-muted": "#64748b",
      "--profile-card-bg": "#ffffff",
      "--profile-header-bg": "#f8fafc",
      "--profile-code-bg": "#f1f5f9",
      "--profile-shadow": "0 1px 3px rgba(0,0,0,0.1)",
      "--profile-section-separator": "#e2e8f0",
    },
  },
  {
    id: "dark",
    name: "Dark",
    description: "Sleek dark theme for the modern developer",
    preview: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    isDark: true,
    vars: {
      "--profile-bg": "#0f172a",
      "--profile-surface": "#1e293b",
      "--profile-border": "#334155",
      "--profile-text": "#f1f5f9",
      "--profile-text-muted": "#94a3b8",
      "--profile-card-bg": "#1e293b",
      "--profile-header-bg": "#0f172a",
      "--profile-code-bg": "#0d1117",
      "--profile-shadow": "0 1px 3px rgba(0,0,0,0.5)",
      "--profile-section-separator": "#334155",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Deep blue tones inspired by the sea",
    preview: "linear-gradient(135deg, #0c1a2e 0%, #1a3a5c 100%)",
    isDark: true,
    vars: {
      "--profile-bg": "#0c1a2e",
      "--profile-surface": "#162436",
      "--profile-border": "#1e3a5f",
      "--profile-text": "#e2eeff",
      "--profile-text-muted": "#7fa8d4",
      "--profile-card-bg": "#162436",
      "--profile-header-bg": "#0c1a2e",
      "--profile-code-bg": "#0a1520",
      "--profile-shadow": "0 2px 8px rgba(0,40,100,0.4)",
      "--profile-section-separator": "#1e3a5f",
    },
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Hacker-style terminal aesthetic with green on black",
    preview: "linear-gradient(135deg, #000000 0%, #0d1b0d 100%)",
    isDark: true,
    vars: {
      "--profile-bg": "#000000",
      "--profile-surface": "#0a0f0a",
      "--profile-border": "#1a3d1a",
      "--profile-text": "#00ff41",
      "--profile-text-muted": "#00a828",
      "--profile-card-bg": "#0d170d",
      "--profile-header-bg": "#000000",
      "--profile-code-bg": "#050f05",
      "--profile-shadow": "0 0 20px rgba(0,255,65,0.15)",
      "--profile-section-separator": "#1a3d1a",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean minimalist design, typography-first",
    preview: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
    isDark: false,
    vars: {
      "--profile-bg": "#fafafa",
      "--profile-surface": "#fafafa",
      "--profile-border": "#e5e5e5",
      "--profile-text": "#171717",
      "--profile-text-muted": "#737373",
      "--profile-card-bg": "#ffffff",
      "--profile-header-bg": "#fafafa",
      "--profile-code-bg": "#f5f5f5",
      "--profile-shadow": "none",
      "--profile-section-separator": "#e5e5e5",
    },
  },
  {
    id: "glass",
    name: "Glass",
    description: "Glassmorphism with beautiful backdrop blur effects",
    preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    isDark: true,
    vars: {
      "--profile-bg": "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      "--profile-surface": "rgba(255,255,255,0.05)",
      "--profile-border": "rgba(255,255,255,0.15)",
      "--profile-text": "#ffffff",
      "--profile-text-muted": "rgba(255,255,255,0.6)",
      "--profile-card-bg": "rgba(255,255,255,0.08)",
      "--profile-header-bg": "rgba(255,255,255,0.05)",
      "--profile-code-bg": "rgba(0,0,0,0.3)",
      "--profile-shadow": "0 8px 32px rgba(0,0,0,0.37)",
      "--profile-section-separator": "rgba(255,255,255,0.1)",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm sunset gradient tones",
    preview: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
    isDark: false,
    vars: {
      "--profile-bg": "#fff8f0",
      "--profile-surface": "#fff1e6",
      "--profile-border": "#fdd5b1",
      "--profile-text": "#2d1b00",
      "--profile-text-muted": "#7c4a00",
      "--profile-card-bg": "#ffffff",
      "--profile-header-bg": "#fff8f0",
      "--profile-code-bg": "#fef3e2",
      "--profile-shadow": "0 2px 8px rgba(255,100,0,0.1)",
      "--profile-section-separator": "#fdd5b1",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Natural earthy greens for a calm, grounded feel",
    preview: "linear-gradient(135deg, #1a2f1a 0%, #2d4a2d 100%)",
    isDark: true,
    vars: {
      "--profile-bg": "#1a2f1a",
      "--profile-surface": "#243824",
      "--profile-border": "#3d5e3d",
      "--profile-text": "#d4edd4",
      "--profile-text-muted": "#8fb48f",
      "--profile-card-bg": "#243824",
      "--profile-header-bg": "#1a2f1a",
      "--profile-code-bg": "#152015",
      "--profile-shadow": "0 2px 8px rgba(0,50,0,0.4)",
      "--profile-section-separator": "#3d5e3d",
    },
  },
];

// ─── Fonts ────────────────────────────────────────────────────────────────────

export const FONTS: FontConfig[] = [
  {
    id: "inter",
    name: "Inter",
    family: "'Inter', system-ui, sans-serif",
    googleFont: "Inter:wght@300;400;500;600;700",
    isMonospace: false,
  },
  {
    id: "poppins",
    name: "Poppins",
    family: "'Poppins', system-ui, sans-serif",
    googleFont: "Poppins:wght@300;400;500;600;700",
    isMonospace: false,
  },
  {
    id: "serif",
    name: "Lora",
    family: "'Lora', Georgia, serif",
    googleFont: "Lora:wght@400;500;600;700",
    isMonospace: false,
  },
  {
    id: "mono",
    name: "JetBrains Mono",
    family: "'JetBrains Mono', 'Fira Code', monospace",
    googleFont: "JetBrains+Mono:wght@300;400;500;600;700",
    isMonospace: true,
  },
  {
    id: "fira",
    name: "Fira Code",
    family: "'Fira Code', 'Courier New', monospace",
    googleFont: "Fira+Code:wght@300;400;500;600;700",
    isMonospace: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getTheme(id: string): ThemeConfig {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function getFont(id: string): FontConfig {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}

export function buildThemeCssVars(
  themeId: string,
  accentColor: string,
  fontId: string
): string {
  const theme = getTheme(themeId);
  const font = getFont(fontId);

  const vars = [
    ...Object.entries(theme.vars).map(([k, v]) => `${k}: ${v}`),
    `--profile-accent: ${accentColor}`,
    `--profile-font: ${font.family}`,
  ];

  return vars.join("; ");
}

export function getGoogleFontsUrl(fontIds: string[]): string {
  const fonts = fontIds
    .map((id) => getFont(id))
    .filter((f) => f.googleFont)
    .map((f) => f.googleFont!);

  if (!fonts.length) return "";

  const families = fonts.map((f) => `family=${f}`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export const SECTION_TYPE_META: Record<
  string,
  { label: string; icon: string; description: string; defaultTitle: string }
> = {
  HEADER: {
    label: "Header",
    icon: "👤",
    description: "Your name, title and contact info",
    defaultTitle: "Header",
  },
  ABOUT: {
    label: "About",
    icon: "💡",
    description: "Professional summary",
    defaultTitle: "About Me",
  },
  EXPERIENCE: {
    label: "Experience",
    icon: "💼",
    description: "Work history",
    defaultTitle: "Experience",
  },
  EDUCATION: {
    label: "Education",
    icon: "🎓",
    description: "Academic background",
    defaultTitle: "Education",
  },
  SKILLS: {
    label: "Skills",
    icon: "🛠️",
    description: "Technologies & tools",
    defaultTitle: "Skills",
  },
  PROJECTS: {
    label: "Projects",
    icon: "🚀",
    description: "Portfolio projects",
    defaultTitle: "Projects",
  },
  CERTIFICATIONS: {
    label: "Certs",
    icon: "📜",
    description: "Certifications & licenses",
    defaultTitle: "Certifications",
  },
  LANGUAGES: {
    label: "Languages",
    icon: "🌍",
    description: "Spoken languages",
    defaultTitle: "Languages",
  },
  AWARDS: {
    label: "Awards",
    icon: "🏆",
    description: "Achievements & awards",
    defaultTitle: "Awards",
  },
  PUBLICATIONS: {
    label: "Publications",
    icon: "📚",
    description: "Articles & papers",
    defaultTitle: "Publications",
  },
  VOLUNTEER: {
    label: "Volunteer",
    icon: "❤️",
    description: "Volunteer work",
    defaultTitle: "Volunteer",
  },
  OPEN_SOURCE: {
    label: "Open Source",
    icon: "⚡",
    description: "OSS contributions",
    defaultTitle: "Open Source",
  },
  CUSTOM: {
    label: "Custom",
    icon: "✨",
    description: "Free-form section",
    defaultTitle: "Custom Section",
  },
};
