"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ChatResponse } from "@/lib/types/cards";
import { CardRenderer } from "@/components/cards/CardRenderer";

type Sport = "NBA" | "NFL" | "NHL" | "MLB" | "La Liga";

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  cards?: ChatResponse["cards"];
};

const sportStarter: Record<Sport, string> = {
  NBA: 'Yo 👋 Ask me: “What NBA games are this week?”',
  NFL: 'Yo 👋 Ask me: “What NFL games are this week?”',
  NHL: 'Yo 👋 Ask me: “What NHL games are this week?”',
  MLB: 'Yo 👋 Ask me: “What MLB games are this week?”',
  "La Liga": 'Yo 👋 Ask me: “What La Liga matches are this week?”',
};

const sportPlaceholder: Record<Sport, string> = {
  NBA: 'Try: "Brunson points line 24.5 next game"',
  NFL: 'Try: "Mahomes passing yards line 285.5"',
  NHL: 'Try: "Matthews shots line 4.5 next game"',
  MLB: 'Try: "Ohtani hits line 1.5 today"',
  "La Liga": 'Try: "Real Madrid vs Sevilla who wins?"',
};

export function ChatWindow({ sport }: { sport: Sport }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: uuidv4(), role: "assistant", content: sportStarter[sport] },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  // When sport changes: add a small system-style assistant bubble + update greeting if you want.
  useEffect(() => {
    setMessages((m) => [
      ...m,
      {
        id: uuidv4(),
        role: "assistant",
        content: `Switched to **${sport}** mode ✅  Ask away.`,
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sport]);

  async function send() {
    if (!canSend) return;

    const userMsg: ChatMsg = { id: uuidv4(), role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 👇 sport goes with the request so backend can route to correct data + prompt
      body: JSON.stringify({ sport, messages: [...messages, userMsg] }),
    });

    const data = (await res.json()) as ChatResponse;

    const botMsg: ChatMsg = {
      id: uuidv4(),
      role: "assistant",
      content: data.content,
      cards: data.cards,
    };
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
              <div key={msg.id} className={isUser ? "flex justify-end" : "flex justify-start"}>
                <div className="max-w-[85%]">
                  <div className={isUser ? "mb-1 text-right text-[11px] text-zinc-500" : "mb-1 text-left text-[11px] text-zinc-500"}>
                    {isUser ? "You" : "Gambling Buddy"}
                  </div>

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
            placeholder={sportPlaceholder[sport]}
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
