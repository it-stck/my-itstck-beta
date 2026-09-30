import React, { useState } from 'react';
import {
  ArrowUpRight,
  GitFork,
  Search,
  ThumbsUp,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { UserProfile } from '../types';
import { THEMES } from '../lib/themes';
import { ResilientImage } from './ResilientImage';

interface ExploreNetworkProps {
  profiles: UserProfile[];
  currentUser: UserProfile;
  onSelectProfile: (username: string) => void;
  onToggleFollow: (targetUsername: string) => void;
  onEndorseSkill: (targetUsername: string, skill: string) => void;
  onForkTemplate: (sourceProfile: UserProfile) => void;
}

export const ExploreNetwork: React.FC<ExploreNetworkProps> = ({
  profiles,
  currentUser,
  onSelectProfile,
  onToggleFollow,
  onEndorseSkill,
  onForkTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [forkedUsername, setForkedUsername] = useState<string | null>(null);

  const filteredProfiles = profiles.filter((p) => {
    const matchesRole = roleFilter === 'all' || p.roleCategory === roleFilter;
    const matchesAvail =
      availabilityFilter === 'all' || p.availability === availabilityFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      p.displayName.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q) ||
      p.headline.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.primaryStack.some((s) => s.toLowerCase().includes(q));

    return matchesRole && matchesAvail && matchesQuery;
  });

  const handleFork = (p: UserProfile) => {
    onForkTemplate(p);
    setForkedUsername(p.username);
    setTimeout(() => setForkedUsername(null), 2200);
  };

  const availabilityText: Record<string, string> = {
    open_to_work: 'Available for Staff / Principal Roles',
    consulting: 'Open to Consulting',
    hiring: 'Hiring Engineers',
    focused: 'Focused on Current Work',
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 py-12 px-6">
      <div className="max-w-[1200px] mx-auto space-y-10">
        {/* Directory Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono text-blue-400 mb-2">
              Developer Network &amp; Directory · my.itstck.com/explore
            </div>
            <h1 className="font-display-syne text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Explore Verified Engineer Portfolios &amp; Stacks
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              Discover software architects and engineers verified via GitHub, Microsoft, and Google. Endorse skills, review technical references, or fork page structures into your own portfolio.
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-400 tabular-nums shrink-0">
            <div>Active Profiles: {filteredProfiles.length}</div>
            <div className="text-slate-500">Europass + GFM Standard Verified</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by @username, name, city, or tech (e.g. Rust, TypeScript, eBPF, PostgreSQL)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111827] border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#111827] rounded-xl border border-slate-800">
            {[
              { id: 'all', label: 'All Disciplines' },
              { id: 'Full-Stack', label: 'Full-Stack' },
              { id: 'Systems & SRE', label: 'Systems & SRE' },
              { id: 'AI & Distributed', label: 'AI & Distributed' },
              { id: 'Design Systems', label: 'Design Systems' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  roleFilter === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            aria-label="Filter by availability"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-[#111827] border border-slate-800 text-xs text-slate-200 cursor-pointer"
          >
            <option value="all">Any Availability</option>
            <option value="open_to_work">Available for Staff/Principal</option>
            <option value="consulting">Open to Consulting</option>
            <option value="focused">Focused on Current Work</option>
          </select>
        </div>

        {/* Profiles Grid */}
        {filteredProfiles.length === 0 ? (
          <div className="p-12 rounded-2xl border border-slate-800 bg-[#111827]/50 text-center space-y-3">
            <p className="text-base font-semibold text-slate-200">
              No profiles found matching criteria
            </p>
            <p className="text-xs text-slate-400">
              Try searching for different keywords or clear current filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setAvailabilityFilter('all');
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((prof) => {
              const isFollowing = currentUser.followingUsernames.includes(prof.username);
              const isSelf = currentUser.username === prof.username;
              const topSkill = prof.endorsements[0];
              const profTheme = THEMES[prof.themeId] || THEMES['obsidian-slate'];

              return (
                <article
                  key={prof.id}
                  className="rounded-2xl border border-slate-800 bg-[#111827] p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <ResilientImage
                        src={prof.avatarUrl}
                        alt={prof.displayName}
                        fallbackLabel={prof.displayName}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-mono text-blue-400 truncate">
                          my.itstck.com/@{prof.username}
                        </div>
                        <h2 className="text-base font-bold text-white truncate mt-0.5">
                          <button
                            type="button"
                            onClick={() => onSelectProfile(prof.username)}
                            className="hover:underline text-left cursor-pointer"
                          >
                            {prof.displayName}
                          </button>
                        </h2>
                        <div className="text-xs text-slate-400 truncate">
                          {prof.company} · {prof.location}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-200 mb-1">
                        {prof.headline}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {prof.bio}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs font-mono">
                      <div className="text-slate-300 truncate">
                        <span className="text-slate-500">Stack: </span>
                        {prof.primaryStack.slice(0, 5).join(' · ')}
                      </div>
                      <div className="text-slate-400 flex items-center gap-1.5 text-[11px] tabular-nums">
                        <span>{prof.europassMeta.yearsOfExperience} yrs exp</span>
                        <span>·</span>
                        <span>Theme: {profTheme.name}</span>
                        <span>·</span>
                        <span>{prof.staticBundleSizeKb} KB</span>
                      </div>
                      <div className="text-[11px] text-emerald-400">
                        {availabilityText[prof.availability] || prof.availability}
                      </div>
                    </div>

                    {topSkill && (
                      <div className="p-2.5 rounded-lg bg-[#0B0F17] border border-slate-800/90 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[11px] text-slate-400 font-mono">
                            Top Endorsed Skill:
                          </div>
                          <div className="text-xs font-medium text-slate-200 truncate">
                            {topSkill.skill}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onEndorseSkill(prof.username, topSkill.skill)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-mono text-blue-400 tabular-nums shrink-0 cursor-pointer"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{topSkill.count}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => onToggleFollow(prof.username)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                            isFollowing
                              ? 'border-slate-700 bg-slate-800 text-slate-200'
                              : 'border-blue-600/60 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleFork(prof)}
                        title="Fork section structure and theme into studio editor"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-[#0B0F17] text-xs text-slate-300 hover:text-white cursor-pointer whitespace-nowrap"
                      >
                        <GitFork className="w-3.5 h-3.5 text-blue-400" />
                        <span>
                          {forkedUsername === prof.username ? 'Forked!' : 'Fork'}
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectProfile(prof.username)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>View /@{prof.username}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
