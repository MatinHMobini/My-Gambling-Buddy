"use client";

import { useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ChatResponse } from "@/lib/types/cards";
import { CardRenderer } from "@/components/cards/CardRenderer";

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  cards?: ChatResponse["cards"];
};

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: uuidv4(), role: "assistant", content: 'Yo 👋 Ask me: “What NBA games are this week?”' },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  async function send() {
    if (!canSend) return;

    const userMsg: ChatMsg = { id: uuidv4(), role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg] }),
    });

    const data = (await res.json()) as ChatResponse;

    const botMsg: ChatMsg = { id: uuidv4(), role: "assistant", content: data.content, cards: data.cards };
    setMessages((m) => [...m, botMsg]);

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    // Brown tray background so gaps stay brown
    <div className="flex h-[80vh] flex-col gap-3 bg-transparent p-3">
      {/* Messages panel */}
      <div className="flex-1 overflow-auto rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={isUser ? "flex justify-end" : "flex justify-start"}
              >
                <div className={isUser ? "max-w-[85%]" : "max-w-[85%]"}>
                  {/* Optional name row */}
                  <div
                    className={
                      isUser
                        ? "mb-1 text-right text-[11px] text-zinc-500"
                        : "mb-1 text-left text-[11px] text-zinc-500"
                    }
                  >
                    {isUser ? "You" : "Gambling Buddy"}
                  </div>

                  {/* Bubble */}
                  <div
                    className={
                      isUser
                        ? "relative rounded-2xl rounded-br-sm bg-zinc-900 px-4 py-3 text-white shadow-sm"
                        : "relative rounded-2xl rounded-bl-sm bg-zinc-100 px-4 py-3 text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                    }
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Cards rendered as attachments under the bubble text */}
                    {msg.cards?.length ? (
                      <div className="mt-3 space-y-3">
                        {msg.cards.map((c, idx) => (
                          <CardRenderer key={idx} card={c} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input panel */}
      <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/10">
        <div className="flex gap-2">
          <Input
            placeholder='Try: "Project Brunson PTS, line 24.5"'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <Button onClick={send} disabled={!canSend}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
