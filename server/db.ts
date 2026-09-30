import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { UserProfile } from '../src/types';

const DB_FILE = path.resolve(process.cwd(), 'data', 'itstck-store.json');

interface UserRecord {
  id: string;
  githubId: string;
  githubUsername: string;
  username: string;
  createdAt: string;
}

interface SessionRecord {
  token: string;
  username: string;
  githubId: string;
  createdAt: string;
  expiresAt: string;
}

interface FileStoreSchema {
  users: UserRecord[];
  profiles: Record<string, UserProfile>;
  sessions: SessionRecord[];
}

let pool: Pool | null = null;
let usePostgres = false;

// In-memory / file store state
let memoryStore: FileStoreSchema = {
  users: [],
  profiles: {},
  sessions: [],
};

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function loadFromFile() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        memoryStore = {
          users: Array.isArray(data.users) ? data.users : [],
          profiles: data.profiles && typeof data.profiles === 'object' ? data.profiles : {},
          sessions: Array.isArray(data.sessions) ? data.sessions : [],
        };
      }
    }
  } catch {
    // If file is unreadable, start with empty store
  }
}

function saveToFile() {
  try {
    ensureDir(path.dirname(DB_FILE));
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch {
    // Non-fatal if sandbox filesystem is read-only
  }
}

export async function initDatabase() {
  loadFromFile();

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      pool = new Pool({
        connectionString: databaseUrl,
        ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
      });

      // Test connection
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            github_id TEXT UNIQUE NOT NULL,
            github_username TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS profiles (
            username TEXT PRIMARY KEY REFERENCES users(username) ON DELETE CASCADE,
            github_id TEXT UNIQUE NOT NULL,
            data JSONB NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            username TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
            github_id TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
          CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
        `);
        usePostgres = true;
        console.log('[DB] Successfully connected to PostgreSQL and migrated tables.');
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('[DB] PostgreSQL connection failed. Falling back to persistent file store.', err);
      usePostgres = false;
    }
  } else {
    console.log('[DB] No DATABASE_URL specified. Running with persistent JSON store at', DB_FILE);
  }
}

// 1. Get all public profiles
export async function getAllProfiles(): Promise<UserProfile[]> {
  if (usePostgres && pool) {
    try {
      const res = await pool.query('SELECT data FROM profiles ORDER BY updated_at DESC');
      return res.rows.map((r) => r.data as UserProfile);
    } catch {
      // Fallback
    }
  }
  return Object.values(memoryStore.profiles);
}

// 2. Get profile by username
export async function getProfileByUsername(username: string): Promise<UserProfile | null> {
  const clean = username.replace(/^@/, '').toLowerCase();
  if (usePostgres && pool) {
    try {
      const res = await pool.query('SELECT data FROM profiles WHERE LOWER(username) = $1', [clean]);
      if (res.rows.length > 0) {
        return res.rows[0].data as UserProfile;
      }
      return null;
    } catch {
      // Fallback
    }
  }
  return memoryStore.profiles[clean] || null;
}

// 3. Get profile by verified GitHub ID (1 GitHub Account = 1 Profile)
export async function getProfileByGitHubId(githubId: string): Promise<UserProfile | null> {
  const cleanId = String(githubId);
  if (usePostgres && pool) {
    try {
      const res = await pool.query('SELECT data FROM profiles WHERE github_id = $1', [cleanId]);
      if (res.rows.length > 0) {
        return res.rows[0].data as UserProfile;
      }
      return null;
    } catch {
      // Fallback
    }
  }
  const foundUser = memoryStore.users.find((u) => u.githubId === cleanId);
  if (foundUser && memoryStore.profiles[foundUser.username]) {
    return memoryStore.profiles[foundUser.username];
  }
  return null;
}

// 4. Create or update profile (with GitHub account ownership binding)
export async function saveProfile(profile: UserProfile, githubId: string, githubUsername: string): Promise<UserProfile> {
  const cleanUsername = profile.username.replace(/^@/, '').toLowerCase();
  const cleanGithubId = String(githubId);

  const updatedProfile: UserProfile = {
    ...profile,
    username: cleanUsername,
    githubId: cleanGithubId,
    githubUsername,
    verifiedProviders: ['github'],
    primaryProvider: 'github',
    socialLinks: {
      ...profile.socialLinks,
      github: `https://github.com/${githubUsername}`,
    },
    lastPublishedAt: new Date().toISOString(),
  };

  if (usePostgres && pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if another user owns this username
      const existingUser = await client.query('SELECT github_id FROM users WHERE username = $1', [cleanUsername]);
      if (existingUser.rows.length > 0 && existingUser.rows[0].github_id !== cleanGithubId) {
        throw new Error('This username is already claimed by another developer.');
      }

      // Upsert User
      await client.query(`
        INSERT INTO users (id, github_id, github_username, username)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (github_id) DO UPDATE
        SET github_username = $3, username = $4;
      `, [updatedProfile.id, cleanGithubId, githubUsername, cleanUsername]);

      // Upsert Profile
      await client.query(`
        INSERT INTO profiles (username, github_id, data, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (username) DO UPDATE
        SET data = $3, updated_at = CURRENT_TIMESTAMP;
      `, [cleanUsername, cleanGithubId, JSON.stringify(updatedProfile)]);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    // Memory store logic
    const existing = memoryStore.users.find((u) => u.username === cleanUsername);
    if (existing && existing.githubId !== cleanGithubId) {
      throw new Error('This username is already claimed by another developer.');
    }

    const userIdx = memoryStore.users.findIndex((u) => u.githubId === cleanGithubId);
    if (userIdx >= 0) {
      // If user had a previous username, delete old profile key
      const oldUsername = memoryStore.users[userIdx].username;
      if (oldUsername !== cleanUsername) {
        delete memoryStore.profiles[oldUsername];
      }
      memoryStore.users[userIdx].username = cleanUsername;
      memoryStore.users[userIdx].githubUsername = githubUsername;
    } else {
      memoryStore.users.push({
        id: updatedProfile.id,
        githubId: cleanGithubId,
        githubUsername,
        username: cleanUsername,
        createdAt: new Date().toISOString(),
      });
    }

    memoryStore.profiles[cleanUsername] = updatedProfile;
    saveToFile();
  }

  return updatedProfile;
}

