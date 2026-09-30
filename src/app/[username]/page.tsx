import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { buildThemeCssVars, getGoogleFontsUrl } from "@/lib/themes";
import { stripMarkdown, getAvatarUrl } from "@/lib/utils";

interface Props {
  params: { username: string };
}

// ISR: revalidate every 60 seconds
export const revalidate = 60;

// Generate static params for top profiles
export async function generateStaticParams() {
  const users = await db.user.findMany({
    where: { profile: { isPublic: true } },
    select: { username: true },
    take: 100,
    orderBy: { profile: { viewCount: "desc" } },
  });
  return users
    .filter((u) => u.username)
    .map((u) => ({ username: u.username! }));
}

// OG metadata
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const user = await db.user.findUnique({
    where: { username: params.username },
    include: {
      profile: { include: { sections: { take: 1, where: { type: "ABOUT", isVisible: true } } } },
    },
  });

  if (!user?.profile?.isPublic) {
    return { title: "Profile not found" };
  }

  const aboutContent = user.profile.sections[0]?.content ?? "";
  const description = user.profile.bio
    ?? stripMarkdown(aboutContent).slice(0, 160)
    ?? `${user.name}'s developer portfolio`;

  const avatarUrl = user.image ?? getAvatarUrl(user.username ?? user.email);

  return {
    title: `${user.name ?? user.username} — IT Stack`,
    description,
    openGraph: {
      type: "profile",
      title: user.name ?? user.username ?? "Developer",
      description,
      images: [{ url: avatarUrl, width: 400, height: 400 }],
      url: `https://my.itstck.com/${params.username}`,
    },
    twitter: {
      card: "summary",
      title: user.name ?? user.username ?? "Developer",
      description,
      images: [avatarUrl],
    },
    alternates: {
      canonical: `https://my.itstck.com/${params.username}`,
    },
  };
}

export default async function UserProfilePage({ params }: Props) {
  const user = await db.user.findUnique({
    where: { username: params.username },
    include: {
      profile: {
        include: {
          sections: {
            where: { isVisible: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!user || !user.profile || !user.profile.isPublic) {
    notFound();
  }

  const { profile } = user;

  // Increment view count (fire-and-forget, don't block render)
  db.profile
    .update({
      where: { userId: user.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {
      // Silent fail — view count is non-critical
    });

  // Build theme CSS vars for injection
  const cssVars = buildThemeCssVars(
    profile.theme ?? "default",
    profile.accentColor ?? "#6366f1",
    profile.font ?? "inter"
  );
  const googleFontsUrl = getGoogleFontsUrl([profile.font ?? "inter"]);

  const profileData = {
    ...profile,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      username: user.username,
    },
  };

  return (
    <>
      {/* Google Fonts */}
      {googleFontsUrl && (
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      )}
      {googleFontsUrl && (
        <link rel="stylesheet" href={googleFontsUrl} />
      )}

      {/* Profile JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            name: user.name,
            url: `https://my.itstck.com/${params.username}`,
            mainEntity: {
              "@type": "Person",
              name: user.name,
              url: profile.website,
              jobTitle: profile.headline,
              image: user.image,
            },
          }),
        }}
      />

      <main
        className="min-h-screen"
        style={{
          // Inject CSS vars at root level
          ...Object.fromEntries(
            cssVars.split(";").map((v) => {
              const [k, ...rest] = v.split(":");
              return [k?.trim(), rest.join(":").trim()];
            }).filter(([k]) => k)
          ),
        }}
      >
        <ProfilePage profile={profileData} />
      </main>
    </>
  );
}
