import { flashAwards } from "../lib/awards";
import type { SlideProps } from "./types";

export function AwardsSlide({ data }: SlideProps) {
  const awards = flashAwards(data);
  return (
    <div className="slide">
      <div className="eyebrow">Statuette non richieste</div>
      <h2>Tre premi lampo.</h2>
      <div className="award-flash">
        {awards.map((a) => (
          <article className="award-card" key={a.name}>
            <div className="award-emoji">{a.emoji}</div>
            <div>
              <h3>
                {a.title} · {a.name}
              </h3>
              <p>{a.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
