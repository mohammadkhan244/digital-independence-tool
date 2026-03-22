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
