// src/app/components/Counter.tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(v => v + 1)}>Clicks: {n}</button>;
}