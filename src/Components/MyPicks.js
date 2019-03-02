import React from "react";
import { Form, Button } from "react-bootstrap";
import players from "../players.json";

import Amplify, { API, graphqlOperation } from "aws-amplify";
import config from "../config";
import { getMyPicks } from "../graphql/queries";
import { addPick, removePick } from "../graphql/mutations";

import "./MyPicks.css";

// Amplify init
Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Identity Pool ID
    userPoolId: config.awsconfig.aws_user_pools_id,
    // REQUIRED - Amazon Cognito Region
    region: config.awsconfig.aws_cognito_region,
    // OPTIONAL - Amazon Cognito User Pool ID
    identityPoolId: config.awsconfig.aws_cognito_identity_pool_id,
    // OPTIONAL - Amazon Cognito Web Client ID
    userPoolWebClientId: config.awsconfig.aws_user_pools_web_client_id
  },
  API: {
    aws_appsync_graphqlEndpoint: config.awsconfig.aws_appsync_graphqlEndpoint,
    aws_appsync_region: config.awsconfig.aws_cognito_region,
    aws_appsync_authenticationType: "AWS_IAM"
  }
});

const sites = [
  {
    display: "MLB",
    href: "http://mlb.mlb.com/team/player.jsp?player_id=*",
    prop: "mlb"
  },
  {
    display: "Baseball America",
    href: "https://www.baseballamerica.com/players/*",
    prop: "baseballamerica"
  },
  {
    display: "Fangraphs",
    href: "http://www.fangraphs.com/statss.aspx?playerid=*",
    prop: "fangraphs"
  },
  {
    display: "Baseball Reference",
    href: "http://www.baseball-reference.com/players/*",
    prop: "bbref"
  },
  {
    display: "Baseball Reference Minors",
    href: "http://minors.baseball-reference.com/minors/player.cgi?id=*",
    prop: "bbrefminors"
  },
  {
    display: "Rotoworld",
    href: "https://www.rotoworld.com/baseball/mlb/player/*",
    prop: "rotoworld"
  },
  {
    display: "CBS",
    href: "http://www.sportsline.com/mlb/players/playerpage/*",
    prop: "cbs"
  },
  {
    display: "Yahoo",
    href: "http://sports.yahoo.com/mlb/players/*",
    prop: "yahoo"
  },
  {
    display: "Twitter",
    href: "https://twitter.com/*",
    prop: "twitter"
  }
];

class MyPicks extends React.Component {
  constructor(props) {
    super(props);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.renderSelectedPlayer = this.renderSelectedPlayer.bind(this);
    this.selectPlayer = this.selectPlayer.bind(this);
    this.pickThisPlayer = this.pickThisPlayer.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.getMyPicks = this.getMyPicks.bind(this);
    this.removePick = this.removePick.bind(this);
  }

  state = {
    players: players,
    sortColumn: "last_name",
    sortDirection: "asc",
    search: "",
    selectedPlayer: {},
    picks: [],
    loading: true
  };

  componentDidMount() {
    this.getMyPicks();
  }

  async getMyPicks() {
    this.setState({ loading: true });
    var { data } = await API.graphql(graphqlOperation(getMyPicks));
    console.log(data.getMyPicks);
    this.setState({ loading: false, picks: data.getMyPicks });
  }

