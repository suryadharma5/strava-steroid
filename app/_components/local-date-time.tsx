"use client";

import { useEffect, useMemo, useState } from "react";

type LocalDateTimeProps = {
  value: string;
  mode?: "date" | "datetime" | "time";
  className?: string;
};

function getFallbackText(value: string, mode: LocalDateTimeProps["mode"]) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  if (mode === "date") {
    return date.toISOString().slice(0, 10);
  }

  if (mode === "time") {
    return date.toISOString().slice(11, 16);
  }

  return `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 16)}`;
}

export function LocalDateTime({
  value,
  mode = "date",
  className,
}: LocalDateTimeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatted = useMemo(() => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    if (mode === "date") {
      return date.toLocaleDateString();
    }

    return date.toLocaleString();
  }, [mode, value]);

  return (
    <time className={className} dateTime={value} suppressHydrationWarning>
      {mounted ? formatted : getFallbackText(value, mode)}
    </time>
  );
}
