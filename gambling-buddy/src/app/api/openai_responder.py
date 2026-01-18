import os
from dotenv import load_dotenv
from openai import OpenAI
from nba_helpers import player_projection, next_game_info, find_team_by_name

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
        max_tokens=1000
    )
    return response.choices[0].message.content

def compare_players(p1, p2, last_n=5):
    a = player_projection(p1, last_n)
    b = player_projection(p2, last_n)

    aNextGame = next_game_info(a['team'])
    bNextGame = next_game_info(b['team'])

    if not a or not b:
        return "Could not compare players."

    # Clean, readable averages for the model
    a_stats = f"PTS: {a['averages']['pts']}, REB: {a['averages']['reb']}, AST: {a['averages']['ast']}, FG%: {a['averages']['fg_pct']}"
    b_stats = f"PTS: {b['averages']['pts']}, REB: {b['averages']['reb']}, AST: {b['averages']['ast']}, FG%: {b['averages']['fg_pct']}"

    prompt = f"""
    Compare these players:

    {a['player_name']} ({a['team']}): {a_stats}
    {b['player_name']} ({b['team']}): {b_stats}

    This is their next games:
    {a['player_name']}: {aNextGame} 
    {b['player_name']}: {bNextGame}

    Say which player is more likely to get over their odds/parlay line for their next game, considering how have they played in the last few games, strengths/weaknesses, and projected stats. Try to not be too repetitive and summarize where possible.
    """

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "system", "content": "Always introduce your response with 'HEYYYYY BUDDY!' and try to begin your first sentence with a friendly/humanlike greeting. You are an NBA analyst providing concise, friendly, and informal performance insights. Use slang or comedic touches as much as possible. keep your responses limited to 500-700 tokens."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1000
    )

    return response.choices[0].message.content

def team_next_game(team_name):
    team = find_team_by_name(team_name)
    game = next_game_info(team_name)

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
