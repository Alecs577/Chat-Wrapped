import { CountUp } from "../components/CountUp";
import { dateIt } from "../lib/format";
import type { SlideProps } from "./types";

export function PeakDaySlide({ data }: SlideProps) {
  const [day, count] = data.peakDay;
  return (
    <div className="slide">
      <div className="eyebrow">La giornata da record</div>
      <h2>{day !== "—" ? dateIt(day) : "—"}</h2>
      <div className="big-stat">
        <CountUp value={count} />
      </div>
      <p className="lead">messaggi in un solo giorno. Qualcuno, da qualche parte, ha messo il telefono a faccia in giù.</p>
    </div>
  );
}
