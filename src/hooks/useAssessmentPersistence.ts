import { AssessmentSession } from '@/types/assessment';

const STORAGE_KEY = 'eadl_assessment_progress';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface PersistedProgress {
  session: AssessmentSession;
  savedAt: string; // ISO timestamp
}

export function loadSavedProgress(): AssessmentSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { session, savedAt }: PersistedProgress = JSON.parse(raw);
    if (session.endTime) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (Date.now() - new Date(savedAt).getTime() > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveProgress(session: AssessmentSession): void {
  try {
    const data: PersistedProgress = {
      session,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently ignore quota or other storage errors
  }
}

export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasSavedProgress(): boolean {
  return loadSavedProgress() !== null;
}

// ── Completed-session results (separate key so clearProgress never touches it) ──

const RESULTS_KEY = 'eadl_assessment_results';

export function saveResults(session: AssessmentSession): void {
  try {
    // Migrate any existing result that predates eadl_all_sessions before overwriting
    const existing = loadResults();
    if (existing?.id && existing.endTime) {
      upsertToAllSessions(existing);
    }
    localStorage.setItem(
      RESULTS_KEY,
      JSON.stringify({ session, savedAt: new Date().toISOString() }),
    );
    upsertToAllSessions(session);
  } catch {}

  // Fire-and-forget to KV — localStorage is the offline fallback
  postSessionToApi(session);
}

export function loadResults(): AssessmentSession | null {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return null;
    const { session }: { session: AssessmentSession; savedAt: string } = JSON.parse(raw);
    return session ?? null;
  } catch {
    return null;
  }
}

export function clearResults(): void {
  localStorage.removeItem(RESULTS_KEY);
}

// ── Session history — all completed sessions, keyed by id (upsert) ──

const ALL_SESSIONS_KEY = 'eadl_all_sessions';

function upsertToAllSessions(session: AssessmentSession): void {
  try {
    const all = loadAllSessions();
    const idx = all.findIndex(s => s.id === session.id);
    if (idx >= 0) {
      all[idx] = session;
    } else {
      all.push(session);
    }
    localStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify(all));
  } catch {}
}

export function loadAllSessions(): AssessmentSession[] {
  try {
    const raw = localStorage.getItem(ALL_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Write API sessions into localStorage so they survive offline
export function mergeApiSessionsToLocal(apiSessions: AssessmentSession[]): void {
  if (apiSessions.length === 0) return;
  try {
    const local = loadAllSessions();
    const idxMap = new Map(local.map((s, i) => [s.id, i]));
    let changed = false;
    apiSessions.forEach(s => {
      if (!s.endTime) return;
      const idx = idxMap.get(s.id);
      if (idx !== undefined) {
        local[idx] = s; // prefer API version (may have open-ended response added later)
        changed = true;
      } else {
        local.push(s);
        idxMap.set(s.id, local.length - 1);
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify(local));
    }
  } catch {}
}

// ── Vercel KV API — fire-and-forget POST, best-effort GET ────────────────────

export async function postSessionToApi(session: AssessmentSession): Promise<void> {
  try {
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session }),
    });
  } catch {
    // Silently fail — localStorage is the fallback
  }
}

export async function fetchSessionsFromApi(params?: {
  participantId?: string;
  mode?: string;
}): Promise<AssessmentSession[]> {
  try {
    const url = new URL('/api/sessions', window.location.origin);
    if (params?.participantId) url.searchParams.set('participantId', params.participantId);
    if (params?.mode) url.searchParams.set('mode', params.mode);

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.sessions) ? data.sessions : [];
  } catch {
    return [];
  }
}
