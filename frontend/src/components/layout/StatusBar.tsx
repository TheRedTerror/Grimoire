"use client";

import { useEffect, useState } from "react";

interface StatusBarProps {
  mode?: string;
  campaignStatus?: "DRAFT" | "PLAN_READY" | "SAVED";
  operationName?: string;
}

export default function StatusBar({
  mode = "PLANNING",
  campaignStatus = "DRAFT",
  operationName,
}: StatusBarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const statusColor =
    campaignStatus === "SAVED"
      ? "text-green-400"
      : campaignStatus === "PLAN_READY"
        ? "text-grimoire-accent"
        : "text-grimoire-muted";

  return (
    <div className="status-bar flex items-center justify-between px-4 py-1 text-[10px] uppercase tracking-[0.14em] border-b border-grimoire-border/60 bg-grimoire-bg/90">
      <div className="flex items-center gap-4">
        <StatusPill label="MODE" value={mode} accent />
        <StatusPill label="STATUS" value={campaignStatus} className={statusColor} />
        {operationName && (
          <span className="hidden md:inline text-grimoire-muted truncate max-w-[200px]">
            OP/<span className="text-grimoire-text">{operationName}</span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 text-grimoire-muted">
        <span className="flex items-center gap-1.5">
          <span className="signal-dot" />
          UPLINK STABLE
        </span>
        <span className="hidden sm:inline">BUILD 0.2.4-aep</span>
        <span className="font-mono text-grimoire-text tabular-nums">{time}</span>
      </div>
    </div>
  );
}

function StatusPill({
  label,
  value,
  accent,
  className = "",
}: {
  label: string;
  value: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-grimoire-muted/70">{label}</span>
      <span className={accent ? "text-grimoire-accent" : className || "text-grimoire-text"}>
        {value}
      </span>
    </span>
  );
}
