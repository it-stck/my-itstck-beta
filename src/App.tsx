import React, { useEffect, useState, useCallback } from 'react';
import { UserProfile, ThemeId, FontPairingId, LayoutMode, AuthSession } from './types';
import { Navbar, AppView } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { StaticProfileView } from './components/StaticProfileView';
import { StudioEditor } from './components/StudioEditor';
import { ExploreNetwork } from './components/ExploreNetwork';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { SsgExporterModal } from './components/SsgExporterModal';
import { AuthOnboardingModal } from './components/AuthOnboardingModal';
import { Github, Sparkles, UserPlus } from 'lucide-react';

const GUEST_BLANK_PROFILE: UserProfile = {
  id: 'usr-guest-template',
  githubId: '0',
  githubUsername: 'guest',
  username: 'developer',
  displayName: 'Your Name Here',
  headline: 'Senior Full-Stack & Systems Engineer',
  roleCategory: 'Full-Stack',
  bio: 'Sign in with your GitHub account to initialize and publish your permanent ItStack curriculum page.',
  location: 'Madrid, Spain',
  timezone: 'Europe/Madrid',
  company: 'Open Source',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  availability: 'open_to_work',
  verifiedProviders: ['github'],
  primaryProvider: 'github',
  primaryStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
  themeId: 'obsidian-slate',
  fontPairingId: 'syne-jakarta',
  layoutMode: 'split-cv',
  densityMode: 'comfortable',
  showEuropassHeader: true,
  showTableOfContents: true,
  customCss: '',
  isPublished: true,
  lastPublishedAt: new Date().toISOString(),
  staticBuildHash: 'guest0',
  staticBundleSizeKb: 11.2,
  followersCount: 0,
  followingUsernames: [],
  sections: [
    {
      id: 'sec-guest-1',
      type: 'readme_overview',
      title: 'Executive Summary',
      subtitle: 'Technical Philosophy & Track Record',
      content:
        '### Hello, World!\nWelcome to your new **my.itstck.com** personal landing page.\n\nSign in with GitHub to claim your `@username`, customize your Europass sections, select custom themes, and compile autonomous HTML.',
      order: 0,
      isVisible: true,
      span: 'full',
      updatedAt: new Date().toISOString().slice(0, 10),
    },
  ],
  endorsements: [],
  recommendations: [],
  socialLinks: {
    github: 'https://github.com',
  },
  europassMeta: {
    nationality: 'Verified Developer',
    workPermit: 'Global / Remote',
    preferredContract: 'Full-Time',
    yearsOfExperience: 5,
    europassPassportId: 'EU-PASS-DEMO',
  },
  analytics: {
    totalViews: 0,
    uniqueVisitors30d: 0,
    staticHtmlDownloads: 0,
    pdfExports: 0,
    readmeClones: 0,
    avgReadTimeSeconds: 0,
    referrers: [],
  },
};

