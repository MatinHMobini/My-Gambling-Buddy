"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ChatResponse } from "@/lib/types/cards";
import { CardRenderer } from "@/components/cards/CardRenderer";

type Sport = "NBA" | "NFL" | "NHL" | "MLB" | "La Liga";
type QuickMode = "games" | "projection" | "matchup" | "parlay" | null;

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
  const [loading, setLoading] = useState(false);

  // Quick-action UI state
  const [quickMode, setQuickMode] = useState<QuickMode>(null);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [team, setTeam] = useState("");
  const [line, setLine] = useState(""); // optional for later
  const [notes, setNotes] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const canSend = useMemo(() => input.trim().length > 0, [input]);

  // When sport changes: show a small bubble
  useEffect(() => {
    setMessages((m) => [
      ...m,
      { id: uuidv4(), role: "assistant", content: `Switched to **${sport}** mode ✅  Ask away.` },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sport]);

  // Listen for sidebar button events
  useEffect(() => {
    function onAction(e: Event) {
      const ce = e as CustomEvent<{ mode: QuickMode }>;
      const mode = ce.detail?.mode ?? null;
      setQuickMode(mode);

      // Reset fields for clarity
      setP1(""); setP2(""); setTeam(""); setLine(""); setNotes("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }

    window.addEventListener("gb:action", onAction as EventListener);
    return () => window.removeEventListener("gb:action", onAction as EventListener);
  }, []);

  async function sendFreeChat() {
    if (!canSend || loading) return;

    const userMsg: ChatMsg = { id: uuidv4(), role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sport, messages: [...messages, userMsg] }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as ChatResponse;

      setMessages((m) => [
        ...m,
        { id: uuidv4(), role: "assistant", content: data.content, cards: data.cards },
      ]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { id: uuidv4(), role: "assistant", content: "⚠️ API error. Check terminal logs + OPENAI_API_KEY in .env.local." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function sendQuick() {
    if (loading || !quickMode) return;

    // Minimal validation per mode
    if (quickMode === "matchup" && (!p1.trim() || !p2.trim())) return;
    if (quickMode === "projection" && (!p1.trim())) return;
    if (quickMode === "games" && (!notes.trim())) {
      // notes here can be like: "this week" or "today" etc.
      // but keep it optional if you want: remove this block.
    }

    // Make a "user bubble" so it feels like part of the chat
    const label =
      quickMode === "matchup"
        ? `🧠 Matchup: ${p1} vs ${p2}`
        : quickMode === "projection"
        ? `📈 Projection: ${p1}`
        : quickMode === "games"
        ? `🏀 Games: ${notes || "upcoming"}`
        : `🧩 Parlay ideas: ${notes || "build me something"}`;

    const userMsg: ChatMsg = { id: uuidv4(), role: "user", content: label };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sport,
          mode: quickMode,
          params: {
            p1: p1.trim(),
            p2: p2.trim(),
            team: team.trim(),
            line: line.trim(),
            notes: notes.trim(),
          },
          messages: [...messages, userMsg],
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ChatResponse;

      setMessages((m) => [
        ...m,
        { id: uuidv4(), role: "assistant", content: data.content, cards: data.cards },
      ]);

      // close the quick panel after running (optional)
      setQuickMode(null);

      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { id: uuidv4(), role: "assistant", content: "⚠️ Quick action failed. Check server logs." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const quickTitle =
    quickMode === "matchup"
      ? "🧠 Matchup"
      : quickMode === "projection"
      ? "📈 Player projection"
      : quickMode === "games"
      ? "🏀 Games this week"
      : quickMode === "parlay"
      ? "🧩 Parlay ideas"
      : "";

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
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>

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

      {/* QUICK ACTION PANEL */}
      {quickMode && (
        <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/10">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-900">{quickTitle}</div>
            <button
              type="button"
              onClick={() => setQuickMode(null)}
              className="text-xs text-zinc-500 hover:text-zinc-800"
            >
              Close ✕
            </button>
          </div>

          {/* Mode-specific inputs */}
          {quickMode === "matchup" && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Player 1 (e.g., Stephen Curry)" value={p1} onChange={(e) => setP1(e.target.value)} />
              <Input placeholder="Player 2 (e.g., LeBron James)" value={p2} onChange={(e) => setP2(e.target.value)} />
              <div className="sm:col-span-2">
                <Input placeholder='Notes (optional) e.g. "include injuries + home/away"' value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
          )}

          {quickMode === "projection" && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Player (e.g., Jalen Brunson)" value={p1} onChange={(e) => setP1(e.target.value)} />
              <Input placeholder='Line (optional) e.g. "24.5 PTS"' value={line} onChange={(e) => setLine(e.target.value)} />
              <div className="sm:col-span-2">
                <Input placeholder='Notes (optional) e.g. "last 5 games, include matchup context"' value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
          )}

          {quickMode === "games" && (
            <div className="grid gap-2">
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setNotes("today")}>
                  Today
                </Button>
                <Button type="button" variant="secondary" onClick={() => setNotes("this week")}>
                  This week
                </Button>
              </div>

              <Input
                placeholder='When? (type "today" or "this week")'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="text-xs text-zinc-500">
                No team needed — I’ll show all NBA games for that period.
              </div>
            </div>
          )}


          {quickMode === "parlay" && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder='What vibe? (e.g., "safe 2-leg", "spicy 4-leg")' value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Input placeholder='Team/players (optional)' value={team} onChange={(e) => setTeam(e.target.value)} />
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <Button onClick={sendQuick} disabled={loading}>
              {loading ? "Running..." : "Run"}
            </Button>
            <Button variant="secondary" onClick={() => setQuickMode(null)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Input panel (free chat always available) */}
      <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/10">
        <div className="flex gap-2">
          <Input
            placeholder={sportPlaceholder[sport]}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendFreeChat()}
          />
          <Button onClick={sendFreeChat} disabled={!canSend || loading}>
            {loading ? "Thinking..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
