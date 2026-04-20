"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import Image from "next/image";
import { BottomNavigation } from "@/app/_components/navigation/bottom-navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type MobileShellProps = {
  title: string;
  subtitle?: string;
  cta?: {
    label: string;
    href: string;
  };
  children: ReactNode;
};

export function MobileShell({
  title,
  subtitle,
  cta,
  children,
}: MobileShellProps) {
  return (
    <main className="min-h-screen bg-[#0e0e0e] px-4 pb-24 text-[#f5f5f5]">
      <div className="mx-auto max-w-4xl">
        <header className="bg-[#131313] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/feed" className="flex items-center gap-3 group">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-[#2a2a2a] group-hover:border-[#ff906d]/50 transition-colors shadow-lg">
                <Image
                  src="/logo.png"
                  alt="Pacer Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-['Space_Grotesk'] text-lg font-semibold uppercase tracking-tight text-[#ff906d]">
                  Pacer
                </p>
                {subtitle ? (
                  <p className="mt-0 text-[0.62rem] uppercase tracking-[0.16em] text-[#a4a4a4]">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              {cta ? (
                <Link
                  href={cta.href}
                  className="bg-linear-to-br from-[#ff906d] to-[#ff5d26] px-3 py-2 text-xs font-semibold uppercase tracking-[0.09em] text-black"
                >
                  {cta.label}
                </Link>
              ) : null}
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
