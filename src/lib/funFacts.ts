import { dateIt, durationIt, fmt } from "./format";
import type { WrappedData } from "./types";

export type FunFact = { kicker: string; title: string; lead: string };

export function funFacts(data: WrappedData): FunFact[] {
  const facts: FunFact[] = [];

  if (data.avgPerDay != null && data.activeDays != null && data.activeDays > 0) {
    facts.push({
      kicker: "Ritmo",
      title: `${fmt(data.avgPerDay)} messaggi al giorno`,
      lead: `Nei ${fmt(data.activeDays)} giorni in cui qualcuno ha scritto, la media non ha mai chiesto il permesso.`,
    });
  }

  if (data.longestSilence && data.longestSilence.ms >= 6 * 60 * 60 * 1000) {
    facts.push({
      kicker: "Silenzio",
      title: durationIt(data.longestSilence.ms),
      lead: `Il buco più lungo: dal ${dateIt(data.longestSilence.from)} al ${dateIt(data.longestSilence.to)}. Il gruppo ha fatto finta di non esistere.`,
    });
  }

  if (data.lastMessage?.name && data.lastMessage.at) {
    facts.push({
      kicker: "Ultima parola",
      title: data.lastMessage.name,
      lead: `L’ultimo messaggio datato è del ${dateIt(data.lastMessage.at)}. Chi chiude, chiude.`,
    });
  }

  if (data.doubleTexter) {
    facts.push({
      kicker: "Raffiche",
      title: data.doubleTexter.name,
      lead: `${fmt(data.doubleTexter.count)} raffiche da due messaggi di fila o più. Il mitra non ha la sicura.`,
    });
  }

  if (data.fastestReply) {
    facts.push({
      kicker: "Lampo",
      title: data.fastestReply.name,
      lead: `Mediana di risposta: ${durationIt(data.fastestReply.medianMs)}. Notifiche ancora calde.`,
    });
  }

  if (data.longestStreak && data.longestStreak.days >= 2) {
    facts.push({
      kicker: "Streak",
      title: `${fmt(data.longestStreak.days)} giorni di fila`,
      lead: `Dal ${dateIt(data.longestStreak.start)} al ${dateIt(data.longestStreak.end)} qualcuno ha scritto ogni giorno. Disciplina o dipendenza: il file non giudica.`,
    });
  }

  if (data.questionAsker) {
    facts.push({
      kicker: "Domande",
      title: data.questionAsker.name,
      lead: `${fmt(data.questionAsker.count)} messaggi con un punto interrogativo. L’inquisitore ufficiale del gruppo.`,
    });
  }

  return facts.slice(0, 6);
}
