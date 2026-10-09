export type CountPair<T = string> = [T, number];

export type Participant = {
  name: string;
  messages: number;
  topEmoji: string;
  topEmojiCount: number;
  topWord: string;
  topWordCount: number;
  uniqueWords: number;
  avgChars: number;
  omittedMedia: number;
  nightMessages: number;
  starters: number;
  weekendMessages: number;
  weekdayMessages: number;
  hours: number[];
};

export type PhraseGroup = {
  title: string;
  items: CountPair[];
};

export type WrappedData = {
  chatName: string;
  source: string;
  total: number;
  validTimedTotal: number;
  participants: Participant[];
  first: string;
  last: string;
  years: string[];
  selectedYear: string | null;
  months: CountPair[];
  weekdays: CountPair[];
  hours: CountPair<number>[];
  peakDay: CountPair;
  topDays: CountPair[];
  words: CountPair[];
  bigrams: CountPair[];
  phraseGroups: PhraseGroup[];
  emojis: CountPair[];
  omittedMedia: number;
  anomalies: number;
  repeatedPhrase: { text: string; count: number };
  longestMessage: { name: string; characters: number };
  reactionAnnotations: number;
  nightOwl: { name: string; count: number } | null;
  conversationStarter: { name: string; count: number } | null;
};

export type ChatMessage = {
  name: string;
  body: string;
  date: Date;
};

export type ParsedChat = {
  chatName: string;
  source: string;
  messages: ChatMessage[];
};

export type Award = {
  name: string;
  title: string;
  emoji: string;
  description: string;
};
