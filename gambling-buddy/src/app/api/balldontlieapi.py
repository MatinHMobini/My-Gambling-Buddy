import requests
from typing import Optional, Dict, Any


class BallDontLieAPI:
    BASE_URL = "https://api.balldontlie.io/v1"
    ODDS_URL = "https://api.balldontlie.io/nba/v2"

    def __init__(self, api_key: Optional[str] = None, timeout: int = 10):
        self.session = requests.Session()
        self.timeout = timeout

        if api_key:
            self.session.headers.update({
                "Authorization": api_key
            })

    def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict:
        url = f"{self.BASE_URL}/{endpoint}"
        response = self.session.get(url, params=params, timeout=self.timeout)
        response.raise_for_status()
        return response.json()

    # --------------------
    # Players
    # --------------------
    def get_players(
        self,
        search: Optional[str] = None,
        team_ids: Optional[str] = None,
        page: int = 1,
        per_page: int = 25
    ) -> Dict:
        params = {
            "page": page,
            "per_page": per_page,
            "team_ids[]": team_ids
        }
        if search:
            params["search"] = search

        return self._get("players/active", params)

    def get_player(self, player_id: int) -> Dict:
        return self._get(f"players/{player_id}")

    # --------------------
    # Teams
    # --------------------
    def get_teams(self) -> Dict:
        return self._get("teams")

    def get_team(self, team_id: int) -> Dict:
        return self._get(f"teams/{team_id}")

    # --------------------
    # Games
    # --------------------
    def get_games(
        self,
        dates: Optional[list[str]] = None,
        seasons: Optional[list[int]] = None,
        team_ids: Optional[list[int]] = None,
        page: int = 1,
        per_page: int = 25
    ) -> Dict:
        params = {
            "page": page,
            "per_page": per_page
        }

        if dates:
            params["dates[]"] = dates
        if seasons:
            params["seasons[]"] = seasons
        if team_ids:
            params["team_ids[]"] = team_ids

        return self._get("games", params)

    def get_game(self, game_id: int) -> Dict:
        return self._get(f"games/{game_id}")
    
    def get_lineups(
        self,
        game_ids: list[int],
        page: int = 1,
        per_page: int = 25
    ) -> Dict:
        params: Dict[str, object] = {
            "page": page,
            "per_page": per_page,
            "game_ids[]": game_ids
        }
        return self._get("lineups", params)

    # --------------------
    # Stats
    # --------------------
    def get_stats(
        self,
        player_ids: Optional[list[int]] = None,
        game_ids: Optional[list[int]] = None,
        seasons: Optional[list[int]] = None,
        page: int = 1,
        per_page: int = 25
    ) -> Dict:
        params = {
            "page": page,
            "per_page": per_page
        }

        if player_ids:
            params["player_ids[]"] = player_ids
        if game_ids:
            params["game_ids[]"] = game_ids
        if seasons:
            params["seasons[]"] = seasons

        return self._get("stats", params)
    
    def get_odds(self, dates: Optional[list[str]] = None) -> list[dict]:
        """
        Fetch odds from multiple sportsbooks for the given dates.
        """
        params = {}
        if dates:
            params["dates[]"] = dates
        
        url = f"{self.ODDS_URL}/odds"
        response = self.session.get(url, params=params, timeout=self.timeout)
        response.raise_for_status()
        return response.json().get("data", [])
    
    def find_best_moneyline(self, odds_list: list[dict], side: str):
        """
        side = "home" or "away"
        Returns: (vendor_name, best_odds)
        """
        key = "moneyline_home_odds" if side == "home" else "moneyline_away_odds"
        valid = [o for o in odds_list if o[key] is not None]
        if not valid:
            return None, None
        best = max(valid, key=lambda x: x[key])
        return best["vendor"], best[key]

    @staticmethod
    def american_to_implied_prob(odds: int) -> float:
        """
        Convert American odds to implied probability (0–1).
        Positive odds: 100 / (odds + 100)
        Negative odds: |odds| / (|odds| + 100)
        """
        if odds > 0:
            return 100 / (odds + 100)
        else:
            return abs(odds) / (abs(odds) + 100)