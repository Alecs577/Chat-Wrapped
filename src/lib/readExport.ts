const TXT_ERROR =
  "Non ho trovato messaggi datati leggibili. Esporta la chat WhatsApp (anche lo zip) e riprova.";

type ZipEntry = {
  dir: boolean;
  name: string;
  async: (type: "string") => Promise<string>;
};

function isZipName(file: File) {
  return /\.zip$/i.test(file.name) || /zip/i.test(file.type);
}

async function hasZipMagic(file: File) {
  const buf = await file.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(buf);
  return bytes[0] === 0x50 && bytes[1] === 0x4b;
}

function pickChatTxt(files: ZipEntry[]) {
  const txts = files.filter(
    (entry) => !entry.dir && /\.txt$/i.test(entry.name) && !entry.name.includes("__MACOSX/")
  );
  if (!txts.length) return null;
  const basename = (name: string) => name.split("/").pop() || name;
  return (
    txts.find((e) => /_chat\.txt$/i.test(basename(e.name))) ||
    txts.find((e) => /whatsapp|chat/i.test(basename(e.name))) ||
    txts.slice().sort((a, b) => basename(a.name).length - basename(b.name).length)[0]
  );
}

export async function readChatExport(file: File): Promise<{ text: string; source: string }> {
  const zipped = isZipName(file) || (await hasZipMagic(file));
  if (!zipped) {
    return {
      text: await file.text(),
      source: file.name.replace(/\.(txt|zip)$/i, ""),
    };
  }

  const JSZip = (await import("jszip")).default;
  let zip: InstanceType<typeof JSZip>;
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    throw new Error("Questo zip non si apre. Esporta di nuovo la chat da WhatsApp, senza media.");
  }

  const entry = pickChatTxt(Object.values(zip.files));
  if (!entry) {
    throw new Error(
      "Nello zip non c’è un file .txt. Esporta la chat senza media: WhatsApp mette il testo nello zip."
    );
  }

  const text = await entry.async("string");
  const source = (entry.name.split("/").pop() || file.name).replace(/\.(txt|zip)$/i, "");
  if (!text.trim()) throw new Error(TXT_ERROR);
  return { text, source };
}
