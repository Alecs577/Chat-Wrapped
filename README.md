# Chat Wrapped

Trasforma l’esportazione di una chat WhatsApp in uno show a slide e in un recap da esplorare. Tutto avviene nel browser: il file non viene inviato a nessun server.

## In locale

```bash
npm install
npm run dev
```

Apri l’URL di Vite, di solito `http://localhost:5173`.

## Come esportare la chat

1. Apri il gruppo o la chat su WhatsApp (Android o iPhone).
2. Menù → Altro / Chat → Esporta chat.
3. Scegli **Senza file** / **Without media**: WhatsApp crea uno **zip** con il `.txt` dentro.
4. Carica lo zip nella landing (trascina o scegli). Va bene anche il `.txt` già scompattato.

## GitHub Pages

Ad ogni push su `main`, il workflow `.github/workflows/pages.yml` pubblica `dist/`.

Nel repository GitHub: Settings → Pages → Source = **GitHub Actions**.

Se il repo non si chiama `Chat-Wrapped`, aggiorna `base` in `vite.config.ts` (`GITHUB_PAGES=true` usa `/Chat-Wrapped/`).

## Condividi con gli amici

Dopo lo show o dal recap, **Copia link per gli amici**. L’URL è corto (`#/w/...`). Chi lo apre vede lo stesso wrapped, senza ricaricare lo zip.

Vengono pubblicate solo le **statistiche** (nomi, classifica, parole, emoji), non il file della chat. Lo store è anonimo; il link può scadere dopo qualche settimana.

In questo browser il wrapped resta anche dopo un refresh (salvataggio locale).

## Privacy

Nessun account. L’analisi dello zip avviene sul dispositivo. Il link condiviso contiene un id pubblico delle stats, non lo zip.
