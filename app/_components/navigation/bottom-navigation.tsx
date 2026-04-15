"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/feed", label: "Feed", icon: "home" },
  { href: "/progress", label: "Progress", icon: "bars" },
  { href: "/coach", label: "Coach", icon: "spark" },
  { href: "/profile", label: "Profile", icon: "user" },
] as const;

function Icon({ type, active }: { type: (typeof NAV_ITEMS)[number]["icon"]; active: boolean }) {
  const color = active ? "#ff906d" : "#8c8c8c";

  if (type === "home") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          d="M4 11.5 12 5l8 6.5V20h-5.5v-5h-5V20H4z"
          fill="none"
          stroke={color}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "bars") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <rect x="4" y="11" width="3.2" height="9" fill={color} />
        <rect x="10.4" y="7" width="3.2" height="13" fill={color} />
        <rect x="16.8" y="4" width="3.2" height="16" fill={color} />
      </svg>
    );
  }

  if (type === "spark") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          d="M12 3.5 13.9 8l4.7.4-3.6 3 1.1 4.6L12 13.5 7.9 16l1.1-4.6-3.6-3L10.1 8z"
          fill="none"
          stroke={color}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        d="M12 13a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm-7 7c0-3.3 3.3-5.8 7-5.8s7 2.5 7 5.8"
        fill="none"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[#262626] bg-[#0e0e0e]/95 backdrop-blur-md">
      <ul className="mx-auto flex max-w-4xl items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-w-16 flex-col items-center gap-1 px-2 py-1"
                aria-current={active ? "page" : undefined}
              >
                <Icon type={item.icon} active={active} />
                <span
                  className={`text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${
                    active ? "text-[#ff906d]" : "text-[#8c8c8c]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
