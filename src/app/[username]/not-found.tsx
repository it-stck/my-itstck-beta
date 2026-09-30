import Link from "next/link";
import { UserX, Search } from "lucide-react";

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <UserX className="w-8 h-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        This profile doesn&apos;t exist or has been set to private.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/explore"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors text-sm font-medium"
        >
          <Search className="w-4 h-4" />
          Explore profiles
        </Link>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
