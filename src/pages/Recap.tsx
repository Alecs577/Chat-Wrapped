import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AwardShareCard, CoverShareCard, RankShareCard } from "../components/ShareCards";
import { toast } from "../components/Toast";
import { participantAwards } from "../lib/awards";
import { dateIt, fmt, hourLabel, monthLabel, monthNames } from "../lib/format";
import { downloadNode, slug } from "../lib/share";
import { useWrapped } from "../state/WrappedContext";
import type { Participant } from "../lib/types";

export function Recap() {
  const { data, viewerName, ingestFile } = useWrapped();
  const navigate = useNavigate();
  const [allRank, setAllRank] = useState(false);
  const [query, setQuery] = useState("");
  const [chartYear, setChartYear] = useState<string | null>(null);
  const [selected, setSelected] = useState<Participant | null>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const rankRef = useRef<HTMLDivElement>(null);
  const awardRef = useRef<HTMLDivElement>(null);
  const awards = useMemo(
    () =>
      data
        ? participantAwards(data).filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
        : [],
    [data, query]
  );

  if (!data) return null;

  const peakMonth = [...data.months].sort((a, b) => b[1] - a[1])[0] || ["—", 0];
  const top = data.participants[0];
  const years = [...new Set(data.months.map((m) => m[0].slice(0, 4)))];
  const year = chartYear ?? years[years.length - 1] ?? "";
  const monthItems = data.months.filter(([m]) => m.startsWith(year));
  const monthMax = Math.max(1, ...monthItems.map((x) => x[1]));
  const monthPeak = monthItems.reduce((a, b) => (a[1] > b[1] ? a : b), ["", 0]);
  const shown = allRank ? data.participants : data.participants.slice(0, 8);
  const maxMsg = data.participants[0]?.messages || 1;
  const focus = selected ?? top;
  const peakHour = [...(focus?.hours ?? [])].map((n, h) => [h, n] as const).sort((a, b) => b[1] - a[1])[0];

  async function copyVerdict() {
    if (!data) return;
    const text = `${fmt(data.total)} messaggi. ${top?.name ?? "—"} in testa con ${fmt(top?.messages ?? 0)}. Mese record: ${peakMonth[0] !== "—" ? monthLabel(peakMonth[0]) : "—" } (${fmt(peakMonth[1])}). Emoji più usata: ${(data.emojis[0] || ["—"])[0]}. Una chat con la puntualità di un’orchestra e il volume di uno stadio.`;
    try {
      await navigator.clipboard.writeText(text);
      toast("Verdetto copiato");
    } catch {
      toast("Seleziona il verdetto e copialo dal browser");
    }
  }

  async function saveCard(kind: "cover" | "rank" | "award") {
    if (!data) return;
    const node = kind === "cover" ? coverRef.current : kind === "rank" ? rankRef.current : awardRef.current;
    if (!node) return;
    const name = `${slug(data.chatName)}-${kind}.png`;
    try {
      await downloadNode(node, name);
      toast("Card scaricata");
    } catch {
      toast("Download non riuscito");
    }
  }

  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/">
          CHAT WRAPPED <span>✳</span>
        </Link>
        <nav aria-label="Navigazione">
          <button type="button" onClick={() => document.getElementById("classifica")?.scrollIntoView({ behavior: "smooth" })}>
            La chat
          </button>
          <button type="button" onClick={() => document.getElementById("linguaggio")?.scrollIntoView({ behavior: "smooth" })}>
            Il dizionario
          </button>
          <button type="button" onClick={() => document.getElementById("ritmo")?.scrollIntoView({ behavior: "smooth" })}>
            Il ritmo
          </button>
          <button type="button" onClick={() => document.getElementById("premi")?.scrollIntoView({ behavior: "smooth" })}>
            I premi
          </button>
        </nav>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="soft-button" onClick={() => navigate("/show")}>
            Rivedi lo show
          </button>
          <label className="upload-button" htmlFor="recap-file">
            ＋ Carica un’altra chat
          </label>
          <input
            id="recap-file"
            type="file"
            accept=".zip,.txt,application/zip,text/plain"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                await ingestFile(file);
                navigate("/");
              } catch {
                toast("File non riconosciuto");
              }
            }}
          />
        </div>
      </header>
      <main className="wrap">
        <section className="hero" id="inizio">
          <div>
            <div className="eyebrow">
              ✳ Una chat. Troppe notifiche. {data.participants.length} protagonisti.
            </div>
            <h1>
              {data.chatName}
              <br />
              <em>wrapped</em>
            </h1>
            <p className="hero-copy">
              Il recap ufficiale: classifica, dizionario, ritmo e premi. Clicca un nome per vederne le abitudini.
            </p>
            <div className="range">
              ARCHIVIO DAL {dateIt(data.first).toUpperCase()} AL {dateIt(data.last).toUpperCase()}
            </div>
          </div>
          <div className="cover" aria-label="Copertina del wrapped">
            <div className="cover-top">
              <span>La stagione delle notifiche</span>
              <span>01 / 01</span>
            </div>
            <div>
              <div className="cover-stamp">
                CHAT
                <br />
                ON.
              </div>
              <div className="cover-date">
                {fmt(data.total)} messaggi
                <br />
                {data.chatName}
              </div>
            </div>
            <div className="cover-bottom">
              <span>Chat Wrapped</span>
              <span>WRAPPED ✳</span>
            </div>
          </div>
        </section>

        <div className="stats">
          <div className="stat">
            <strong>{fmt(data.total)}</strong>
            <span>messaggi nel periodo</span>
          </div>
          <div className="stat">
            <strong>{data.participants.length}</strong>
            <span>partecipanti che hanno scritto</span>
          </div>
          <div className="stat">
            <strong>{fmt(data.omittedMedia)}</strong>
            <span>segnaposto «media omessi»</span>
          </div>
        </div>

        <section className="section" id="classifica">
          <div className="section-head">
            <div>
              <div className="kicker">01 / Chi tiene acceso il gruppo</div>
              <h2>
                Il pollice
                <br />
                più veloce.
              </h2>
            </div>
            <p className="section-intro">
              Clicca una riga per aprire la scheda personale. Ogni barra è una piccola richiesta di ferie per WhatsApp.
            </p>
          </div>
          <div className="rank-layout">
            <div>
              <div className="rank-list">
                {shown.map((p, i) => (
                  <button
                    key={p.name}
                    type="button"
                    className={`rank-row${focus?.name === p.name ? " active" : ""}`}
                    onClick={() => setSelected(p)}
                  >
                    <span className="rank-no">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="rank-name">{p.name}</div>
                      <div className="rank-bar">
                        <i style={{ width: `${Math.max(2, (p.messages / maxMsg) * 100)}%` }} />
                      </div>
                    </div>
                    <span className="rank-value">{fmt(p.messages)}</span>
                  </button>
                ))}
              </div>
              {data.participants.length > 8 && (
                <div className="toggle">
                  <button type="button" className="ghost-button" onClick={() => setAllRank((v) => !v)}>
                    {allRank ? "Nascondi gli altri ↑" : "Mostra tutti i partecipanti ↓"}
                  </button>
                </div>
              )}
            </div>
            {focus && (
              <aside className="spotlight">
                <div>
                  <small>{focus === top ? "Il centralino umano" : "Scheda personale"}</small>
                  <h3>{focus.name}</h3>
                </div>
                <div className="person-meta">
                  <strong>{fmt(focus.messages)} messaggi</strong>
                  <p>
                    {focus.topWord ? `Parola in loop: “${focus.topWord}” (${fmt(focus.topWordCount)}×). ` : ""}
                    {focus.topEmoji ? `Firma: ${focus.topEmoji} × ${fmt(focus.topEmojiCount)}. ` : ""}
                    Media {fmt(focus.avgChars)} caratteri. {fmt(focus.uniqueWords)} parole distinte.
                    {focus.omittedMedia ? ` ${fmt(focus.omittedMedia)} media omessi.` : ""}
                    {peakHour && peakHour[1] > 0 ? ` Ora preferita: ${hourLabel(peakHour[0])}.` : ""}
                    {` ${fmt(focus.nightMessages)} messagg${focus.nightMessages === 1 ? "io" : "i"} nel turno 00–05.`}
                    {` ${fmt(focus.starters)} riapertur${focus.starters === 1 ? "a" : "e"} dopo un buco di 4 ore.`}
                  </p>
                </div>
              </aside>
            )}
          </div>
        </section>

        <section className="section" id="linguaggio">
          <div className="section-head">
            <div>
              <div className="kicker">02 / La lingua ufficiale</div>
              <h2>
                Il dizionario
                <br />
                delle urgenze.
              </h2>
            </div>
            <p className="section-intro">
              Parole, emoji e frasi che ricorrono davvero. I segnaposto dei media sono esclusi dalle parole.
            </p>
          </div>
          <div className="language-grid">
            <div className="panel">
              <h3>Parole-tormentone</h3>
              <div className="word-cloud">
                {data.words.slice(0, 14).map(([w, n]) => (
                  <span className="word" key={w}>
                    {w}
                    <small>{fmt(n)}×</small>
                  </span>
                ))}
                {!data.words.length && <span className="empty">Nessun testo utile trovato.</span>}
              </div>
              <p className="footnote">Contate nei messaggi testuali, dopo aver tolto parole comuni.</p>
            </div>
            <div className="panel">
              <h3>La colonna sonora, ma in emoji</h3>
              <div className="emoji-row">
                {data.emojis.slice(0, 10).map(([e, n]) => (
                  <div className="emoji-card" key={e}>
                    <b>{e}</b>
                    <span>{fmt(n)} volte</span>
                  </div>
                ))}
                {!data.emojis.length && <span className="empty">Nessuna emoji rilevata.</span>}
              </div>
            </div>
          </div>
          <div className="panel" style={{ marginTop: 20 }}>
            <h3>Argomenti ricorrenti · le tracce nel testo</h3>
            <div className="phrases">
              {data.phraseGroups.map((g) => (
                <div className="phrase" key={g.title}>
                  <strong>{g.title}</strong>
                  <span>
                    {g.items.map(([w, n]) => (
                      <span key={w}>
                        {w} · {fmt(n)}
                        <br />
                      </span>
                    ))}
                  </span>
                </div>
              ))}
              {!data.phraseGroups.length && <span className="empty">Nessuna frase ricorrente.</span>}
            </div>
            <p className="footnote">
              Raggruppati dalle coppie di parole più ripetute: tracce lessicali, non ricostruzioni dei media mancanti.
            </p>
            <div className="records">
              <article className="record">
                <span className="record-label">La frase copia-incolla</span>
                <div>
                  <div className="record-value">“{data.repeatedPhrase.text}”</div>
                  <div className="record-note">
                    Ripetuta {fmt(data.repeatedPhrase.count)} volte, normalizzando maiuscole e punteggiatura.
                  </div>
                </div>
              </article>
              <article className="record">
                <span className="record-label">Il papiro</span>
                <div>
                  <div className="record-value">{fmt(data.longestMessage.characters)} caratteri</div>
                  <div className="record-note">
                    Messaggio più lungo: {data.longestMessage.name}. Il testo non viene ripubblicato qui.
                  </div>
                </div>
              </article>
              <article className="record">
                <span className="record-label">Il messaggio più reactato</span>
                <div>
                  <div className="record-value">Dato non presente</div>
                  <div className="record-note">
                    {data.reactionAnnotations > 0
                      ? "Il file contiene possibili annotazioni, ma non un conteggio attribuibile con certezza."
                      : "Questa esportazione .txt non associa conteggi di reazione ai messaggi."}{" "}
                    Nessun podio inventato.
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="ritmo">
          <div className="section-head">
            <div>
              <div className="kicker">03 / Il calendario del caos</div>
              <h2>
                Quando il gruppo
                <br />
                va in onda.
              </h2>
            </div>
            <p className="section-intro">
              Picchi dal {dateIt(data.first)} al {dateIt(data.last)}. Se una data sembra strana, è il file a parlare.
            </p>
          </div>
          <div className="rhythm-layout">
            <div className="chart-panel">
              <div className="chart-title">
                <h3>Messaggi al mese</h3>
                <div className="year-filters">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      className={y === year ? "active" : ""}
                      onClick={() => setChartYear(y)}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
              <div className="month-chart">
                {monthItems.map(([m, n]) => (
                  <div
                    key={m}
                    className={`month-col${m === monthPeak[0] ? " peak" : ""}`}
                    title={`${monthNames[Number(m.slice(5)) - 1]} ${m.slice(0, 4)}: ${fmt(n)} messaggi`}
                  >
                    <span className="month-val">{fmt(n)}</span>
                    <i className="month-bar" style={{ height: `${Math.max(2, (n / monthMax) * 100)}%` }} />
                    <span className="month-label">{monthNames[Number(m.slice(5)) - 1]}</span>
                  </div>
                ))}
                {!monthItems.length && <span className="empty">Nessun mese con dati.</span>}
              </div>
              <div className="footnote">
                Mese più movimentato: <b>{peakMonth[0] !== "—" ? monthLabel(peakMonth[0]) : "—"}</b>, con{" "}
                {fmt(peakMonth[1])} messaggi.
              </div>
            </div>
            <div className="side-charts">
              <div className="chart-panel">
                <div className="chart-title">
                  <h3>Giorni della settimana</h3>
                </div>
                <Bars items={data.weekdays} />
              </div>
              <div className="chart-panel">
                <div className="chart-title">
                  <h3>Ora del giorno</h3>
                </div>
                <Bars
                  items={[...data.hours]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([h, n]) => [hourLabel(h), n])}
                />
              </div>
            </div>
          </div>
          <div className="callout">
            <div>
              <small>La giornata da record</small>
              <strong>{data.peakDay[0] !== "—" ? dateIt(data.peakDay[0]) : "—"}</strong>
            </div>
            <span>{fmt(data.peakDay[1])} messaggi</span>
          </div>
        </section>

        <section className="section" id="premi">
          <div className="section-head">
            <div>
              <div className="kicker">04 / Riconoscimenti non richiesti</div>
              <h2>
                Una statuetta
                <br />a testa.
              </h2>
            </div>
            <p className="section-intro">
              Premi sulle statistiche personali: gufo, organizzatore, emoji, o comparsa. Nessuna giuria imparziale era
              disponibile.
            </p>
          </div>
          <div className="award-tools">
            <input
              type="search"
              placeholder="Cerca un partecipante…"
              aria-label="Cerca un partecipante"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span>
              {awards.length} / {data.participants.length}
            </span>
          </div>
          <div className="awards-grid">
            {awards.map((a) => (
              <article className="award" key={a.name}>
                <div className="award-emoji">{a.emoji}</div>
                <div>
                  <h3>
                    {a.title} · {a.name}
                  </h3>
                  <p>{a.description}</p>
                </div>
              </article>
            ))}
            {!awards.length && <div className="empty">Nessun partecipante trovato.</div>}
          </div>
        </section>

        <section className="finale">
          <small>Il verdetto finale</small>
          <h2>
            {fmt(data.total)} messaggi per decidere, probabilmente, dove vedersi.
          </h2>
          <p>
            {top ? `${top.name} ha guidato la classifica, ` : ""}
            {peakMonth[0] !== "—" ? `${monthLabel(peakMonth[0])} è stato il mese da record, ` : ""}e{" "}
            {(data.emojis[0] || ["😂"])[0]} ha fatto gli straordinari. In sintesi: una chat con la puntualità di
            un’orchestra e il volume di uno stadio.
          </p>
          <div className="share-row">
            <button className="soft-button" type="button" onClick={() => void copyVerdict()}>
              Copia il verdetto
            </button>
            <button className="soft-button" type="button" onClick={() => void saveCard("cover")}>
              Scarica copertina
            </button>
            <button className="soft-button" type="button" onClick={() => void saveCard("rank")}>
              Scarica top 5
            </button>
            <button className="soft-button" type="button" onClick={() => void saveCard("award")}>
              Scarica premio
            </button>
            <button className="soft-button" type="button" onClick={() => navigate("/show")}>
              Rivedi lo show
            </button>
          </div>
        </section>
        <footer className="data-note">
          <div>
            <b>Metodo, senza magia.</b> Analisi fatta solo sulle righe datate riconosciute nell’esportazione. Le parole
            sono ricavate dal testo visibile; i messaggi eliminati e i media non leggibili non vengono ricostruiti. Il
            file non lascia il browser.
          </div>
          <span>
            ARCHIVIO: {fmt(data.total)} MESSAGGI · {data.anomalies} DATE FUORI INTERVALLO ESCLUSE DAI GRAFICI
            {viewerName ? ` · SEI ${viewerName.toUpperCase()}` : ""}
          </span>
        </footer>
      </main>
      <div className="offscreen-share" aria-hidden="true">
        <CoverShareCard ref={coverRef} data={data} />
        <RankShareCard ref={rankRef} data={data} />
        <AwardShareCard ref={awardRef} data={data} viewerName={viewerName} />
      </div>
    </>
  );
}

function Bars({ items }: { items: [string, number][] }) {
  const max = Math.max(1, ...items.map((x) => x[1]));
  return (
    <div className="bars">
      {items.map(([label, n], i) => (
        <div className={`bar-row${i === 0 ? " best" : ""}`} key={label}>
          <span className="bar-label">{label}</span>
          <span className="bar-track">
            <i style={{ width: `${(n / max) * 100}%` }} />
          </span>
          <span className="bar-value">{fmt(n)}</span>
        </div>
      ))}
    </div>
  );
}
