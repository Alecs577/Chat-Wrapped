import type { WrappedData } from "../lib/types";

export type SlideProps = {
  data: WrappedData;
  viewerName: string | null;
  onViewerName: (name: string | null) => void;
  onNext: () => void;
  onRecap: () => void;
  onDownloadCover: () => void;
  onShareLink: () => void;
};
