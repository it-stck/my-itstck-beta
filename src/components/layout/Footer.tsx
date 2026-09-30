import Link from "next/link";
import { Terminal } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
                <Terminal className="w-3.5 h-3.5 text-white" />
              </div>
              IT<span className="text-brand-500">Stack</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Developer portfolio pages that actually look good.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2">
              {[
                { href: "/explore", label: "Explore" },
                { href: "/login", label: "Sign up free" },
                { href: "/dashboard", label: "Dashboard" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Resources</h4>
            <ul className="space-y-2">
              {[
                { href: "#", label: "Documentation" },
                { href: "#", label: "API" },
                { href: "#", label: "Status" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              {[
                { href: "#", label: "Privacy" },
                { href: "#", label: "Terms" },
                { href: "#", label: "Cookies" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} IT Stack. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js · Powered by ☕
          </p>
        </div>
      </div>
    </footer>
  );
}
