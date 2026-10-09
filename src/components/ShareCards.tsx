import { forwardRef } from "react";
import { flashAwards } from "../lib/awards";
import { dateIt, fmt } from "../lib/format";
import type { WrappedData } from "../lib/types";

export const CoverShareCard = forwardRef<HTMLDivElement, { data: WrappedData }>(function CoverShareCard(
  { data },
  ref
) {
  return (
    <div ref={ref} className="share-card" style={{ width: 720, minHeight: 900, padding: 48 }}>
      <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase" }}>
        Chat Wrapped
      </div>
      <div className="stamp" style={{ marginTop: 40 }}>
        CHAT
        <br />
        ON.
      </div>
      <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.06em", marginTop: 28 }}>
        {data.chatName}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, marginTop: 18 }}>
        {fmt(data.total)} messaggi
        <br />
        {dateIt(data.first)} — {dateIt(data.last)}
      </div>
      <div style={{ marginTop: "auto", fontWeight: 900, letterSpacing: "0.12em" }}>WRAPPED ✳</div>
    </div>
  );
});

export const RankShareCard = forwardRef<HTMLDivElement, { data: WrappedData }>(function RankShareCard(
  { data },
  ref
) {
  return (
    <div ref={ref} className="share-card" style={{ width: 720, minHeight: 900, padding: 48, background: "#d6c4ff" }}>
      <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase" }}>
        Top 5
      </div>
      <div className="stamp" style={{ margin: "28px 0 36px" }}>
        POLLICI
      </div>
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 18 }}>
        {data.participants.slice(0, 5).map((p, i) => (
          <li key={p.name} style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 28 }}>
            <span>
              {String(i + 1).padStart(2, "0")} {p.name}
            </span>
            <span>{fmt(p.messages)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
});

export const AwardShareCard = forwardRef<HTMLDivElement, { data: WrappedData; viewerName: string | null }>(
  function AwardShareCard({ data, viewerName }, ref) {
    const award =
      flashAwards(data).find((a) => a.name === viewerName) ||
      flashAwards(data)[0] || { title: "Wrapped", name: data.chatName, emoji: "✳", description: "" };
    return (
      <div ref={ref} className="share-card" style={{ width: 720, minHeight: 900, padding: 48, background: "#ff6845" }}>
        <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Premio personale
        </div>
        <div style={{ fontSize: 72, marginTop: 48 }}>{award.emoji}</div>
        <div className="stamp" style={{ marginTop: 20 }}>
          {award.title}
        </div>
        <div style={{ fontSize: 36, fontWeight: 900, marginTop: 18 }}>{award.name}</div>
        <p style={{ fontSize: 22, fontWeight: 700, maxWidth: 520 }}>{award.description}</p>
      </div>
    );
  }
);
