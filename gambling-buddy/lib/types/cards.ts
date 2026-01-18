export type ScheduleCard = {
  type: "schedule";
  title: string;
  games: Array<{ away: string; home: string; date: string; time?: string }>;
};

export type PlayerCard = {
  type: "player";
  title: string;
  player: string;
  stat: "PTS" | "REB" | "AST";
  projection: number;
  low: number;
  high: number;
  line?: number;
  pOver?: number; // 0..1
  context?: string; // "Home vs BOS" etc
};

export type MatchupCard = {
  type: "matchup";
  title: string;
  teamA: string;
  teamB: string;
  pA: number; // 0..1
  pB: number; // 0..1
  drivers: string[];
};

export type ToolCard = ScheduleCard | PlayerCard | MatchupCard;

export type ChatResponse = {
  content: string;
  cards?: ToolCard[];
};
