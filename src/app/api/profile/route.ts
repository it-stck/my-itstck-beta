import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createApiError, createApiSuccess } from "@/lib/utils";
import { z } from "zod";

const profilePatchSchema = z.object({
  // User fields
  username: z.string().min(3).max(30).optional(),
  name: z.string().max(100).optional(),
  // Profile fields
  headline: z.string().max(200).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().or(z.literal("")).optional(),
  contactEmail: z.string().email().or(z.literal("")).optional(),
  // Socials
  github: z.string().max(100).optional(),
  linkedin: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
  youtube: z.string().max(100).optional(),
  devto: z.string().max(100).optional(),
  // Appearance
  theme: z.string().optional(),
  font: z.string().optional(),
  accentColor: z.string().optional(),
  layout: z.string().optional(),
  showAvatar: z.boolean().optional(),
  showStats: z.boolean().optional(),
  // Visibility
  isPublic: z.boolean().optional(),
  isIndexed: z.boolean().optional(),
  // SEO
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
}).passthrough();

// GET /api/profile — get current user's profile with sections
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return createApiError("Unauthorized", 401);

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      sections: { orderBy: { order: "asc" } },
      user: { select: { name: true, email: true, image: true, username: true } },
    },
  });

  if (!profile) return createApiError("Profile not found", 404);
  return createApiSuccess(profile);
}

// PATCH /api/profile — update profile
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return createApiError("Unauthorized", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return createApiError("Invalid JSON body", 400);
  }

  const parsed = profilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return createApiError(parsed.error.errors.map((e) => e.message).join(", "), 400);
  }

  const { username, name, ...profileFields } = parsed.data;

  // Handle username change
  if (username) {
    const existing = await db.user.findUnique({ where: { username } });
    if (existing && existing.id !== session.user.id) {
      return createApiError("Username already taken", 409);
    }
  }

  // Update user fields
  if (username || name) {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(username ? { username } : {}),
        ...(name ? { name } : {}),
      },
    });
  }

  // Build profile update — only include defined fields
  const profileData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(profileFields)) {
    if (value !== undefined) profileData[key] = value;
  }

  const profile = await db.profile.update({
    where: { userId: session.user.id },
    data: profileData,
    include: {
      sections: { orderBy: { order: "asc" } },
      user: { select: { name: true, email: true, image: true, username: true } },
    },
  });

  return createApiSuccess(profile);
}

// DELETE /api/profile — delete account
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return createApiError("Unauthorized", 401);

  await db.user.delete({ where: { id: session.user.id } });
  return createApiSuccess({ deleted: true });
}
