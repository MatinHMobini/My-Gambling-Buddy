import requests
from typing import Optional, Dict, Any


class BallDontLieAPI:
    BASE_URL = "https://api.balldontlie.io/v1"

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
        page: int = 1,
        per_page: int = 25
    ) -> Dict:
        params = {
            "page": page,
            "per_page": per_page
        }
        if search:
            params["search"] = search

        return self._get("players", params)

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
