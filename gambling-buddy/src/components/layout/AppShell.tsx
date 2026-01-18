"use client";

import Image from "next/image";
import Logo from "@/app/Logo.png";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import type { Sport } from "@/components/sport/SportTabs";

const PROMPTS: Record<Sport, string[]> = {
  NBA: [
    'Try: "Brunson points line 24.5 next game"',
    'Try: "Knicks vs Celtics who has the edge?"',
    'Try: "Best 2-leg parlay for tonight (safe-ish)"',
  ],
  NFL: [
    'Try: "Bills vs Dolphins matchup overview"',
    'Try: "Best prop ideas for Mahomes this week"',
    'Try: "Explain a safe 2-leg parlay idea"',
  ],
  NHL: [
    'Try: "Leafs vs Bruins matchup overview"',
    'Try: "Best shots-on-goal prop style ideas"',
    'Try: "What factors matter most for goalies?"',
  ],
  MLB: [
    'Try: "Yankees vs Red Sox matchup overview"',
    'Try: "Pitcher vs lineup: what should I look for?"',
    'Try: "Give a simple parlay idea (low risk)"',
  ],
  "La Liga": [
    'Try: "Real Madrid vs Sevilla matchup overview"',
    'Try: "How do home/away splits affect picks?"',
    'Try: "Give me 3 angles for this match"',
  ],
};

export function AppShell({
  children,
  sport,
}: {
  children: ReactNode;
  sport: Sport;
}) {
  const isNBA = sport === "NBA";

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 p-4">
        <aside className="col-span-12 md:col-span-3">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex items-center justify-center">
                <Image
                  src={Logo}
                  alt="Gambling Buddy Logo"
                  priority
                  className="h-32 w-32 rounded-2xl object-contain shadow-sm sm:h-44 sm:w-44"
                />
              </div>

              <div className="text-lg font-semibold">Gambling Buddy</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Ask for schedules, projections, and matchup breakdowns.
              </div>
            </div>

            {/* NBA-only: specialized buttons */}
            {isNBA ? (
              <div className="mt-5 space-y-2 text-sm">
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("gb:action", { detail: { mode: "games" } })
                    )
                  }
                  className="w-full rounded-xl bg-muted px-4 py-3 text-left font-medium text-foreground/90 ring-1 ring-white/10 transition hover:bg-muted/80"
                >
                  🏀 Games this week
                </button>

                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("gb:action", { detail: { mode: "projection" } })
                    )
                  }
                  className="w-full rounded-xl bg-muted px-4 py-3 text-left font-medium text-foreground/90 ring-1 ring-white/10 transition hover:bg-muted/80"
                >
                  📈 Player projection
                </button>

                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("gb:action", { detail: { mode: "matchup" } })
                    )
                  }
                  className="w-full rounded-xl bg-muted px-4 py-3 text-left font-medium text-foreground/90 ring-1 ring-white/10 transition hover:bg-muted/80"
                >
                  🧠 Matchup
                </button>

                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("gb:action", { detail: { mode: "parlay" } })
                    )
                  }
                  className="w-full rounded-xl bg-muted px-4 py-3 text-left font-medium text-foreground/90 ring-1 ring-white/10 transition hover:bg-muted/80"
                >
                  🧩 Parlay ideas
                </button>
              </div>
            ) : (
              /* Non-NBA: show suggestions only (no special buttons) */
              <div className="mt-5">
                <div className="rounded-xl bg-muted px-4 py-3 ring-1 ring-white/10">
                  <div className="text-sm font-semibold text-foreground/90">
                    {sport} tips
                  </div>
                  <div className="mt-2 space-y-2 text-sm text-foreground/80">
                    {PROMPTS[sport].map((p) => (
                      <div key={p} className="rounded-lg bg-black/5 px-3 py-2">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-xs text-muted-foreground">
              Entertainment only. No guarantees.
            </div>
          </Card>
        </aside>

        <main className="col-span-12 md:col-span-9">{children}</main>
      </div>
    </div>
  );
}
