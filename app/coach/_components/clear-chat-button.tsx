"use client";

import { useTransition } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
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
  AlertDialogMedia
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ClearChatButtonProps {
  onClear: () => Promise<void>;
}

export function ClearChatButton({ onClear }: ClearChatButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClear = () => {
    startTransition(async () => {
      await onClear();
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="h-8 text-[0.65rem] uppercase tracking-[0.1em] text-[#8f8f8f] hover:text-[#ff906d] hover:bg-[#ff906d]/10 transition-all cursor-pointer gap-2"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {isPending ? "Clearing..." : "Clear Chat"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#131313] border-[#2a2a2a] text-white">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-xl font-['Space_Grotesk'] font-bold">
            Clear Chat History?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#8f8f8f]">
            This will permanently delete your conversation with Axel. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-[#1a1a1a]/50">
          <AlertDialogCancel className="border-[#2a2a2a] cursor-pointer bg-transparent text-white hover:bg-muted-foreground hover:text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleClear}
            className="bg-red-700 hover:bg-red-900 text-white font-bold text-sm cursor-pointer"
          >
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
