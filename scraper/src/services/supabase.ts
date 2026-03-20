import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

function loadEnv() {
  const candidates = [
    // when running inside scraper/
    path.resolve(process.cwd(), '.env'),
    // when running from repo root (npm workspaces)
    path.resolve(process.cwd(), 'scraper', '.env'),
    // when current file is scraper/src/services/supabase.ts
    path.resolve(__dirname, '..', '..', '..', '.env'),
  ];

  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    try {
      // Use explicit read+parse so we can handle Windows edge cases reliably.
      const raw = fs.readFileSync(p);
      const parsed = dotenv.parse(raw);
      for (const [k, v] of Object.entries(parsed)) {
        const current = process.env[k];
        if (current === undefined || current.trim() === '') process.env[k] = v;
      }
      return p;
    } catch {
      // fallback to dotenv's own loader
      const result = dotenv.config({ path: p });
      if (!result.error) return p;
    }
  }

  // still attempt default behaviour, but we'll validate below anyway
  dotenv.config();
  return null;
}

const loadedEnvPath = loadEnv();

// If scraper env is incomplete, try to reuse public client env.
try {
  const clientCandidates = [
    // when cwd = scraper/
    path.resolve(process.cwd(), '..', 'client', '.env.local'),
    // when cwd = repo root
    path.resolve(process.cwd(), 'client', '.env.local'),
    // when current file is scraper/src/services/supabase.ts
    path.resolve(__dirname, '..', '..', '..', '..', 'client', '.env.local'),
  ];

  for (const clientEnvPath of clientCandidates) {
    if (!fs.existsSync(clientEnvPath)) continue;
    const raw = fs.readFileSync(clientEnvPath);
    const parsed = dotenv.parse(raw);
    const url = parsed.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const anon = parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if ((process.env.SUPABASE_URL === undefined || process.env.SUPABASE_URL.trim() === '') && url) {
      process.env.SUPABASE_URL = url;
    }
    if ((process.env.SUPABASE_ANON_KEY === undefined || process.env.SUPABASE_ANON_KEY.trim() === '') && anon) {
      process.env.SUPABASE_ANON_KEY = anon;
    }
    break;
  }
} catch {
  // ignore
}

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
const supabaseKey = serviceRoleKey || anonKey;

if (!supabaseUrl || !supabaseKey) {
  const hasUrl = Boolean(supabaseUrl);
  const hasServiceRole = Boolean(serviceRoleKey);
  const hasAnon = Boolean(anonKey);
  throw new Error(
    [
      'Missing Supabase env vars for scraper.',
      `Env file used: ${loadedEnvPath ?? '(dotenv default lookup)'}`,
      `Detected: SUPABASE_URL=${hasUrl ? 'set' : 'missing'}, SUPABASE_SERVICE_ROLE_KEY=${hasServiceRole ? 'set' : 'missing'}, SUPABASE_ANON_KEY=${hasAnon ? 'set' : 'missing'}`,
      'Add them to scraper/.env:',
      '  SUPABASE_URL=...',
      '  SUPABASE_SERVICE_ROLE_KEY=...  (recommended for upserts)',
      'or set SUPABASE_ANON_KEY=... if you intentionally use anon key.',
    ].join('\n'),
  );
}

console.log(
  `[supabase] env=${loadedEnvPath ?? 'default'} key=${serviceRoleKey ? 'service_role' : 'anon'}`,
);

export const supabase = createClient(supabaseUrl, supabaseKey);