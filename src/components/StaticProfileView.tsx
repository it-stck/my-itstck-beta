import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  FileCode,
  GitFork,
  Globe,
  Mail,
  MessageSquarePlus,
  Printer,
  ThumbsUp,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import {
  UserProfile,
  ThemeId,
  FontPairingId,
  LayoutMode,
} from '../types';
import { THEMES, FONT_PAIRINGS } from '../lib/themes';
import { MarkdownRenderer, compileProfileToStaticHtml } from '../lib/markdown';
import { ResilientImage } from './ResilientImage';

interface StaticProfileViewProps {
  profile: UserProfile;
  currentUser: UserProfile;
  isOwnProfile: boolean;
  routeFormat: 'at' | 'u';
  onToggleRouteFormat: (fmt: 'at' | 'u') => void;
  onEditProfile: () => void;
  onOpenSsgModal: () => void;
  onForkTemplate: (sourceProfile: UserProfile) => void;
  onEndorseSkill: (targetUsername: string, skillName: string) => void;
  onToggleFollow: (targetUsername: string) => void;
  onAddRecommendation: (targetUsername: string, relation: string, content: string) => void;
  onQuickThemePreview?: (themeId: ThemeId, fontId: FontPairingId, layoutMode: LayoutMode) => void;
  onSelectProfile: (username: string) => void;
}

