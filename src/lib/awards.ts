import { fmt } from "./format";
import type { Award, WrappedData } from "./types";

export function participantAwards(data: WrappedData): Award[] {
  const leader = data.participants[0]?.name;
  return data.participants.map((p) => {
    if (p.name === leader) {
      return {
        name: p.name,
        title: "Il centralino umano",
        emoji: "📣",
        description: `${fmt(p.messages)} messaggi: la chat aveva un addetto stampa e non lo sapeva.`,
      };
    }
    if (data.nightOwl?.name === p.name && p.nightMessages >= 8) {
      return {
        name: p.name,
        title: "Il gufo",
        emoji: "🦉",
        description: `${fmt(p.nightMessages)} messaggi tra mezzanotte e le cinque. Il silenzioso non era così silenzioso.`,
      };
    }
    if (data.conversationStarter?.name === p.name) {
      return {
        name: p.name,
        title: "Chi riaccende la chat",
        emoji: "🔌",
        description: `${fmt(p.starters)} volte ha scritto dopo un buco di almeno quattro ore. Qualcuno doveva pur cominciare.`,
      };
    }
    if (p.topEmoji && p.topEmojiCount >= 2) {
      return {
        name: p.name,
        title: "Firma in emoji",
        emoji: p.topEmoji,
        description: `${fmt(p.topEmojiCount)} ${p.topEmoji}: una presenza riconoscibile anche senza leggere il nome.`,
      };
    }
    if (p.topWord && p.topWordCount >= 2) {
      return {
        name: p.name,
        title: "Parola in loop",
        emoji: "🔁",
        description: `“${p.topWord}” compare ${fmt(p.topWordCount)} volte nei suoi messaggi. Il vocabolario ha un ritornello.`,
      };
    }
    return {
      name: p.name,
      title: "Comparsa con tempismo",
      emoji: "🎟️",
      description: `${fmt(p.messages)} messagg${p.messages === 1 ? "io" : "i"}: poche notifiche, ma tutte ufficialmente agli atti.`,
    };
  });
}

export function flashAwards(data: WrappedData): Award[] {
  const all = participantAwards(data);
  const picks: Award[] = [];
  const seen = new Set<string>();
  const prefer = [
    all.find((a) => a.title === "Il centralino umano"),
    all.find((a) => a.title === "Il gufo"),
    all.find((a) => a.title === "Chi riaccende la chat"),
    all.find((a) => a.title === "Comparsa con tempismo"),
    all.find((a) => a.title === "Firma in emoji"),
  ];
  for (const a of prefer) {
    if (a && !seen.has(a.name) && picks.length < 3) {
      picks.push(a);
      seen.add(a.name);
    }
  }
  for (const a of all) {
    if (!seen.has(a.name) && picks.length < 3) {
      picks.push(a);
      seen.add(a.name);
    }
  }
  return picks;
}
