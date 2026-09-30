import React, { useState } from 'react';
import { Check, PlusCircle, ShieldCheck, X } from 'lucide-react';
import { UserProfile, OAuthProvider, ThemeId, FontPairingId } from '../types';
import { THEMES, SECTION_TYPE_CATALOG } from '../lib/themes';
import { ResilientImage } from './ResilientImage';

interface AuthOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  currentUser: UserProfile;
  onSwitchUser: (username: string) => void;
  onCreateNewUser: (newProfile: UserProfile) => void;
}

export const AuthOnboardingModal: React.FC<AuthOnboardingModalProps> = ({
  isOpen,
  onClose,
  profiles,
  currentUser,
  onSwitchUser,
  onCreateNewUser,
}) => {
  const [mode, setMode] = useState<'login' | 'onboarding'>('login');
  const [selectedProvider, setSelectedProvider] = useState<OAuthProvider>('github');
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newHeadline, setNewHeadline] = useState('Senior Full-Stack & Cloud Architect');
  const [newCompany, setNewCompany] = useState('');
  const [newLocation, setNewLocation] = useState('London, UK');
  const [newThemeId, setNewThemeId] = useState<ThemeId>('obsidian-slate');
  const [newStackInput, setNewStackInput] = useState('TypeScript, Rust, React 19, PostgreSQL, Docker');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const cleanSlug = newUsername.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const isUsernameTaken = profiles.some(
    (p) => p.username.toLowerCase() === cleanSlug
  );

  const handleProviderStartOnboarding = (provider: OAuthProvider) => {
    setSelectedProvider(provider);
    setMode('onboarding');
    setErrorMsg('');
  };

  const handleFinishOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanSlug || cleanSlug.length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }
    if (isUsernameTaken) {
      setErrorMsg('That username is already claimed on my.itstck.com.');
      return;
    }
    if (!newDisplayName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const parsedStack = newStackInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const starterSections = SECTION_TYPE_CATALOG.slice(0, 5).map((cat, idx) => ({
      id: `sec-init-${Date.now()}-${idx}`,
      type: cat.type,
      title: cat.defaultTitle,
      subtitle: cat.defaultSubtitle,
      content: cat.templateContent,
      order: idx,
      isVisible: true,
      span: 'full' as const,
      updatedAt: new Date().toISOString().slice(0, 10),
    }));

    const createdProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      username: cleanSlug,
      displayName: newDisplayName.trim(),
      headline: newHeadline.trim() || 'Software Engineer',
      roleCategory: 'Full-Stack',
      bio: `Software Engineer at ${newCompany || 'Tech Industry'}. Verifiable static resume & portfolio hosted at my.itstck.com/@${cleanSlug}.`,
      location: newLocation.trim() || 'Europe',
      timezone: 'UTC',
      company: newCompany.trim() || 'Independent Architect',
      avatarUrl: '/src/assets/images/avatar_alex_turner_1790802548314.jpg',
      availability: 'open_to_work',
      verifiedProviders: [selectedProvider],
      primaryProvider: selectedProvider,
      primaryStack: parsedStack.length > 0 ? parsedStack : ['TypeScript', 'React', 'Node.js'],
      themeId: newThemeId,
      fontPairingId: 'syne-jakarta' as FontPairingId,
      layoutMode: 'split-cv',
      densityMode: 'comfortable',
      showEuropassHeader: true,
      showTableOfContents: true,
      customCss: '',
      isPublished: true,
      lastPublishedAt: new Date().toISOString(),
      staticBuildHash: Math.random().toString(16).substring(2, 9),
      staticBundleSizeKb: 10.4,
      followersCount: 1,
      followingUsernames: ['alexturner'],
      sections: starterSections,
      endorsements: [
        {
          skill: parsedStack[0] || 'Software Architecture',
          category: 'Architecture',
          count: 1,
          endorsedByUsernames: [cleanSlug],
        },
      ],
      recommendations: [],
      socialLinks: {
        github: `https://github.com/${cleanSlug}`,
        website: `https://my.itstck.com/@${cleanSlug}`,
        email: `${cleanSlug}@itstck.com`,
      },
      europassMeta: {
        nationality: 'European Citizen',
        workPermit: 'EU / UK / Global Remote',
        preferredContract: 'Full-Time / Advisory',
        yearsOfExperience: 5,
        europassPassportId: `EU-PASS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      },
      analytics: {
        totalViews: 1,
        uniqueVisitors30d: 1,
        staticHtmlDownloads: 0,
        pdfExports: 0,
        readmeClones: 0,
        avgReadTimeSeconds: 120,
        referrers: [
          {
            source: `Direct (my.itstck.com/@${cleanSlug})`,
            visits: 1,
            conversionRate: '100%',
          },
        ],
      },
    };

    onCreateNewUser(createdProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F17]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="font-display-syne text-lg font-bold text-white">
                Federated OAuth Identity · my.itstck.com
              </h2>
              <p className="text-xs text-slate-400">
                Sign in or claim your static landing page with GitHub, Microsoft, or Google
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-center gap-2 p-1 bg-[#0B0F17] rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Switch Session / OAuth SSO
            </button>
            <button
              type="button"
              onClick={() => setMode('onboarding')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'onboarding'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Claim New Route (/@user)
            </button>
          </div>

          {mode === 'login' ? (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-3">
                  Sign in or link federated OAuth 2.0 provider:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleProviderStartOnboarding('github')}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-700 bg-[#0B0F17] hover:border-blue-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <span>Sign in with GitHub</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderStartOnboarding('microsoft')}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-700 bg-[#0B0F17] hover:border-blue-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <span>Sign in with Microsoft</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderStartOnboarding('google')}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-700 bg-[#0B0F17] hover:border-blue-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <span>Sign in with Google</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 mb-3">
                  Or switch to a demo verified engineering persona:
                </div>
                <div className="space-y-2.5">
                  {profiles.map((prof) => {
                    const isCurrent = prof.username === currentUser.username;
                    return (
                      <div
                        key={prof.id}
                        onClick={() => {
                          onSwitchUser(prof.username);
                          onClose();
                        }}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                          isCurrent
                            ? 'border-blue-500 bg-blue-950/30'
                            : 'border-slate-800 bg-[#0B0F17] hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ResilientImage
                            src={prof.avatarUrl}
                            alt={prof.displayName}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              {prof.displayName}{' '}
                              <span className="font-mono text-blue-400">
                                (@{prof.username})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {prof.headline} · OAuth: {prof.verifiedProviders.join(', ').toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                              Active
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-blue-400">
                              Switch →
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFinishOnboarding} className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/50 text-xs text-blue-200 flex items-center justify-between">
                <span>
                  Selected OAuth: <strong className="uppercase">{selectedProvider}</strong> OAuth 2.0
                </span>
                <div className="flex gap-1.5">
                  {(['github', 'microsoft', 'google'] as OAuthProvider[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedProvider(p)}
                      className={`px-2 py-0.5 rounded text-[11px] uppercase font-mono cursor-pointer ${
                        selectedProvider === p
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-700 text-xs text-rose-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  1. Claim your static URL handle (/@username &amp; /u/username)
                </label>
                <div className="flex items-center rounded-xl bg-[#0B0F17] border border-slate-700 px-3.5 py-2.5">
                  <span className="text-xs font-mono text-slate-500">my.itstck.com/@</span>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="your_handle"
                    className="bg-transparent text-xs font-mono text-white focus:outline-none flex-1"
                  />
                  {cleanSlug.length >= 3 && (
                    <span
                      className={`text-[11px] font-mono ${
                        isUsernameTaken ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isUsernameTaken ? 'Taken' : 'Available'}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="e.g. David Vance"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Technical Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={newHeadline}
                    onChange={(e) => setNewHeadline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Distributed Labs"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Initial Theme
                  </label>
                  <select
                    value={newThemeId}
                    onChange={(e) => setNewThemeId(e.target.value as ThemeId)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-slate-700 text-xs text-white"
                  >
                    {Object.values(THEMES).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Primary Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={newStackInput}
                  onChange={(e) => setNewStackInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-slate-700 text-xs font-mono text-blue-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Claim Route &amp; Launch Studio</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
