"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Code2, Check, X, Loader2, ArrowRight } from "lucide-react";
import { DEFAULT_SECTIONS } from "@/prisma/seed";

type Step = "username" | "profile" | "sections";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("username");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Username step
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");

  // Profile step
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");

  // Check username availability with debounce
  const checkUsername = useCallback(async (val: string) => {
    if (val.length < 3) { setUsernameStatus("invalid"); return; }
    setUsernameStatus("checking");
    try {
      const res = await fetch(`/api/username?q=${encodeURIComponent(val)}`);
      const json = await res.json();
      setUsernameStatus(json.data.available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (!username) { setUsernameStatus("idle"); return; }
    const timer = setTimeout(() => checkUsername(username), 400);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    setError("");
    try {
      // 1. Set username and profile info
      const profileRes = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, headline: title, location, website }),
      });
      if (!profileRes.ok) {
        const err = await profileRes.json();
        throw new Error(err.error || "Failed to save profile");
      }

      // 2. Create default sections
      await Promise.all(
        DEFAULT_SECTIONS.map((s) =>
          fetch("/api/sections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(s),
          })
        )
      );

      // 3. Mark onboarding complete
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: false }), // start private, user can publish
      });

      // 4. Mark user as onboarded (server action would be ideal here)
      await fetch("/api/onboarding/complete", { method: "POST" });

      router.push("/editor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">IT Stack</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Set up your profile</h1>
          <p className="text-slate-400 text-sm mt-1">Just a few details and you're ready to go</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["username", "profile", "sections"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step === s ? "bg-brand-500 text-white" :
                (["username", "profile", "sections"].indexOf(step) > i) ? "bg-green-500 text-white" :
                "bg-white/10 text-slate-400"
              }`}>
                {["username", "profile", "sections"].indexOf(step) > i ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < 2 && <div className="w-8 h-0.5 bg-white/20" />}
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Username */}
          {step === "username" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-white text-xl font-semibold mb-1">Choose your username</h2>
                <p className="text-slate-400 text-sm">This will be your public URL: my.itstck.com/<strong className="text-slate-300">you</strong></p>
              </div>

              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">
                    my.itstck.com/
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="yourname"
                    maxLength={30}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 pl-[8.5rem] text-white placeholder-slate-500 font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {usernameStatus === "checking" && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                    {usernameStatus === "available" && <Check className="w-4 h-4 text-green-400" />}
                    {(usernameStatus === "taken" || usernameStatus === "invalid") && <X className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
                <div className="mt-2 text-xs">
                  {usernameStatus === "available" && <span className="text-green-400">✓ Available!</span>}
                  {usernameStatus === "taken" && <span className="text-red-400">Already taken. Try another.</span>}
                  {usernameStatus === "invalid" && username && <span className="text-red-400">Min 3 chars, letters/numbers/_-</span>}
                  {usernameStatus === "idle" && <span className="text-slate-500">Letters, numbers, - and _ only. Min 3 chars.</span>}
                </div>
              </div>

              <button
                onClick={() => setStep("profile")}
                disabled={usernameStatus !== "available"}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Profile info */}
          {step === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-white text-xl font-semibold mb-1">Tell us about yourself</h2>
                <p className="text-slate-400 text-sm">These will appear on your public profile</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-1.5">Professional title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Developer"
                    maxLength={100}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-1.5">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Barcelona, Spain"
                    maxLength={100}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-1.5">Website (optional)</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yoursite.com"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("username")}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("sections")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium transition-colors"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Sections */}
          {step === "sections" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-white text-xl font-semibold mb-1">Your profile sections</h2>
                <p className="text-slate-400 text-sm">We'll create these sections for you to fill in the editor</p>
              </div>

              <div className="space-y-2">
                {DEFAULT_SECTIONS.map((s) => (
                  <div key={s.type} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-6 h-6 rounded bg-brand-500/20 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{s.title}</span>
                  </div>
                ))}
              </div>

              <p className="text-slate-500 text-xs">You can add, remove and reorder sections in the editor.</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("profile")}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCompleteOnboarding}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                  ) : (
                    <>Open Editor <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
