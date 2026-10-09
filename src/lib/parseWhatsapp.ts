import type { ChatMessage, ParsedChat } from "./types";

const LINE_RE =
  /^\[?(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)(?:\s*([ap]\.m\.|[ap]m))?\]?\s+-\s+(.*)$/i;

const INVISIBLE = /[\u200e\u200f\u202a\u202c]/g;

function parseDate(raw: string): Date | null {
  const m = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (!m) return null;
  let year = Number(m[3]);
  if (year < 100) year += year < 70 ? 2000 : 1900;
  const date = new Date(year, Number(m[2]) - 1, Number(m[1]));
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== Number(m[2]) - 1 ||
    date.getDate() !== Number(m[1])
  ) {
    return null;
  }
  return date;
}

export function detectChatName(text: string, fallback: string): string {
  const head = text.replace(/^\uFEFF/, "").split(/\r?\n/).slice(0, 40);
  for (const line of head) {
    const it = line.match(/^Chat WhatsApp con\s+(.+)/i);
    if (it?.[1]) return it[1].trim();
    const en = line.match(/^WhatsApp Chat with\s+(.+)/i);
    if (en?.[1]) return en[1].trim();
  }
  return fallback
    .replace(/\.txt$/i, "")
    .replace(/^WhatsApp Chat with\s+/i, "")
    .replace(/^Chat WhatsApp con\s+/i, "")
    .trim() || "La chat";
}

function yieldTick(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export async function parseWhatsapp(
  text: string,
  source: string,
  onProgress?: (count: number) => void
): Promise<ParsedChat> {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const messages: ChatMessage[] = [];
  const chunk = 1800;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(LINE_RE);
    if (!m) {
      if (messages.length) messages[messages.length - 1].body += `\n${line}`;
      continue;
    }
    const dt = parseDate(m[1]);
    if (!dt) continue;
    const time = m[2].match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!time) continue;
    let h = Number(time[1]);
    if (m[3]) {
      const pm = m[3].toLowerCase().startsWith("p");
      h = (h % 12) + (pm ? 12 : 0);
    }
    dt.setHours(h, Number(time[2]), Number(time[3] || 0), 0);
    const split = m[4].indexOf(": ");
    if (split < 1) continue;
    const name = m[4].slice(0, split).replace(INVISIBLE, "").trim();
    if (!name) continue;
    messages.push({ name, body: m[4].slice(split + 2), date: dt });

    if (onProgress && (messages.length % 400 === 0 || i === lines.length - 1)) {
      onProgress(messages.length);
    }
    if (i > 0 && i % chunk === 0) await yieldTick();
  }

  onProgress?.(messages.length);
  if (!messages.length) {
    throw new Error(
      "Non ho trovato messaggi datati leggibili. Esporta la chat WhatsApp (zip o .txt) e riprova."
    );
  }

  return {
    chatName: detectChatName(text, source),
    source: source.replace(/\.txt$/i, ""),
    messages,
  };
}

export function yearsFromMessages(messages: ChatMessage[]): string[] {
  const years = new Set<string>();
  for (const m of messages) {
    if (m.date.getFullYear() >= 2020) years.add(String(m.date.getFullYear()));
  }
  return [...years].sort();
}
