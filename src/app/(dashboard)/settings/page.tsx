import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsPageClient } from "./SettingsPageClient";

export const metadata: Metadata = {
  title: "Settings — IT Stack",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  if (!user || !user.profile) redirect("/onboarding");

  const initial = {
    username: user.username ?? "",
    name: user.name ?? "",
    email: user.email,
    bio: user.profile.bio ?? "",
    headline: user.profile.headline ?? "",
    location: user.profile.location ?? "",
    website: user.profile.website ?? "",
    github: user.profile.github ?? "",
    linkedin: user.profile.linkedin ?? "",
    twitter: user.profile.twitter ?? "",
    contactEmail: user.profile.contactEmail ?? "",
    isPublic: user.profile.isPublic,
    isIndexed: user.profile.isIndexed,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile and account preferences
        </p>
      </div>
      <SettingsPageClient initial={initial} />
    </div>
  );
}
