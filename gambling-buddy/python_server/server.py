from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from pathlib import Path

# ✅ Load env from BOTH places:  
# - repo root: My-Gambling-Buddy/.env  (your keys are here)
# - app root:  gambling-buddy/.env    (in case you move it later)
APP_ROOT = Path(__file__).resolve().parents[1]         # .../My-Gambling-Buddy/gambling-buddy
REPO_ROOT = APP_ROOT.parent                           # .../My-Gambling-Buddy

load_dotenv(REPO_ROOT / ".env.local")
load_dotenv(REPO_ROOT / ".env")
load_dotenv(APP_ROOT / ".env.local")
load_dotenv(APP_ROOT / ".env")

from .openai_responder import (
    compare_players,
    player_recent_performance,
    team_next_game,
    will_player_score_over,
    generic_chat,
    nba_games,   # ✅ new
)

app = FastAPI()

# -----------------------
# Request models
# -----------------------
class GenericReq(BaseModel):
    sport: str
    message: str

class MatchupReq(BaseModel):
    sport: str = "NBA"
    p1: str
    p2: str
    last_n: int = 5

class PerfReq(BaseModel):
    sport: str = "NBA"
    player: str
    last_n: int = 5

class TeamReq(BaseModel):
    sport: str = "NBA"
    team: str

class OverReq(BaseModel):
    sport: str = "NBA"
    player: str
    target: float
    last_n: int = 5
    
class GamesReq(BaseModel):
    sport: str = "NBA"
    when: str = "this week"   # "today" or "this week"


# -----------------------
# Health
# -----------------------
@app.get("/health")
def health():
    return {"ok": True}

# -----------------------
# Generic chat (ALL non-NBA should use this)
# No custom prompts. Just pass user message straight to OpenAI.
# -----------------------
@app.post("/generic_chat")
def generic(req: GenericReq):
    try:
        return {"content": generic_chat(req.message)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------
# NBA-only endpoints
# If sport != NBA, we fall back to generic_chat automatically.
# -----------------------
@app.post("/matchup")
def matchup(req: MatchupReq):
    try:
        if req.sport != "NBA":
            # Since non-NBA won't show these buttons, this is just a safety fallback.
            return {"content": generic_chat(f"{req.p1} vs {req.p2} matchup")}
        return {"content": compare_players(req.p1, req.p2, req.last_n)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/performance")
def performance(req: PerfReq):
    try:
        if req.sport != "NBA":
            return {"content": generic_chat(req.player)}
        return {"content": player_recent_performance(req.player, req.last_n)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/team_next_game")
def team(req: TeamReq):
    try:
        if req.sport != "NBA":
            return {"content": generic_chat(req.team)}
        return {"content": team_next_game(req.team)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/over_under")
def over(req: OverReq):
    try:
        if req.sport != "NBA":
            return {"content": generic_chat(f"{req.player} over/under {req.target}")}
        return {"content": will_player_score_over(req.player, req.target, req.last_n)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@app.post("/games")
def games(req: GamesReq):
    try:
        if req.sport != "NBA":
            return {"content": generic_chat(f"{req.sport} games {req.when}")}
        return {"content": nba_games(req.when)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

