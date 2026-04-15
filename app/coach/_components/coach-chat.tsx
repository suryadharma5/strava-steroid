"use client";

import { FormEvent, useMemo, useState } from "react";

type Message = {
  id: string;
  role: "coach" | "user";
  content: string;
  timestamp: string;
};

type CoachChatProps = {
  openingInsight: string;
};

export function CoachChat({ openingInsight }: CoachChatProps) {
  const initialMessages = useMemo<Message[]>(
    () => [
      {
        id: "coach-1",
        role: "coach",
        content: openingInsight,
        timestamp: "09:12 AM",
      },
    ],
    [openingInsight],
  );

  const [messages, setMessages] = useState(initialMessages);
  const [prompt, setPrompt] = useState("");

  const submitPrompt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = prompt.trim();
    if (!value) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: value,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const coachMessage: Message = {
      id: `coach-${Date.now() + 1}`,
      role: "coach",
      content:
        "You are trending well. I recommend a controlled endurance block tomorrow and keeping recovery volume below zone 2 if HRV remains suppressed.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((previous) => [...previous, userMessage, coachMessage]);
    setPrompt("");
  };

  return (
    <section className="bg-[#131313] p-4">
      <div className="space-y-3">
        {messages.map((message) => (
          <article key={message.id} className="space-y-1">
            <p className="text-[0.62rem] uppercase tracking-[0.11em] text-[#9d9d9d]">
              {message.role === "coach" ? "Gemini" : "You"} // {message.timestamp}
            </p>
            <div
              className={`p-3 text-sm leading-6 ${
                message.role === "coach"
                  ? "bg-[#1a1a1a] text-[#efefef]"
                  : "bg-[#ff906d] text-[#1a1a1a]"
              }`}
            >
              {message.content}
            </div>
          </article>
        ))}
      </div>

      <form onSubmit={submitPrompt} className="mt-4 flex gap-2">
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask Gemini about your form..."
          className="h-11 flex-1 bg-[#1a1a1a] px-3 text-sm text-white outline-none"
          aria-label="Ask Gemini"
        />
        <button
          type="submit"
          className="bg-gradient-to-br from-[#ff906d] to-[#ff5d26] px-4 text-sm font-semibold uppercase tracking-[0.08em] text-black"
        >
          Send
        </button>
      </form>
    </section>
  );
}
