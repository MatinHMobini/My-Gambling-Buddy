from .balldontlieapi import BallDontLieAPI
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os

load_dotenv()
api = BallDontLieAPI(api_key=os.getenv("BALLDONTLIE_API_KEY"), timeout=30)  # stats only (v1)

# ---- Helper functions ----
def get_current_nba_season():
    today = datetime.now()
    year = today.year

    # NBA season starts around October
    if today.month >= 10:
        return year
    else:
        return year - 1
    
def find_player_by_name(name: str):
    try:
        if " " not in name:
            players = api.get_players(search=name)["data"]
            return players if players else None
        
        first_name, last_name = name.split(" ", 1)

        results = api.get_players(search=last_name)["data"]

        for player in results:
            if (player["first_name"].lower() == first_name.lower() and player["last_name"].lower() == last_name.lower()):
                return player
            
        print("No exact match found for '{name}' found")
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
        stats = api.get_stats(
            player_ids=[player["id"]],
            per_page=50  # grab more to ensure recency
        )["data"]
    except Exception as e:
        print(f"Error fetching stats for {player_name}: {e}")
        return None

    if not stats:
        return None

    stats = sorted(stats, key=lambda s: s["game"]["date"], reverse=True)[:last_n]

    totals = {"pts": 0, "reb": 0, "ast": 0, "fg_pct": 0, "fg3_pct": 0, "ft_pct": 0}
    for s in stats:
        totals["pts"] += s["pts"]
        totals["reb"] += s["reb"]
        totals["ast"] += s["ast"]
        totals["fg_pct"] += s["fg_pct"] if s["fg_pct"] is not None else 0
        totals["fg3_pct"] += s["fg3_pct"] if s["fg3_pct"] is not None else 0
        totals["ft_pct"] += s["ft_pct"] if s["ft_pct"] is not None else 0

    games = len(stats)
    averages = {k: round(v / games, 2) for k, v in totals.items()}
    return {
        "player_name": f"{player['first_name']} {player['last_name']}",
        "team": player["team"]["full_name"],
        "averages": averages
    }

def next_game_info(team_name):
    team = find_team_by_name(team_name)

    if not team:
        return "Team not found."

    # Today
    now = datetime.now()

    # Create a list of the next 7 dates as strings
    next_7_days = [(now + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]

    # Call the API
    games = api.get_games(
        team_ids=[team["id"]],
        dates=next_7_days,  # pass the list of dates here
        per_page=10
    )["data"]

    if not games:
        return f"No upcoming games found for {team['full_name']}."

    games = sorted(games, key=lambda g: g["date"])

    return games[0]

def next_game_lineup(game):
    homeTeamId = game['home_team']['id']
    visitorTeamId = game['visitor_team']['id']
    return api.get_players(team_ids={homeTeamId, visitorTeamId})