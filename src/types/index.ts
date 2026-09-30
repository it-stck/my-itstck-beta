import type { User, Profile, Section, SectionType, UserRole, UserPlan } from "@prisma/client";

// ─── Re-exports from Prisma ───────────────────────────────────────────────────
export type { SectionType, UserRole, UserPlan };

// ─── Extended types ───────────────────────────────────────────────────────────

export type UserWithProfile = User & {
  profile: Profile | null;
};

export type ProfileWithSections = Profile & {
  sections: Section[];
  user: Pick<User, "id" | "name" | "email" | "image" | "username">;
};

export type SectionWithMetadata = Section & {
  metadata: SectionMetadata | null;
};

// ─── Section types ────────────────────────────────────────────────────────────

export interface SectionMetadata {
  icon?: string;
  color?: string;
  columns?: number;
  layout?: "list" | "grid" | "timeline";
  showDates?: boolean;
}

export interface SectionFormData {
  title: string;
  content: string;
  isVisible: boolean;
  type: SectionType;
  order: number;
  metadata?: SectionMetadata;
}

// ─── Theme types ──────────────────────────────────────────────────────────────

export type ThemeId =
  | "default"
  | "dark"
  | "ocean"
  | "terminal"
  | "minimal"
  | "glass"
  | "sunset"
  | "forest";

export type FontId =
  | "inter"
  | "mono"
  | "poppins"
  | "serif"
  | "fira";

export type LayoutId = "sidebar" | "centered" | "columns";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  preview: string; // CSS gradient or color for preview swatch
  isDark: boolean;
  vars: Record<string, string>;
}

export interface FontConfig {
  id: FontId;
  name: string;
  family: string;
  googleFont?: string;
  isMonospace: boolean;
}

// ─── Profile appearance ───────────────────────────────────────────────────────

export interface ProfileAppearance {
  theme: ThemeId;
  font: FontId;
  accentColor: string;
  layout: LayoutId;
  showAvatar: boolean;
  showStats: boolean;
}

// ─── Editor state ─────────────────────────────────────────────────────────────

export interface EditorState {
  sections: Section[];
  selectedSectionId: string | null;
  appearance: ProfileAppearance;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  previewMode: "editor" | "preview" | "split";
}

// ─── API response types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export interface OnboardingFormData {
  username: string;
  title: string;
  location: string;
  website?: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface UserStats {
  views: number;
  followers: number;
  following: number;
  sections: number;
}

// ─── Explore / public feed ────────────────────────────────────────────────────

export interface PublicProfile {
  username: string;
  name: string | null;
  image: string | null;
  title: string | null;
  location: string | null;
  theme: string;
  viewCount: number;
  createdAt: Date;
}
