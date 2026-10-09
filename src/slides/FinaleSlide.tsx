import { fmt, monthLabel } from "../lib/format";
import type { SlideProps } from "./types";

export function FinaleSlide({ data, onRecap, onDownloadCover, onShareLink }: SlideProps) {
  const top = data.participants[0];
  const peakMonth = [...data.months].sort((a, b) => b[1] - a[1])[0];
  return (
    <div className="slide">
      <div className="eyebrow">Il verdetto</div>
      <h2>{fmt(data.total)} messaggi per decidere, probabilmente, dove vedersi.</h2>
      <p className="lead">
        {top ? `${top.name} ha guidato la classifica. ` : ""}
        {peakMonth ? `${monthLabel(peakMonth[0])} è stato il mese più rumoroso. ` : ""}
        {data.emojis[0] ? `${data.emojis[0][0]} ha fatto gli straordinari. ` : ""}
        Ora puoi esplorare i numeri, o portare via la copertina.
      </p>
      <div className="share-row">
        <button type="button" className="solid-button" onClick={onShareLink}>
          Copia link per gli amici
        </button>
        <button type="button" className="soft-button" onClick={onRecap}>
          Esplora il recap
        </button>
        <button type="button" className="soft-button" onClick={onDownloadCover}>
          Scarica la copertina
        </button>
      </div>
    </div>
  );
}
