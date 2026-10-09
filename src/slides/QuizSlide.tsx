import { useMemo, useState } from "react";
import { fmt } from "../lib/format";
import type { SlideProps } from "./types";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function QuizSlide({ data }: SlideProps) {
  const leader = data.participants[0];
  const options = useMemo(() => {
    if (!leader) return [];
    const others = data.participants.slice(1, 8);
    const picked = shuffle(others).slice(0, 3);
    return shuffle([leader, ...picked]);
  }, [data, leader]);
  const [guess, setGuess] = useState<string | null>(null);
  if (!leader) return null;
  const revealed = guess !== null;

  return (
    <div className="slide">
      <div className="eyebrow">Quiz</div>
      <h2>Chi ha scritto di più?</h2>
      <p className="lead">Quattro nomi, un solo centralino. Tap e poi la verità.</p>
      <div className="quiz-grid">
        {options.map((p) => {
          const correct = p.name === leader.name;
          const cls = revealed ? (correct ? " correct" : guess === p.name ? " wrong" : "") : "";
          return (
            <button
              key={p.name}
              type="button"
              className={`quiz-opt${cls}`}
              disabled={revealed}
              onClick={() => setGuess(p.name)}
            >
              {p.name}
              {revealed ? ` · ${fmt(p.messages)}` : ""}
            </button>
          );
        })}
      </div>
      {revealed && (
        <p className="lead">
          {guess === leader.name ? "Esatto." : "No."} {leader.name} ha tenuto acceso il gruppo con {fmt(leader.messages)} messaggi.
        </p>
      )}
    </div>
  );
}
