import { useEffect, useState } from "react";
import { fmt } from "../lib/format";

export function CountUp({ value, duration = 1100 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setN(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{fmt(n)}</>;
}
