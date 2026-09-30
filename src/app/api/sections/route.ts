import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sectionSchema, sectionsReorderSchema } from "@/lib/validations";
import { createApiError, createApiSuccess } from "@/lib/utils";

// GET /api/sections — get all sections for current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return createApiError("Unauthorized", 401);

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return createApiError("Profile not found", 404);

  const sections = await db.section.findMany({
    where: { profileId: profile.id },
    orderBy: { order: "asc" },
  });

  return createApiSuccess(sections);
}

// POST /api/sections — create a new section
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return createApiError("Unauthorized", 401);

  let body: unknown;
  try { body = await req.json(); } catch { return createApiError("Invalid JSON", 400); }

  const parsed = sectionSchema.safeParse(body);
  if (!parsed.success) {
    return createApiError(parsed.error.errors.map((e) => e.message).join(", "), 400);
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return createApiError("Profile not found", 404);

  // Count existing sections
  const count = await db.section.count({ where: { profileId: profile.id } });

  // Free plan: max 12 sections
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  const maxSections = user?.plan === "FREE" ? 12 : 50;
  if (count >= maxSections) {
    return createApiError(`Maximum ${maxSections} sections allowed on your plan`, 403);
  }

  const { title, content, isVisible, type, metadata } = parsed.data;

  const section = await db.section.create({
    data: {
      profileId: profile.id,
      title,
      content,
      isVisible: isVisible ?? true,
      type,
      order: count,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
    },
  });

  return createApiSuccess(section, 201);
}

// PUT /api/sections — reorder sections
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return createApiError("Unauthorized", 401);

  let body: unknown;
  try { body = await req.json(); } catch { return createApiError("Invalid JSON", 400); }

  const parsed = sectionsReorderSchema.safeParse(body);
  if (!parsed.success) {
    return createApiError("Invalid reorder data", 400);
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return createApiError("Profile not found", 404);

  // Verify all section IDs belong to this profile
  const sectionIds = parsed.data.sections.map((s) => s.id);
  const owned = await db.section.count({
    where: { id: { in: sectionIds }, profileId: profile.id },
  });
  if (owned !== sectionIds.length) {
    return createApiError("Unauthorized: one or more sections not owned", 403);
  }

  // Batch update orders
  await Promise.all(
    parsed.data.sections.map((s) =>
      db.section.update({ where: { id: s.id }, data: { order: s.order } })
    )
  );

  const sections = await db.section.findMany({
    where: { profileId: profile.id },
    orderBy: { order: "asc" },
  });

  return createApiSuccess(sections);
}
