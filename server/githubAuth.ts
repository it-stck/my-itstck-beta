import crypto from 'crypto';
import { UserProfile } from '../src/types';
import { SECTION_TYPE_CATALOG } from '../src/lib/themes';
import { getProfileByGitHubId, saveProfile, createSession } from './db';

export interface GitHubUserData {
  id: number | string;
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  email: string | null;
  public_repos: number;
}

export function isGitHubOAuthConfigured(): boolean {
  return !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
}

export function getGitHubAuthorizeUrl(redirectUri?: string): string {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    throw new Error('GITHUB_CLIENT_ID is not configured in environment variables.');
  }

  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'read:user,user:email',
    state,
  });

  if (redirectUri) {
    params.set('redirect_uri', redirectUri);
  }

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeGitHubCode(code: string, redirectUri?: string): Promise<GitHubUserData> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth client credentials are not configured.');
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Failed to exchange GitHub authorization code: ${tokenResponse.statusText}`);
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!tokenData.access_token) {
    throw new Error(tokenData.error_description || tokenData.error || 'No access token returned from GitHub.');
  }

  // Fetch authenticated user profile
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'ItStack-SaaS-Production',
    },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to fetch user data from GitHub API.');
  }

  return (await userResponse.json()) as GitHubUserData;
}

export async function authenticateOrProvisionGitHubUser(
  githubUser: GitHubUserData,
  desiredUsername?: string
): Promise<{ profile: UserProfile; token: string; isNewUser: boolean }> {
  const githubIdStr = String(githubUser.id);
  const githubHandle = githubUser.login.toLowerCase();

  // 1. Check if user already exists with this GitHub ID (1 GitHub Account = 1 Profile)
  const existingProfile = await getProfileByGitHubId(githubIdStr);
  if (existingProfile) {
    const token = crypto.randomUUID();
    await createSession(existingProfile.username, githubIdStr, token);
    return { profile: existingProfile, token, isNewUser: false };
  }

  // 2. Provision new profile bound to this GitHub ID
  const candidateUsername = (desiredUsername || githubHandle)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 30);

  const initialSections = SECTION_TYPE_CATALOG.slice(0, 5).map((cat, idx) => ({
    id: `sec-${Date.now()}-${idx}`,
    type: cat.type,
    title: cat.defaultTitle,
    subtitle: cat.defaultSubtitle,
    content: cat.templateContent,
    order: idx,
    isVisible: true,
    span: 'full' as const,
    updatedAt: new Date().toISOString().slice(0, 10),
  }));

  const newProfile: UserProfile = {
    id: `usr-${Date.now()}`,
    githubId: githubIdStr,
    githubUsername: githubHandle,
    username: candidateUsername,
    displayName: githubUser.name || githubUser.login,
    headline: 'Software Engineer',
    roleCategory: 'Full-Stack',
    bio: githubUser.bio || `Developer profile for @${githubHandle} on my.itstck.com.`,
    location: githubUser.location || 'Global',
    timezone: 'UTC',
    company: githubUser.company || 'Open Source & Engineering',
    avatarUrl: githubUser.avatar_url,
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
    staticBuildHash: crypto.randomBytes(4).toString('hex'),
    staticBundleSizeKb: 11.2,
    followersCount: 0,
    followingUsernames: [],
    sections: initialSections,
    endorsements: [
      {
        skill: 'Software Architecture',
        category: 'Architecture',
        count: 1,
        endorsedByUsernames: [candidateUsername],
      },
    ],
    recommendations: [],
    socialLinks: {
      github: `https://github.com/${githubHandle}`,
      website: githubUser.blog || `https://my.itstck.com/@${candidateUsername}`,
      email: githubUser.email || undefined,
    },
    europassMeta: {
      nationality: 'Verified GitHub Developer',
      workPermit: 'Global / Remote',
      preferredContract: 'Full-Time / Contract',
      yearsOfExperience: 4,
      europassPassportId: `EU-PASS-GH-${githubIdStr.slice(-5)}`,
    },
    analytics: {
      totalViews: 1,
      uniqueVisitors30d: 1,
      staticHtmlDownloads: 0,
      pdfExports: 0,
      readmeClones: 0,
      avgReadTimeSeconds: 90,
      referrers: [
        {
          source: `github.com/${githubHandle}`,
          visits: 1,
          conversionRate: '100%',
        },
      ],
    },
  };

  const saved = await saveProfile(newProfile, githubIdStr, githubHandle);
  const token = crypto.randomUUID();
  await createSession(saved.username, githubIdStr, token);

  return { profile: saved, token, isNewUser: true };
}
