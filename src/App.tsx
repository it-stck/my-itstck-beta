import React, { useEffect, useState } from 'react';
import { UserProfile, ThemeId, FontPairingId, LayoutMode } from './types';
import { INITIAL_PROFILES } from './lib/seedData';
import { Navbar, AppView } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { StaticProfileView } from './components/StaticProfileView';
import { StudioEditor } from './components/StudioEditor';
import { ExploreNetwork } from './components/ExploreNetwork';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { SsgExporterModal } from './components/SsgExporterModal';
import { AuthOnboardingModal } from './components/AuthOnboardingModal';

export default function App() {
  const [profiles, setProfiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [currentUsername, setCurrentUsername] = useState<string>('alexturner');
  const [viewedUsername, setViewedUsername] = useState<string>('alexturner');
  const [activeView, setActiveView] = useState<AppView>('landing');
  const [routeFormat, setRouteFormat] = useState<'at' | 'u'>('at');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSsgModalOpen, setIsSsgModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/profiles')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.profiles) && data.profiles.length > 0) {
          setProfiles(data.profiles);
        }
      })
      .catch(() => {
        // Fallback to initial seed profiles
      });

    const path = window.location.pathname;
    if (path.startsWith('/@')) {
      const handle = path.slice(2).split('/')[0];
      if (handle) {
        setViewedUsername(handle);
        setRouteFormat('at');
        setActiveView('profile');
      }
    } else if (path.startsWith('/u/')) {
      const handle = path.slice(3).split('/')[0];
      if (handle) {
        setViewedUsername(handle);
        setRouteFormat('u');
        setActiveView('profile');
      }
    }
  }, []);

  const currentUser =
    profiles.find((p) => p.username.toLowerCase() === currentUsername.toLowerCase()) ||
    profiles[0];

  const viewedProfile =
    profiles.find((p) => p.username.toLowerCase() === viewedUsername.toLowerCase()) ||
    currentUser;

  const handleNavigate = (view: AppView, username?: string) => {
    if (username) {
      setViewedUsername(username);
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setCurrentUsername(updated.username);
    setViewedUsername(updated.username);

    fetch(`/api/profiles/${encodeURIComponent(currentUser.username)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});
  };

  const handleQuickThemePreview = (
    themeId: ThemeId,
    fontPairingId: FontPairingId,
    layoutMode: LayoutMode
  ) => {
    const updated: UserProfile = {
      ...viewedProfile,
      themeId,
      fontPairingId,
      layoutMode,
    };
    setProfiles((prev) =>
      prev.map((p) => (p.id === viewedProfile.id ? updated : p))
    );
    fetch(`/api/profiles/${encodeURIComponent(viewedProfile.username)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});
  };

  const handleEndorseSkill = (targetUsername: string, skillName: string) => {
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
    if (targetUsername === currentUser.username) return;
    const isCurrentlyFollowing =
      currentUser.followingUsernames.includes(targetUsername);

    setProfiles((prev) =>
      prev.map((prof) => {
        if (prof.username === currentUser.username) {
          return {
            ...prof,
            followingUsernames: isCurrentlyFollowing
              ? prof.followingUsernames.filter((u) => u !== targetUsername)
              : [...prof.followingUsernames, targetUsername],
          };
        }
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
    const newRec = {
      id: `rec-${Date.now()}`,
      authorUsername: currentUser.username,
      authorName: currentUser.displayName,
      authorRole: `${currentUser.headline.slice(0, 42)} · ${currentUser.company}`,
      authorAvatar: currentUser.avatarUrl,
      relation,
      content,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setProfiles((prev) =>
      prev.map((prof) => {
        if (prof.username !== targetUsername) return prof;
        const updated = {
          ...prof,
          recommendations: [newRec, ...prof.recommendations],
        };
        fetch(`/api/profiles/${encodeURIComponent(targetUsername)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch(() => {});
        return updated;
      })
    );
  };

  const handleForkTemplate = (sourceProfile: UserProfile) => {
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
    handleSaveProfile(updatedCurrent);
    handleNavigate('editor');
  };

  const handleCreateNewUser = (newProfile: UserProfile) => {
    setProfiles((prev) => [newProfile, ...prev]);
    setCurrentUsername(newProfile.username);
    setViewedUsername(newProfile.username);
    setActiveView('editor');

    fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProfile),
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSsgModal={() => setIsSsgModalOpen(true)}
      />

      <div className="flex-1">
        {activeView === 'landing' && (
          <LandingView
            profiles={profiles}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenSsgModal={() => setIsSsgModalOpen(true)}
          />
        )}

        {activeView === 'explore' && (
          <ExploreNetwork
            profiles={profiles}
            currentUser={currentUser}
            onSelectProfile={(username) => handleNavigate('profile', username)}
            onToggleFollow={handleToggleFollow}
            onEndorseSkill={handleEndorseSkill}
            onForkTemplate={handleForkTemplate}
          />
        )}

        {activeView === 'editor' && (
          <StudioEditor
            key={currentUser.id + '-' + currentUser.sections.length}
            profile={currentUser}
            onSaveProfile={handleSaveProfile}
            onViewLiveProfile={() => handleNavigate('profile', currentUser.username)}
            onOpenSsgModal={() => setIsSsgModalOpen(true)}
          />
        )}

        {activeView === 'profile' && (
          <StaticProfileView
            profile={viewedProfile}
            currentUser={currentUser}
            isOwnProfile={viewedProfile.username === currentUser.username}
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
          />
        )}

        {activeView === 'dashboard' && (
          <DashboardAnalytics
            profile={currentUser}
            onUpdateProfile={handleSaveProfile}
            onNavigateProfile={() => handleNavigate('profile', currentUser.username)}
            onNavigateEditor={() => handleNavigate('editor')}
            onOpenSsgModal={() => setIsSsgModalOpen(true)}
          />
        )}
      </div>

      <SsgExporterModal
        profile={activeView === 'profile' ? viewedProfile : currentUser}
        isOpen={isSsgModalOpen}
        onClose={() => setIsSsgModalOpen(false)}
      />

      <AuthOnboardingModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        profiles={profiles}
        currentUser={currentUser}
        onSwitchUser={(username) => {
          setCurrentUsername(username);
          setViewedUsername(username);
        }}
        onCreateNewUser={handleCreateNewUser}
      />
    </div>
  );
}
