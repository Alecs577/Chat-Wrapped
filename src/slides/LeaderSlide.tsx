import { CountUp } from "../components/CountUp";
import { fmt, pct } from "../lib/format";
import type { SlideProps } from "./types";

export function LeaderSlide({ data, viewerName }: SlideProps) {
  const top = data.participants[0];
  const you = viewerName ? data.participants.findIndex((p) => p.name === viewerName) : -1;
  if (!top) return null;

  return (
    <div className="slide">
      <div className="eyebrow">Il pollice più veloce</div>
      <h2>{top.name}</h2>
      <div className="big-stat">
        <CountUp value={top.messages} />
      </div>
      <p className="lead">
        messaggi. Il {pct(top.messages, data.total)}% della chat. Il tasto «silenzia» è stato informato.
        {you === 0
          ? " Sei tu: la chat aveva un addetto stampa e non lo sapeva."
          : you > 0
            ? ` Tu sei ${you + 1}° su ${data.participants.length}, con ${fmt(data.participants[you].messages)} messaggi.`
            : ""}
      </p>
    </div>
  );
}
