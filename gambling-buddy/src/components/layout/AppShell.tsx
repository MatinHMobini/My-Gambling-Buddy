import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 p-4">
        <aside className="col-span-12 md:col-span-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Gambling Buddy</div>
              <Badge variant="secondary">NBA</Badge>
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
              Ask for schedules, projections, and matchup breakdowns.
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="rounded-md bg-muted p-2">🏀 Games this week</div>
              <div className="rounded-md bg-muted p-2">📈 Player projection</div>
              <div className="rounded-md bg-muted p-2">🧠 Matchup</div>
              <div className="rounded-md bg-muted p-2">🧩 Parlay ideas</div>
            </div>

            <div className="mt-6 text-xs text-muted-foreground">
              Entertainment only. No guarantees.
            </div>
          </Card>
        </aside>

        {/* IMPORTANT: main is NOT white anymore */}
        <main className="col-span-12 md:col-span-9">{children}</main>
      </div>
    </div>
  );
}
