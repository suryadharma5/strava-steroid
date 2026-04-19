"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot } from "lucide-react";

type Message = {
  role: "user" | "coach";
  content: string;
};

interface CoachChatProps {
  apiEndpoint: string;
  initialSuggestions?: string[];
  activityId?: string;
  placeholder?: string;
  userProfileUrl?: string;
}

export function CoachChat({ 
  apiEndpoint, 
  initialSuggestions, 
  activityId,
  placeholder = "Talk to Axel...",
  userProfileUrl
}: CoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, contentOverride?: string) => {
    if (e) e.preventDefault();
    const content = contentOverride || input;
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage, { role: "coach", content: "" }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          activityId
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const textDecoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const text = textDecoder.decode(value);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: last.content + text }];
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "coach", content: "Sorry, I'm having trouble connecting. Let's try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#131313] overflow-hidden">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Suggestions appear ONLY when no messages exist */}
          {messages.length === 0 && initialSuggestions && initialSuggestions.length > 0 && (
            <div className="space-y-3 py-4">
              <p className="text-xs uppercase tracking-widest text-[#8f8f8f] font-semibold text-center mt-4">
                Recommended Questions
              </p>
              <div className="flex flex-col gap-2">
                {initialSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="p-3 text-sm text-left bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#ff906d] transition-colors text-[#d0d0d0]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className={`h-8 w-8 flex justify-center items-center ${m.role === "coach" ? "bg-[#FC4C02] text-white" : "bg-[#2a2a2a]"}`}>
                {m.role === "coach" ? (
                  <Bot className="h-5 w-5" />
                ) : userProfileUrl ? (
                  <img
                    src={userProfileUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Avatar>
              <div
                className={`max-w-[80%] rounded-lg p-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#1a1a1a] text-[#f5f5f5]"
                    : "bg-[#2a2a2a] text-[#ff906d]"
                }`}
              >
                {m.content || (isLoading && i === messages.length - 1 ? (
                  <div className="flex gap-1 py-1">
                    <span className="w-1.5 h-1.5 bg-[#ff906d] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#ff906d] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#ff906d] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                ) : "")}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t border-[#2a2a2a] bg-[#1a1a1a]">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="bg-[#131313] border-[#2a2a2a] text-[#f5f5f5] placeholder:text-[#555]"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#FC4C02] hover:bg-[#ff5d26] text-white cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
