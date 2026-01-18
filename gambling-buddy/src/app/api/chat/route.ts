// gambling-buddy/src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import type { ChatResponse } from "@/lib/types/cards";

export const runtime = "nodejs";

type Sport = "NBA" | "NFL" | "NHL" | "MLB" | "La Liga";
type Mode = "games" | "projection" | "matchup" | "parlay";
type IncomingMsg = { role: "user" | "assistant"; content: string };

function getPyBaseUrl() {
  // ✅ In Vercel set PY_BACKEND_URL=https://your-render-service.onrender.com
  // ✅ Locally you can leave it unset and it will use localhost
  return process.env.PY_BACKEND_URL || "http://127.0.0.1:8001";
}

/**
 * Button-mode endpoints (NBA lane).
 * NOTE: "games" is now /games (week/today list), NOT /team_next_game.
 */
function pickPythonEndpoint(mode: Mode) {
  switch (mode) {
    case "matchup":
      return "/matchup"; // compare_players(p1, p2)
    case "projection":
      return "/performance"; // player_recent_performance(player)
    case "games":
      return "/games"; // ✅ NEW: all games today/this week
    case "parlay":
      // If you don't have python parlay yet, fallback to generic_chat.
      return null;
    default:
      return null;
  }
}

async function callPython(path: string, payload: any) {
  const base = getPyBaseUrl();
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
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

    // -----------------------------------------
    // LANE 2: Quick buttons
    // -----------------------------------------
    if (mode) {
      // ✅ Only NBA gets specialized button behavior.
      // Non-NBA: just go generic chat through python (no special prompts).
      if (sport !== "NBA") {
        const lastUser = (messages[messages.length - 1]?.content ?? "").trim();
        const data = await callPython("/generic_chat", {
          sport,
          message: lastUser || `User clicked ${mode} in ${sport} mode.`,
        });
        const resp: ChatResponse = { content: data.content, cards: [] };
        return NextResponse.json(resp);
      }

      // NBA-only quick mode behavior
      if (mode === "matchup") {
        const p1 = (params?.p1 ?? "").trim();
        const p2 = (params?.p2 ?? "").trim();
        const last_n = Number(params?.last_n ?? 5);

        if (!p1 || !p2) {
          return NextResponse.json({
            content: `Need 2 players.\nExample: Player 1="Stephen Curry", Player 2="LeBron James"`,
            cards: [],
          } satisfies ChatResponse);
        }

        const data = await callPython("/matchup", { sport, p1, p2, last_n });
        return NextResponse.json({ content: data.content, cards: [] } satisfies ChatResponse);
      }

      if (mode === "projection") {
        // Your ChatWindow sends p1; python expects player
        const player = ((params?.player ?? params?.p1) ?? "").trim();
        const last_n = Number(params?.last_n ?? 5);

        if (!player) {
          return NextResponse.json({
            content: `Need a player name.\nExample: Player="Jalen Brunson"`,
            cards: [],
          } satisfies ChatResponse);
        }

        const data = await callPython("/performance", { sport, player, last_n });
        return NextResponse.json({ content: data.content, cards: [] } satisfies ChatResponse);
      }

      if (mode === "games") {
        // ✅ No team required — show ALL games.
        // Keep a simple "when" selector: "today" or "this week"
        const whenRaw = (params?.when ?? params?.notes ?? "this week").toString().trim().toLowerCase();
        const when = whenRaw.includes("today") ? "today" : "week";

        const data = await callPython("/games", { sport, when });
        return NextResponse.json({ content: data.content, cards: [] } satisfies ChatResponse);
      }

      // mode === "parlay" (no python endpoint yet)
      // fallback: generic chat in python (no special prompts)
      if (mode === "parlay") {
        const prefs = (params?.notes ?? "").toString().trim();
        const msg = `Generate a few parlay ideas for NBA (entertainment only). Preferences: ${prefs || "none"}.`;

        const data = await callPython("/generic_chat", { sport, message: msg });
        return NextResponse.json({ content: data.content, cards: [] } satisfies ChatResponse);
      }
    }

    // -----------------------------------------
    // LANE 1: Free chat (generic)
    // -----------------------------------------
    // ✅ Easiest: always pass through python generic_chat so Vercel doesn't need OPENAI key
    // (Only python server needs OPENAI_API_KEY).
    const lastUser = (messages[messages.length - 1]?.content ?? "").trim();
    const data = await callPython("/generic_chat", { sport, message: lastUser });

    const resp: ChatResponse = { content: data.content, cards: [] };
    return NextResponse.json(resp);
  } catch (err: any) {
    console.error("API /chat error:", err);
    const resp: ChatResponse = {
      content:
        "⚠️ Server error.\n- If deployed: confirm PY_BACKEND_URL is set on Vercel.\n- If local: confirm python server is running on :8001.\n- Check Render logs for missing env vars (OPENAI_API_KEY, BALLDONTLIE_API_KEY).",
      cards: [],
    };
    return NextResponse.json(resp, { status: 500 });
  }
}
