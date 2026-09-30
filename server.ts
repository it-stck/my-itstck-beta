import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import {
  initDatabase,
  getAllProfiles,
  getProfileByUsername,
  saveProfile,
  deleteProfile,
  getSession,
  deleteSession,
} from './server/db';
import {
  isGitHubOAuthConfigured,
  getGitHubAuthorizeUrl,
  exchangeGitHubCode,
  fetchPublicGitHubUser,
  authenticateOrProvisionGitHubUser,
} from './server/githubAuth';
import {
  compileProfileToStaticHtml,
  compileProfileToReadmeMarkdown,
} from './src/lib/markdown';
import { UserProfile } from './src/types';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
    githubId: string;
    profile: UserProfile;
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  // Initialize PostgreSQL / file storage
  await initDatabase();

  // Auth Middleware
  async function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization || (req.headers['x-auth-token'] as string);
    if (!authHeader) {
      return next();
    }
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return next();
    }

    try {
      const session = await getSession(token);
      if (session) {
        const profile = await getProfileByUsername(session.username);
        if (profile) {
          req.user = {
            username: session.username,
            githubId: session.githubId,
            profile,
          };
        }
      }
    } catch (err) {
      console.error('[Auth] Session lookup error:', err);
    }
    next();
  }

  function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required. Please sign in with GitHub.' });
      return;
    }
    next();
  }

  app.use(authenticate);

  // ==========================================
  // Auth API Routes (GitHub Only)
  // ==========================================

  // 1. Auth config status
  app.get('/api/auth/status', (_req, res) => {
    res.json({
      githubOAuthConfigured: isGitHubOAuthConfigured(),
      clientId: process.env.GITHUB_CLIENT_ID || null,
    });
  });

  // 2. Start GitHub OAuth redirect
  app.get('/api/auth/github', (req, res) => {
    try {
      const redirectUri = req.query.redirect_uri as string | undefined;
      const url = getGitHubAuthorizeUrl(redirectUri);
      res.json({ url });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 3. GitHub OAuth Callback (Exchange code)
  app.post('/api/auth/github/callback', async (req, res) => {
    const { code, redirectUri, desiredUsername } = req.body as {
      code: string;
      redirectUri?: string;
      desiredUsername?: string;
    };

    if (!code) {
      res.status(400).json({ error: 'Missing GitHub authorization code.' });
      return;
    }

    try {
      const githubUser = await exchangeGitHubCode(code, redirectUri);
      const authResult = await authenticateOrProvisionGitHubUser(githubUser, desiredUsername);
      res.json(authResult);
    } catch (err: any) {
      console.error('[OAuth Callback Error]', err);
      res.status(400).json({ error: err.message || 'Failed to authenticate with GitHub' });
    }
  });

  // 4. GitHub Direct Verification Login (Real public GitHub account verification)
  // Allows testing and logging in directly with a real GitHub handle, fetching authentic avatar, bio, and unique ID
  app.post('/api/auth/github/direct', async (req, res) => {
    const { githubUsername, desiredUsername } = req.body as {
      githubUsername: string;
      desiredUsername?: string;
    };

    if (!githubUsername || !githubUsername.trim()) {
      res.status(400).json({ error: 'Please enter a GitHub username.' });
      return;
    }

    try {
      const githubUser = await fetchPublicGitHubUser(githubUsername.trim());
      const authResult = await authenticateOrProvisionGitHubUser(githubUser, desiredUsername);
      res.json(authResult);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to verify GitHub username.' });
    }
  });

  // 5. Get current authenticated user
  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json({ profile: req.user!.profile });
  });

  // 6. Logout
  app.post('/api/auth/logout', async (req: AuthenticatedRequest, res) => {
    const authHeader = req.headers.authorization || (req.headers['x-auth-token'] as string);
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      await deleteSession(token);
    }
    res.json({ success: true });
  });

  // ==========================================
  // Profiles API Routes
  // ==========================================

  // List all published profiles (Public Directory)
  app.get('/api/profiles', async (_req, res) => {
    const profiles = await getAllProfiles();
    res.json({ profiles });
  });

  // Get single profile by username
  app.get('/api/profiles/:username', async (req, res) => {
    const profile = await getProfileByUsername(req.params.username);
    if (!profile) {
      res.status(404).json({ error: 'Developer profile not found on my.itstck.com' });
      return;
    }
    res.json({ profile });
  });

  // Update profile (STRICT OWNERSHIP ENFORCEMENT)
  // Each user can ONLY edit their own profile!
  app.put('/api/profiles/:username', requireAuth, async (req: AuthenticatedRequest, res) => {
    const targetUsername = req.params.username.replace(/^@/, '').toLowerCase();
    const currentUsername = req.user!.username.toLowerCase();

    if (targetUsername !== currentUsername) {
      res.status(403).json({
        error: 'Forbidden: You can only edit and modify your own profile.',
      });
      return;
    }

    try {
      const updated = await saveProfile(
        req.body as UserProfile,
        req.user!.githubId,
        req.user!.profile.githubUsername
      );
      res.json({ profile: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to save profile' });
    }
  });

  // Delete profile (DELETE ACCOUNT)
  // Each user can ONLY delete their own profile!
  app.delete('/api/profiles/:username', requireAuth, async (req: AuthenticatedRequest, res) => {
    const targetUsername = req.params.username.replace(/^@/, '').toLowerCase();
    const currentUsername = req.user!.username.toLowerCase();

    if (targetUsername !== currentUsername) {
      res.status(403).json({
        error: 'Forbidden: You can only delete your own profile.',
      });
      return;
    }

    try {
      const success = await deleteProfile(targetUsername, req.user!.githubId);
      if (success) {
        // Terminate session
        const authHeader = req.headers.authorization || (req.headers['x-auth-token'] as string);
        if (authHeader) {
          const token = authHeader.replace(/^Bearer\s+/i, '').trim();
          await deleteSession(token);
        }
        res.json({ success: true, message: 'Profile permanently deleted.' });
      } else {
        res.status(404).json({ error: 'Profile not found.' });
      }
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to delete profile.' });
    }
  });

  // Endorse a skill (Public interaction)
  app.post('/api/profiles/:username/endorse', async (req, res) => {
    const { skill, actorUsername } = req.body as { skill: string; actorUsername: string };
    const prof = await getProfileByUsername(req.params.username);
    if (!prof) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const actor = actorUsername || 'anonymous';
    prof.endorsements = prof.endorsements.map((item) => {
      if (item.skill !== skill) return item;
      const already = item.endorsedByUsernames.includes(actor);
      return {
        ...item,
        count: already ? Math.max(0, item.count - 1) : item.count + 1,
        endorsedByUsernames: already
          ? item.endorsedByUsernames.filter((u) => u !== actor)
          : [...item.endorsedByUsernames, actor],
      };
    });

    const updated = await saveProfile(prof, prof.githubId, prof.githubUsername);
    res.json({ profile: updated });
  });

  // Direct Static HTML Export (SSG)
  app.get('/api/export/html/:username', async (req, res) => {
    const prof = await getProfileByUsername(req.params.username);
    if (!prof) {
      res.status(404).send('Profile not found');
      return;
    }
    prof.analytics.staticHtmlDownloads += 1;
    await saveProfile(prof, prof.githubId, prof.githubUsername);
    const html = compileProfileToStaticHtml(prof);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // Direct README.md Export
  app.get('/api/export/readme/:username', async (req, res) => {
    const prof = await getProfileByUsername(req.params.username);
    if (!prof) {
      res.status(404).send('Profile not found');
      return;
    }
    const md = compileProfileToReadmeMarkdown(prof);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(md);
  });

  // Client routing: Vite development middleware vs Static Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ItStack SaaS Engine listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
