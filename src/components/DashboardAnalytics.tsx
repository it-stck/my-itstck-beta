import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  FileCode,
  Globe,
  Github,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile } from '../types';
import { compileProfileToStaticHtml } from '../lib/markdown';

interface DashboardAnalyticsProps {
  profile: UserProfile;
  authToken: string | null;
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigateProfile: () => void;
  onNavigateEditor: () => void;
  onOpenSsgModal: () => void;
  onDeleteProfile: (username: string) => Promise<void>;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  profile,
  authToken,
  onUpdateProfile,
  onNavigateProfile,
  onNavigateEditor,
  onOpenSsgModal,
  onDeleteProfile,
}) => {
  const [slugInput, setSlugInput] = useState(profile.username);
  const [slugSaved, setSlugSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleSaveSlug = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = slugInput.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleaned) return;
    onUpdateProfile({
      ...profile,
      username: cleaned,
      socialLinks: {
        ...profile.socialLinks,
        website: `https://my.itstck.com/@${cleaned}`,
      },
    });
    setSlugSaved(true);
    setTimeout(() => setSlugSaved(false), 2000);
  };

  const handleDownloadHtmlDirect = () => {
    const html = compileProfileToStaticHtml(profile);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `@${profile.username}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== profile.username.toLowerCase()) {
      setDeleteError(`Please type '${profile.username}' to confirm deletion.`);
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    try {
      await onDeleteProfile(profile.username);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete profile.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 py-12 px-6">
      <div className="max-w-[1200px] mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono text-blue-400 mb-1.5">
              Production Dashboard &amp; Account Settings · my.itstck.com/dashboard
            </div>
            <h1 className="font-display-syne text-3xl font-bold text-white">
              Telemetry &amp; GitHub Profile (@{profile.username})
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadHtmlDirect}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-200 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML ({profile.staticBundleSizeKb} KB)</span>
            </button>
            <button
              type="button"
              onClick={onNavigateProfile}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>View /@{profile.username}</span>
            </button>
          </div>
        </div>

        {/* Tabular KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-[#111827]">
            <div className="text-xs font-mono text-slate-400">
              Total Pageviews (/@{profile.username})
            </div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
              {profile.analytics.totalViews.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-400 font-mono tabular-nums mt-1">
              {profile.analytics.uniqueVisitors30d.toLocaleString()} unique visitors
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-[#111827]">
            <div className="text-xs font-mono text-slate-400">
              HTML &amp; PDF Exports
            </div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
              {(profile.analytics.staticHtmlDownloads + profile.analytics.pdfExports).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 font-mono tabular-nums mt-1">
              {profile.analytics.staticHtmlDownloads} HTML · {profile.analytics.pdfExports} PDF
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-[#111827]">
            <div className="text-xs font-mono text-slate-400">
              Technical Skill Endorsements
            </div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
              {profile.endorsements.reduce((acc, item) => acc + item.count, 0)}
            </div>
            <div className="text-xs text-blue-400 font-mono tabular-nums mt-1">
              Across {profile.endorsements.length} audited competencies
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-[#111827]">
            <div className="text-xs font-mono text-slate-400">
              Static Build Payload Size
            </div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
              {profile.staticBundleSizeKb} KB
            </div>
            <div className="text-xs text-emerald-400 font-mono tabular-nums mt-1">
              Build #{profile.staticBuildHash} · 0 KB JS Runtime
            </div>
          </div>
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {/* Slug Configuration */}
            <div className="p-6 rounded-xl border border-slate-800 bg-[#111827] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Canonical Route &amp; Custom Slug Configuration
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Both routes automatically resolve to your pre-compiled static page
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenSsgModal}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-400 hover:underline cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Inspect HTML</span>
                </button>
              </div>

              <form onSubmit={handleSaveSlug} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center rounded-lg bg-[#0B0F17] border border-slate-800 px-3.5 py-2">
                  <span className="text-xs font-mono text-slate-500">my.itstck.com/@</span>
                  <input
                    type="text"
                    value={slugInput}
                    onChange={(e) => setSlugInput(e.target.value)}
                    className="bg-transparent text-xs font-mono text-white focus:outline-none flex-1"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer whitespace-nowrap"
                >
                  {slugSaved ? 'Slug Updated!' : 'Update Handle'}
                </button>
              </form>

              <div className="pt-2 space-y-1.5 text-xs font-mono text-slate-400">
                <div className="flex items-center justify-between py-1.5 px-3 rounded bg-[#0B0F17] border border-slate-800/80">
                  <span>Primary Handle (@handle):</span>
                  <button
                    type="button"
                    onClick={onNavigateProfile}
                    className="text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>https://my.itstck.com/@{profile.username}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center justify-between py-1.5 px-3 rounded bg-[#0B0F17] border border-slate-800/80">
                  <span>Static Alias (/u/handle):</span>
                  <button
                    type="button"
                    onClick={onNavigateProfile}
                    className="text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>https://my.itstck.com/u/{profile.username}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Referrers */}
            <div className="rounded-xl border border-slate-800 bg-[#111827] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  Technical Traffic Referrers
                </h2>
                <span className="text-xs font-mono text-slate-400">Real-time edge stats</span>
              </div>
              <table className="w-full text-left border-collapse text-xs sm:text-sm font-mono tabular-nums">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0B0F17] text-slate-400">
                    <th className="py-3 px-5 font-medium">Source / Referrer</th>
                    <th className="py-3 px-5 font-medium text-right">Visits</th>
                    <th className="py-3 px-5 font-medium text-right">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.analytics.referrers.map((ref) => (
                    <tr
                      key={ref.source}
                      className="border-b border-slate-800/70 last:border-b-0 hover:bg-slate-800/30"
                    >
                      <td className="py-3 px-5 text-slate-200 font-sans font-medium">
                        {ref.source}
                      </td>
                      <td className="py-3 px-5 text-right text-slate-300">
                        {ref.visits.toLocaleString()}
                      </td>
                      <td className="py-3 px-5 text-right text-emerald-400">
                        {ref.conversionRate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* GitHub Account Identity Box */}
            <div className="p-6 rounded-xl border border-slate-800 bg-[#111827] space-y-4">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-white" />
                <h2 className="text-sm font-semibold text-white">
                  GitHub Account Verification
                </h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your ItStack profile is uniquely bound to your verified GitHub account. Exactly one profile is allowed per GitHub account.
              </p>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0B0F17] space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">GitHub Handle:</span>
                  <a
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline font-semibold"
                  >
                    @{profile.githubUsername}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">GitHub ID:</span>
                  <span className="text-slate-200">{profile.githubId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ItStack Slug:</span>
                  <span className="text-emerald-400">/@{profile.username}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onNavigateEditor}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Launch Studio Editor
              </button>
            </div>

            {/* DANGER ZONE: Permanent Account Deletion */}
            <div className="p-6 rounded-xl border border-rose-900/60 bg-[#150a0d] space-y-4">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h2 className="text-sm font-bold">Danger Zone: Delete Profile</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Permanently delete your ItStack portfolio, static build files, and release your <strong className="text-white">@{profile.username}</strong> handle. This action is irreversible.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800/80 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Profile &amp; Static Page</span>
                </button>
              ) : (
                <div className="p-4 rounded-lg bg-[#0B0F17] border border-rose-900/80 space-y-3">
                  <p className="text-xs text-rose-300 font-medium">
                    Type <code className="text-white bg-slate-800 px-1 py-0.5 rounded font-mono">{profile.username}</code> to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={profile.username}
                    className="w-full px-3 py-1.5 rounded bg-black border border-rose-800 text-xs font-mono text-white focus:outline-none"
                  />

                  {deleteError && (
                    <p className="text-[11px] text-rose-400 font-mono">{deleteError}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleConfirmDelete}
                      className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                        setDeleteError('');
                      }}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
