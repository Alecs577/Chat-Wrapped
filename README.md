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

## Privacy

Nessun account, nessun backend. L’analisi resta sul dispositivo. Si può scaricare copertina, top 5 e premio in PNG, o copiare il verdetto: non esiste un URL pubblico del wrapped di un’altra persona.
