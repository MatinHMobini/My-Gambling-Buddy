"use client";

import { useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; 
import type { ChatResponse } from "@/lib/types/cards";
import { CardRenderer } from "@/components/cards/CardRenderer";

type ChatMsg = { id: string; role: "user" | "assistant"; content: string; cards?: ChatResponse["cards"] };

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: uuidv4(), role: "assistant", content: "Yo 👋 Ask me: “What NBA games are this week?”" },
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
    <div className="flex h-[80vh] flex-col">
      <div className="flex-1 space-y-3 overflow-auto rounded-lg border bg-card p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={msg.role === "user"
              ? "max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-primary-foreground"
              : "max-w-[80%] rounded-2xl bg-muted px-4 py-2"}>
              <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
              {msg.cards?.length ? (
                <div className="mt-3 space-y-3">
                  {msg.cards.map((c, idx) => <CardRenderer key={idx} card={c} />)}
                </div>
              ) : null}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          placeholder='Try: "Project Brunson PTS, line 24.5"'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <Button onClick={send} disabled={!canSend}>Send</Button>
      </div>
    </div>
  );
}
