import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { analyzeChat } from "../lib/analyzeChat";
import { parseWhatsapp, yearsFromMessages } from "../lib/parseWhatsapp";
import { readChatExport } from "../lib/readExport";
import { clearSession, loadSession, saveSession } from "../lib/storage";
import type { ParsedChat, WrappedData } from "../lib/types";

type WrappedContextValue = {
  data: WrappedData | null;
  parsed: ParsedChat | null;
  viewerName: string | null;
  parsing: boolean;
  parseCount: number;
  error: string | null;
  ingestFile: (file: File, onReady?: (years: string[], chatName: string) => void) => Promise<void>;
  applyYear: (year: string | null) => void;
  setViewerName: (name: string | null) => void;
  reset: () => void;
};

const WrappedContext = createContext<WrappedContextValue | null>(null);

const saved = typeof sessionStorage !== "undefined" ? loadSession() : null;

export function WrappedProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WrappedData | null>(saved?.data ?? null);
  const [parsed, setParsed] = useState<ParsedChat | null>(null);
  const [viewerName, setViewerNameState] = useState<string | null>(saved?.viewerName ?? null);
  const [parsing, setParsing] = useState(false);
  const [parseCount, setParseCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((next: WrappedData | null, name: string | null) => {
    if (next) saveSession(next, name);
    else clearSession();
  }, []);

  const ingestFile = useCallback(
    async (file: File, onReady?: (years: string[], chatName: string) => void) => {
      setParsing(true);
      setError(null);
      setParseCount(0);
      try {
        const { text, source } = await readChatExport(file);
        const next = await parseWhatsapp(text, source, setParseCount);
        const valid = next.messages.filter((m) => m.date.getFullYear() >= 2020);
        if (!valid.length) {
          throw new Error(
            "Non ho trovato messaggi datati leggibili. Esporta la chat WhatsApp (zip o .txt) e riprova."
          );
        }
        setParsed(next);
        setData(null);
        setViewerNameState(null);
        persist(null, null);
        onReady?.(yearsFromMessages(next.messages), next.chatName);
      } catch (err) {
        setParsed(null);
        setData(null);
        persist(null, null);
        setError(err instanceof Error ? err.message : "File non riconosciuto");
        throw err;
      } finally {
        setParsing(false);
      }
    },
    [persist]
  );

  const applyYear = useCallback(
    (year: string | null) => {
      if (!parsed) return;
      const next = analyzeChat(parsed.messages, parsed.source, parsed.chatName, year);
      setData(next);
      persist(next, viewerName);
    },
    [parsed, persist, viewerName]
  );

  const setViewerName = useCallback(
    (name: string | null) => {
      setViewerNameState(name);
      if (data) persist(data, name);
    },
    [data, persist]
  );

  const reset = useCallback(() => {
    setData(null);
    setParsed(null);
    setViewerNameState(null);
    setError(null);
    setParseCount(0);
    persist(null, null);
  }, [persist]);

  const value = useMemo(
    () => ({
      data,
      parsed,
      viewerName,
      parsing,
      parseCount,
      error,
      ingestFile,
      applyYear,
      setViewerName,
      reset,
    }),
    [
      data,
      parsed,
      viewerName,
      parsing,
      parseCount,
      error,
      ingestFile,
      applyYear,
      setViewerName,
      reset,
    ]
  );

  return <WrappedContext.Provider value={value}>{children}</WrappedContext.Provider>;
}

export function useWrapped() {
  const ctx = useContext(WrappedContext);
  if (!ctx) throw new Error("useWrapped must be used inside WrappedProvider");
  return ctx;
}
