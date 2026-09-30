import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { isValidUsername } from "@/lib/utils";
import { createApiSuccess, createApiError } from "@/lib/utils";

// GET /api/username?q=username — check availability
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();

  if (!username) return createApiError("Username query parameter required", 400);
  if (!isValidUsername(username)) {
    return createApiSuccess({ available: false, reason: "Invalid username format" });
  }

  const existing = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });

  return createApiSuccess({
    available: !existing,
    username,
    reason: existing ? "Username already taken" : null,
  });
}
