import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createApiSuccess } from "@/lib/utils";

// GET /api/users?page=1&q=search — public listing
export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const pageSize = 24;

  const where = {
    isPublic: true,
    ...(q
      ? {
          user: {
            OR: [
              { username: { contains: q, mode: "insensitive" as const } },
              { name: { contains: q, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
  };

  const [profiles, total] = await Promise.all([
    db.profile.findMany({
      where,
      select: {
        theme: true,
        title: true,
        location: true,
        viewCount: true,
        createdAt: true,
        user: {
          select: { username: true, name: true, image: true },
        },
      },
      orderBy: { viewCount: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.profile.count({ where }),
  ]);

  return createApiSuccess({
    profiles,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}
