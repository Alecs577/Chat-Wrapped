import { fmt } from "../lib/format";
import type { SlideProps } from "./types";

export function DictionarySlide({ data, viewerName }: SlideProps) {
  const word = data.words[0];
  const bigram = data.bigrams[0];
  const you = data.participants.find((p) => p.name === viewerName);

  return (
    <div className="slide">
      <div className="eyebrow">Il dizionario delle urgenze</div>
      <h2>{word ? `“${word[0]}”` : "Poche parole"}</h2>
      <p className="lead">
        {word ? `Ripetuta ${fmt(word[1])} volte. ` : "Il testo utile era scarso. "}
        {bigram ? `La coppia più insistente: “${bigram[0]}” (${fmt(bigram[1])}×).` : ""}
        {you?.topWord ? ` La tua parola in loop: “${you.topWord}”.` : ""}
      </p>
    </div>
  );
}
