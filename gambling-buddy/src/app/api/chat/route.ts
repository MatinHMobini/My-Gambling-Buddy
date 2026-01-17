import { NextResponse } from "next/server";
import type { ChatResponse } from "@/lib/types/cards"; 

export async function POST(req: Request) {
  const body = await req.json();
  const last = (body?.messages?.[body.messages.length - 1]?.content ?? "").toLowerCase();

  let resp: ChatResponse = {
    content: "Try: “What NBA games are this week?” or “Project Brunson PTS line 24.5”. (Stub)",
  };

  if (last.includes("games") && last.includes("week")) {
    resp = {
      content: "Here’s a demo schedule card (stubbed).",
      cards: [
        {
          type: "schedule",
          title: "This Week (Demo)",
          games: [
            { away: "Warriors", home: "Lakers", date: "Fri" },
            { away: "Celtics", home: "Knicks", date: "Sat" },
          ],
        },
      ],
    };
  }

  if (last.includes("project") || last.includes("line") || last.includes("over")) {
    resp = {
      content: "Demo projection (stub): slight lean over, medium confidence.",
      cards: [
        {
          type: "player",
          title: "Player Projection (Demo)",
          player: "Jalen Brunson",
          stat: "PTS",
          projection: 26.8,
          low: 20.4,
          high: 33.2,
          line: 24.5,
          pOver: 0.58,
          context: "Home game",
        },
      ],
    };
  }

  return NextResponse.json(resp);
}
