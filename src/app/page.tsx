import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Code2, Layers, Globe, Star, ArrowRight, Zap, Shield, Palette } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">IT Stack</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/explore" className="hover:text-foreground transition-colors">Explore</Link>
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#themes" className="hover:text-foreground transition-colors">Themes</Link>
          </div>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-full text-sm font-medium mb-6 border border-brand-200 dark:border-brand-800">
            <Zap className="w-3.5 h-3.5" />
            Your developer identity, beautifully presented
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance leading-tight">
            Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-500">
              IT Stack
            </span>
            <br />
            portfolio page
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance">
            The professional portfolio platform for developers. Showcase your skills,
            experience and projects at <strong>my.itstck.com/you</strong>. Login with
            GitHub, Google or Microsoft in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105"
            >
              Create your page free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl font-semibold text-lg transition-colors"
            >
              Browse examples
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.users.toLocaleString()}+</div>
              <div>Developers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.profiles.toLocaleString()}+</div>
              <div>Profiles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.views.toLocaleString()}+</div>
              <div>Profile views</div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof URLs */}
      <section className="py-8 px-4 bg-muted/30 border-y border-border overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 animate-pulse-slow flex-wrap justify-center text-sm font-mono text-muted-foreground">
            {["my.itstck.com/alice", "my.itstck.com/john-dev", "my.itstck.com/maria_fullstack",
              "my.itstck.com/carlos", "my.itstck.com/alex-infra", "my.itstck.com/dev_sarah"].map((url) => (
              <span key={url} className="px-3 py-1 bg-background border border-border rounded-lg">
                {url}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything a developer needs
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built by developers, for developers. Every feature designed to make
              your professional profile shine.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-border bg-card hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4 text-xl">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Themes preview */}
      <section id="themes" className="py-24 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              8 beautiful themes
            </h2>
            <p className="text-muted-foreground text-lg">
              From minimal to terminal-hacker. Make it yours.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {THEME_PREVIEWS.map((theme) => (
              <div key={theme.name} className="rounded-xl overflow-hidden border border-border group cursor-pointer hover:scale-105 transition-transform">
                <div
                  className="h-24"
                  style={{ background: theme.gradient }}
                />
                <div className="px-3 py-2 bg-card">
                  <div className="font-medium text-sm">{theme.name}</div>
                  <div className="text-xs text-muted-foreground">{theme.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Up and running in 2 minutes
            </h2>
          </div>

          <div className="space-y-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {i + 1}
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to stand out?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of developers showcasing their stack professionally.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105"
          >
            Create your free profile
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Free forever · No credit card · 2 min setup
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-foreground">IT Stack</span>
            <span>· Built with ❤️ for developers</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/explore" className="hover:text-foreground transition-colors">Explore</Link>
            <a href="https://github.com" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
          <div>© {new Date().getFullYear()} IT Stack</div>
        </div>
      </footer>
    </div>
  );
}

async function getStats() {
  try {
    const [users, profiles, viewsAggregate] = await Promise.all([
      db.user.count(),
      db.profile.count({ where: { isPublic: true } }),
      db.profile.aggregate({ _sum: { viewCount: true } }),
    ]);
    return {
      users,
      profiles,
      views: viewsAggregate._sum.viewCount ?? 0,
    };
  } catch {
    return { users: 0, profiles: 0, views: 0 };
  }
}

const FEATURES = [
  {
    icon: "📝",
    title: "Markdown Editor",
    description: "Write in markdown with a live preview. Support for code blocks, tables, badges and more.",
  },
  {
    icon: "🎨",
    title: "8 Themes",
    description: "Choose from Light, Dark, Ocean, Terminal, Minimal, Glass, Sunset and Forest.",
  },
  {
    icon: "🔤",
    title: "Custom Fonts",
    description: "Inter, Poppins, Lora, JetBrains Mono, Fira Code. Set the personality of your page.",
  },
  {
    icon: "📦",
    title: "Europass Sections",
    description: "Structured sections for experience, education, skills, projects, certifications and more.",
  },
  {
    icon: "🔒",
    title: "OAuth Login",
    description: "Secure sign-in with GitHub, Google or Microsoft. No passwords to manage.",
  },
  {
    icon: "⚡",
    title: "Lightning Fast",
    description: "Server-rendered profile pages with ISR. Loads instantly, anywhere in the world.",
  },
  {
    icon: "🌐",
    title: "Your own URL",
    description: "Get your permanent URL at my.itstck.com/you. Easy to share on LinkedIn, GitHub or email.",
  },
  {
    icon: "📊",
    title: "Profile Analytics",
    description: "See how many people are viewing your profile and which sections get the most attention.",
  },
  {
    icon: "🎯",
    title: "SEO Optimized",
    description: "Full OpenGraph, Twitter cards and structured data so your profile gets found.",
  },
];

const THEME_PREVIEWS = [
  { name: "Light", gradient: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)", desc: "Clean & professional" },
  { name: "Dark", gradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", desc: "Modern dark mode" },
  { name: "Ocean", gradient: "linear-gradient(135deg, #0c1a2e 0%, #1a3a5c 100%)", desc: "Deep blue tones" },
  { name: "Terminal", gradient: "linear-gradient(135deg, #000000 0%, #0d1b0d 100%)", desc: "Hacker aesthetic" },
  { name: "Minimal", gradient: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)", desc: "Ultra clean" },
  { name: "Glass", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", desc: "Glassmorphism" },
  { name: "Sunset", gradient: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)", desc: "Warm & vibrant" },
  { name: "Forest", gradient: "linear-gradient(135deg, #1a2f1a 0%, #2d4a2d 100%)", desc: "Earthy greens" },
];

const STEPS = [
  {
    title: "Sign in with GitHub, Google or Microsoft",
    description: "One click, no forms to fill out. We pull your name and avatar automatically.",
  },
  {
    title: "Choose your @username",
    description: "Pick a short, memorable username. This becomes your permanent profile URL.",
  },
  {
    title: "Fill in your sections",
    description: "Add your experience, skills, projects and education using our structured markdown editor.",
  },
  {
    title: "Pick your theme & go live",
    description: "Choose a theme, customize your accent color and font, then publish. Your page is live instantly.",
  },
];
