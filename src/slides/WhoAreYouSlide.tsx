import type { SlideProps } from "./types";

export function WhoAreYouSlide({ data, viewerName, onViewerName, onNext }: SlideProps) {
  return (
    <div className="slide">
      <div className="eyebrow">Micro-scelta</div>
      <h2>Tu chi sei?</h2>
      <p className="lead">
        Opzionale. Se ti riconosci, lo show ti dice a che punto sei in classifica. Altrimenti resta sul gruppo.
      </p>
      <div className="name-grid">
        {data.participants.map((p) => (
          <button
            key={p.name}
            type="button"
            className={`name-chip${viewerName === p.name ? " active" : ""}`}
            onClick={() => {
              onViewerName(p.name);
              onNext();
            }}
          >
            {p.name}
          </button>
        ))}
      </div>
      <button type="button" className="ghost-button" onClick={() => { onViewerName(null); onNext(); }}>
        Salta, resta sul gruppo →
      </button>
    </div>
  );
}
