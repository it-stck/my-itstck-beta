import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { Code2, Github } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your IT Stack account",
};

// Microsoft icon (SVG)
function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" className="w-5 h-5" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

// Google icon (SVG)
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const session = await auth();
  if (session?.user) {
    redirect(searchParams.callbackUrl ?? "/dashboard");
  }

  const callbackUrl = searchParams.callbackUrl ?? "/dashboard";
  const error = searchParams.error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-2xl">IT Stack</span>
          </a>
          <h1 className="text-white text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-slate-400">
            Sign in to manage your developer profile
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error === "OAuthAccountNotLinked"
              ? "An account with this email already exists. Use the original sign-in method."
              : error === "AccessDenied"
              ? "Access denied. Please try again."
              : "Authentication error. Please try again."}
          </div>
        )}

        {/* Auth card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="space-y-3">
            {/* GitHub */}
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: callbackUrl });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#24292f] hover:bg-[#24292f]/90 text-white rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Github className="w-5 h-5" />
                Continue with GitHub
              </button>
            </form>

            {/* Google */}
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: callbackUrl });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </form>

            {/* Microsoft */}
            <form
              action={async () => {
                "use server";
                await signIn("microsoft-entra-id", { redirectTo: callbackUrl });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MicrosoftIcon />
                Continue with Microsoft
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-slate-400 text-xs text-center leading-relaxed">
              By signing in, you agree to our{" "}
              <a href="/terms" className="text-brand-400 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-brand-400 hover:underline">
                Privacy Policy
              </a>
              .
              <br />
              We never post without permission.
            </p>
          </div>
        </div>

        {/* Features teaser */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-slate-400">
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-lg mb-1">🔒</div>
            No password needed
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-lg mb-1">⚡</div>
            Ready in 2 min
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-lg mb-1">🎨</div>
            8 beautiful themes
          </div>
        </div>
      </div>
    </div>
  );
}
