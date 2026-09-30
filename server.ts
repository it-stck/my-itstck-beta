import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { INITIAL_PROFILES } from './src/lib/seedData';
import {
  compileProfileToStaticHtml,
  compileProfileToReadmeMarkdown,
} from './src/lib/markdown';
import { UserProfile } from './src/types';

const PORT = 3000;
const DB_FILE = path.resolve(process.cwd(), 'data', 'itstck-store.json');

function loadProfilesFromDisk(): UserProfile[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to initial seed profiles
  }
  return JSON.parse(JSON.stringify(INITIAL_PROFILES));
}

function saveProfilesToDisk(profiles: UserProfile[]) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
  } catch {
    // Non-fatal if sandbox has read-only disk
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  let profilesStore: UserProfile[] = loadProfilesFromDisk();

  // 1. List profiles
  app.get('/api/profiles', (_req, res) => {
    res.json({ profiles: profilesStore });
  });

  // 2. Fetch single profile
  app.get('/api/profiles/:username', (req, res) => {
    const clean = req.params.username.replace(/^@/, '').toLowerCase();
    const found = profilesStore.find((p) => p.username.toLowerCase() === clean);
    if (!found) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json({ profile: found });
  });

  // 3. Create profile
  app.post('/api/profiles', (req, res) => {
    const incoming = req.body as UserProfile;
    if (!incoming || !incoming.username) {
      res.status(400).json({ error: 'Invalid profile data' });
      return;
    }
    const clean = incoming.username.replace(/^@/, '').toLowerCase();
    if (profilesStore.some((p) => p.username.toLowerCase() === clean)) {
      res.status(409).json({ error: 'Username is already taken' });
      return;
    }
    const created: UserProfile = { ...incoming, username: clean };
    profilesStore.unshift(created);
    saveProfilesToDisk(profilesStore);
    res.status(201).json({ profile: created });
  });

  // 4. Update profile
  app.put('/api/profiles/:username', (req, res) => {
    const clean = req.params.username.replace(/^@/, '').toLowerCase();
    const idx = profilesStore.findIndex((p) => p.username.toLowerCase() === clean);
    if (idx === -1) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    const updated: UserProfile = {
      ...profilesStore[idx],
      ...req.body,
    };
    profilesStore[idx] = updated;
    saveProfilesToDisk(profilesStore);
    res.json({ profile: updated });
  });

  // 5. Skill Endorsements
  app.post('/api/profiles/:username/endorse', (req, res) => {
    const clean = req.params.username.replace(/^@/, '').toLowerCase();
    const { skill, actorUsername } = req.body as {
      skill: string;
      actorUsername: string;
    };
    const prof = profilesStore.find((p) => p.username.toLowerCase() === clean);
    if (!prof) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    prof.endorsements = prof.endorsements.map((item) => {
      if (item.skill !== skill) return item;
      const already = item.endorsedByUsernames.includes(actorUsername);
      return {
        ...item,
        count: already ? Math.max(0, item.count - 1) : item.count + 1,
        endorsedByUsernames: already
          ? item.endorsedByUsernames.filter((u) => u !== actorUsername)
          : [...item.endorsedByUsernames, actorUsername],
      };
    });
    saveProfilesToDisk(profilesStore);
    res.json({ profile: prof });
  });

  // 6. Direct Static HTML Export
  app.get('/api/export/html/:username', (req, res) => {
    const clean = req.params.username.replace(/^@/, '').toLowerCase();
    const prof = profilesStore.find((p) => p.username.toLowerCase() === clean);
    if (!prof) {
      res.status(404).send('Profile not found');
      return;
    }
    prof.analytics.staticHtmlDownloads += 1;
    saveProfilesToDisk(profilesStore);
    const html = compileProfileToStaticHtml(prof);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // 7. Direct README.md Export
  app.get('/api/export/readme/:username', (req, res) => {
    const clean = req.params.username.replace(/^@/, '').toLowerCase();
    const prof = profilesStore.find((p) => p.username.toLowerCase() === clean);
    if (!prof) {
      res.status(404).send('Profile not found');
      return;
    }
    const md = compileProfileToReadmeMarkdown(prof);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(md);
  });

  // Vite development vs Production static serving
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
    console.log(`ItStack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
