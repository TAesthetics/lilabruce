import { useEffect, useState } from "react";

export function Clock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => setNow(formatNow());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="hidden font-sans text-[12px] tracking-[0.1em] text-cyan tabular-nums sm:inline">
      {now}
    </span>
  );
}

function formatNow() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}
