import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { AwardShareCard, CARD_BG, CoverShareCard, RankShareCard } from "../components/ShareCards";
import { toast } from "../components/Toast";
import { participantAwards } from "../lib/awards";
import { dateIt, durationIt, fmt, hourLabel, monthLabel, monthNames, pct } from "../lib/format";
import { HeatmapGrid } from "../slides/HeatmapSlide";
import { downloadNode, slug } from "../lib/share";
import { useWrapped } from "../state/WrappedContext";
import type { Participant } from "../lib/types";

const revealUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
const sectionReveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.08 },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

export function Recap() {
  const { data, viewerName, ingestFile, copyShareLink } = useWrapped();
  const navigate = useNavigate();
  const [allRank, setAllRank] = useState(false);
  const [query, setQuery] = useState("");
  const [downloading, setDownloading] = useState<"cover" | "rank" | "award" | null>(null);
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
    if (!data || downloading) return;
    const node = kind === "cover" ? coverRef.current : kind === "rank" ? rankRef.current : awardRef.current;
    if (!node) return;
    const files = {
      cover: `${slug(data.chatName)}-copertina.png`,
      rank: `${slug(data.chatName)}-top5.png`,
      award: `${slug(data.chatName)}-premio.png`,
    } as const;
    setDownloading(kind);
    try {
      await downloadNode(node, files[kind], CARD_BG[kind]);
      toast("Card scaricata");
    } catch {
      toast("Download non riuscito");
    } finally {
      setDownloading(null);
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
        <motion.section className="hero" id="inizio" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.13 } } }}>
          <div>
            <motion.div className="eyebrow" variants={revealUp}>
              ✳ Una chat. Troppe notifiche. {data.participants.length} protagonisti.
            </motion.div>
            <motion.h1 variants={revealUp}>
              {data.chatName}
              <br />
              <em>wrapped</em>
            </motion.h1>
            <motion.p className="hero-copy" variants={revealUp}>
              Il recap ufficiale: classifica, dizionario, ritmo e premi. Clicca un nome per vederne le abitudini.
            </motion.p>
            <motion.div className="range" variants={revealUp}>
              ARCHIVIO DAL {dateIt(data.first).toUpperCase()} AL {dateIt(data.last).toUpperCase()}
            </motion.div>
          </div>
          <motion.div className="cover" aria-label="Copertina del wrapped" variants={revealUp} whileHover={{ rotate: 0, scale: 1.025 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
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
          </motion.div>
        </motion.section>

        <motion.div className="stats" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
          <motion.div className="stat" variants={revealUp}>
            <strong>{fmt(data.total)}</strong>
            <span>messaggi nel periodo</span>
          </motion.div>
          <motion.div className="stat" variants={revealUp}>
            <strong>{data.participants.length}</strong>
            <span>partecipanti che hanno scritto</span>
          </motion.div>
          <motion.div className="stat" variants={revealUp}>
            <strong>{fmt(data.omittedMedia)}</strong>
            <span>segnaposto «media omessi»</span>
          </motion.div>
          {data.avgPerDay != null && (
            <motion.div className="stat" variants={revealUp}>
              <strong>{fmt(data.avgPerDay)}</strong>
              <span>messaggi/giorno attivo</span>
            </motion.div>
          )}
          {data.longestStreak && data.longestStreak.days >= 2 && (
            <motion.div className="stat" variants={revealUp}>
              <strong>{fmt(data.longestStreak.days)}</strong>
              <span>giorni di fila (streak)</span>
            </motion.div>
          )}
          {data.longestSilence && (
            <motion.div className="stat" variants={revealUp}>
              <strong>{durationIt(data.longestSilence.ms)}</strong>
              <span>silenzio record</span>
            </motion.div>
          )}
        </motion.div>

        <motion.section className="section" id="classifica" {...sectionReveal}>
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
                      <motion.i initial={{ scaleX: 0 }} whileInView={{ scaleX: Math.max(0.02, p.messages / maxMsg) }} viewport={{ once: true }} transition={{ duration: 0.7, delay: Math.min(i * 0.045, 0.35), ease: [0.22, 1, 0.36, 1] }} />
                      </div>
                    </div>
                    <span className="rank-value">
                      {fmt(p.messages)} · {pct(p.messages, data.total)}%
                    </span>
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
              <AnimatePresence mode="wait" initial={false}>
              <motion.aside className="spotlight" key={focus.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
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
                    {focus.questions != null && focus.questions > 0
                      ? ` ${fmt(focus.questions)} messagg${focus.questions === 1 ? "io" : "i"} con «?».`
                      : ""}
                    {focus.doubleTexts != null && focus.doubleTexts > 0
                      ? ` ${fmt(focus.doubleTexts)} raffiche in doppio.`
                      : ""}
                    {focus.medianReplyMs != null
                      ? ` Mediana risposta: ${durationIt(focus.medianReplyMs)}.`
                      : ""}
                  </p>
                </div>
              </motion.aside>
              </AnimatePresence>
            )}
          </div>
        </motion.section>

        <motion.section className="section" id="linguaggio" {...sectionReveal}>
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
        </motion.section>

        <motion.section className="section" id="ritmo" {...sectionReveal}>
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
                    <motion.i className="month-bar" initial={{ scaleY: 0 }} whileInView={{ scaleY: Math.max(0.02, n / monthMax) }} viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }} />
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
          {data.heatmap?.some((n) => n > 0) && (
            <div className="chart-panel" style={{ marginTop: 20 }}>
              <div className="chart-title">
                <h3>Mappa termica · lun–dom × 24h</h3>
              </div>
              <HeatmapGrid cells={data.heatmap} max={Math.max(...data.heatmap)} />
            </div>
          )}
          {(data.longestSilence || data.lastMessage?.name) && (
            <div className="rhythm-callouts">
              {data.longestSilence && (
                <div className="callout">
                  <div>
                    <small>Silenzio record</small>
                    <strong>{durationIt(data.longestSilence.ms)}</strong>
                  </div>
                  <span>
                    Dal {dateIt(data.longestSilence.from)} al {dateIt(data.longestSilence.to)}
                  </span>
                </div>
              )}
              {data.lastMessage?.name && (
                <div className="callout">
                  <div>
                    <small>Ultima parola</small>
                    <strong>{data.lastMessage.name}</strong>
                  </div>
                  <span>{dateIt(data.lastMessage.at)}</span>
                </div>
              )}
            </div>
          )}
        </motion.section>

        <motion.section className="section" id="premi" {...sectionReveal}>
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
              <motion.article className="award" key={a.name} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.4, delay: Math.min(awards.indexOf(a) * 0.035, 0.3) }} whileHover={{ y: -5, borderColor: "#d4ff55" }}>
                <div className="award-emoji">{a.emoji}</div>
                <div>
                  <h3>
                    {a.title} · {a.name}
                  </h3>
                  <p>{a.description}</p>
                </div>
              </motion.article>
            ))}
            {!awards.length && <div className="empty">Nessun partecipante trovato.</div>}
          </div>
        </motion.section>

        <motion.section className="finale" {...sectionReveal}>
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
            <button
              className="soft-button"
              type="button"
              onClick={() => {
                void copyShareLink()
                  .then(() => toast("Link copiato. Mandalo in chat: chi lo apre vede lo show."))
                  .catch((err: unknown) =>
                    toast(err instanceof Error ? err.message : "Condivisione non riuscita")
                  );
              }}
            >
              Copia link per gli amici
            </button>
            <button className="soft-button" type="button" onClick={() => void copyVerdict()}>
              Copia il verdetto
            </button>
            <button className="soft-button" type="button" onClick={() => navigate("/show")}>
              Rivedi lo show
            </button>
          </div>
          <p className="share-downloads-label">Card PNG da mandare</p>
          <div className="share-row">
            <button
              className="download-button"
              type="button"
              disabled={downloading !== null}
              onClick={() => void saveCard("cover")}
            >
              {downloading === "cover" ? "Preparazione…" : "Scarica copertina"}
            </button>
            <button
              className="download-button"
              type="button"
              disabled={downloading !== null}
              onClick={() => void saveCard("rank")}
            >
              {downloading === "rank" ? "Preparazione…" : "Scarica top 5"}
            </button>
            <button
              className="download-button"
              type="button"
              disabled={downloading !== null}
              onClick={() => void saveCard("award")}
            >
              {downloading === "award" ? "Preparazione…" : "Scarica premio"}
            </button>
          </div>
        </motion.section>
        <footer className="data-note">
          <div>
            <b>Metodo, senza magia.</b> Analisi fatta solo sulle righe datate riconosciute nell’esportazione. Le parole
            sono ricavate dal testo visibile; i messaggi eliminati e i media non leggibili non vengono ricostruiti. Il
            file resta sul tuo dispositivo. Se copi il link per gli amici, partono solo le statistiche, non lo zip.
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
