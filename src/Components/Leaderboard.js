import React from "react";
import players from "../players.json";
import { LinkContainer } from "react-router-bootstrap";
import moment from "moment";
import "./Leaderboard.css";

class Leaderboard extends React.Component {
  score(player) {
    return Math.max(
      this.props.hitter_leaders.leaders[player.mlb]
        ? parseInt(this.props.hitter_leaders.leaders[player.mlb])
        : 0,
      this.props.pitcher_leaders.leaders[player.mlb]
        ? parseInt(this.props.pitcher_leaders.leaders[player.mlb])
        : 0
    );
  }

  sortedPlayers() {
    return players
      .filter(
        p =>
          this.props.hitter_leaders.leaders[p.mlb] ||
          this.props.pitcher_leaders.leaders[p.mlb]
      )
      .sort((a, b) => (this.score(a) > this.score(b) ? -1 : 1))
      .slice(0, 19);
  }

  sortedUsers() {
    var current_user = this.props.user_leaders.leaders.find(
      u => u.sub === this.props.sub
    );
    var users = this.props.user_leaders.leaders.sort((a, b) =>
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
    var offset = new Date().getTimezoneOffset();
    var usersUpdatedAt =
      this.props.user_leaders && this.props.user_leaders.updatedAt
        ? moment(this.props.user_leaders.updatedAt)
            .subtract(offset, "minutes")
            .fromNow()
        : "";
    var playersUpdatedAt =
      this.props.hitter_leaders && this.props.hitter_leaders.updatedAt
        ? moment(this.props.hitter_leaders.updatedAt)
            .subtract(offset, "minutes")
            .fromNow()
        : "";
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 col-sm-12">
            <h2>User Leaders</h2>
            <p>Last Updated: {usersUpdatedAt}</p>
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
                <div className="col-1">
                  {this.props.renderRank(parseInt(u), sortedUsers.users)}
                </div>
                <div className="col-9">
                  <LinkContainer
                    to={"/profile/" + sortedUsers.users[u].sub.substring(10)}
                  >
                    <a href="#">{sortedUsers.users[u].displayName}</a>
                  </LinkContainer>
                </div>
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
            <p>Last Updated: {playersUpdatedAt}</p>
            <div className="container">
              <div className="row">
                <div className="col-8">Name</div>
                <div className="col-4">Score</div>
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
