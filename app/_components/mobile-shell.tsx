import type { ReactNode } from "react";
import Link from "next/link";

import { BottomNavigation } from "@/app/_components/navigation/bottom-navigation";

type MobileShellProps = {
  title: string;
  subtitle?: string;
  cta?: {
    label: string;
    href: string;
  };
  children: ReactNode;
};

export function MobileShell({ title, subtitle, cta, children }: MobileShellProps) {
  return (
    <main className="min-h-screen bg-[#0e0e0e] px-4 pb-24 pt-4 text-[#f5f5f5]">
      <div className="mx-auto max-w-4xl">
        <header className="bg-[#131313] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-['Space_Grotesk'] text-lg font-semibold uppercase tracking-tight text-[#ff906d]">
                Kinetic
              </p>
              {subtitle ? (
                <p className="mt-1 text-[0.62rem] uppercase tracking-[0.16em] text-[#a4a4a4]">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {cta ? (
                <Link
                  href={cta.href}
                  className="bg-linear-to-br from-[#ff906d] to-[#ff5d26] px-3 py-2 text-xs font-semibold uppercase tracking-[0.09em] text-black"
                >
                  {cta.label}
                </Link>
              ) : null}
              <Link
                href="/logout"
                className="px-2 py-2 text-xs font-semibold uppercase tracking-widest text-[#a4a4a4] transition-colors hover:text-[#ff906d]"
              >
                Sign out
              </Link>
            </div>
          </div>
          <h1 className="mt-4 font-['Space_Grotesk'] text-4xl font-bold uppercase tracking-tight">
            {title}
          </h1>
        </header>

        <div className="mt-4 space-y-4">{children}</div>
      </div>
      <BottomNavigation />
    </main>
  );
}
