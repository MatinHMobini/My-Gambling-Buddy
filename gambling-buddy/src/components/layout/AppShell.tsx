// src/components/layout/AppShell.tsx
import Image from "next/image";
import Logo from "@/app/Logo.png";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function QuickActionButton({
  emoji,
  label,
  onClick,
}: {
  emoji: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={[
        // spacing + sizing (extra right padding to avoid edge-cramp)
        "w-full justify-start gap-3 px-2.5 pr-6 py-3",
        // visuals
        "rounded-xl border-white/25 bg-black/10 text-white",
        "hover:bg-black/20 hover:border-white/35",
        "active:translate-y-[1px]",
        "shadow-sm hover:shadow-md",
        // focus
        "focus-visible:ring-2 focus-visible:ring-white/40",
      ].join(" ")}
    >
      <span className="text-base leading-none">{emoji}</span>

      {/* flex-1 ensures consistent inner spacing; min-w-0 prevents overflow issues */}
      <span className="flex-1 min-w-0 text-sm font-medium leading-snug">
        {label}
      </span>
    </Button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
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

            <div className="mt-5 space-y-2">
              <QuickActionButton
                emoji="🏀"
                label="Games this week"
                onClick={() => console.log("Games this week")}
              />
              <QuickActionButton
                emoji="📈"
                label="Player projection"
                onClick={() => console.log("Player projection")}
              />
              <QuickActionButton
                emoji="🧠"
                label="Matchup"
                onClick={() => console.log("Matchup")}
              />
              <QuickActionButton
                emoji="🧩"
                label="Parlay ideas"
                onClick={() => console.log("Parlay ideas")}
              />
            </div>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              Entertainment only, No guarantees.
            </div>
          </Card>
        </aside>

        <main className="col-span-12 md:col-span-9">{children}</main>
      </div>
    </div>
  );
}
