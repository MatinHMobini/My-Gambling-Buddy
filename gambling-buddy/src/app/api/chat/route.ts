import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { ChatResponse } from "@/lib/types/cards";

export const runtime = "nodejs";

type Sport = "NBA" | "NFL" | "NHL" | "MLB" | "La Liga";
type Mode = "games" | "projection" | "matchup" | "parlay";

type IncomingMsg = { role: "user" | "assistant"; content: string };

function systemGeneric(sport: Sport) {
  return `
You are "Gambling Buddy", a sports betting buddy for ENTERTAINMENT ONLY.
Mode: ${sport}

Rules:
- No guarantees. Be explicit.
- If user asks for live odds/injuries/lines, say you don't have real-time access unless they provide it.
- Keep answers structured and readable (bullets, short sections).
`;
}

function pickPythonEndpoint(mode: Mode) {
  // Map buttons -> python functions (your “lane 2”)
  switch (mode) {
    case "matchup":
      return "/matchup"; // compare_players(p1, p2)
    case "projection":
      return "/performance"; // player_recent_performance(player)
    case "games":
      return "/team_next_game"; // team_next_game(team)
    case "parlay":
      // you don't have python parlay yet; you can add later
      return null;
    default:
      return null;
  }
}

async function callPython(mode: Mode, params: any) {
  const base = process.env.PY_API_URL || "http://127.0.0.1:8001";
  const endpoint = pickPythonEndpoint(mode);

  if (!endpoint) return null;

  const res = await fetch(`${base}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params ?? {}),
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Python API error ${res.status}: ${t}`);
  }

  return (await res.json()) as { content: string };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const sport = (body?.sport ?? "NBA") as Sport;
    const mode = (body?.mode ?? null) as Mode | null;
    const params = body?.params ?? {};
    const messages = (body?.messages ?? []) as IncomingMsg[];

    const trimmed = messages.slice(-20);

    // ✅ Lane 2: Button-mode = call your PYTHON functions
    if (mode) {
      // Your python pipeline is NBA-only right now
      if (sport !== "NBA") {
        const resp: ChatResponse = {
          content: `⚠️ ${mode.toUpperCase()} lane is only wired for NBA right now (your Python functions are NBA-specific). Switch to NBA or use normal chat.`,
          cards: [],
        };
        return NextResponse.json(resp);
      }

      // Validate required params per mode (so you don’t silently call with blanks)
      if (mode === "matchup") {
        const p1 = params?.p1?.trim();
        const p2 = params?.p2?.trim();
        if (!p1 || !p2) {
          return NextResponse.json({
            content: `Tell me the two players. Example: p1="Stephen Curry", p2="LeBron James".`,
            cards: [],
          } satisfies ChatResponse);
        }
      }

      if (mode === "projection") {
        const player = params?.player?.trim() || params?.p1?.trim();
        if (!player) {
          return NextResponse.json({
            content: `Tell me the player name for projection/performance. Example: player="Stephen Curry"`,
            cards: [],
          } satisfies ChatResponse);
        }
        // normalize: python expects { player, last_n }
        params.player = player;
      }

      if (mode === "games") {
        const team = params?.team?.trim();
        if (!team) {
          return NextResponse.json({
            content: `Tell me the team name. Example: team="Golden State Warriors"`,
            cards: [],
          } satisfies ChatResponse);
        }
      }

      // ✅ Actually call python
      const py = await callPython(mode, params);

      // If mode is "parlay" and python endpoint doesn't exist yet, fallback to TS prompt
      if (!py && mode === "parlay") {
        const { text } = await generateText({
          model: openai("gpt-4o-mini"),
          messages: [
            {
              role: "system",
              content:
                `You are a friendly parlay-idea generator for entertainment only.\nSport: ${sport}\nGive 2-3 options: safer / medium / spicy.`,
            },
            { role: "user", content: `Parlay ideas. Preferences: ${params?.notes ?? ""}` },
          ],
          maxOutputTokens: 800,
          temperature: 0.7,
        });

        return NextResponse.json({ content: text, cards: [] } satisfies ChatResponse);
      }

      const resp: ChatResponse = { content: py?.content ?? "No response.", cards: [] };
      return NextResponse.json(resp);
    }

    // ✅ Lane 1: Free chat (TS OpenAI)
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [{ role: "system", content: systemGeneric(sport) }, ...trimmed],
      maxOutputTokens: 700,
      temperature: 0.6,
    });

    const resp: ChatResponse = { content: text, cards: [] };
    return NextResponse.json(resp);
  } catch (err: any) {
    console.error("API /chat error:", err);
    const resp: ChatResponse = {
      content:
        "⚠️ Server error. If lane-2: make sure the Python server is running and PY_API_URL is set. If lane-1: check OPENAI_API_KEY in gambling-buddy/.env.local and restart dev server.",
      cards: [],
    };
    return NextResponse.json(resp, { status: 500 });
  }
}
