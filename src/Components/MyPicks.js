import React from "react";
import { Form, Button } from "react-bootstrap";
import players from "../players.json";
import "./MyPicks.css";

class MyPicks extends React.Component {
  constructor(props) {
    super(props);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.renderSelectedPlayer = this.renderSelectedPlayer.bind(this);
    this.selectPlayer = this.selectPlayer.bind(this);
    this.pickThisPlayer = this.pickThisPlayer.bind(this);
  }

  state = {
    players: players,
    sortColumn: "last_name",
    sortDirection: "asc",
    search: "",
    selectedPlayer: {},
    picks: {}
  };

  filteredPlayers() {
    return players
      .filter(
        p =>
          this.state.search === "" ||
          (p.first_name + " " + p.last_name)
            .toLowerCase()
            .indexOf(this.state.search.toLowerCase()) > -1 ||
          p.team.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1
      )
      .sort(
        (a, b) =>
          (this.state.sortDirection === "asc" ? 1 : -1) *
          (a[this.state.sortColumn] &&
          b[this.state.sortColumn] &&
          a[this.state.sortColumn].toLowerCase() >
            b[this.state.sortColumn].toLowerCase()
            ? 1
            : -1)
      );
  }

  sortedPicks() {
    var ordered = {};
    Object.keys(this.state.picks)
      .sort()
      .forEach(k => (ordered[k] = this.state.picks[k]));
    return ordered;
  }

  handleSearchChange(e) {
    this.setState({ search: e.target.value });
  }

  handleSortChange(e) {
    e.preventDefault();
    if (this.state.sortColumn === e.target.attributes["data-column"].value) {
      this.setState({
        sortDirection: this.state.sortDirection === "asc" ? "desc" : "asc"
      });
    } else {
      this.setState({
        sortDirection: "asc",
        sortColumn: e.target.attributes["data-column"].value
      });
    }
  }

  pickThisPlayer(e) {
    var player_ba_id = e.currentTarget.attributes["data-player"].value;
    var player = this.state.players.find(
      p => p.baseballamerica === player_ba_id
    );
    var picks = { ...this.state.picks };
    var ordinal = 1;
    for (var p = 1; p <= 20; p++) {
      if (typeof picks[p] === "undefined") {
        ordinal = p;
        break;
      }
    }
    picks[ordinal] = player;
    this.setState({ picks });
  }

  selectPlayer(e) {
    var filteredPlayers = this.filteredPlayers();
    var player = filteredPlayers[e.currentTarget.attributes["data-key"].value];
    console.log(player);
    this.setState({ selectedPlayer: player });
  }

  renderSelectedPlayer() {
    if (typeof this.state.selectedPlayer.first_name !== "undefined") {
      return (
        <div className="text-center">
          <h3>
            {this.state.selectedPlayer.first_name +
              " " +
              this.state.selectedPlayer.last_name}
          </h3>
          <p className="lead">{this.state.selectedPlayer.team}</p>
          <Button
            onClick={this.pickThisPlayer}
            data-player={this.state.selectedPlayer.baseballamerica}
          >
            Pick this Player
          </Button>
        </div>
      );
    } else {
      return "";
    }
  }

  renderPicks() {
    var ret = [];
    for (var p = 1; p <= 20; p++) {
      ret.push(
        <div className="row">
          <div className="col-1 text-right">{p}.</div>
          <div className="col-10">
            {this.state.picks[p]
              ? this.state.picks[p].first_name +
                " " +
                this.state.picks[p].last_name
              : ""}
          </div>
        </div>
      );
    }
    return ret;
  }

  render() {
    var filteredPlayers = this.filteredPlayers();
    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-4 col-xs-12">
            <div className="container">
              <h2>My Picks</h2>
              {this.renderPicks()}
            </div>
          </div>
          <div className="col-sm-4 col-xs-12">
            {this.renderSelectedPlayer()}
          </div>
          <div className="col-sm-4 col-xs-12">
            <Form.Control
              placeholder="search"
              defaultValue={this.state.search}
              onChange={this.handleSearchChange}
            />
            <div
              className="container"
              style={{ maxHeight: "500px", overflowY: "scroll" }}
            >
              <div className="row">
                <div className="col-6" style={{ fontWeight: "bold" }}>
                  <a
                    href="#"
                    onClick={this.handleSortChange}
                    data-column="last_name"
                  >
                    Name
                  </a>
                </div>
                <div className="col-6" style={{ fontWeight: "bold" }}>
                  <a
                    href="#"
                    onClick={this.handleSortChange}
                    data-column="team"
                  >
                    Team
                  </a>
                </div>
              </div>
              {Object.keys(filteredPlayers).map(key => (
                <div
                  className={"row " + (key % 2 === 0 ? "gray" : "")}
                  key={key}
                  data-key={key}
                  onClick={this.selectPlayer}
                >
                  <div className="col-6">
                    {filteredPlayers[key].first_name +
                      " " +
                      filteredPlayers[key].last_name}
                  </div>
                  <div className="col-6">{filteredPlayers[key].team}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MyPicks;
