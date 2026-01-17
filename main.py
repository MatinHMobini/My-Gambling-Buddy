import os
from balldontlieapi import BallDontLieAPI
from dotenv import load_dotenv

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
