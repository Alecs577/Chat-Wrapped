import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fmt } from "../lib/format";
import { yearsFromMessages } from "../lib/parseWhatsapp";
import { useWrapped } from "../state/WrappedContext";

export function Landing() {
  const { ingestFile, applyYear, parsing, parseCount, error, data, parsed, reset } = useWrapped();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hot, setHot] = useState(false);
  const [ready, setReady] = useState<{ years: string[]; chatName: string } | null>(null);
  const [year, setYear] = useState<string | null>(null);

  useEffect(() => {
    if (!parsed) return;
    setReady({ years: yearsFromMessages(parsed.messages), chatName: parsed.chatName });
  }, [parsed]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const okName = /\.(txt|zip)$/i.test(file.name);
    const okType =
      !file.type ||
      file.type.startsWith("text/") ||
      /zip/i.test(file.type) ||
      file.type === "application/octet-stream";
    if (!okName && !okType) return;
    try {
      await ingestFile(file, (years, chatName) => {
        setReady({ years, chatName });
        setYear(null);
      });
    } catch {
      setReady(null);
    }
  }

  function start() {
    applyYear(year);
    navigate("/show");
  }

  return (
    <div className="landing">
      <header className="topbar">
        <a className="brand" href="#/">
          CHAT WRAPPED <span>✳</span>
        </a>
        {data && (
          <button type="button" className="soft-button" onClick={() => navigate("/recap")}>
            Torna al recap
          </button>
        )}
      </header>
      <main className="wrap landing-hero">
        <div>
          <div className="eyebrow">Esportazione WhatsApp · tutto nel browser</div>
          <h1>
            Il wrapped
            <br />
            <em>della chat</em>
          </h1>
          <p className="hero-copy">
            WhatsApp ti dà uno zip con il .txt dentro: trascinalo così com’è. Ne esce uno show a slide, poi un recap da
            esplorare con gli amici. Il file non viene inviato da nessuna parte.
          </p>
          <details className="howto">
            <summary>Come esportare la chat (senza media)</summary>
            <ol>
              <li>Apri il gruppo o la chat su WhatsApp.</li>
              <li>Menù → Altro / Chat → Esporta chat.</li>
              <li>Scegli «Senza file» o «Without media»: lo zip resta piccolo.</li>
              <li>Trascina qui lo zip (o il .txt se l’hai già scompattato). Android e iPhone vanno entrambi bene.</li>
            </ol>
          </details>
        </div>
        <div
          className={`dropzone${hot ? " hot" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setHot(true);
          }}
          onDragLeave={() => setHot(false)}
          onDrop={(e) => {
            e.preventDefault();
            setHot(false);
            void onFile(e.dataTransfer.files[0]);
          }}
        >
          <div>
            <h2>{parsing ? "Sto contando." : ready ? ready.chatName : "Trascina lo zip"}</h2>
            {parsing && (
              <p>
                Messaggi riconosciuti: <b className="parse-meter">{fmt(parseCount)}</b>
              </p>
            )}
            {!parsing && !ready && (
              <p>Oppure clicca e scegli lo zip di WhatsApp. Meglio senza media: serve solo il testo.</p>
            )}
            {ready && !parsing && (
              <>
                <p>Scegli la stagione, poi parte lo show.</p>
                <div className="year-row">
                  <button type="button" className={!year ? "active" : ""} onClick={() => setYear(null)}>
                    Tutta la chat
                  </button>
                  {ready.years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      className={year === y ? "active" : ""}
                      onClick={() => setYear(y)}
                    >
                      {y}
                    </button>
                  ))}
                </div>
                <button type="button" className="solid-button" onClick={start}>
                  Inizia lo show
                </button>
              </>
            )}
            {error && <p className="error-line">{error}</p>}
          </div>
          <div>
            <input
              ref={inputRef}
              id="file-input"
              type="file"
              accept=".zip,.txt,application/zip,text/plain"
              hidden
              onChange={(e) => {
                void onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button type="button" className="upload-button" onClick={() => inputRef.current?.click()}>
              {ready ? "＋ Un’altra chat" : "＋ Scegli un file"}
            </button>
            {ready && (
              <button
                type="button"
                className="ghost-button"
                style={{ marginLeft: 12 }}
                onClick={() => {
                  reset();
                  setReady(null);
                }}
              >
                Annulla
              </button>
            )}
            <p className="privacy-note">
              Analisi locale. Nessun account, nessun server, nessun URL pubblico del wrapped altrui.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
