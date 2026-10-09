import { hourLabel } from "../lib/format";
import type { SlideProps } from "./types";

const WD_SHORT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const WD_LONG = [
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica",
];

export function HeatmapGrid({ cells, max }: { cells: number[]; max: number }) {
  const peak = max || 1;
  const hourMarks = [0, 6, 12, 18];
  return (
    <div className="heatmap-wrap">
      <div className="heatmap-hour-axis" aria-hidden="true">
        {hourMarks.map((h) => (
          <span key={h} style={{ gridColumn: h + 2 }}>{h}</span>
        ))}
      </div>
      <div className="heatmap">
        {WD_SHORT.map((label, row) => (
          <div className="heat-row" key={label}>
            <span className="heat-label">{label}</span>
            {Array.from({ length: 24 }, (_, h) => {
              const v = cells[row * 24 + h] ?? 0;
              const opacity = v > 0 ? 0.15 + (v / peak) * 0.85 : 0.06;
              return (
                <span
                  key={h}
                  className="heat-cell"
                  title={`${WD_LONG[row]} ${hourLabel(h)}: ${v}`}
                  style={{ background: `rgba(212, 255, 85, ${opacity})` }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function peakFromHeatmap(cells: number[]) {
  let best = 0;
  let bestV = 0;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] > bestV) {
      bestV = cells[i];
      best = i;
    }
  }
  if (!bestV) return null;
  const wd = Math.floor(best / 24);
  const h = best % 24;
  return { wd, h, count: bestV };
}

export function HeatmapSlide({ data, viewerName }: SlideProps) {
  const cells = data.heatmap;
  if (!cells?.length || !cells.some((n) => n > 0)) return null;

  const max = Math.max(...cells);
  const peak = peakFromHeatmap(cells);
  const you = data.participants.find((p) => p.name === viewerName);
  const yourPeak = you
    ? [...you.hours].map((n, h) => [h, n] as const).sort((a, b) => b[1] - a[1])[0]
    : null;

  return (
    <div className="slide">
      <div className="eyebrow">La fascia oraria</div>
      <h2>
        {peak ? `${WD_LONG[peak.wd]} ${hourLabel(peak.h)}` : "—"}
      </h2>
      <p className="lead">
        {peak
          ? `Il picco del gruppo: ${peak.count} messaggi in quella cella. `
          : ""}
        {yourPeak && yourPeak[1] > 0
          ? `La tua ora personale: ${hourLabel(yourPeak[0])}.`
          : ""}
      </p>
      <HeatmapGrid cells={cells} max={max} />
    </div>
  );
}