// 5. Delete profile (Permanent account deletion)
export async function deleteProfile(username: string, requestingGithubId: string): Promise<boolean> {
  const clean = username.replace(/^@/, '').toLowerCase();
  const cleanId = String(requestingGithubId);

  if (usePostgres && pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const verify = await client.query('SELECT github_id FROM users WHERE username = $1', [clean]);
      if (verify.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }
      if (verify.rows[0].github_id !== cleanId) {
        await client.query('ROLLBACK');
        throw new Error('Unauthorized: You can only delete your own profile.');
      }

      await client.query('DELETE FROM users WHERE username = $1', [clean]);
      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    const userIdx = memoryStore.users.findIndex((u) => u.username === clean);
    if (userIdx === -1) return false;
    if (memoryStore.users[userIdx].githubId !== cleanId) {
      throw new Error('Unauthorized: You can only delete your own profile.');
    }

    memoryStore.users.splice(userIdx, 1);
    delete memoryStore.profiles[clean];
    memoryStore.sessions = memoryStore.sessions.filter((s) => s.username !== clean);
    saveToFile();
    return true;
  }
}

// 6. Session Management
export async function createSession(username: string, githubId: string, token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
  if (usePostgres && pool) {
    try {
      await pool.query(`
        INSERT INTO sessions (token, username, github_id, expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (token) DO UPDATE SET expires_at = $4;
      `, [token, username, String(githubId), expiresAt]);
    } catch (e) {
      console.error('[DB] Failed to insert session into postgres:', e);
    }
  }

  // Always keep in memory store as fallback
  memoryStore.sessions = memoryStore.sessions.filter((s) => s.token !== token);
  memoryStore.sessions.push({
    token,
    username,
    githubId: String(githubId),
    createdAt: new Date().toISOString(),
    expiresAt,
  });
  saveToFile();
}

export async function getSession(token: string): Promise<{ username: string; githubId: string } | null> {
  if (!token) return null;

  if (usePostgres && pool) {
    try {
      const res = await pool.query(
        'SELECT username, github_id FROM sessions WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP',
        [token]
      );
      if (res.rows.length > 0) {
        return {
          username: res.rows[0].username,
          githubId: res.rows[0].github_id,
        };
      }
    } catch {
      // Fallback
    }
  }

  const s = memoryStore.sessions.find(
    (item) => item.token === token && new Date(item.expiresAt) > new Date()
  );
  if (s) {
    return { username: s.username, githubId: s.githubId };
  }
  return null;
}

export async function deleteSession(token: string): Promise<void> {
  if (usePostgres && pool) {
    try {
      await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
    } catch {
      // Fallback
    }
  }
  memoryStore.sessions = memoryStore.sessions.filter((s) => s.token !== token);
  saveToFile();
}
