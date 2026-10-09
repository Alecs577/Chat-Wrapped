import type { WrappedData } from "./types";

const POST_URL = "https://bytebin.lucko.me/post";
const GET_URL = "https://bytebin.lucko.me";

export type SharePayload = {
  v: 1;
  data: WrappedData;
};

export function sharePageUrl(id: string) {
  const base = import.meta.env.BASE_URL || "/";
  const origin = window.location.origin;
  const prefix = `${origin}${base.endsWith("/") ? base : `${base}/`}`;
  return `${prefix}#/w/${id}`;
}

export async function publishWrapped(data: WrappedData): Promise<string> {
  const payload: SharePayload = { v: 1, data };
  const res = await fetch(POST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Non sono riuscito a creare il link. Riprova tra un attimo.");
  }
  const json = (await res.json()) as { key?: string };
  const key = json.key || res.headers.get("location")?.replace(/^\//, "");
  if (!key) throw new Error("Lo store non ha restituito un id.");
  return key;
}

export async function loadWrapped(id: string): Promise<WrappedData> {
  const res = await fetch(`${GET_URL}/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
  });
  if (res.status === 404) {
    throw new Error("Questo link non esiste più, è scaduto o è sbagliato.");
  }
  if (!res.ok) throw new Error("Non riesco a caricare il wrapped condiviso.");
  const json = (await res.json()) as SharePayload | WrappedData;
  const data = "data" in json && json.data ? json.data : (json as WrappedData);
  if (!data?.participants?.length) {
    throw new Error("Il link non contiene un wrapped leggibile.");
  }
  return data;
}
