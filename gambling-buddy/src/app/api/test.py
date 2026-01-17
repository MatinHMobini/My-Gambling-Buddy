from openai_responder import (
    player_recent_performance,
    compare_players,
    team_next_game,
    will_player_score_over
)

#---- Player test ----
#player = "Stephen Curry"
#print("---- Player Recent Performance ----")
#print(player_recent_performance(player))

#---- Player comparison test ----
print("\n---- Compare Players ----")
print(compare_players("Stephen Curry", "LeBron James"))

# ---- Team next game test ----
#team = "Golden State Warriors"
#print("\n---- Team Next Game ----")
#print(team_next_game(team))

# ---- Over/Under prediction test ----
#target_points = 30
#print("\n---- Will Player Score Over ----")
#print(will_player_score_over(player, target_points))
