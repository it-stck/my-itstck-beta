import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getAvatarUrl } from "@/lib/utils";
import { Search, Eye, Layers, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Explore Developers — IT Stack",
  description: "Browse developer portfolios built with IT Stack",
};

export const revalidate = 300; // 5 min ISR

interface SearchParams {
  q?: string;
  page?: string;
}

const PAGE_SIZE = 24;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = searchParams.q ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    profile: { isPublic: true, isIndexed: true },
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { username: { contains: query, mode: "insensitive" as const } },
            { profile: { headline: { contains: query, mode: "insensitive" as const } } },
            { profile: { location: { contains: query, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        profile: {
          select: {
            theme: true,
            headline: true,
            location: true,
            viewCount: true,
            accentColor: true,
            _count: { select: { sections: true } },
          },
        },
      },
      orderBy: { profile: { viewCount: "desc" } },
      skip,
      take: PAGE_SIZE,
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Developers</h1>
          <p className="text-muted-foreground">
            {total.toLocaleString()} developer portfolios and counting
          </p>
        </div>

        {/* Search */}
        <form method="GET" className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search by name, username, role, location..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </form>

        {/* Grid */}
        {users.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {users.map((user) => {
                const profile = user.profile!;
                const avatarSrc = user.image ?? getAvatarUrl(user.username ?? user.email);
                const accentColor = profile.accentColor ?? "#6366f1";

                return (
                  <Link
                    key={user.id}
                    href={`/${user.username}`}
                    className="group rounded-xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
                  >
                    {/* Color strip */}
                    <div
                      className="h-1.5 w-full"
                      style={{ backgroundColor: accentColor }}
                    />

                    <div className="p-4">
                      {/* Avatar + name */}
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-full overflow-hidden ring-2 shrink-0"
                          style={{ boxShadow: `0 0 0 2px ${accentColor}40` }}
                        >
                          <Image
                            src={avatarSrc}
                            alt={user.name ?? user.username ?? ""}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate group-hover:text-brand-500 transition-colors">
                            {user.name ?? user.username}
                          </p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>

                      {/* Title */}
                      {profile.headline && (
                        <p className="text-sm text-muted-foreground truncate mb-2">
                          {profile.headline}
                        </p>
                      )}

                      {/* Location */}
                      {profile.location && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3" />
                          {profile.location}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="w-3.5 h-3.5" />
                          {(profile.viewCount ?? 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Layers className="w-3.5 h-3.5" />
                          {profile._count.sections}
                        </span>
                        <span
                          className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${accentColor}15`,
                            color: accentColor,
                          }}
                        >
                          {profile.theme ?? "default"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/explore?q=${query}&page=${page - 1}`}
                    className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                  >
                    Previous
                  </Link>
                )}
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/explore?q=${query}&page=${page + 1}`}
                    className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg font-medium mb-2">No profiles found</p>
            <p className="text-muted-foreground mb-6">
              {query ? `No results for "${query}"` : "Be the first to create a profile!"}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors text-sm font-medium"
            >
              Create your profile
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
