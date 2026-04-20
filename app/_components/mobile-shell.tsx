"use client";

import type { ReactNode } from "react";
import Link from "next/link";

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
    <main className="min-h-screen bg-[#0e0e0e] px-4 pb-24 pt-4 text-[#f5f5f5]">
      <div className="mx-auto max-w-4xl">
        <header className="bg-[#131313] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-['Space_Grotesk'] text-lg font-semibold uppercase tracking-tight text-[#ff906d]">
                Pacer
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

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-[#FC4C02] cursor-pointer rounded-md text-white hover:bg-[#FC4C02]/80 h-auto py-2 px-3 text-xs font-semibold uppercase tracking-widest">
                    Sign out
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#131313] border-[#2a2a2a] text-[#f5f5f5]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-['Space_Grotesk'] uppercase tracking-tight">
                      Are you sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[#a4a4a4]">
                      You will be signed out of Pacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="bg-[#1a1a1a]/50">
                    <AlertDialogCancel className="bg-transparent border-[#2a2a2a] text-[#a4a4a4] cursor-pointer hover:bg-transparent hover:text-white">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Link href="/logout">
                        <Button className="bg-[#FC4C02] text-white hover:bg-[#FC4C02]/90 transition-colors cursor-pointer hover:text-white/80">
                          Sign out
                        </Button>
                      </Link>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
