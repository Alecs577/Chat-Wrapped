import { useState } from "react";
import { funFacts } from "../lib/funFacts";
import type { SlideProps } from "./types";

export function FunFactsSlide({ data }: SlideProps) {
  const facts = funFacts(data);
  const [i, setI] = useState(0);
  if (!facts.length) return null;

  const fact = facts[i % facts.length];

  return (
    <div className="slide">
      <div className="eyebrow">{fact.kicker}</div>
      <h2 className="fun-fact">{fact.title}</h2>
      <p className="lead">{fact.lead}</p>
      {facts.length > 1 && (
        <button
          type="button"
          className="solid-button"
          onClick={() => setI((v) => (v + 1) % facts.length)}
        >
          Un altro fatto →
        </button>
      )}
    </div>
  );
}
