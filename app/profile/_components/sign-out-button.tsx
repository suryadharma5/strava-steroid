"use client";

import Link from "next/link";
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

export function SignOutButton() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full h-12 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all font-['Space_Grotesk'] text-sm font-bold uppercase tracking-[0.15em] cursor-pointer">
          Sign out
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-[#2a2a2a] text-[#f5f5f5]">
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
          <AlertDialogAction
            variant={"ghost"}
            asChild
            className="bg-[#FC4C02] text-white hover:bg-[#FC4C02]/90 transition-colors cursor-pointer hover:text-white/80 border-0"
          >
            <Link href="/logout">Sign out</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
