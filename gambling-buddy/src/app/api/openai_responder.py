import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from openai import OpenAI
from nba_helpers import player_projection, find_team_by_name, api

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
if not client.api_key:
    raise ValueError("OPENAI_API_KEY not found in .env")

# ---- Functions ----
def player_recent_performance(name, last_n=5):
    proj = player_projection(name, last_n)
    if not proj:
        return "Player not found."

    prompt = f"""
    Summarize recent performance for {proj['player_name']} ({proj['team']}).

    Averages over last {last_n} games:
    PTS: {proj['averages']['pts']}
    REB: {proj['averages']['reb']}
    AST: {proj['averages']['ast']}
    FG%: {proj['averages']['fg_pct']}
    """

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "system", "content": "You are an NBA analyst providing concise performance insights. You can use friendly/informal language and slang/comedic as you are providing the response."},
            {"role": "user", "content": prompt}],
        max_tokens=800
    )
    return response.choices[0].message.content

def compare_players(p1, p2, last_n=5):
    a = player_projection(p1, last_n)
    b = player_projection(p2, last_n)
    if not a or not b:
        return "Could not compare players."

    # Clean, readable averages for the model
    a_stats = f"PTS: {a['averages']['pts']}, REB: {a['averages']['reb']}, AST: {a['averages']['ast']}, FG%: {a['averages']['fg_pct']}"
    b_stats = f"PTS: {b['averages']['pts']}, REB: {b['averages']['reb']}, AST: {b['averages']['ast']}, FG%: {b['averages']['fg_pct']}"

    prompt = f"""
    Compare these players:

    {a['player_name']} ({a['team']}): {a_stats}
    {b['player_name']} ({b['team']}): {b_stats}

    Say who is more likely to get over their odds/parlay line right now (also include the actual parlay/odds line itself, it doesn't only have to be for points), if anyone in the game on either team is injured and how it can affect the game/the performance of these compared players, if the upcoming game of both players being compared are either home or away it should be considered as impactful in their performance (as this can affect performance of players, players usually play better on home turf), how have they played in the last few games, and what are their strengths/weaknesses, who are their next opponents, what are their projected stats.
    """

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "system", "content": "Always introduce your response with 'HEYYYYY BUDDY!' and try to begin your first sentence with a friendly/humainlike greeting. You are an NBA analyst providing concise, friendly, and informal performance insights. Use slang or comedic touches as much as possible. keep your responses limited to around 500-700 tokens. Because of frequent trades, please verify the stats/team of every player that you reference in your response and you can use the data from balldontlie api to verify the lineups of each team"},
            {"role": "user", "content": prompt}
        ],
        max_tokens=800
    )

    return response.choices[0].message.content

def team_next_game(team_name):
    team = find_team_by_name(team_name)

    if not team:
        return "Team not found."

    # Defining date range for next two weeks (7 days)
    today = datetime.utcnow().date().isoformat()
    future = (datetime.utcnow().date() + timedelta(days=7)).isoformat()

    games = api.get_games(
        team_ids=[team["id"]],
        start_date=today,
        end_date=future,
        per_page=10
    )["data"]

    if not games:
        return f"No upcoming games found for {team['full_name']}."

    games = sorted(games, key=lambda g: g["date"])

    game = games[0]

    home = game["home_team"]
    visitor = game["visitor_team"]

    opponent = visitor if home["id"] == team["id"] else home
    location = "home" if home["id"] == team["id"] else "away"

    game_date = game["date"].split("T")[0]

    return f"{team['full_name']} play the {opponent['full_name']} on {game_date} ({location})."

def will_player_score_over(name, target, last_n=5):
    proj = player_projection(name, last_n)
    if not proj:
        return "Player not found."

    avg = proj["averages"]["pts"]
    likely = "likely" if avg >= target else "unlikely"
    return f"{proj['player_name']} averages {avg} points recently, making it {likely} they score over {target}."
