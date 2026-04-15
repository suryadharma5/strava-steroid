"use client";

import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Run", value: "Run" },
  { label: "Ride", value: "Ride" },
  { label: "Swim", value: "Swim" },
  { label: "Hike", value: "Hike" },
] as const;

type ActivityFilterSelectProps = {
  value: string;
};

export function ActivityFilterSelect({ value }: ActivityFilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedValue, setSelectedValue] = useState(value);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9c9c9c]">
        Activity type
      </span>
      <select
        value={selectedValue}
        onChange={(event) => {
          const nextValue = event.target.value;
          setSelectedValue(nextValue);

          startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());

            if (nextValue === "all") {
              params.delete("sport");
            } else {
              params.set("sport", nextValue);
            }

            params.delete("page");
            const query = params.toString();
            router.replace(query ? `${pathname}?${query}` : pathname, {
              scroll: false,
            });
          });
        }}
        className="h-11 bg-[#1b1b1b] px-3 text-sm font-medium text-white outline-none"
      >
        {FILTER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#1b1b1b]">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
