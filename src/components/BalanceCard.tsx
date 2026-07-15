"use client";

import { useState } from "react";

export default function BalanceCard({ balance }: { balance: number }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">
        Account Balance:{" "}
        <strong>{visible ? `$${balance.toFixed(2)}` : "$ ••••"}</strong>
      </span>
      <button
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Hide balance" : "Show balance"}
        className="rounded-full border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
