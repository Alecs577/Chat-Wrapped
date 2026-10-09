import { fmt } from "../lib/format";
import type { SlideProps } from "./types";

export function EmojiSlide({ data, viewerName }: SlideProps) {
  const you = data.participants.find((p) => p.name === viewerName);
  return (
    <div className="slide">
      <div className="eyebrow">La colonna sonora</div>
      <h2>Ma in emoji.</h2>
      <div className="emoji-stage">
        {data.emojis.slice(0, 8).map(([e, n]) => (
          <div className="emoji-bubble" key={e}>
            <b>{e}</b>
            <span>{fmt(n)}</span>
          </div>
        ))}
      </div>
      <p className="lead">
        {data.emojis[0] ? `${data.emojis[0][0]} ha fatto gli straordinari.` : "Nessuna emoji rilevata."}
        {you?.topEmoji ? ` La tua firma: ${you.topEmoji}.` : ""}
      </p>
    </div>
  );
}
