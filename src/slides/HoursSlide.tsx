import { fmt, hourLabel } from "../lib/format";
import type { SlideProps } from "./types";

export function HoursSlide({ data, viewerName }: SlideProps) {
  const peak = [...data.hours].sort((a, b) => b[1] - a[1])[0];
  const you = data.participants.find((p) => p.name === viewerName);
  const yourNight = you?.nightMessages ?? 0;

  return (
    <div className="slide">
      <div className="eyebrow">Il club delle ore piccole</div>
      <h2>{peak ? hourLabel(peak[0]) : "—"}</h2>
      <p className="lead">
        {peak
          ? `È l’ora più rumorosa: ${fmt(peak[1])} messaggi. `
          : ""}
        {data.nightOwl
          ? `${data.nightOwl.name} guida il club 00:00–05:00 con ${fmt(data.nightOwl.count)} messaggi.`
          : "Di notte, per una volta, il gruppo ha dormito."}
        {you
          ? yourNight
            ? ` Tu: ${fmt(yourNight)} messaggi nel turno notturno.`
            : " Tu, di notte, hai resistito."
          : ""}
      </p>
    </div>
  );
}
