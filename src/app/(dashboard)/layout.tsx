import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/lib/auth";
import {
  Code2, LayoutDashboard, PenSquare, Settings,
  Globe, LogOut, ExternalLink, Users,
} from "lucide-react";
import { getAvatarUrl } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.onboardingCompleted) redirect("/onboarding");

  const avatar = getAvatarUrl({
    image: session.user.image,
    username: session.user.username ?? undefined,
    name: session.user.name ?? undefined,
  });

  const profileUrl = session.user.username
    ? `/${session.user.username}`
    : null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-card border-r border-border flex flex-col">
        {/* Brand */}
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">IT Stack</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem href="/editor" icon={PenSquare} label="Editor" />
          <NavItem href="/settings" icon={Settings} label="Settings" />
          <NavItem href="/explore" icon={Users} label="Explore" />

          {profileUrl && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>My Profile</span>
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <Image
              src={avatar}
              alt={session.user.name ?? ""}
              width={36}
              height={36}
              className="rounded-full"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {session.user.name ?? session.user.email}
              </div>
              {session.user.username && (
                <div className="text-xs text-muted-foreground">
                  @{session.user.username}
                </div>
              )}
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
