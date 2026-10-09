import { toIsoDate } from "./format";
import type {
  ChatMessage,
  CountPair,
  Participant,
  PhraseGroup,
  WrappedData,
} from "./types";

const STOP_WORDS = new Set(
  "a ad al allo alla ai agli alle anche che chi ci co con come da dal dallo dalla dai dagli dalle dei del dello della delle di e ed è era eri essere fa fare fra gli ha hai hanno il in io la le lei li lo lui ma me mi mio mia miei mie ne nei nel nello nella nelle no noi non o per più poi quale quando quanto qui quello questa questo se sei senza si sia sono su tra tu un una uno vi voi sto sta stato pure perché quindi però siamo solo bene ora tutto cosa fatto già questo messaggio modificato eliminato whatsapp".split(
    " "
  )
);

const IGNORED_BODY =
  /^(?:<?media omessi>?|<media omitted>|<video note omitted>|image omitted|video omitted|audio omitted|sticker omitted|posizione in tempo reale condivisa|in attesa del messaggio)$/i;

const DELETED =
  /^(?:questo messaggio.*(?:modificato|eliminato)|hai eliminato questo messaggio|this message was deleted|you deleted this message|message was deleted)$/i;

const EMOJI_RE =
  /\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?)*/gu;

const WORD_RE = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)?/gu;

const WEEKDAY_IT: Record<string, string> = {
  Monday: "Lunedì",
  Tuesday: "Martedì",
  Wednesday: "Mercoledì",
  Thursday: "Giovedì",
  Friday: "Venerdì",
  Saturday: "Sabato",
  Sunday: "Domenica",
};

const TECHNICAL_BIGRAM =
  /messaggio|stato|modificato|eliminato|posizione tempo|tempo reale|opzione voti|media omessi|media omitted/;

type PersonAgg = {
  name: string;
  messages: number;
  emoji: Map<string, number>;
  word: Map<string, number>;
  unique: Set<string>;
  chars: number;
  omittedMedia: number;
  nightMessages: number;
  starters: number;
  weekendMessages: number;
  weekdayMessages: number;
  hours: number[];
  questions: number;
  doubleTexts: number;
  replyMs: number[];
  lastMessageAt: string;
};

function medianMs(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  if (s.length % 2) return s[mid];
  return Math.round((s[mid - 1] + s[mid]) / 2);
}

