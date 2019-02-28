import React from "react";
import players from "../players.json";
import axios from "axios";
import hitter_leaders from "../hitter_leaders.json";
import pitcher_leaders from "../pitcher_leaders.json";
import user_leaders from "../user_leaders.json";
import "./Leaderboard.css";

class Leaderboard extends React.Component {
  state = {
    hitter_leaders: {},
    pitcher_leaders: {},
    user_leaders: []
  };

  componentDidMount() {
    axios
      .get("hitter_leaders.json")
      .then(({ data }) => console.log(data))
      .catch(() => {
        this.state.hitter_leaders = hitter_leaders;
      });
    axios
      .get("pitcher_leaders.json")
      .then(({ data }) => console.log(data))
      .catch(() => {
        this.state.pitcher_leaders = pitcher_leaders;
      });
    axios
      .get("user_leaders.json")
      .then(({ data }) => console.log(data))
      .catch(() => {
        this.state.user_leaders = user_leaders;
      });
  }

  score(player) {
    return Math.max(
      this.state.hitter_leaders[player.mlb]
        ? parseInt(this.state.hitter_leaders[player.mlb])
        : 0,
      this.state.pitcher_leaders[player.mlb]
        ? parseInt(this.state.pitcher_leaders[player.mlb])
        : 0
    );
  }

  sortedPlayers() {
    return players
      .filter(
        p =>
          this.state.hitter_leaders[p.mlb] || this.state.pitcher_leaders[p.mlb]
      )
      .sort((a, b) => (this.score(a) > this.score(b) ? -1 : 1));
  }

  sortedUsers() {
    var current_user = this.state.user_leaders.find(
      u => u.sub === this.props.sub
    );
    var users = this.state.user_leaders.sort((a, b) =>
      a.score > b.score ? -1 : 1
    );
    var rank = 1;
    for (var u = 0; u > users.length; u++) {
      if (u === 0 || users[u].score !== users[u - 1].score) {
        rank = u + 1;
      }
      if (users[u].sub === this.props.sub) {
        break;
      }
    }
    users.slice(0, 19);
    return { users, rank, current_user };
  }

  render() {
    var sortedPlayers = this.sortedPlayers();
    var sortedUsers = this.sortedUsers();
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 col-sm-12">
            <h2>User Leaders</h2>
            <div className="row">
              <div className="col-1">&nbsp;</div>
              <div className="col-9">Name</div>
              <div className="col-2">Score</div>
            </div>
            {Object.keys(sortedUsers.users).map(u => (
              <div
                key={u}
                className={
                  "row" +
                  (sortedUsers.users[u].sub === this.props.sub
                    ? " highlight"
                    : "")
                }
              >
                <div className="col-1">{parseInt(u) + 1}</div>
                <div className="col-9">{sortedUsers.users[u].sub}</div>
                <div className="col-2">{sortedUsers.users[u].score}</div>
              </div>
            ))}
            {sortedUsers.rank > 20 ? (
              <div className="row highlight">
                <div className="col-1">{sortedUsers.rank}</div>
                <div className="col-9">{sortedUsers.current_user.sub}</div>
                <div className="col-2">{sortedUsers.current_user.score}</div>
              </div>
            ) : (
              ""
            )}
          </div>
          <div className="col-md-6 col-sm-12">
            <h2>Player Leaders</h2>
            <div className="container">
              <div className="row">
                <div className="col-6">Name</div>
                <div className="col-6">Score</div>
              </div>
              {Object.keys(sortedPlayers).map(key => (
                <div key={key} className="row">
                  <div className="col-8">
                    <a
                      href={
                        "http://mlb.mlb.com/team/player.jsp?player_id=" +
                        sortedPlayers[key].mlb
                      }
                      target="_new"
                    >
                      {sortedPlayers[key].first_name}{" "}
                      {sortedPlayers[key].last_name}
                    </a>
                  </div>
                  <div className="col-4">{this.score(sortedPlayers[key])}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Leaderboard;