export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem('itstck_auth_token')
  );
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null);
  const [viewedHandle, setViewedHandle] = useState<string>('');
  const [activeView, setActiveView] = useState<AppView>('landing');
  const [routeFormat, setRouteFormat] = useState<'at' | 'u'>('at');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSsgModalOpen, setIsSsgModalOpen] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);

  // Fetch single profile helper
  const loadProfileByHandle = useCallback(async (handle: string) => {
    const clean = handle.replace(/^@/, '').toLowerCase().trim();
    if (!clean) return;
    setViewedHandle(clean);
    setProfileNotFound(false);

    try {
      const res = await fetch(`/api/profiles/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setViewedProfile(data.profile);
          setProfileNotFound(false);
          return;
        }
      }
      setProfileNotFound(true);
      setViewedProfile(null);
    } catch {
      setProfileNotFound(true);
      setViewedProfile(null);
    }
  }, []);

  // Initialize application, OAuth code exchange, and session
  useEffect(() => {
    // 1. Fetch directory profiles
    fetch('/api/profiles')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.profiles)) {
          setProfiles(data.profiles);
        }
      })
      .catch(() => {});

    // 2. Check for GitHub OAuth Code callback in URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const ghCode = urlParams.get('code');
    if (ghCode) {
      fetch('/api/auth/github/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: ghCode,
          redirectUri: window.location.origin,
        }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((session: AuthSession) => {
          localStorage.setItem('itstck_auth_token', session.token);
          setAuthToken(session.token);
          setCurrentUser(session.profile);
          setViewedProfile(session.profile);
          setActiveView('editor');
          window.history.replaceState({}, '', `/@${session.profile.username}`);
        })
        .catch((err) => {
          console.error('[OAuth] Code exchange error:', err);
        });
    } else {
      // 3. Verify existing session
      const storedToken = localStorage.getItem('itstck_auth_token');
      if (storedToken) {
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.profile) {
              setCurrentUser(data.profile);
            } else {
              localStorage.removeItem('itstck_auth_token');
              setAuthToken(null);
            }
          })
          .catch(() => {});
      }
    }

    // 4. Initial Route parsing
    const path = window.location.pathname;
    if (path.startsWith('/@')) {
      const handle = path.slice(2).split('/')[0];
      if (handle) {
        setRouteFormat('at');
        setActiveView('profile');
        loadProfileByHandle(handle);
      }
    } else if (path.startsWith('/u/')) {
      const handle = path.slice(3).split('/')[0];
      if (handle) {
        setRouteFormat('u');
        setActiveView('profile');
        loadProfileByHandle(handle);
      }
    }
  }, [loadProfileByHandle]);

  const handleNavigate = (view: AppView, username?: string) => {
    if (username) {
      setViewedHandle(username);
      loadProfileByHandle(username);
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'profile' && username) {
      const routePrefix = routeFormat === 'at' ? '/@' : '/u/';
      window.history.pushState({}, '', `${routePrefix}${username}`);
    } else if (view === 'landing') {
      window.history.pushState({}, '', '/');
    }
  };

  const handleLoginSuccess = (session: AuthSession) => {
    localStorage.setItem('itstck_auth_token', session.token);
    setAuthToken(session.token);
    setCurrentUser(session.profile);
    setProfiles((prev) => {
      const exists = prev.some(
        (p) => p.username.toLowerCase() === session.profile.username.toLowerCase()
      );
      return exists
        ? prev.map((p) =>
            p.username.toLowerCase() === session.profile.username.toLowerCase()
              ? session.profile
              : p
          )
        : [session.profile, ...prev];
    });
    setViewedProfile(session.profile);
    setActiveView('editor');
    window.history.replaceState({}, '', `/@${session.profile.username}`);
  };

  const handleLogout = async () => {
    if (authToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => {});
    }
    localStorage.removeItem('itstck_auth_token');
    setAuthToken(null);
    setCurrentUser(null);
    setActiveView('landing');
    window.history.pushState({}, '', '/');
  };

  const handleSaveProfile = async (updated: UserProfile): Promise<void> => {
    if (!currentUser || !authToken) {
      setIsAuthModalOpen(true);
      throw new Error('Please sign in with GitHub to publish your profile.');
    }

    if (currentUser.username.toLowerCase() !== updated.username.toLowerCase()) {
      // User might be updating their slug in settings
      // Allowed if it's the current user updating their own profile
    }

    const res = await fetch(
      `/api/profiles/${encodeURIComponent(currentUser.username)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updated),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save profile changes.');
    }

    const data = await res.json();
    setCurrentUser(data.profile);
    setViewedProfile(data.profile);
    setProfiles((prev) =>
      prev.map((p) =>
        p.githubId === data.profile.githubId ? data.profile : p
      )
    );
  };

  const handleDeleteProfile = async (username: string): Promise<void> => {
    if (!currentUser || !authToken) return;
    if (currentUser.username.toLowerCase() !== username.toLowerCase()) {
      throw new Error('Unauthorized: You can only delete your own profile.');
    }

    const res = await fetch(`/api/profiles/${encodeURIComponent(username)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete profile.');
    }

    localStorage.removeItem('itstck_auth_token');
    setAuthToken(null);
    setCurrentUser(null);
    setViewedProfile(null);
    setProfiles((prev) =>
      prev.filter((p) => p.username.toLowerCase() !== username.toLowerCase())
    );
    setActiveView('landing');
    window.history.replaceState({}, '', '/');
  };

  const handleQuickThemePreview = (
    themeId: ThemeId,
    fontPairingId: FontPairingId,
    layoutMode: LayoutMode
  ) => {
    if (!viewedProfile) return;
    const updated: UserProfile = {
      ...viewedProfile,
      themeId,
      fontPairingId,
      layoutMode,
    };
    setViewedProfile(updated);

    if (currentUser && currentUser.username === viewedProfile.username) {
      handleSaveProfile(updated).catch(() => {});
    }
  };

  const handleEndorseSkill = (targetUsername: string, skillName: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setProfiles((prev) =>
      prev.map((prof) => {
        if (prof.username !== targetUsername) return prof;
        return {
          ...prof,
          endorsements: prof.endorsements.map((item) => {
            if (item.skill !== skillName) return item;
            const already = item.endorsedByUsernames.includes(currentUser.username);
            return {
              ...item,
              count: already ? Math.max(0, item.count - 1) : item.count + 1,
              endorsedByUsernames: already
                ? item.endorsedByUsernames.filter((u) => u !== currentUser.username)
                : [...item.endorsedByUsernames, currentUser.username],
            };
          }),
        };
      })
    );

    if (viewedProfile && viewedProfile.username === targetUsername) {
      setViewedProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          endorsements: prev.endorsements.map((item) => {
            if (item.skill !== skillName) return item;
            const already = item.endorsedByUsernames.includes(currentUser.username);
            return {
              ...item,
              count: already ? Math.max(0, item.count - 1) : item.count + 1,
              endorsedByUsernames: already
                ? item.endorsedByUsernames.filter((u) => u !== currentUser.username)
                : [...item.endorsedByUsernames, currentUser.username],
            };
          }),
        };
      });
    }

    fetch(`/api/profiles/${encodeURIComponent(targetUsername)}/endorse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skill: skillName,
        actorUsername: currentUser.username,
      }),
    }).catch(() => {});
  };

  const handleToggleFollow = (targetUsername: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (targetUsername === currentUser.username) return;

    const isCurrentlyFollowing = currentUser.followingUsernames.includes(targetUsername);
    const updatedUser: UserProfile = {
      ...currentUser,
      followingUsernames: isCurrentlyFollowing
        ? currentUser.followingUsernames.filter((u) => u !== targetUsername)
        : [...currentUser.followingUsernames, targetUsername],
    };

    setCurrentUser(updatedUser);
    handleSaveProfile(updatedUser).catch(() => {});

    setProfiles((prev) =>
      prev.map((prof) => {
        if (prof.username === targetUsername) {
          return {
            ...prof,
            followersCount: isCurrentlyFollowing
              ? Math.max(0, prof.followersCount - 1)
              : prof.followersCount + 1,
          };
        }
        return prof;
      })
    );
  };

  const handleAddRecommendation = (
    targetUsername: string,
    relation: string,
    content: string
  ) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const newRec = {
      id: `rec-${Date.now()}`,
      authorUsername: currentUser.username,
      authorName: currentUser.displayName,
      authorRole: `${currentUser.headline.slice(0, 40)} · ${currentUser.company}`,
      authorAvatar: currentUser.avatarUrl,
      relation,
      content,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updateRecList = (prof: UserProfile): UserProfile => ({
      ...prof,
      recommendations: [newRec, ...prof.recommendations],
    });

    setProfiles((prev) =>
      prev.map((prof) => (prof.username === targetUsername ? updateRecList(prof) : prof))
    );

    if (viewedProfile && viewedProfile.username === targetUsername) {
      setViewedProfile(updateRecList(viewedProfile));
    }
  };

  const handleForkTemplate = async (sourceProfile: UserProfile) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const clonedSections = sourceProfile.sections.map((sec, idx) => ({
      ...sec,
      id: `sec-fork-${Date.now()}-${idx}`,
    }));

    const updatedCurrent: UserProfile = {
      ...currentUser,
      themeId: sourceProfile.themeId,
      fontPairingId: sourceProfile.fontPairingId,
      layoutMode: sourceProfile.layoutMode,
      densityMode: sourceProfile.densityMode,
      sections: clonedSections,
    };

    await handleSaveProfile(updatedCurrent);
    setActiveView('editor');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSsgModal={() => setIsSsgModalOpen(true)}
        onLogout={handleLogout}
      />

      <div className="flex-1">
        {/* 1. Landing View */}
        {activeView === 'landing' && (
          <LandingView
            profiles={profiles}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenSsgModal={() => setIsSsgModalOpen(true)}
          />
        )}

        {/* 2. Explore Directory */}
        {activeView === 'explore' && (
          <ExploreNetwork
            profiles={profiles}
            currentUser={currentUser}
            onSelectProfile={(username) => handleNavigate('profile', username)}
            onToggleFollow={handleToggleFollow}
            onEndorseSkill={handleEndorseSkill}
            onForkTemplate={handleForkTemplate}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* 3. Studio Editor */}
        {activeView === 'editor' && (
          <>
            {currentUser ? (
              <StudioEditor
                key={`${currentUser.id}-${currentUser.sections.length}`}
                profile={currentUser}
                currentUser={currentUser}
                authToken={authToken}
                onSaveProfile={handleSaveProfile}
                onViewLiveProfile={() => handleNavigate('profile', currentUser.username)}
                onOpenSsgModal={() => setIsSsgModalOpen(true)}
                onPromptAuth={() => setIsAuthModalOpen(true)}
              />
            ) : (
              <div className="min-h-[80vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full p-8 rounded-2xl border border-slate-800 bg-[#111827] text-center space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h2 className="font-display-syne text-2xl font-bold text-white">
                    Sign in with GitHub to edit your portfolio
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Each user strictly authors and maintains their own verified page. Sign in with your GitHub account to access the Markdown Studio, customize your Europass sections, and compile your static HTML.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Github className="w-4 h-4" />
                    <span>Sign in with GitHub</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 4. Public Profile Page (/@user or /u/user) */}
        {activeView === 'profile' && (
          <>
            {viewedProfile ? (
              <StaticProfileView
                profile={viewedProfile}
                currentUser={currentUser}
                isOwnProfile={
                  !!currentUser &&
                  currentUser.username.toLowerCase() === viewedProfile.username.toLowerCase()
                }
                routeFormat={routeFormat}
                onToggleRouteFormat={setRouteFormat}
                onEditProfile={() => handleNavigate('editor')}
                onOpenSsgModal={() => setIsSsgModalOpen(true)}
                onForkTemplate={handleForkTemplate}
                onEndorseSkill={handleEndorseSkill}
                onToggleFollow={handleToggleFollow}
                onAddRecommendation={handleAddRecommendation}
                onQuickThemePreview={handleQuickThemePreview}
                onSelectProfile={(u) => handleNavigate('profile', u)}
                onPromptAuth={() => setIsAuthModalOpen(true)}
              />
            ) : profileNotFound ? (
              <div className="min-h-[80vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full p-8 rounded-2xl border border-slate-800 bg-[#111827] text-center space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto font-mono text-lg font-bold">
                    404
                  </div>
                  <h2 className="font-display-syne text-2xl font-bold text-white">
                    @{viewedHandle || 'user'} not found
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This ItStack profile has not been claimed or published yet. If this is your GitHub handle, you can claim and create it now.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Claim @{viewedHandle} with GitHub</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-slate-400 text-xs font-mono animate-pulse">
                  Loading verified developer profile...
                </div>
              </div>
            )}
          </>
        )}

        {/* 5. Dashboard & Analytics */}
        {activeView === 'dashboard' && (
          <>
            {currentUser ? (
              <DashboardAnalytics
                profile={currentUser}
                authToken={authToken}
                onUpdateProfile={handleSaveProfile}
                onNavigateProfile={() => handleNavigate('profile', currentUser.username)}
                onNavigateEditor={() => handleNavigate('editor')}
                onOpenSsgModal={() => setIsSsgModalOpen(true)}
                onDeleteProfile={handleDeleteProfile}
              />
            ) : (
              <div className="min-h-[80vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full p-8 rounded-2xl border border-slate-800 bg-[#111827] text-center space-y-5">
                  <h2 className="font-display-syne text-2xl font-bold text-white">
                    Sign in to view settings
                  </h2>
                  <p className="text-xs text-slate-400">
                    You must be signed in with your GitHub account to access settings and telemetry.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Github className="w-4 h-4" />
                    <span>Sign in with GitHub</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <SsgExporterModal
        profile={viewedProfile || currentUser || GUEST_BLANK_PROFILE}
        isOpen={isSsgModalOpen}
        onClose={() => setIsSsgModalOpen(false)}
      />

      <AuthOnboardingModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
