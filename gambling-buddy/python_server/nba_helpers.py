from .balldontlieapi import BallDontLieAPI
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os

load_dotenv()
api = BallDontLieAPI(api_key=os.getenv("BALLDONTLIE_API_KEY"), timeout=30)

def get_current_nba_season():
    today = datetime.now()
    year = today.year
    return year if today.month >= 10 else year - 1

def find_player_by_name(name: str):
    try:
        if " " not in name:
            players = api.get_players(search=name)["data"]
            return players[0] if players else None

        first_name, last_name = name.split(" ", 1)
        results = api.get_players(search=last_name)["data"]
        for player in results:
            if (
                player["first_name"].lower() == first_name.lower()
                and player["last_name"].lower() == last_name.lower()
            ):
                return player
        return None
    except Exception as e:
        print(f"Error fetching player {name}: {e}")
        return None

def find_team_by_name(name: str):
    try:
        teams = api.get_teams()["data"]
        for t in teams:
            if name.lower() in t["full_name"].lower():
                return t
    except Exception as e:
        print(f"Error fetching teams: {e}")
    return None

def player_projection(player_name: str, last_n: int = 5):
    player = find_player_by_name(player_name)
    if not player:
        return None
    try:
        stats = api.get_stats(player_ids=[player["id"]], per_page=50)["data"]
    except Exception as e:
        print(f"Error fetching stats for {player_name}: {e}")
        return None

    if not stats:
        return None

    stats = sorted(stats, key=lambda s: s["game"]["date"], reverse=True)[:last_n]

    totals = {"pts": 0, "reb": 0, "ast": 0, "fg_pct": 0}
    for s in stats:
        totals["pts"] += s["pts"]
        totals["reb"] += s["reb"]
        totals["ast"] += s["ast"]
        totals["fg_pct"] += s["fg_pct"] if s["fg_pct"] is not None else 0

    games = len(stats)
    averages = {k: round(v / games, 2) for k, v in totals.items()}
    return {
        "player_name": f"{player['first_name']} {player['last_name']}",
        "team": player["team"]["full_name"],
        "averages": averages,
    }

def next_game_info(team_name: str):
    team = find_team_by_name(team_name)
    if not team:
        return "Team not found."

    now = datetime.now()
    next_7_days = [(now + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]

    games = api.get_games(team_ids=[team["id"]], dates=next_7_days, per_page=100)["data"]
    if not games:
        return f"No upcoming games found for {team['full_name']}."

    games = sorted(games, key=lambda g: g["date"])
    return games[0]

# -------------------------
# ✅ NEW: All-league games
# -------------------------
def _dates_for_when(when: str) -> list[str]:
    w = (when or "").strip().lower()
    now = datetime.now()

    if "today" in w:
        return [now.strftime("%Y-%m-%d")]

    # default: this week (next 7 days incl today)
    return [(now + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]

def nba_games_all(when: str = "this week") -> list[dict]:
    """
    Return ALL NBA games for today or this week (no team filter).
    """
    dates = _dates_for_when(when)

    all_games: list[dict] = []
    page = 1

    while True:
        resp = api.get_games(dates=dates, page=page, per_page=100)
        data = resp.get("data", [])
        all_games.extend(data)

        meta = resp.get("meta") or {}
        next_page = meta.get("next_page")

        if not next_page:
            break
        page = next_page

    # sort by date
    all_games.sort(key=lambda g: g.get("date", ""))
    return all_games
