import type { ToolCard } from "@/lib/types/cards";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CardRenderer({ card }: { card: ToolCard }) {
  if (card.type === "schedule") {
    return (
      <Card className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-medium">{card.title}</div>
          <Badge variant="secondary">Schedule</Badge>
        </div>
        <div className="space-y-1 text-sm">
          {card.games.map((g, i) => (
            <div key={i} className="flex items-center justify-between rounded-md bg-muted p-2">
              <div>{g.away} @ {g.home}</div>
              <div className="text-muted-foreground">{g.date}{g.time ? ` • ${g.time}` : ""}</div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (card.type === "player") {
    return (
      <Card className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-medium">{card.title}</div>
          <Badge variant="secondary">Player</Badge>
        </div>
        <div className="text-sm">
          <div className="font-semibold">{card.player}</div>
          <div className="text-muted-foreground">
            {card.stat} • {card.context ?? "Next game"}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-md bg-muted p-2">
              <div className="text-xs text-muted-foreground">Projection</div>
              <div className="text-lg font-semibold">{card.projection.toFixed(1)}</div>
            </div>
            <div className="rounded-md bg-muted p-2">
              <div className="text-xs text-muted-foreground">Range</div>
              <div className="text-lg font-semibold">{card.low.toFixed(1)}–{card.high.toFixed(1)}</div>
            </div>
            <div className="rounded-md bg-muted p-2">
              <div className="text-xs text-muted-foreground">P(Over)</div>
              <div className="text-lg font-semibold">{card.pOver != null ? `${Math.round(card.pOver * 100)}%` : "—"}</div>
            </div>
          </div>
          {card.line != null ? <div className="mt-2 text-xs text-muted-foreground">Line: {card.line}</div> : null}
        </div>
      </Card>
    );
  }

  // matchup
  return (
    <Card className="p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-medium">{card.title}</div>
        <Badge variant="secondary">Matchup</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md bg-muted p-2">
          <div className="font-semibold">{card.teamA}</div>
          <div className="text-muted-foreground">Win: {Math.round(card.pA * 100)}%</div>
        </div>
        <div className="rounded-md bg-muted p-2">
          <div className="font-semibold">{card.teamB}</div>
          <div className="text-muted-foreground">Win: {Math.round(card.pB * 100)}%</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">Drivers: {card.drivers.join(" • ")}</div>
    </Card>
  );
}
