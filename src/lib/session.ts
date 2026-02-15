import type { CurrentUser } from '@/contexts/AppContext';

const SESSION_KEY = 'dispatchlink_session';
const USERS_KEY = 'dispatchlink_users';

export function saveSession(user: CurrentUser): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    // Quota exceeded — clear the larger users cache and retry
    try {
      localStorage.removeItem(USERS_KEY);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch {
      // Still failing — nothing we can do
    }
  }
}

export function loadSession(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function cacheRegisteredUsers(users: CurrentUser[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // Quota exceeded — don't let user cache prevent session from saving.
    // Try saving without images to reduce size.
    try {
      const slim = users.map(u => ({ ...u, image: undefined, coverImage: undefined }));
      localStorage.setItem(USERS_KEY, JSON.stringify(slim));
    } catch {
      // Still too big — skip caching users entirely
    }
  }
}

export function loadCachedUsers(): CurrentUser[] | null {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CurrentUser[];
  } catch {
    return null;
  }
}