  filteredPlayers() {
    return players
      .filter(
        p =>
          this.state.picks.filter(
            pick => parseInt(pick.playerId) === parseInt(p.baseballamerica)
          ).length === 0 &&
          (this.state.search === "" ||
            (p.first_name + " " + p.last_name)
              .toLowerCase()
              .indexOf(this.state.search.toLowerCase()) > -1 ||
            p.team.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1)
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

  async pickThisPlayer(e) {
    this.setState({ selectedPlayer: {} });
    var ordinal = 1;
    for (var p = 1; p <= 20; p++) {
      var pick = this.state.picks.find(pi => parseInt(pi.rank) === p);
      if (typeof pick === "undefined") {
        ordinal = p;
        break;
      }
    }

    try {
      await API.graphql(
        graphqlOperation(addPick, {
          playerId: e.currentTarget.attributes["data-player-id"].value,
          rank: ordinal
        })
      );
      setTimeout(this.getMyPicks, 100);
    } catch (e) {
      console.log(e);
    }
  }

  selectPlayer(e) {
    var player = this.state.players.find(
      p =>
        parseInt(p.baseballamerica) ===
        parseInt(e.currentTarget.attributes["data-player-id"].value)
    );
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
          {this.props.isReadonly ? (
            ""
          ) : (
            <Button
              onClick={this.pickThisPlayer}
              data-player-id={this.state.selectedPlayer.baseballamerica}
            >
              Pick this Player
            </Button>
          )}
          <p className="lead mt-5">
            View{" "}
            {this.state.selectedPlayer.first_name +
              " " +
              this.state.selectedPlayer.last_name}{" "}
            on
          </p>
          {Object.keys(this.state.selectedPlayer).map(k => {
            var site = sites.find(s => s.prop === k);
            if (site && this.state.selectedPlayer[k] !== null) {
              var href;
              if (k === "bbref") {
                href = site.href.replace(
                  "*",
                  this.state.selectedPlayer[k].substring(0, 1) +
                    "/" +
                    this.state.selectedPlayer[k] +
                    ".shtml"
                );
              } else {
                href = site.href.replace("*", this.state.selectedPlayer[k]);
              }
              return (
                <p key={"selectedPlayer-" + k}>
                  <a href={href} target="_new">
                    {site.display}
                  </a>
                </p>
              );
            } else {
              return "";
            }
          })}
        </div>
      );
    } else {
      return (
        <h3 className="lead text-center mt-5">
          Click on a player to view them.
        </h3>
      );
    }
  }

  async removePick(e) {
    try {
      await API.graphql(
        graphqlOperation(removePick, {
          playerId: e.currentTarget.attributes["data-player-id"].value
        })
      );
      setTimeout(this.getMyPicks, 100);
    } catch (e) {
      console.log(e);
    }
  }

  renderPicks() {
    var ret = [];
    if (this.state.loading) {
      return "Loading...";
    } else {
      for (var p = 1; p <= 20; p++) {
        var pick = this.state.picks.find(pi => pi.rank === p);
        var player = pick
          ? this.state.players.find(
              pl => parseInt(pl.baseballamerica) === parseInt(pick.playerId)
            )
          : null;
        var elements = [];
        elements.push(<div key={p + "-1"} className="col-1" />);
        elements.push(
          <div key={p + "-2"} className="col-1 text-right">
            {p}.
          </div>
        );
        elements.push(
          <div
            key={p + "-3"}
            className="col-7 pointy nowrap"
            onClick={this.selectPlayer}
            data-player-id={player ? player.baseballamerica : ""}
          >
            {player ? player.first_name + " " + player.last_name : ""}
          </div>
        );
        if (player && !this.props.isReadonly) {
          elements.push(
            <Button
              key={p + "-4"}
              className="btn-danger btn-sm"
              style={{ paddingTop: "0px", paddingBottom: "0px", margin: "5px" }}
              data-player-id={player.baseballamerica}
              onClick={this.removePick}
            >
              &times;
            </Button>
          );
        }
        ret.push(
          <div key={p} className="row" style={{ height: "33px" }}>
            {elements}
          </div>
        );
      }
      return ret;
    }
  }

  render() {
    var filteredPlayers = this.filteredPlayers();
    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6 col-sm-8 col-xs-12">
            <div className="container">
              <h2 className="text-center">My Picks</h2>
              {this.renderPicks()}
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-4 col-xs-12">
            {this.renderSelectedPlayer()}
          </div>
          <div className="col-lg-4 col-md-12 col-sm-12 col-xs-12">
            <Form.Control
              placeholder="search"
              defaultValue={this.state.search}
              onChange={this.handleSearchChange}
            />
            <div
              className="container"
              style={{ maxHeight: "660px", overflowY: "scroll" }}
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
                  className={"row pointy " + (key % 2 === 0 ? "gray" : "")}
                  key={key}
                  data-player-id={filteredPlayers[key].baseballamerica}
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