function isCountableBody(body: string): boolean {
  const key = body
    .toLowerCase()
    .replace(/[\u200e\u200f\u202a\u202c]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return Boolean(key) && !IGNORED_BODY.test(body) && !DELETED.test(key);
}

function topMap<T>(map: Map<T, number>, n: number, byValue = true): CountPair<T>[] {
  const list = [...map.entries()] as CountPair<T>[];
  list.sort((a, b) => (byValue ? b[1] - a[1] : Number(a[0]) - Number(b[0])));
  return list.slice(0, n);
}

function emptyPerson(name: string): PersonAgg {
  return {
    name,
    messages: 0,
    emoji: new Map(),
    word: new Map(),
    unique: new Set(),
    chars: 0,
    omittedMedia: 0,
    nightMessages: 0,
    starters: 0,
    weekendMessages: 0,
    weekdayMessages: 0,
    hours: Array.from({ length: 24 }, () => 0),
    questions: 0,
    doubleTexts: 0,
    replyMs: [],
    lastMessageAt: "",
  };
}

function recordStats(msgs: ChatMessage[]) {
  const counts = new Map<string, number>();
  const spellings = new Map<string, Map<string, number>>();
  let longest = { name: "", characters: 0 };
  const reactionRe =
    /\[(?:reaction|reacted)\b|\b(?:reaction|reacted)\s*:\s*[\u{1F300}-\u{1FAFF}]/iu;

  for (const m of msgs) {
    const body = m.body.replace(/[\u200e\u200f\u202a\u202c]/g, "").replace(/\s+/g, " ").trim();
    const key = body
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
    const deleted = DELETED.test(key);
    if (
      key.length >= 8 &&
      /[a-zà-ÿ]/i.test(key) &&
      !IGNORED_BODY.test(body) &&
      !deleted
    ) {
      counts.set(key, (counts.get(key) || 0) + 1);
      if (!spellings.has(key)) spellings.set(key, new Map());
      const map = spellings.get(key)!;
      map.set(body, (map.get(body) || 0) + 1);
    }
    if (body && !IGNORED_BODY.test(body) && !deleted && body.length > longest.characters) {
      longest = { name: m.name, characters: body.length };
    }
  }

  const best = [...counts].sort((a, b) => b[1] - a[1])[0] || ["—", 0];
  const phrase =
    [...(spellings.get(best[0]) || new Map())].sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  return {
    repeatedPhrase: { text: phrase, count: best[1] },
    longestMessage: longest,
    reactionAnnotations: msgs.filter((m) => reactionRe.test(m.body)).length,
  };
}

function groupPhrases(bigrams: CountPair[]): PhraseGroup[] {
  const groups: Record<string, CountPair[]> = {
    Convocazioni: [],
    Appuntamenti: [],
    Ritrovi: [],
  };
  for (const pair of bigrams) {
    const p = pair[0];
    const group = /qualcuno|sapere|venire|voti|opzione|fate|vuole/.test(p)
      ? "Convocazioni"
      : /sera|pomeriggio|cena|tardi|oggi|domani|stasera/.test(p)
        ? "Appuntamenti"
        : /giochi|tavolo|casa|bar|posto|parco|pizzeria/.test(p)
          ? "Ritrovi"
          : null;
    if (group && groups[group].length < 3) groups[group].push(pair);
  }
  return Object.entries(groups)
    .filter(([, items]) => items.length)
    .map(([title, items]) => ({ title, items }));
}

export function analyzeChat(
  messages: ChatMessage[],
  source: string,
  chatName: string,
  selectedYear: string | null = null
): WrappedData {
  const timed = messages.filter((m) => m.date.getFullYear() >= 2020);
  const scoped = selectedYear
    ? timed.filter((m) => String(m.date.getFullYear()) === selectedYear)
    : timed;

  if (!timed.length || !scoped.length) {
    throw new Error(
      "Non ho trovato messaggi datati leggibili. Esporta la chat WhatsApp (zip o .txt) e riprova."
    );
  }

  const people = new Map<string, PersonAgg>();
  const words = new Map<string, number>();
  const bigrams = new Map<string, number>();
  const emojis = new Map<string, number>();
  const weekdays = new Map<string, number>();
  const hours = new Map<number, number>();
  const months = new Map<string, number>();
  const days = new Map<string, number>();
  let omitted = 0;

  const sorted = [...scoped].sort((a, b) => a.date.getTime() - b.date.getTime());
  let prevTime = 0;
  const FOUR_HOURS = 4 * 60 * 60 * 1000;
  const heatmap = Array.from({ length: 168 }, () => 0);

  for (const m of sorted) {
    let p = people.get(m.name);
    if (!p) {
      p = emptyPerson(m.name);
      people.set(m.name, p);
    }
    p.messages += 1;
    p.chars += m.body.length;
    const hour = m.date.getHours();
    p.hours[hour] += 1;
    if (hour <= 5) p.nightMessages += 1;

    const t = m.date.getTime();
    if (prevTime && t - prevTime >= FOUR_HOURS) p.starters += 1;
    else if (!prevTime) p.starters += 1;
    prevTime = t;

    const wdEn = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(m.date);
    const wd = WEEKDAY_IT[wdEn] ?? wdEn;
    if (wdEn === "Saturday" || wdEn === "Sunday") p.weekendMessages += 1;
    else p.weekdayMessages += 1;

    for (const e of m.body.match(EMOJI_RE) || []) {
      emojis.set(e, (emojis.get(e) || 0) + 1);
      p.emoji.set(e, (p.emoji.get(e) || 0) + 1);
    }

    const omittedHits = (m.body.match(/media omessi|media omitted/gi) || []).length;
    omitted += omittedHits;
    p.omittedMedia += omittedHits;

    const clean = m.body
      .toLowerCase()
      .replace(/<?media omessi>?|<media omitted>/gi, " ")
      .replace(
        /questo messaggio\s+(è\s+)?stato\s+(modificato|eliminato)|hai eliminato questo messaggio|this message was deleted|you deleted this message/g,
        " "
      )
      .replace(/https?:\/\/\S+/g, " ");
    const toks = (clean.match(WORD_RE) || [])
      .map((w) => w.toLowerCase().replace(/^['’]|['’]$/g, ""))
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
    for (const w of toks) {
      words.set(w, (words.get(w) || 0) + 1);
      p.word.set(w, (p.word.get(w) || 0) + 1);
      p.unique.add(w);
    }
    for (let i = 0; i < toks.length - 1; i++) {
      if (toks[i] !== toks[i + 1]) {
        const k = `${toks[i]} ${toks[i + 1]}`;
        bigrams.set(k, (bigrams.get(k) || 0) + 1);
      }
    }

    weekdays.set(wd, (weekdays.get(wd) || 0) + 1);
    hours.set(hour, (hours.get(hour) || 0) + 1);
    const mo = `${m.date.getFullYear()}-${String(m.date.getMonth() + 1).padStart(2, "0")}`;
    months.set(mo, (months.get(mo) || 0) + 1);
    days.set(toIsoDate(m.date), (days.get(toIsoDate(m.date)) || 0) + 1);

    p.lastMessageAt = toIsoDate(m.date);
    const wdIdx = (m.date.getDay() + 6) % 7;
    heatmap[wdIdx * 24 + hour] += 1;
    if (isCountableBody(m.body) && m.body.includes("?")) p.questions += 1;
  }

  const REPLY_MIN = 2000;
  const REPLY_MAX = 2 * 60 * 60 * 1000;
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  let longestSilence: { ms: number; from: string; to: string } | null = null;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const dt = curr.date.getTime() - prev.date.getTime();
    if (dt >= SIX_HOURS && (!longestSilence || dt > longestSilence.ms)) {
      longestSilence = { ms: dt, from: toIsoDate(prev.date), to: toIsoDate(curr.date) };
    }
    if (prev.name !== curr.name && dt >= REPLY_MIN && dt <= REPLY_MAX) {
      const person = people.get(curr.name);
      if (person) person.replyMs.push(dt);
    }
  }

  let burstAuthor: string | null = null;
  let burstLen = 0;
  for (const m of sorted) {
    if (m.name === burstAuthor) {
      burstLen += 1;
    } else {
      if (burstAuthor && burstLen >= 2) {
        const person = people.get(burstAuthor);
        if (person) person.doubleTexts += 1;
      }
      burstAuthor = m.name;
      burstLen = 1;
    }
  }
  if (burstAuthor && burstLen >= 2) {
    const person = people.get(burstAuthor);
    if (person) person.doubleTexts += 1;
  }

  const uniqueDays = [...new Set(sorted.map((m) => toIsoDate(m.date)))].sort();
  const activeDays = uniqueDays.length;
  let longestStreak: { days: number; start: string; end: string } | null = null;
  if (uniqueDays.length) {
    let streakStart = uniqueDays[0];
    let streakLen = 1;
    let bestStreak = { days: 1, start: uniqueDays[0], end: uniqueDays[0] };
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = new Date(`${uniqueDays[i - 1]}T12:00:00`);
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      if (toIsoDate(next) === uniqueDays[i]) {
        streakLen += 1;
      } else {
        if (streakLen > bestStreak.days) {
          bestStreak = { days: streakLen, start: streakStart, end: uniqueDays[i - 1] };
        }
        streakStart = uniqueDays[i];
        streakLen = 1;
      }
    }
    if (streakLen > bestStreak.days) {
      bestStreak = { days: streakLen, start: streakStart, end: uniqueDays[uniqueDays.length - 1] };
    }
    longestStreak = bestStreak;
  }

  const nameTokens = new Set(
    [...people.keys()].flatMap((name) =>
      name
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((w) => w.length > 2)
    )
  );

  const minBigram = scoped.length > 8000 ? 25 : Math.max(4, Math.round(scoped.length / 400));
  const bigramList = topMap(bigrams, 80).filter(
    ([k, n]) =>
      n >= minBigram &&
      !TECHNICAL_BIGRAM.test(k) &&
      !k.split(" ").some((w) => nameTokens.has(w))
  );

  const participants: Participant[] = [...people.values()]
    .map((p) => {
      const te = topMap(p.emoji, 1)[0] || ["", 0];
      const tw = topMap(p.word, 1)[0] || ["", 0];
      return {
        name: p.name,
        messages: p.messages,
        topEmoji: te[0],
        topEmojiCount: te[1],
        topWord: tw[0],
        topWordCount: tw[1],
        uniqueWords: p.unique.size,
        avgChars: p.messages ? Math.round(p.chars / p.messages) : 0,
        omittedMedia: p.omittedMedia,
        nightMessages: p.nightMessages,
        starters: p.starters,
        weekendMessages: p.weekendMessages,
        weekdayMessages: p.weekdayMessages,
        hours: p.hours,
        questions: p.questions,
        doubleTexts: p.doubleTexts,
        medianReplyMs: medianMs(p.replyMs),
        lastMessageAt: p.lastMessageAt,
      };
    })
    .sort((a, b) => b.messages - a.messages);

  const minReplies = scoped.length < 80 ? 2 : 3;
  const withReplies = participants.filter((p) => {
    const agg = people.get(p.name);
    return agg && agg.replyMs.length >= minReplies && p.medianReplyMs != null;
  });
  const fastest =
    withReplies.length
      ? [...withReplies].sort((a, b) => (a.medianReplyMs ?? Infinity) - (b.medianReplyMs ?? Infinity))[0]
      : null;
  const fastestUnique =
    fastest &&
    withReplies.filter((p) => p.medianReplyMs === fastest.medianReplyMs).length === 1
      ? { name: fastest.name, medianMs: fastest.medianReplyMs! }
      : null;

  const dtMax = participants.reduce(
    (best, p) => ((p.doubleTexts ?? 0) > (best.doubleTexts ?? 0) ? p : best),
    participants[0]
  );
  const dtCount = dtMax?.doubleTexts ?? 0;
  const doubleTexter =
    dtMax &&
    dtCount >= 2 &&
    participants.filter((p) => (p.doubleTexts ?? 0) === dtCount).length === 1
      ? { name: dtMax.name, count: dtCount }
      : null;

  const qMax = participants.reduce(
    (best, p) => ((p.questions ?? 0) > (best.questions ?? 0) ? p : best),
    participants[0]
  );
  const qCount = qMax?.questions ?? 0;
  const questionAsker =
    qMax &&
    qCount >= 3 &&
    participants.filter((p) => (p.questions ?? 0) === qCount).length === 1
      ? { name: qMax.name, count: qCount }
      : null;

  const lastMsg = sorted[sorted.length - 1];

  const extra = recordStats(scoped);
  const years = [
    ...new Set(timed.map((m) => String(m.date.getFullYear()))),
  ].sort();

  const nightOwl = [...participants].sort((a, b) => b.nightMessages - a.nightMessages)[0];
  const starter = [...participants].sort((a, b) => b.starters - a.starters)[0];

  return {
    chatName,
    source,
    total: scoped.length,
    validTimedTotal: scoped.length,
    participants,
    first: toIsoDate(sorted[0].date),
    last: toIsoDate(sorted[sorted.length - 1].date),
    years,
    selectedYear,
    months: topMap(months, 120).sort((a, b) => a[0].localeCompare(b[0])),
    weekdays: topMap(weekdays, 7),
    hours: topMap(hours, 24).sort((a, b) => Number(a[0]) - Number(b[0])),
    peakDay: topMap(days, 1)[0] || ["—", 0],
    topDays: topMap(days, 5),
    words: topMap(words, 20),
    bigrams: bigramList.slice(0, 12),
    phraseGroups: groupPhrases(bigramList),
    emojis: topMap(emojis, 20),
    omittedMedia: omitted,
    anomalies: messages.length - timed.length,
    repeatedPhrase: extra.repeatedPhrase,
    longestMessage: extra.longestMessage,
    reactionAnnotations: extra.reactionAnnotations,
    nightOwl:
      nightOwl && nightOwl.nightMessages >= 3
        ? { name: nightOwl.name, count: nightOwl.nightMessages }
        : null,
    conversationStarter:
      starter && starter.starters >= 3
        ? { name: starter.name, count: starter.starters }
        : null,
    avgPerDay: Math.round(scoped.length / Math.max(1, activeDays)),
    activeDays,
    longestStreak,
    longestSilence,
    lastMessage: { name: lastMsg.name, at: toIsoDate(lastMsg.date) },
    fastestReply: fastestUnique,
    doubleTexter,
    questionAsker,
    heatmap,
  };
}
