"use client";

import { MobileShell } from "@/app/_components/mobile-shell";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <MobileShell title="Offline" subtitle="Connection lost">
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 scale-150 blur-3xl bg-[#FC4C02]/20 rounded-full" />
          <div className="relative h-20 w-20 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center shadow-2xl">
            <WifiOff className="h-10 w-10 text-[#FC4C02]" />
          </div>
        </div>
        
        <h2 className="font-['Space_Grotesk'] text-2xl font-bold uppercase tracking-tight text-white mb-2">
          You&apos;re Offline
        </h2>
        
        <p className="text-sm text-[#a4a4a4] max-w-xs mx-auto leading-relaxed">
          Please check your internet connection to continue tracking your performance with Pacer.
        </p>
        
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 bg-[#FC4C02] text-white px-6 py-3 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-[#FC4C02]/90 transition-all cursor-pointer shadow-lg shadow-[#FC4C02]/10"
        >
          Try Again
        </button>
      </div>
    </MobileShell>
  );
}
