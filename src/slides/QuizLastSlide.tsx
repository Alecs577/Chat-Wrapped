import { useMemo, useState } from "react";
import { dateIt } from "../lib/format";
import type { SlideProps } from "./types";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function QuizLastSlide({ data }: SlideProps) {
  const answer = data.lastMessage;
  const options = useMemo(() => {
    if (!answer?.name) return [];
    const others = data.participants.filter((p) => p.name !== answer.name).slice(0, 8);
    const picked = shuffle(others).slice(0, 3);
    return shuffle([answer.name, ...picked.map((p) => p.name)]);
  }, [data, answer?.name]);
  const [guess, setGuess] = useState<string | null>(null);
  if (!answer?.name || data.participants.length < 2) return null;
  const revealed = guess !== null;

  return (
    <div className="slide">
      <div className="eyebrow">Quiz</div>
      <h2>Chi ha l’ultima parola?</h2>
      <p className="lead">Ultimo messaggio datato: {dateIt(answer.at)}. Indovina chi ha chiuso.</p>
      <div className="quiz-grid">
        {options.map((name) => {
          const correct = name === answer.name;
          const cls = revealed ? (correct ? " correct" : guess === name ? " wrong" : "") : "";
          return (
            <button
              key={name}
              type="button"
              className={`quiz-opt${cls}`}
              disabled={revealed}
              onClick={() => setGuess(name)}
            >
              {name}
            </button>
          );
        })}
      </div>
      {revealed && (
        <p className="lead">
          {guess === answer.name ? "Esatto." : "No."} {answer.name} ha avuto l’ultima parola il {dateIt(answer.at)}.
        </p>
      )}
    </div>
  );
}
