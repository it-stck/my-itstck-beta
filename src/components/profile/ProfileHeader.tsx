"use client";

import Image from "next/image";
import {
  MapPin, Globe, Github, Linkedin, Twitter, Mail,
  Eye, Users, Layers,
} from "lucide-react";
import type { Profile } from "@prisma/client";
import { getAvatarUrl } from "@/lib/utils";

interface ProfileHeaderProps {
  profile: Profile & {
    user: { name: string | null; email: string; image: string | null; username: string | null };
    sections?: { length: number };
  };
  accentColor: string;
  showAvatar: boolean;
  showStats: boolean;
  isPreview?: boolean;
}

export function ProfileHeader({
  profile,
  accentColor,
  showAvatar,
  showStats,
  isPreview = false,
}: ProfileHeaderProps) {
  const avatarSrc = profile.user.image ?? getAvatarUrl(profile.user.username ?? profile.user.email);

  const socialLinks = [
    { key: "github", icon: Github, href: profile.github ? `https://github.com/${profile.github}` : null, label: "GitHub" },
    { key: "linkedin", icon: Linkedin, href: profile.linkedin ? `https://linkedin.com/in/${profile.linkedin}` : null, label: "LinkedIn" },
    { key: "twitter", icon: Twitter, href: profile.twitter ? `https://twitter.com/${profile.twitter}` : null, label: "Twitter" },
    { key: "website", icon: Globe, href: profile.website, label: "Website" },
    { key: "email", icon: Mail, href: `mailto:${profile.contactEmail ?? profile.user.email}`, label: "Email" },
  ].filter((l) => l.href);

  return (
    <header
      className="profile-header px-6 py-8"
      style={{ backgroundColor: "var(--profile-header-bg)" }}
    >
      <div className="flex items-start gap-5">
        {/* Avatar */}
        {showAvatar && (
          <div
            className="shrink-0 rounded-2xl overflow-hidden ring-2"
            style={{
              width: 80,
              height: 80,
              ringColor: accentColor,
              boxShadow: `0 0 0 3px ${accentColor}40`,
            }}
          >
            <Image
              src={avatarSrc}
              alt={profile.user.name ?? "Avatar"}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Username badge */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${accentColor}20`,
                color: accentColor,
                border: `1px solid ${accentColor}40`,
              }}
            >
              @{profile.user.username}
            </span>
          </div>

          {/* Name */}
          <h1
            className="text-2xl font-bold tracking-tight leading-tight"
            style={{ color: "var(--profile-text)" }}
          >
            {profile.user.name ?? profile.user.username}
          </h1>

          {/* Title */}
          {profile.headline && (
            <p
              className="text-base font-medium mt-0.5"
              style={{ color: accentColor }}
            >
              {profile.headline}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {profile.location && (
              <span
                className="flex items-center gap-1 text-sm"
                style={{ color: "var(--profile-text-muted)" }}
              >
                <MapPin className="w-3.5 h-3.5" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm hover:opacity-80 transition-opacity"
                style={{ color: accentColor }}
              >
                <Globe className="w-3.5 h-3.5" />
                {profile.website.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            )}
          </div>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {socialLinks.map(({ key, icon: Icon, href, label }) => (
                <a
                  key={key}
                  href={href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className="p-1.5 rounded-lg transition-all hover:scale-110"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    color: accentColor,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p
          className="mt-4 text-sm leading-relaxed"
          style={{ color: "var(--profile-text-muted)" }}
        >
          {profile.bio}
        </p>
      )}

      {/* Stats */}
      {showStats && (
        <div
          className="flex items-center gap-4 mt-4 pt-4 border-t"
          style={{ borderColor: "var(--profile-section-separator)" }}
        >
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--profile-text-muted)" }}>
            <Eye className="w-4 h-4" />
            <span>
              <strong style={{ color: "var(--profile-text)" }}>{profile.viewCount ?? 0}</strong> views
            </span>
          </div>
          {profile.sections && (
            <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--profile-text-muted)" }}>
              <Layers className="w-4 h-4" />
              <span>
                <strong style={{ color: "var(--profile-text)" }}>{profile.sections.length}</strong> sections
              </span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
