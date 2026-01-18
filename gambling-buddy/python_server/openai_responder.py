# gambling-buddy/python_server/openai_responder.py
import os
from dotenv import load_dotenv
from openai import OpenAI

from .nba_helpers import (
    player_projection,
    next_game_info,
    find_team_by_name,
    nba_games_all,
)

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
if not client.api_key:
    raise ValueError("OPENAI_API_KEY not found in .env")

# -------------------------
# ✅ Global formatting rules
# -------------------------
STYLE_GUIDE = """
FORMAT RULES (IMPORTANT):
- Output MUST be plain text (NOT markdown).
- Do NOT use: **bold**, __underline__, # headings, --- dividers, backticks, markdown tables.
- Use emoji section headers like:
  🧾 Quick take:
  🔍 Key factors:
  🎯 Summary:
  🧩 Next steps:
- Use bullets like: • item
- If you show a table, use a simple plain-text pipe table WITHOUT markdown separator lines:
  Player | PTS | REB | AST
  Name   | 25  | 7   | 9
- Keep it clean, readable, and not too long.
"""

# ✅ Hard rule: no disclaimers unless user explicitly asks
NO_DISCLAIMER_RULE = """
HARD RULE:
- Do NOT include any disclaimers, warnings, or "entertainment only / no guarantees / not financial advice" lines.
- Do NOT add responsible-gambling messaging unless the user explicitly asks for it.
"""

def _ask_openai(system: str, user: str, max_tokens: int = 900) -> str:
    resp = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "system", "content": system.strip()},
            {"role": "user", "content": user.strip()},
        ],
        max_tokens=max_tokens,
        temperature=0.7,
    )
    return resp.choices[0].message.content

# -------------------------
# NBA-specific functions
# -------------------------
def player_recent_performance(name, last_n=5):
    proj = player_projection(name, last_n)
    if not proj:
        return "❌ Player not found."

    prompt = f"""
Summarize recent performance for {proj['player_name']} ({proj['team']}).

Averages over last {last_n} games:
PTS: {proj['averages']['pts']}
REB: {proj['averages']['reb']}
AST: {proj['averages']['ast']}
FG%: {proj['averages']['fg_pct']}
"""

    system = f"""
You are an NBA analyst. Be friendly and slightly funny.
Make it structured and easy to scan.
Include a short “Quick take” + “What it means for props”.
{NO_DISCLAIMER_RULE}
{STYLE_GUIDE}
"""
    return _ask_openai(system, prompt, max_tokens=900)

def compare_players(p1, p2, last_n=5):
    a = player_projection(p1, last_n)
    b = player_projection(p2, last_n)

    if not a or not b:
        return "❌ Could not compare players (one or both not found)."

    aNextGame = next_game_info(a["team"])
    bNextGame = next_game_info(b["team"])

    a_stats = f"PTS: {a['averages']['pts']}, REB: {a['averages']['reb']}, AST: {a['averages']['ast']}, FG%: {a['averages']['fg_pct']}"
    b_stats = f"PTS: {b['averages']['pts']}, REB: {b['averages']['reb']}, AST: {b['averages']['ast']}, FG%: {b['averages']['fg_pct']}"

    prompt = f"""
Compare these players for betting/props:

Player A: {a['player_name']} ({a['team']})
Recent (last {last_n}): {a_stats}
Next game: {aNextGame}

Player B: {b['player_name']} ({b['team']})
Recent (last {last_n}): {b_stats}
Next game: {bNextGame}

Give:
1) Quick take (1-2 lines)
2) Key differences (bullets)
3) Lean + why (state uncertainty in normal language, but NO disclaimer line)
4) “If you only remember 1 thing…”
"""

    system = f"""
Always start with: HEYYYYY BUDDY!
You are a friendly NBA props analyst. Keep it punchy, fun, and structured.
{NO_DISCLAIMER_RULE}
{STYLE_GUIDE}
"""
    return _ask_openai(system, prompt, max_tokens=950)

def team_next_game(team_name):
    team = find_team_by_name(team_name)
    game = next_game_info(team_name)

    if not team or not game or isinstance(game, str):
        return f"❌ Could not find next game for: {team_name}"

    home = game["home_team"]
    visitor = game["visitor_team"]

    opponent = visitor if home["id"] == team["id"] else home
    location = "home" if home["id"] == team["id"] else "away"
    game_date = game["date"].split("T")[0]

    return f"🏟️ Next game: {team['full_name']} vs {opponent['full_name']} on {game_date} ({location})."

def will_player_score_over(name, target, last_n=5):
    proj = player_projection(name, last_n)
    if not proj:
        return "❌ Player not found."

    avg = proj["averages"]["pts"]
    likely = "more likely" if avg >= target else "less likely"

    return (
        f"🎯 Quick check:\n"
        f"• {proj['player_name']} recent avg (last {last_n}): {avg} PTS\n"
        f"• Target: {target}\n"
        f"➡️ That makes it {likely} they go over (based only on recent averages)."
    )

# -------------------------
# ✅ Generic chat for ALL sports
# -------------------------
def generic_chat(user_message: str, sport: str = "Sports") -> str:
    system = f"""
You are "Gambling Buddy" for {sport}.
Your job: answer the user in a clean, structured way, and ask 1-2 clarifying questions if needed.
Avoid wall-of-text. Make it easy to scan.
{NO_DISCLAIMER_RULE}
{STYLE_GUIDE}
"""
    return _ask_openai(system, user_message, max_tokens=900)

# -------------------------
# ✅ Games list (already structured)
# -------------------------
def nba_games(when: str = "this week") -> str:
    games = nba_games_all(when)

    if not games:
        return f"🏀 NBA Games ({when})\n❌ No games found."

    grouped: dict[str, list[dict]] = {}
    for g in games:
        d = (g.get("date") or "").split("T")[0]
        grouped.setdefault(d, []).append(g)

    lines = []
    lines.append(f"🏀 NBA Games ({when})")
    lines.append("")

    for day in sorted(grouped.keys()):
        lines.append(f"📅 {day}")
        for g in grouped[day]:
            away = g["visitor_team"]["full_name"]
            home = g["home_team"]["full_name"]
            lines.append(f"• {away} @ {home}")
        lines.append("")

    return "\n".join(lines).strip()
