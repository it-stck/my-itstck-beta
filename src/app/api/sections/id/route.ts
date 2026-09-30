// IMPORTANT: This file's directory should be renamed to [id] after project setup
// Run: mv src/app/api/sections/id src/app/api/sections/\[id\]
// Or use the setup script: bash scripts/setup-dynamic-routes.sh

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sectionSchema } from "@/lib/validations";
import { createApiError, createApiSuccess } from "@/lib/utils";

type RouteParams = { params: { id: string } };

// GET /api/sections/[id]
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return createApiError("Unauthorized", 401);

  const profile = await db.profile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return createApiError("Profile not found", 404);

  const section = await db.section.findFirst({
    where: { id: params.id, profileId: profile.id },
  });
  if (!section) return createApiError("Section not found", 404);

  return createApiSuccess(section);
}

// PATCH /api/sections/[id]
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return createApiError("Unauthorized", 401);

  let body: unknown;
  try { body = await req.json(); } catch { return createApiError("Invalid JSON", 400); }

  const parsed = sectionSchema.partial().safeParse(body);
  if (!parsed.success) {
    return createApiError(parsed.error.errors.map((e) => e.message).join(", "), 400);
  }

  const profile = await db.profile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return createApiError("Profile not found", 404);

  const existing = await db.section.findFirst({ where: { id: params.id, profileId: profile.id } });
  if (!existing) return createApiError("Section not found", 404);

  const { title, content, isVisible, order, metadata } = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (isVisible !== undefined) updateData.isVisible = isVisible;
  if (order !== undefined) updateData.order = order;
  if (metadata !== undefined) updateData.metadata = metadata;

  const section = await db.section.update({ where: { id: params.id }, data: updateData });
  return createApiSuccess(section);
}

// DELETE /api/sections/[id]
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return createApiError("Unauthorized", 401);

  const profile = await db.profile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return createApiError("Profile not found", 404);

  const existing = await db.section.findFirst({ where: { id: params.id, profileId: profile.id } });
  if (!existing) return createApiError("Section not found", 404);

  await db.section.delete({ where: { id: params.id } });
  return createApiSuccess({ deleted: true });
}
