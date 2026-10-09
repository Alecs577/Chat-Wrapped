import { toPng } from "html-to-image";

export async function downloadNode(node: HTMLElement, filename: string, backgroundColor: string) {
  const width = 720;
  const height = 900;
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor,
    skipFonts: true,
    width,
    height,
    style: {
      opacity: "1",
      transform: "none",
      position: "static",
      left: "0",
      top: "0",
      margin: "0",
      width: `${width}px`,
      height: `${height}px`,
      overflow: "visible",
    },
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function slug(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "chat"
  );
}
