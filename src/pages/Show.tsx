import gsap from "gsap";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { CARD_BG, CoverShareCard } from "../components/ShareCards";
import { downloadNode, slug } from "../lib/share";
import { AwardsSlide } from "../slides/AwardsSlide";
import { CoverSlide } from "../slides/CoverSlide";
import { DictionarySlide } from "../slides/DictionarySlide";
import { EmojiSlide } from "../slides/EmojiSlide";
import { FinaleSlide } from "../slides/FinaleSlide";
import { FunFactsSlide } from "../slides/FunFactsSlide";
import { HeatmapSlide } from "../slides/HeatmapSlide";
import { HoursSlide } from "../slides/HoursSlide";
import { LeaderSlide } from "../slides/LeaderSlide";
import { PeakDaySlide } from "../slides/PeakDaySlide";
import { PhraseSlide } from "../slides/PhraseSlide";
import { QuizLastSlide } from "../slides/QuizLastSlide";
import { QuizSlide } from "../slides/QuizSlide";
import { funFacts } from "../lib/funFacts";
import type { SlideProps } from "../slides/types";
import { WhoAreYouSlide } from "../slides/WhoAreYouSlide";
import { useWrapped } from "../state/WrappedContext";
import { toast } from "../components/Toast";

export function Show() {
  const { data, viewerName, setViewerName, copyShareLink } = useWrapped();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const touchX = useRef<number | null>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const gsapCtx = useRef<gsap.Context | null>(null);

  const slides = useMemo(() => {
    if (!data) return [];
    const list: { id: string; node: (props: SlideProps) => ReactNode }[] = [
      { id: "cover", node: (p) => <CoverSlide {...p} /> },
    ];
    if (data.participants.length > 1) {
      list.push({ id: "who", node: (p) => <WhoAreYouSlide {...p} /> });
    }
    if (data.participants[0]) list.push({ id: "leader", node: (p) => <LeaderSlide {...p} /> });
    if (data.participants.length > 1) list.push({ id: "quiz", node: (p) => <QuizSlide {...p} /> });
    if (data.participants.length > 1 && data.lastMessage?.name) {
      list.push({ id: "quizLast", node: (p) => <QuizLastSlide {...p} /> });
    }
    if (data.hours.length) list.push({ id: "hours", node: (p) => <HoursSlide {...p} /> });
    if (data.heatmap?.some((n) => n > 0)) {
      list.push({ id: "heatmap", node: (p) => <HeatmapSlide {...p} /> });
    }
    if (data.peakDay[0] !== "—") list.push({ id: "peak", node: (p) => <PeakDaySlide {...p} /> });
    if (funFacts(data).length) list.push({ id: "funfacts", node: (p) => <FunFactsSlide {...p} /> });
    if (data.words.length || data.bigrams.length) {
      list.push({ id: "dict", node: (p) => <DictionarySlide {...p} /> });
    }
    if (data.emojis.length) list.push({ id: "emoji", node: (p) => <EmojiSlide {...p} /> });
    if (data.repeatedPhrase.count > 1 || data.longestMessage.characters) {
      list.push({ id: "phrase", node: (p) => <PhraseSlide {...p} /> });
    }
    list.push({ id: "awards", node: (p) => <AwardsSlide {...p} /> });
    list.push({ id: "finale", node: (p) => <FinaleSlide {...p} /> });
    return list;
  }, [data]);

  const attachCard = useCallback((node: HTMLDivElement | null) => {
    gsapCtx.current?.revert();
    gsapCtx.current = null;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsapCtx.current = gsap.context(() => {
      const glow = node.querySelector(".show-slide-glow");
      if (glow) {
        gsap.fromTo(
          glow,
          { rotate: -16, scale: 0.82, opacity: 0.35 },
          { rotate: 10, scale: 1, opacity: 1, duration: 0.9, ease: "power2.out" }
        );
      }
      const bits = node.querySelectorAll(".slide > *");
      if (bits.length) {
        gsap.fromTo(
          bits,
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.48, stagger: 0.055, ease: "power3.out", delay: 0.08 }
        );
      }
    }, node);
  }, []);

  useEffect(() => {
    rootRef.current?.focus();
    return () => {
      gsapCtx.current?.revert();
    };
  }, []);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fill = rootRef.current?.querySelector<HTMLElement>(".show-progress i.on span");
    if (!fill) return;
    const tween = gsap.fromTo(
      fill,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.42, ease: "power2.out", transformOrigin: "left center" }
    );
    return () => {
      tween.kill();
    };
  }, [index]);

  if (!data) return null;
  const go = (next: number) => {
    if (next < 0 || next >= slides.length) return;
    setDir(next > index ? 1 : -1);
    setIndex(next);
  };

  const props: SlideProps = {
    data,
    viewerName,
    onViewerName: setViewerName,
    onNext: () => go(index + 1),
    onRecap: () => navigate("/recap"),
    onDownloadCover: () => {
      if (!coverRef.current) return;
      void downloadNode(coverRef.current, `${slug(data.chatName)}-copertina.png`, CARD_BG.cover)
        .then(() => toast("Copertina scaricata"))
        .catch(() => toast("Download non riuscito, prova dal recap"));
    },
    onShareLink: () => {
      void copyShareLink()
        .then(() => toast("Link copiato. Mandalo in chat: chi lo apre vede lo show."))
        .catch((err: unknown) =>
          toast(err instanceof Error ? err.message : "Condivisione non riuscita")
        );
    },
  };

  return (
    <div
      className="show"
      onTouchStart={(e) => {
        touchX.current = e.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start == null || end == null) return;
        const dx = end - start;
        if (dx < -50) go(index + 1);
        if (dx > 50) go(index - 1);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(index + 1);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(index - 1);
        }
        if (e.key === "Escape") navigate("/recap");
      }}
      tabIndex={0}
      ref={rootRef}
    >
      <div className="show-progress" aria-hidden="true">
        {slides.map((s, i) => (
          <i key={s.id} className={i <= index ? "on" : ""}>
            {i === index && <span />}
          </i>
        ))}
      </div>
      <div className="show-bar">
        <span>
          {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <button type="button" className="ghost-button" onClick={() => navigate("/recap")}>
          Salta al recap
        </button>
      </div>
      <div className="show-body">
        <div className="show-stage">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              className="show-slide"
              key={slides[index].id}
              ref={attachCard}
              custom={dir}
              initial={{ opacity: 0, x: dir * 56, scale: 0.97, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: dir * -32, scale: 0.985, filter: "blur(4px)" }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="show-slide-glow" aria-hidden="true" />
              {slides[index].node(props)}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="show-nav">
          <button type="button" className="soft-button" onClick={() => go(index - 1)} disabled={index === 0}>
            Indietro
          </button>
          {index < slides.length - 1 ? (
            <button type="button" className="solid-button" onClick={() => go(index + 1)}>
              Avanti
            </button>
          ) : (
            <button type="button" className="solid-button" onClick={() => navigate("/recap")}>
              Recap
            </button>
          )}
        </div>
      </div>
      <div className="offscreen-share" aria-hidden="true">
        <CoverShareCard ref={coverRef} data={data} />
      </div>
    </div>
  );
}
