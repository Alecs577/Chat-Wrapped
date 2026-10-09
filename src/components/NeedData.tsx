import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useWrapped } from "../state/WrappedContext";

export function NeedData({ children }: { children: ReactNode }) {
  const { data } = useWrapped();
  if (!data) return <Navigate to="/" replace />;
  return children;
}
