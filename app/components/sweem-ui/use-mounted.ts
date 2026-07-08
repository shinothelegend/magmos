"use client";

import { useEffect, useState } from "react";

// Gate client-only widgets (e.g. recharts ResponsiveContainer, which needs a
// measured DOM box) until after mount. Defers the setState out of the effect
// body so it doesn't trip react-hooks/set-state-in-effect.
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}
