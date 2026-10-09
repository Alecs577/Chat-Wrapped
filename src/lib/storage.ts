import type { WrappedData } from "./types";

const KEY = "chat-wrapped-v1";

type Session = {
  data: WrappedData;
  viewerName: string | null;
  shareId?: string | null;
};

export function saveSession(data: WrappedData, viewerName: string | null, shareId?: string | null) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ data, viewerName, shareId } satisfies Session));
  } catch {
    /* quota or private mode */
  }
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.data?.participants) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
