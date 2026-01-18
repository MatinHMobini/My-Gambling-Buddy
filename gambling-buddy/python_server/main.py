import os
from balldontlieapi import BallDontLieAPI
from dotenv import load_dotenv
from datetime import date

load_dotenv()

api = BallDontLieAPI(api_key=os.getenv("BALLDONTLIE_API_KEY"))

# TO MICHAEL: THESE ARE EXAMPLES BELOW ON HOW TO USE THE API WRAPPER

# Search players
players = api.get_players(search="curry")
print("PLAYERS ", players["data"][0])

# Get a specific player
player = api.get_player(115)  # Stephen Curry
print("PLAYER ", player)

# List teams
teams = api.get_teams()
print("TEAMS ", teams["data"])

# Get recent games
games = api.get_games(seasons=[2023], per_page=5)
print("GAMES ", games["data"])

# Get stats for a player
stats = api.get_stats(player_ids=[115], seasons=[2023])
print("STATS ", stats["data"][0])

today = [date.today().isoformat()]

# Fetch games
games = {g["id"]: g for g in api.get_games(dates=today)["data"]}

# Fetch odds
odds_data = api.get_odds(dates=today)

# Group by game
from collections import defaultdict
game_odds = defaultdict(list)
for odd in odds_data:
    game_odds[odd["game_id"]].append(odd)

# Compare odds
for game_id, odds_list in game_odds.items():
    if game_id not in games:
        continue
    game = games[game_id]
    home, away = game["home_team"]["abbreviation"], game["visitor_team"]["abbreviation"]

    home_vendor, home_odds = api.find_best_moneyline(odds_list, "home")
    away_vendor, away_odds = api.find_best_moneyline(odds_list, "away")

    if home_odds and away_odds:
        home_prob = api.american_to_implied_prob(home_odds)
        away_prob = api.american_to_implied_prob(away_odds)
        combined = home_prob + away_prob
        edge = max(0, 1 - combined)

        print(f"{away} @ {home}")
        print(f"{home}: {home_odds:+d} at {home_vendor} ({home_prob:.1%})")
        print(f"{away}: {away_odds:+d} at {away_vendor} ({away_prob:.1%})")
        print(f"Potential edge: {edge:.1%}")


