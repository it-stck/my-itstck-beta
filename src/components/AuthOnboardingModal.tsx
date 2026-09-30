import React, { useState } from 'react';
import { Github, ShieldCheck, X, AlertCircle, Loader2 } from 'lucide-react';
import { UserProfile, AuthSession } from '../types';

interface AuthOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AuthSession) => void;
}

export const AuthOnboardingModal: React.FC<AuthOnboardingModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [githubInput, setGithubInput] = useState('');
  const [desiredSlug, setDesiredSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleStartGitHubAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = githubInput.replace(/^@/, '').trim();
    if (!cleanHandle) {
      setErrorMsg('Please enter your GitHub username.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. Check if OAuth client ID is configured for direct redirect
      const configRes = await fetch('/api/auth/status');
      const config = await configRes.json();

      if (config.githubOAuthConfigured) {
        // Full OAuth 2.0 flow
        const authUrlRes = await fetch('/api/auth/github');
        const { url } = await authUrlRes.json();
        if (url) {
          window.location.href = url;
          return;
        }
      }

      // 2. Direct Verification Flow (Fetches authentic GitHub account data and unique numeric ID)
      const res = await fetch('/api/auth/github/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubUsername: cleanHandle,
          desiredUsername: desiredSlug.trim() || cleanHandle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate with GitHub.');
      }

      onLoginSuccess(data as AuthSession);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with GitHub.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F17]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
              <Github className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-display-syne text-base font-bold text-white">
                Sign in with GitHub
              </h2>
              <p className="text-[11px] text-slate-400">
                1 GitHub Account = 1 Verified ItStack Profile
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">Verifiable Developer Identity</p>
              <p className="text-slate-300 mt-0.5 text-[11px]">
                Sign in with your GitHub account. If you already have an ItStack profile, you will be logged in immediately. If you are new, your starter page will be provisioned.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-700/60 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleStartGitHubAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                GitHub Username Handle
              </label>
              <div className="flex items-center rounded-xl bg-[#0B0F17] border border-slate-700 px-3.5 py-2.5 focus-within:border-blue-500">
                <span className="text-xs font-mono text-slate-500 select-none mr-1">github.com/</span>
                <input
                  type="text"
                  required
                  autoFocus
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  placeholder="e.g. torvalds"
                  className="bg-transparent text-xs font-mono text-white focus:outline-none flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Desired ItStack URL (Optional alias)
              </label>
              <div className="flex items-center rounded-xl bg-[#0B0F17] border border-slate-800 px-3.5 py-2 text-xs">
                <span className="font-mono text-slate-500 select-none mr-1">my.itstck.com/@</span>
                <input
                  type="text"
                  value={desiredSlug}
                  onChange={(e) =>
                    setDesiredSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                  }
                  placeholder={githubInput.toLowerCase() || 'your_handle'}
                  className="bg-transparent font-mono text-slate-300 focus:outline-none flex-1"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-slate-100 hover:bg-white text-slate-950 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Verifying GitHub Account...</span>
                </>
              ) : (
                <>
                  <Github className="w-4 h-4" />
                  <span>Authenticate with GitHub</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="px-6 py-3 bg-[#0B0F17] border-t border-slate-800/80 text-[11px] text-slate-500 font-mono text-center">
          Strict authorization enforced · Each user can only edit their own profile
        </div>
      </div>
    </div>
  );
};
