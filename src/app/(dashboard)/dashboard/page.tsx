import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PenSquare, Globe, Eye, Users, ExternalLink, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { formatDate, formatNumber, getProfileUrl } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: {
        include: {
          sections: { select: { id: true, type: true, isVisible: true } },
          _count: { select: { sections: true } },
        },
      },
      _count: { select: { followers: true, follows: true } },
    },
  });

  if (!user) redirect("/login");
  if (!user.profile) redirect("/onboarding");

  const profile = user.profile;
  const profileUrl = user.username ? getProfileUrl(user.username) : null;
  const visibleSections = profile.sections.filter((s) => s.isVisible).length;
  const totalSections = profile.sections.length;

  // Profile completion score
  const completionItems = [
    { label: "Username", done: !!user.username },
    { label: "Title", done: !!profile.title },
    { label: "Location", done: !!profile.location },
    { label: "GitHub link", done: !!profile.githubUrl },
    { label: "At least 3 sections", done: totalSections >= 3 },
    { label: "Profile published", done: profile.isPublic },
  ];
  const completionScore = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground">
            {profile.isPublic
              ? "Your profile is live and visible to everyone."
              : "Your profile is private. Publish it when you're ready."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/editor"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <PenSquare className="w-4 h-4" /> Edit Profile
          </Link>
          {profileUrl && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> View Live
            </a>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Profile Views"
          value={formatNumber(profile.viewCount)}
          icon={Eye}
          color="blue"
        />
        <StatCard
          label="Followers"
          value={formatNumber(user._count.followers)}
          icon={Users}
          color="green"
        />
        <StatCard
          label="Sections"
          value={`${visibleSections}/${totalSections}`}
          icon={PenSquare}
          color="purple"
        />
        <StatCard
          label="Status"
          value={profile.isPublic ? "Public" : "Private"}
          icon={profile.isPublic ? Globe : Lock}
          color={profile.isPublic ? "green" : "yellow"}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile completion */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Profile Completion</h2>
            <span className="text-2xl font-bold text-brand-500">{completionScore}%</span>
          </div>

          <div className="w-full h-2 bg-muted rounded-full mb-4">
            <div
              className="h-2 bg-brand-500 rounded-full transition-all"
              style={{ width: `${completionScore}%` }}
            />
          </div>

          <div className="space-y-2">
            {completionItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${
                    item.done ? "text-green-500" : "text-muted-foreground/30"
                  }`}
                />
                <span
                  className={item.done ? "text-foreground" : "text-muted-foreground"}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {completionScore < 100 && (
            <Link
              href="/editor"
              className="mt-4 flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium"
            >
              Complete your profile <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <QuickAction
              href="/editor"
              icon="✏️"
              title="Edit sections"
              description="Update your experience, skills or projects"
            />
            <QuickAction
              href="/editor?tab=appearance"
              icon="🎨"
              title="Change theme"
              description="Pick a new theme, font or accent color"
            />
            <QuickAction
              href="/settings"
              icon="🔗"
              title="Add social links"
              description="Connect GitHub, LinkedIn, Twitter"
            />
            {!profile.isPublic && (
              <QuickAction
                href="/settings?section=visibility"
                icon="🌐"
                title="Publish your profile"
                description="Make it visible to the world"
              />
            )}
          </div>
        </div>
      </div>

      {/* Your URL */}
      {user.username && (
        <div className="mt-6 p-4 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-brand-700 dark:text-brand-300">Your profile URL</div>
            <div className="font-mono text-brand-600 dark:text-brand-400">{profileUrl}</div>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(profileUrl!)}
            className="px-3 py-1.5 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "purple" | "yellow";
}) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
    yellow: "bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400",
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className={`w-9 h-9 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
    >
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
    </Link>
  );
}
