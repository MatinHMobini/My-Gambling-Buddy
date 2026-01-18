from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# ✅ Load env from project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(PROJECT_ROOT, ".env.local"))
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

from .openai_responder import (
    compare_players,
    player_recent_performance,
    team_next_game,
    will_player_score_over,
)


app = FastAPI()

class MatchupReq(BaseModel):
    p1: str
    p2: str
    last_n: int = 5

class PerfReq(BaseModel):
    player: str
    last_n: int = 5

class TeamReq(BaseModel):
    team: str

class OverReq(BaseModel):
    player: str
    target: float
    last_n: int = 5

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/matchup")
def matchup(req: MatchupReq):
    try:
        return {"content": compare_players(req.p1, req.p2, req.last_n)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/performance")
def performance(req: PerfReq):
    try:
        return {"content": player_recent_performance(req.player, req.last_n)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/team_next_game")
def team(req: TeamReq):
    try:
        return {"content": team_next_game(req.team)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/over_under")
def over(req: OverReq):
    try:
        return {"content": will_player_score_over(req.player, req.target, req.last_n)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
