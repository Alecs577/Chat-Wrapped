export const fmt = (n: number) => new Intl.NumberFormat("it-IT").format(n);

export const monthNames = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
];

export const dateIt = (iso: string) =>
  new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));

export const monthLabel = (ym: string) => {
  const month = Number(ym.slice(5)) - 1;
  return `${monthNames[month] ?? ym} ${ym.slice(0, 4)}`;
};

export const toIsoDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;
