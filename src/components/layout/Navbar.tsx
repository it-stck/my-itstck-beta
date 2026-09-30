import Link from "next/link";
import { auth } from "@/lib/auth";
import { Terminal, Github } from "lucide-react";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <span>
            IT<span className="text-brand-500">Stack</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/explore"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Explore
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/editor"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
              >
                Editor
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
              >
                Get started free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
