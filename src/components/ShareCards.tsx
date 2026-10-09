import { forwardRef, type CSSProperties } from "react";
import { flashAwards } from "../lib/awards";
import { dateIt, fmt } from "../lib/format";
import type { WrappedData } from "../lib/types";

export const CARD_BG = {
  cover: "#d4ff55",
  rank: "#d6c4ff",
  award: "#ff6845",
} as const;

const ink = "#181817";

function cardStyle(background: string): CSSProperties {
  return {
    width: 720,
    height: 900,
    boxSizing: "border-box",
    padding: 56,
    background,
    color: ink,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    fontFamily: "Arial, Helvetica, sans-serif",
    borderRadius: 0,
  };
}

export const CoverShareCard = forwardRef<HTMLDivElement, { data: WrappedData }>(function CoverShareCard(
  { data },
  ref
) {
  return (
    <div ref={ref} data-share-kind="cover" style={cardStyle(CARD_BG.cover)}>
      <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase" }}>
        Chat Wrapped
      </div>
      <div>
        <div style={{ fontSize: 92, fontWeight: 1000, lineHeight: 0.8, letterSpacing: "-0.08em" }}>
          CHAT
          <br />
          ON.
        </div>
        <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.05em", marginTop: 28 }}>{data.chatName}</div>
        <div style={{ fontSize: 22, fontWeight: 900, marginTop: 16 }}>
          {fmt(data.total)} messaggi
          <br />
          {dateIt(data.first)} — {dateIt(data.last)}
        </div>
      </div>
      <div style={{ fontWeight: 900, letterSpacing: "0.12em" }}>WRAPPED ✳</div>
    </div>
  );
});

export const RankShareCard = forwardRef<HTMLDivElement, { data: WrappedData }>(function RankShareCard(
  { data },
  ref
) {
  return (
    <div ref={ref} data-share-kind="rank" style={cardStyle(CARD_BG.rank)}>
      <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase" }}>
        Top 5
      </div>
      <div>
        <div style={{ fontSize: 72, fontWeight: 1000, lineHeight: 0.85, letterSpacing: "-0.08em", marginBottom: 36 }}>
          POLLICI
        </div>
        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 22 }}>
          {data.participants.slice(0, 5).map((p, i) => (
            <li
              key={p.name}
              style={{ display: "flex", justifyContent: "space-between", gap: 16, fontWeight: 900, fontSize: 28 }}
            >
              <span>
                {String(i + 1).padStart(2, "0")} {p.name}
              </span>
              <span>{fmt(p.messages)}</span>
            </li>
          ))}
        </ol>
      </div>
      <div style={{ fontWeight: 900, letterSpacing: "0.12em" }}>CHAT WRAPPED ✳</div>
    </div>
  );
});

export const AwardShareCard = forwardRef<HTMLDivElement, { data: WrappedData; viewerName: string | null }>(
  function AwardShareCard({ data, viewerName }, ref) {
    const award =
      flashAwards(data).find((a) => a.name === viewerName) ||
      flashAwards(data)[0] || { title: "Wrapped", name: data.chatName, emoji: "✳", description: "" };
    return (
      <div ref={ref} data-share-kind="award" style={cardStyle(CARD_BG.award)}>
        <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Premio
        </div>
        <div>
          <div style={{ fontSize: 72 }}>{award.emoji}</div>
          <div style={{ fontSize: 56, fontWeight: 1000, lineHeight: 0.9, letterSpacing: "-0.07em", marginTop: 20 }}>
            {award.title}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 18 }}>{award.name}</div>
          <p style={{ fontSize: 20, fontWeight: 700, maxWidth: 520, lineHeight: 1.35 }}>{award.description}</p>
        </div>
        <div style={{ fontWeight: 900, letterSpacing: "0.12em" }}>CHAT WRAPPED ✳</div>
      </div>
    );
  }
);
