import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { loadWrapped } from "../lib/shareStore";
import { useWrapped } from "../state/WrappedContext";

export function Shared() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hydrate } = useWrapped();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Link incompleto.");
      return;
    }
    let cancelled = false;
    void loadWrapped(id)
      .then((data) => {
        if (cancelled) return;
        hydrate(data, null, id);
        navigate("/show", { replace: true });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Link non valido.");
      });
    return () => {
      cancelled = true;
    };
  }, [hydrate, id, navigate]);

  return (
    <div className="landing">
      <header className="topbar">
        <Link className="brand" to="/">
          CHAT WRAPPED <span>✳</span>
        </Link>
      </header>
      <main className="wrap landing-hero">
        <div>
          <div className="eyebrow">Wrapped condiviso</div>
          <h1>
            {error ? "Link" : "Un attimo."}
            <br />
            <em>{error ? "non valido" : "Apro lo show"}</em>
          </h1>
          <p className="hero-copy">
            {error ?? "Sto recuperando le statistiche. Lo zip originale non viaggia con il link."}
          </p>
          {error && (
            <Link className="solid-button" to="/" style={{ marginTop: 18, display: "inline-flex" }}>
              Carica una chat
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
