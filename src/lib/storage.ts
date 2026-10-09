import type { WrappedData } from "./types";

const KEY = "chat-wrapped-v1";

type Session = {
  data: WrappedData;
  viewerName: string | null;
};

export function saveSession(data: WrappedData, viewerName: string | null) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ data, viewerName } satisfies Session));
  } catch {
    /* quota or private mode */
  }
}

export function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY);
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
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
