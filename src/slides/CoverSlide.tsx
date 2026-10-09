import { CountUp } from "../components/CountUp";
import { dateIt } from "../lib/format";
import type { SlideProps } from "./types";

export function CoverSlide({ data }: SlideProps) {
  return (
    <div className="slide">
      <div className="eyebrow">Una chat. Troppe notifiche.</div>
      <h2>{data.chatName}</h2>
      <div className="big-stat">
        <CountUp value={data.total} />
      </div>
      <p className="lead">
        messaggi dal {dateIt(data.first)} al {dateIt(data.last)}.
        {data.selectedYear ? ` Stagione ${data.selectedYear}.` : " Tutto l’archivio, senza filtri."}
      </p>
    </div>
  );
}
