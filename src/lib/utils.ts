import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Tailwind class merger ────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Username validation ──────────────────────────────────────────────────────
const RESERVED_USERNAMES = new Set([
  "admin", "api", "app", "auth", "blog", "dashboard", "docs",
  "editor", "explore", "help", "home", "login", "logout", "me",
  "onboarding", "pro", "profile", "register", "settings", "signup",
  "status", "support", "terms", "privacy", "u", "user", "users",
  "www", "itstck", "null", "undefined",
]);

export function isValidUsername(username: string): boolean {
  if (!username) return false;
  if (username.length < 3 || username.length > 30) return false;
  if (RESERVED_USERNAMES.has(username.toLowerCase())) return false;
  return /^[a-z0-9][a-z0-9_-]*[a-z0-9]$/i.test(username);
}

export function slugifyUsername(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 30);
}

// ─── URL helpers ──────────────────────────────────────────────────────────────
export function getProfileUrl(username: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://my.itstck.com";
  return `${base}/${username}`;
}

export function getAvatarUrl(user: {
  image?: string | null;
  username?: string | null;
  name?: string | null;
}): string {
  if (user.image) return user.image;
  const seed = user.username || user.name || "user";
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=6366f1`;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// ─── Number helpers ───────────────────────────────────────────────────────────
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ─── API helpers ──────────────────────────────────────────────────────────────
export function createApiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function createApiSuccess<T>(data: T, status = 200) {
  return Response.json({ data }, { status });
}

// ─── String helpers ───────────────────────────────────────────────────────────
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s/g, "")
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .replace(/>\s/g, "")
    .replace(/[-*]\s/g, "")
    .trim();
}

// ─── Color helpers ────────────────────────────────────────────────────────────
export function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "263 70% 50%";

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
