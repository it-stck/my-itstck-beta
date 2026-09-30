import { z } from "zod";
import { isValidUsername } from "./utils";

// ─── Username ─────────────────────────────────────────────────────────────────
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores and hyphens"
  )
  .refine(isValidUsername, "This username is not available");

// ─── Onboarding ───────────────────────────────────────────────────────────────
export const onboardingSchema = z.object({
  username: usernameSchema,
  title: z
    .string()
    .max(100, "Title must be at most 100 characters")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(100, "Location must be at most 100 characters")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

// ─── Profile / settings ───────────────────────────────────────────────────────
export const profileSchema = z.object({
  username: usernameSchema.optional(),
  title: z.string().max(100).optional().or(z.literal("")),
  location: z.string().max(100).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  githubUrl: z
    .string()
    .url()
    .regex(/github\.com/, "Must be a GitHub URL")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url()
    .regex(/linkedin\.com/, "Must be a LinkedIn URL")
    .optional()
    .or(z.literal("")),
  twitterUrl: z
    .string()
    .url()
    .regex(/(twitter|x)\.com/, "Must be a Twitter/X URL")
    .optional()
    .or(z.literal("")),
  youtubeUrl: z
    .string()
    .url()
    .regex(/youtube\.com/, "Must be a YouTube URL")
    .optional()
    .or(z.literal("")),
  dribbbleUrl: z
    .string()
    .url()
    .regex(/dribbble\.com/, "Must be a Dribbble URL")
    .optional()
    .or(z.literal("")),
  devtoUrl: z
    .string()
    .url()
    .regex(/dev\.to/, "Must be a Dev.to URL")
    .optional()
    .or(z.literal("")),
  // Appearance
  theme: z.string().optional(),
  font: z.string().optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color")
    .optional(),
  layout: z.enum(["sidebar", "centered", "columns"]).optional(),
  showAvatar: z.boolean().optional(),
  showStats: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  isIndexed: z.boolean().optional(),
  // SEO
  seoTitle: z.string().max(60).optional().or(z.literal("")),
  seoDescription: z.string().max(160).optional().or(z.literal("")),
});

// ─── Section ──────────────────────────────────────────────────────────────────
export const sectionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  content: z.string().max(50_000, "Content too long (max 50k chars)"),
  isVisible: z.boolean().default(true),
  type: z.enum([
    "HEADER", "ABOUT", "EXPERIENCE", "EDUCATION", "SKILLS",
    "PROJECTS", "CERTIFICATIONS", "LANGUAGES", "AWARDS",
    "PUBLICATIONS", "VOLUNTEER", "OPEN_SOURCE", "CUSTOM",
  ]),
  order: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const sectionUpdateSchema = sectionSchema.partial().extend({
  id: z.string().cuid(),
});

export const sectionsReorderSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string().cuid(),
      order: z.number().int().min(0),
    })
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type SectionFormData = z.infer<typeof sectionSchema>;
export type SectionUpdateFormData = z.infer<typeof sectionUpdateSchema>;
