import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { NeedData } from "./components/NeedData";
import { ToastHost } from "./components/Toast";
import { Landing } from "./pages/Landing";
import { Recap } from "./pages/Recap";
import { Show } from "./pages/Show";
import { WrappedProvider } from "./state/WrappedContext";

export function App() {
  return (
    <WrappedProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
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
      </HashRouter>
      <ToastHost />
    </WrappedProvider>
  );
}
