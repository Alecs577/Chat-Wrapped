import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { NeedData } from "./components/NeedData";
import { ToastHost } from "./components/Toast";
import { Landing } from "./pages/Landing";
import { Recap } from "./pages/Recap";
import { Shared } from "./pages/Shared";
import { Show } from "./pages/Show";
import { WrappedProvider } from "./state/WrappedContext";

export function App() {
  return (
    <WrappedProvider>
      <HashRouter>
        <MotionConfig reducedMotion="user">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/w/:id" element={<Shared />} />
          <Route
            path="/show"
            element={
              <NeedData>
                <Show />
              </NeedData>
            }
          />
          <Route
            path="/recap"
            element={
              <NeedData>
                <Recap />
              </NeedData>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </MotionConfig>
      </HashRouter>
      <ToastHost />
    </WrappedProvider>
  );
}
