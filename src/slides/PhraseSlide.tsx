import { fmt } from "../lib/format";
import type { SlideProps } from "./types";

export function PhraseSlide({ data }: SlideProps) {
  const rp = data.repeatedPhrase;
  const lm = data.longestMessage;
  return (
    <div className="slide">
      <div className="eyebrow">Copia, incolla, papiro</div>
      <h2>{rp.text !== "—" ? `“${rp.text}”` : "Niente ritornelli"}</h2>
      <p className="lead">
        {rp.count > 1 ? `La frase più ripetuta: ${fmt(rp.count)} volte, ignorando maiuscole e punteggiatura. ` : ""}
        {lm.characters
          ? `Il papiro è di ${lm.name}: ${fmt(lm.characters)} caratteri. Il testo non viene ripubblicato qui.`
          : ""}
      </p>
    </div>
  );
}
