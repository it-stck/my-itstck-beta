import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { EditorLayout } from "@/components/editor/EditorLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor",
  description: "Edit your developer profile",
};

export default async function EditorPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      sections: { orderBy: { order: "asc" } },
      user: {
        select: { name: true, email: true, image: true, username: true },
      },
    },
  });

  if (!profile) redirect("/onboarding");

  return <EditorLayout profile={profile} />;
}