export const StaticProfileView: React.FC<StaticProfileViewProps> = ({
  profile,
  currentUser,
  isOwnProfile,
  routeFormat,
  onToggleRouteFormat,
  onEditProfile,
  onOpenSsgModal,
  onForkTemplate,
  onEndorseSkill,
  onToggleFollow,
  onAddRecommendation,
  onQuickThemePreview,
  onSelectProfile,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showRecForm, setShowRecForm] = useState(false);
  const [recRelation, setRecRelation] = useState('');
  const [recContent, setRecContent] = useState('');
  const [forkConfirmed, setForkConfirmed] = useState(false);

  const theme = THEMES[profile.themeId] || THEMES['obsidian-slate'];
  const fontPairing = FONT_PAIRINGS[profile.fontPairingId] || FONT_PAIRINGS['jakarta-jetbrains'];

  const visibleSections = [...profile.sections]
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  const canonicalUrl =
    routeFormat === 'at'
      ? `https://my.itstck.com/@${profile.username}`
      : `https://my.itstck.com/u/${profile.username}`;

  const isFollowing = currentUser.followingUsernames.includes(profile.username);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(canonicalUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadStaticHtml = () => {
    const htmlString = compileProfileToStaticHtml(profile);
    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `@${profile.username}-itstck.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleForkClick = () => {
    onForkTemplate(profile);
    setForkConfirmed(true);
    setTimeout(() => setForkConfirmed(false), 2500);
  };

  const handleSubmitRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recRelation.trim() || !recContent.trim()) return;
    onAddRecommendation(profile.username, recRelation.trim(), recContent.trim());
    setRecRelation('');
    setRecContent('');
    setShowRecForm(false);
  };

  const availabilityLabel: Record<string, string> = {
    open_to_work: 'Available for Staff / Principal Roles',
    consulting: 'Open to Architecture Consulting',
    hiring: 'Hiring Engineers for Team',
    focused: 'Focused on Current Project',
  };

  return (
    <div
      style={{
        backgroundColor: theme.bgCanvas,
        color: theme.textPrimary,
        fontFamily: fontPairing.bodyFontFamily,
      }}
      className="min-h-screen transition-colors duration-200"
    >
      {/* Top Route & Static Build Inspector Bar */}
      <div
        style={{
          backgroundColor: theme.bgSurface,
          borderColor: theme.borderSubtle,
        }}
        className="no-print border-b px-6 py-2.5"
      >
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 p-0.5 rounded-md border" style={{ borderColor: theme.borderSubtle, backgroundColor: theme.bgCanvas }}>
              <button
                type="button"
                onClick={() => onToggleRouteFormat('at')}
                style={{
                  backgroundColor: routeFormat === 'at' ? theme.bgElevated : 'transparent',
                  color: routeFormat === 'at' ? theme.textPrimary : theme.textMuted,
                }}
                className="px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer whitespace-nowrap"
              >
                /@{profile.username}
              </button>
              <button
                type="button"
                onClick={() => onToggleRouteFormat('u')}
                style={{
                  backgroundColor: routeFormat === 'u' ? theme.bgElevated : 'transparent',
                  color: routeFormat === 'u' ? theme.textPrimary : theme.textMuted,
                }}
                className="px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer whitespace-nowrap"
              >
                /u/{profile.username}
              </button>
            </div>

            <span className="font-mono truncate max-w-xs sm:max-w-md" style={{ color: theme.textSecondary }}>
              {canonicalUrl}
            </span>

            <button
              type="button"
              onClick={handleCopyUrl}
              style={{ color: theme.accentText }}
              className="inline-flex items-center gap-1 font-medium hover:underline cursor-pointer whitespace-nowrap"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {onQuickThemePreview && (
              <div className="hidden lg:flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                <span>Quick Theme:</span>
                <select
                  aria-label="Change preview theme"
                  value={profile.themeId}
                  onChange={(e) =>
                    onQuickThemePreview(
                      e.target.value as ThemeId,
                      profile.fontPairingId,
                      profile.layoutMode
                    )
                  }
                  style={{
                    backgroundColor: theme.bgCanvas,
                    color: theme.textPrimary,
                    borderColor: theme.borderSubtle,
                  }}
                  className="px-2 py-1 rounded border text-xs cursor-pointer"
                >
                  {Object.values(THEMES).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Change layout arrangement"
                  value={profile.layoutMode}
                  onChange={(e) =>
                    onQuickThemePreview(
                      profile.themeId,
                      profile.fontPairingId,
                      e.target.value as LayoutMode
                    )
                  }
                  style={{
                    backgroundColor: theme.bgCanvas,
                    color: theme.textPrimary,
                    borderColor: theme.borderSubtle,
                  }}
                  className="px-2 py-1 rounded border text-xs cursor-pointer"
                >
                  <option value="split-cv">Layout: Split Europass CV</option>
                  <option value="readme-stream">Layout: GitHub README Stream</option>
                  <option value="bento-portfolio">Layout: Bento Portfolio Grid</option>
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={handleDownloadStaticHtml}
              style={{
                borderColor: theme.borderSubtle,
                color: theme.textPrimary,
                backgroundColor: theme.bgCanvas,
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML ({profile.staticBundleSizeKb} KB)</span>
            </button>

            <button
              type="button"
              onClick={onOpenSsgModal}
              style={{
                borderColor: theme.borderSubtle,
                color: theme.textPrimary,
                backgroundColor: theme.bgCanvas,
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Inspect SSG Code</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                borderColor: theme.borderSubtle,
                color: theme.textPrimary,
                backgroundColor: theme.bgCanvas,
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            {isOwnProfile ? (
              <button
                type="button"
                onClick={onEditProfile}
                style={{
                  backgroundColor: theme.accentPrimary,
                  color: '#FFFFFF',
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Open in Studio Editor</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleForkClick}
                style={{
                  borderColor: theme.borderSubtle,
                  color: theme.accentText,
                  backgroundColor: theme.bgCanvas,
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>{forkConfirmed ? 'Structure Forked!' : 'Fork Template'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Profile Viewport */}
      <div className="max-w-[1200px] mx-auto px-6 py-10 md:py-14">
        {/* Profile Header */}
        <header style={{ borderColor: theme.borderSubtle }} className="pb-10 border-b">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <ResilientImage
                src={profile.avatarUrl}
                alt={profile.displayName}
                fallbackLabel={profile.displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border shrink-0"
              />

              <div className="space-y-2.5">
                {/* Zero-Pill Unboxed Text Metadata */}
                <div style={{ color: theme.textMuted }} className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span style={{ color: theme.accentText }} className="font-semibold">
                    @{profile.username}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{availabilityLabel[profile.availability] || profile.availability}</span>
                  <span aria-hidden="true">·</span>
                  <span>Verified via {profile.verifiedProviders.join(', ').toUpperCase()}</span>
                </div>

                <h1
                  style={{
                    fontFamily: fontPairing.headingFontFamily,
                    color: theme.textPrimary,
                  }}
                  className="text-2xl sm:text-4xl font-bold tracking-tight"
                >
                  {profile.displayName}
                </h1>

                <p style={{ color: theme.textSecondary }} className="text-base sm:text-lg font-medium max-w-2xl">
                  {profile.headline}
                </p>

                <p style={{ color: theme.textMuted }} className="text-sm leading-relaxed max-w-2xl">
                  {profile.bio}
                </p>

                {/* Location & Tenure Metadata */}
                <div style={{ color: theme.textSecondary }} className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono">
                  <span>{profile.company}</span>
                  <span aria-hidden="true" style={{ color: theme.textMuted }}>·</span>
                  <span>{profile.location} ({profile.timezone})</span>
                  <span aria-hidden="true" style={{ color: theme.textMuted }}>·</span>
                  <span className="tabular-nums">{profile.europassMeta.yearsOfExperience} years exp</span>
                  <span aria-hidden="true" style={{ color: theme.textMuted }}>·</span>
                  <span className="tabular-nums">{profile.followersCount.toLocaleString()} followers</span>
                </div>

                {/* Core Stack */}
                <div className="pt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono">
                  <span style={{ color: theme.textMuted }}>Core Stack:</span>
                  {profile.primaryStack.map((tech, idx) => (
                    <React.Fragment key={tech}>
                      <span style={{ color: theme.accentText }} className="font-medium">
                        {tech}
                      </span>
                      {idx < profile.primaryStack.length - 1 && (
                        <span aria-hidden="true" style={{ color: theme.textMuted }}>
                          /
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Actions */}
            <div className="no-print flex flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
              {!isOwnProfile && (
                <button
                  type="button"
                  onClick={() => onToggleFollow(profile.username)}
                  style={{
                    backgroundColor: isFollowing ? theme.bgSurface : theme.accentPrimary,
                    color: isFollowing ? theme.textPrimary : '#FFFFFF',
                    borderColor: theme.borderSubtle,
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-opacity hover:opacity-90 cursor-pointer whitespace-nowrap"
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Following on ItStack</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow @{profile.username}</span>
                    </>
                  )}
                </button>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1" style={{ color: theme.textSecondary }}>
                {profile.socialLinks.github && (
                  <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.socialLinks.email && (
                  <a href={`mailto:${profile.socialLinks.email}`} className="inline-flex items-center gap-1 hover:underline">
                    <Mail className="w-3 h-3" />
                    <span>Contact</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Europass Metadata Strip */}
          {profile.showEuropassHeader && (
            <div
              style={{
                backgroundColor: theme.bgSurface,
                borderColor: theme.borderSubtle,
              }}
              className="mt-8 p-4 rounded-lg border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs"
            >
              <div>
                <div style={{ color: theme.textMuted }} className="font-mono mb-0.5">
                  Europass Passport ID
                </div>
                <div style={{ color: theme.textPrimary }} className="font-mono font-semibold tabular-nums">
                  {profile.europassMeta.europassPassportId}
                </div>
              </div>
              <div>
                <div style={{ color: theme.textMuted }} className="font-mono mb-0.5">
                  Citizenship &amp; Work Permit
                </div>
                <div style={{ color: theme.textPrimary }} className="font-medium">
                  {profile.europassMeta.nationality || 'European Union'} · {profile.europassMeta.workPermit || 'Global'}
                </div>
              </div>
              <div>
                <div style={{ color: theme.textMuted }} className="font-mono mb-0.5">
                  Target Role / Contract
                </div>
                <div style={{ color: theme.textPrimary }} className="font-medium">
                  {profile.europassMeta.preferredContract || 'Full-Time / Advisory'}
                </div>
              </div>
              <div>
                <div style={{ color: theme.textMuted }} className="font-mono mb-0.5">
                  Deterministic Static Build
                </div>
                <div style={{ color: theme.textPrimary }} className="font-mono tabular-nums">
                  Build #{profile.staticBuildHash} · {profile.staticBundleSizeKb} KB HTML5
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Layout Modes */}
        {profile.layoutMode === 'split-cv' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-10">
            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-8">
              {profile.showTableOfContents && (
                <div style={{ borderColor: theme.borderSubtle }} className="pb-6 border-b">
                  <h2
                    style={{
                      fontFamily: fontPairing.headingFontFamily,
                      color: theme.textPrimary,
                    }}
                    className="text-sm font-semibold mb-3"
                  >
                    Document Outline (Europass &amp; MD)
                  </h2>
                  <nav className="space-y-2 text-xs font-mono">
                    {visibleSections.map((sec, idx) => (
                      <a
                        key={sec.id}
                        href={`#sec-${sec.id}`}
                        style={{ color: theme.textSecondary }}
                        className="block hover:underline truncate"
                      >
                        0{idx + 1}. {sec.title}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Endorsements */}
              <div style={{ borderColor: theme.borderSubtle }} className="pb-6 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h2
                    style={{
                      fontFamily: fontPairing.headingFontFamily,
                      color: theme.textPrimary,
                    }}
                    className="text-sm font-semibold"
                  >
                    Peer Endorsements
                  </h2>
                  <span style={{ color: theme.textMuted }} className="text-xs font-mono tabular-nums">
                    Click to endorse
                  </span>
                </div>

                <div className="space-y-2.5">
                  {profile.endorsements.map((item) => {
                    const hasEndorsed = item.endorsedByUsernames.includes(currentUser.username);
                    return (
                      <div
                        key={item.skill}
                        style={{
                          borderColor: theme.borderSubtle,
                          backgroundColor: theme.bgSurface,
                        }}
                        className="p-3 rounded-lg border flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div style={{ color: theme.textPrimary }} className="text-xs font-semibold truncate">
                            {item.skill}
                          </div>
                          <div style={{ color: theme.textMuted }} className="text-[11px] font-mono">
                            {item.category} · Endorsed by {item.endorsedByUsernames.slice(0, 2).map((u) => `@${u}`).join(', ')}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onEndorseSkill(profile.username, item.skill)}
                          style={{
                            borderColor: hasEndorsed ? theme.accentPrimary : theme.borderSubtle,
                            color: hasEndorsed ? theme.accentText : theme.textSecondary,
                            backgroundColor: theme.bgCanvas,
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono tabular-nums shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{item.count}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2
                    style={{
                      fontFamily: fontPairing.headingFontFamily,
                      color: theme.textPrimary,
                    }}
                    className="text-sm font-semibold"
                  >
                    Technical References ({profile.recommendations.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowRecForm(!showRecForm)}
                    style={{ color: theme.accentText }}
                    className="no-print inline-flex items-center gap-1 text-xs font-medium hover:underline cursor-pointer"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Write Endorsement</span>
                  </button>
                </div>

                {showRecForm && (
                  <form
                    onSubmit={handleSubmitRecommendation}
                    style={{
                      backgroundColor: theme.bgSurface,
                      borderColor: theme.borderSubtle,
                    }}
                    className="no-print mb-4 p-3.5 rounded-lg border space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: theme.textSecondary }}>
                        Professional Relationship (e.g. Architect at FinTech Core)
                      </label>
                      <input
                        type="text"
                        required
                        value={recRelation}
                        onChange={(e) => setRecRelation(e.target.value)}
                        placeholder="Collaborated on edge telemetry..."
                        style={{
                          backgroundColor: theme.bgCanvas,
                          borderColor: theme.borderSubtle,
                          color: theme.textPrimary,
                        }}
                        className="w-full px-2.5 py-1.5 rounded border text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: theme.textSecondary }}>
                        Verified Recommendation as @{currentUser.username}
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={recContent}
                        onChange={(e) => setRecContent(e.target.value)}
                        placeholder="State technical impact, collaboration, and results..."
                        style={{
                          backgroundColor: theme.bgCanvas,
                          borderColor: theme.borderSubtle,
                          color: theme.textPrimary,
                        }}
                        className="w-full px-2.5 py-1.5 rounded border text-xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRecForm(false)}
                        style={{ color: theme.textMuted }}
                        className="px-2.5 py-1 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{ backgroundColor: theme.accentPrimary, color: '#fff' }}
                        className="px-3 py-1 rounded text-xs font-semibold cursor-pointer"
                      >
                        Publish
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {profile.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      style={{
                        borderColor: theme.borderSubtle,
                        backgroundColor: theme.bgSurface,
                      }}
                      className="p-4 rounded-lg border space-y-2"
                    >
                      <p style={{ color: theme.textSecondary }} className="text-xs leading-relaxed italic">
                        "{rec.content}"
                      </p>
                      <div className="flex items-center gap-2.5 pt-1">
                        <ResilientImage
                          src={rec.authorAvatar}
                          alt={rec.authorName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onSelectProfile(rec.authorUsername)}
                            style={{ color: theme.textPrimary }}
                            className="text-xs font-semibold hover:underline cursor-pointer block truncate"
                          >
                            {rec.authorName} (@{rec.authorUsername})
                          </button>
                          <div style={{ color: theme.textMuted }} className="text-[11px] truncate">
                            {rec.authorRole} · {rec.relation}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Stream */}
            <main className="lg:col-span-8 space-y-10">
              {visibleSections.map((section, index) => (
                <section
                  key={section.id}
                  id={`sec-${section.id}`}
                  style={{ borderColor: theme.borderSubtle }}
                  className="pb-10 border-b last:border-b-0"
                >
                  <div style={{ color: theme.textMuted }} className="text-xs font-mono mb-1 tabular-nums">
                    0{index + 1}. {section.type.replace('_', ' ').toUpperCase()} · Updated {section.updatedAt}
                  </div>
                  <h2
                    style={{
                      fontFamily: fontPairing.headingFontFamily,
                      color: theme.textPrimary,
                    }}
                    className="text-xl sm:text-2xl font-bold tracking-tight mb-1"
                  >
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p style={{ color: theme.textMuted }} className="text-xs sm:text-sm mb-5">
                      {section.subtitle}
                    </p>
                  )}
                  <MarkdownRenderer
                    content={section.content}
                    theme={theme}
                    fontPairing={fontPairing}
                    density={profile.densityMode}
                  />
                </section>
              ))}
            </main>
          </div>
        )}

        {profile.layoutMode === 'readme-stream' && (
          <main className="max-w-[860px] mx-auto pt-10 space-y-12">
            {visibleSections.map((section, index) => (
              <section
                key={section.id}
                id={`sec-${section.id}`}
                style={{ borderColor: theme.borderSubtle }}
                className="pb-10 border-b last:border-b-0"
              >
                <div style={{ color: theme.textMuted }} className="text-xs font-mono mb-1 tabular-nums">
                  0{index + 1}. {section.type.replace('_', ' ').toUpperCase()}
                </div>
                <h2
                  style={{
                    fontFamily: fontPairing.headingFontFamily,
                    color: theme.textPrimary,
                  }}
                  className="text-2xl font-bold tracking-tight mb-1"
                >
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p style={{ color: theme.textMuted }} className="text-sm mb-5">
                    {section.subtitle}
                  </p>
                )}
                <MarkdownRenderer
                  content={section.content}
                  theme={theme}
                  fontPairing={fontPairing}
                  density={profile.densityMode}
                />
              </section>
            ))}
          </main>
        )}

        {profile.layoutMode === 'bento-portfolio' && (
          <main className="pt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleSections.map((section, index) => (
              <section
                key={section.id}
                id={`sec-${section.id}`}
                style={{
                  borderColor: theme.borderSubtle,
                  backgroundColor: theme.bgSurface,
                }}
                className={`p-6 rounded-2xl border ${
                  section.span === 'full' || index === 0 ? 'md:col-span-2' : 'md:col-span-1'
                }`}
              >
                <div style={{ color: theme.textMuted }} className="text-xs font-mono mb-1 tabular-nums">
                  0{index + 1}. {section.type.replace('_', ' ').toUpperCase()}
                </div>
                <h2
                  style={{
                    fontFamily: fontPairing.headingFontFamily,
                    color: theme.textPrimary,
                  }}
                  className="text-xl font-bold tracking-tight mb-1"
                >
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p style={{ color: theme.textMuted }} className="text-xs mb-4">
                    {section.subtitle}
                  </p>
                )}
                <MarkdownRenderer
                  content={section.content}
                  theme={theme}
                  fontPairing={fontPairing}
                  density={profile.densityMode}
                />
              </section>
            ))}
          </main>
        )}

        {/* Static Footer */}
        <footer
          style={{
            borderColor: theme.borderSubtle,
            color: theme.textMuted,
          }}
          className="mt-16 pt-8 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono"
        >
          <div>
            my.itstck.com/@{profile.username} · Canonical static route: my.itstck.com/u/{profile.username}
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Standalone HTML5 ({profile.staticBundleSizeKb} KB)</span>
            </span>
            <span>·</span>
            <span>Europass &amp; GFM Standard</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
