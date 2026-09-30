export type OAuthProvider = 'github' | 'microsoft' | 'google';

export type SectionType =
  | 'readme_overview'
  | 'work_experience'
  | 'education'
  | 'tech_stack'
  | 'projects'
  | 'languages_cefr'
  | 'certifications'
  | 'publications'
  | 'custom';

export type ThemeId =
  | 'obsidian-slate'
  | 'paper-editorial'
  | 'github-dark'
  | 'github-light'
  | 'europass-swiss'
  | 'nordic-frost'
  | 'brutalist-mono'
  | 'solarized-vellum';

export type FontPairingId =
  | 'jakarta-jetbrains'
  | 'syne-jakarta'
  | 'instrument-jakarta'
  | 'jetbrains-mono';

export type LayoutMode = 'split-cv' | 'readme-stream' | 'bento-portfolio';

export type DensityMode = 'compact' | 'comfortable' | 'spacious';

export type AvailabilityStatus = 'open_to_work' | 'consulting' | 'hiring' | 'focused';

export interface ProfileSection {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  content: string; // Markdown + Europass syntax
  order: number;
  isVisible: boolean;
  span?: 'full' | 'half';
  updatedAt: string;
}

export interface EndorsementItem {
  skill: string;
  category: 'Architecture' | 'Backend' | 'Frontend' | 'Cloud & DevOps' | 'AI & Data' | 'Security';
  count: number;
  endorsedByUsernames: string[];
}

export interface RecommendationComment {
  id: string;
  authorUsername: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  relation: string;
  content: string;
  createdAt: string;
}

export interface SocialLinks {
  github?: string;
  microsoft?: string;
  google?: string;
  linkedin?: string;
  website?: string;
  email?: string;
  orcid?: string;
}

export interface EuropassPersonalMeta {
  nationality?: string;
  workPermit?: string;
  drivingLicense?: string;
  preferredContract?: string;
  yearsOfExperience: number;
  europassPassportId: string;
}

export interface AnalyticsReferrer {
  source: string;
  visits: number;
  conversionRate: string;
}

export interface ProfileAnalytics {
  totalViews: number;
  uniqueVisitors30d: number;
  staticHtmlDownloads: number;
  pdfExports: number;
  readmeClones: number;
  avgReadTimeSeconds: number;
  referrers: AnalyticsReferrer[];
}

export interface UserProfile {
  id: string;
  username: string; // handle: accessible via /@username & /u/username
  displayName: string;
  headline: string;
  roleCategory: 'Full-Stack' | 'Systems & SRE' | 'AI & Distributed' | 'Design Systems';
  bio: string;
  location: string;
  timezone: string;
  company: string;
  avatarUrl: string;
  availability: AvailabilityStatus;
  verifiedProviders: OAuthProvider[];
  primaryProvider: OAuthProvider;
  primaryStack: string[];
  themeId: ThemeId;
  fontPairingId: FontPairingId;
  layoutMode: LayoutMode;
  densityMode: DensityMode;
  showEuropassHeader: boolean;
  showTableOfContents: boolean;
  customCss: string;
  isPublished: boolean;
  lastPublishedAt: string;
  staticBuildHash: string;
  staticBundleSizeKb: number;
  followersCount: number;
  followingUsernames: string[];
  sections: ProfileSection[];
  endorsements: EndorsementItem[];
  recommendations: RecommendationComment[];
  socialLinks: SocialLinks;
  europassMeta: EuropassPersonalMeta;
  analytics: ProfileAnalytics;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  category: 'Dark' | 'Light' | 'Editorial';
  description: string;
  bgCanvas: string;
  bgSurface: string;
  bgElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderSubtle: string;
  accentPrimary: string;
  accentText: string;
  codeBg: string;
}

export interface FontPairingDefinition {
  id: FontPairingId;
  name: string;
  description: string;
  headingFontFamily: string;
  bodyFontFamily: string;
  monoFontFamily: string;
  headingClass: string;
}
