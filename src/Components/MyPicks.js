import React from "react";
import { Form, Button } from "react-bootstrap";
import players from "../players.json";

import AWSAppSyncClient from "aws-appsync";
import Amplify, { Auth } from "aws-amplify";
import awsconfig from "../aws-exports";
import gql from "graphql-tag";
import { getMyPicks } from "../graphql/queries";
import { addPick, removePick } from "../graphql/mutations";

import "./MyPicks.css";

// Amplify init
Amplify.configure(awsconfig);

const GRAPHQL_API_REGION = awsconfig.aws_appsync_region;
const GRAPHQL_API_ENDPOINT_URL = awsconfig.aws_appsync_graphqlEndpoint;
const AUTH_TYPE = awsconfig.aws_appsync_authenticationType;

// AppSync client instantiation
const client = new AWSAppSyncClient({
  url: GRAPHQL_API_ENDPOINT_URL,
  region: GRAPHQL_API_REGION,
  auth: {
    type: AUTH_TYPE,
    // Get the currently logged in users credential.
    jwtToken: async () =>
      (await Auth.currentSession()).getAccessToken().getJwtToken()
  },
  cacheOptions: {}
});

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

  getMyPicks() {
    var self = this;
    client
      .query({ query: gql(getMyPicks), fetchPolicy: "network-only" })
      .then(({ data: { getMyPicks } }) => {
        var picks = getMyPicks
          .map(p => {
            var player = self.state.players.find(
              pl => parseInt(pl.baseballamerica) === parseInt(p.playerId)
            );
            if (player) {
              player.rank = p.rank;
              return player;
            } else {
              return null;
            }
          })
          .sort((a, b) => (a.rank > b.rank ? 1 : -1));
        self.setState({ loading: false, picks });
        console.log(getMyPicks);
      });
  }

  filteredPlayers() {
    return players
      .filter(
        p =>
          this.state.picks.filter(
            pick =>
              parseInt(pick.baseballamerica) === parseInt(p.baseballamerica)
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

  pickThisPlayer(e) {
    this.setState({ selectedPlayer: {} });
    var ordinal = 1;
    for (var p = 1; p <= 20; p++) {
      var pick = this.state.picks.find(pi => parseInt(pi.rank) === p);
      if (typeof pick === "undefined") {
        ordinal = p;
        break;
      }
    }

    client
      .mutate({
        mutation: gql(addPick),
        variables: {
          playerId: e.currentTarget.attributes["data-player-id"].value,
          rank: ordinal
        }
      })
      .then(result => {
        console.log(result);
        setTimeout(this.getMyPicks, 100);
      });
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
          <Button
            onClick={this.pickThisPlayer}
            data-player-id={this.state.selectedPlayer.baseballamerica}
          >
            Pick this Player
          </Button>
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

  removePick(e) {
    client
      .mutate({
        mutation: gql(removePick),
        variables: {
          playerId: e.currentTarget.attributes["data-player-id"].value
        }
      })
      .then(result => {
        console.log(result);
        setTimeout(this.getMyPicks, 100);
      });
  }

  renderPicks() {
    var ret = [];
    for (var p = 1; p <= 20; p++) {
      var pick = this.state.picks.find(pi => pi.rank === p);
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
          data-player-id={pick ? pick.baseballamerica : ""}
        >
          {pick ? pick.first_name + " " + pick.last_name : ""}
        </div>
      );
      if (pick) {
        elements.push(
          <Button
            key={p + "-4"}
            className="btn-danger btn-sm"
            style={{ paddingTop: "0px", paddingBottom: "0px", margin: "5px" }}
            data-player-id={pick.baseballamerica}
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
