import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  FileCode,
  Globe,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { UserProfile, OAuthProvider } from '../types';
import { compileProfileToStaticHtml } from '../lib/markdown';

interface DashboardAnalyticsProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigateProfile: () => void;
  onNavigateEditor: () => void;
  onOpenSsgModal: () => void;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  profile,
  onUpdateProfile,
  onNavigateProfile,
  onNavigateEditor,
  onOpenSsgModal,
}) => {
  const [slugInput, setSlugInput] = useState(profile.username);
  const [slugSaved, setSlugSaved] = useState(false);

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

  const handleToggleProvider = (provider: OAuthProvider) => {
    const exists = profile.verifiedProviders.includes(provider);
    if (exists && profile.verifiedProviders.length <= 1) return;
    const nextProviders = exists
      ? profile.verifiedProviders.filter((p) => p !== provider)
      : [...profile.verifiedProviders, provider];
    onUpdateProfile({
      ...profile,
      verifiedProviders: nextProviders,
    });
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

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 py-12 px-6">
      <div className="max-w-[1200px] mx-auto space-y-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono text-blue-400 mb-1.5">
              Production Dashboard &amp; Telemetry · my.itstck.com/dashboard
            </div>
            <h1 className="font-display-syne text-3xl font-bold text-white">
              Static Page Analytics &amp; OAuth Identity (@{profile.username})
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

        {/* High-Density Tabular Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-[#111827]">
            <div className="text-xs font-mono text-slate-400">
              Total Pageviews (/@{profile.username})
            </div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
              {profile.analytics.totalViews.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-400 font-mono tabular-nums mt-1">
              {profile.analytics.uniqueVisitors30d.toLocaleString()} unique visitors (30d)
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-[#111827]">
            <div className="text-xs font-mono text-slate-400">
              HTML &amp; PDF Europass Exports
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

        {/* 2-Column Split: Referrer Analytics & OAuth Accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-[#111827] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  Technical Traffic Referrers (Trailing 30 Days)
                </h2>
                <span className="text-xs font-mono text-slate-400">Real-time edge stats</span>
              </div>
              <table className="w-full text-left border-collapse text-xs sm:text-sm font-mono tabular-nums">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0B0F17] text-slate-400">
                    <th className="py-3 px-5 font-medium">Source / Referrer</th>
                    <th className="py-3 px-5 font-medium text-right">Visits</th>
                    <th className="py-3 px-5 font-medium text-right">Resume Conversion</th>
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
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-xl border border-slate-800 bg-[#111827] space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">
                  Connected OAuth Providers
                </h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your **GitHub**, **Microsoft**, and **Google** accounts for verifiable developer identity and single sign-on (SSO).
              </p>

              <div className="space-y-3 pt-1">
                {(
                  [
                    {
                      id: 'github',
                      name: 'GitHub OAuth',
                      desc: 'Sync repository stars and README.md',
                      account: profile.socialLinks.github || `github.com/${profile.username}`,
                    },
                    {
                      id: 'microsoft',
                      name: 'Microsoft Entra ID',
                      desc: 'Enterprise identity verification',
                      account: profile.socialLinks.microsoft || `${profile.username}@outlook.com`,
                    },
                    {
                      id: 'google',
                      name: 'Google Cloud Identity',
                      desc: 'Verified email and Google Workspace sign-in',
                      account: profile.socialLinks.google || profile.socialLinks.email,
                    },
                  ] as const
                ).map((prov) => {
                  const isConnected = profile.verifiedProviders.includes(prov.id);
                  return (
                    <div
                      key={prov.id}
                      className="p-3.5 rounded-xl border border-slate-800 bg-[#0B0F17] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">
                            {prov.name}
                          </span>
                          {isConnected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                              <Check className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {isConnected ? prov.account : prov.desc}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleProvider(prov.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                          isConnected
                            ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-500'
                        }`}
                      >
                        {isConnected ? 'Connected' : 'Link'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-[#111827] space-y-3">
              <h2 className="text-sm font-semibold text-white">
                Europass &amp; Markdown Compiler Status
              </h2>
              <div className="text-xs text-slate-400 space-y-1.5 font-mono">
                <div>Active Sections: {profile.sections.filter((s) => s.isVisible).length} of {profile.sections.length}</div>
                <div>Passport ID: {profile.europassMeta.europassPassportId}</div>
                <div>Last Published: {new Date(profile.lastPublishedAt).toLocaleString()}</div>
              </div>
              <button
                type="button"
                onClick={onNavigateEditor}
                className="w-full mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Launch Studio Editor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
