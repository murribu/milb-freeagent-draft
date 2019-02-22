import React from "react";
import { Form, Button } from "react-bootstrap";
import players from "../players.json";

import AWSAppSyncClient from "aws-appsync";
import Amplify, { Auth } from "aws-amplify";
import awsconfig from "../aws-exports";
import gql from "graphql-tag";
import { getMyPicks } from "../graphql/queries";
import { addPick } from "../graphql/mutations";

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
              pl => pl.baseballamerica == p.playerId
            );
            if (player) {
              player.rank = p.rank;
              return player;
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
    var ordinal = 1;
    for (var p = 1; p <= 20; p++) {
      if (typeof this.state.picks[p] === "undefined") {
        ordinal = p;
        break;
      }
    }

    client
      .mutate({
        mutation: gql(addPick),
        variables: {
          playerId: e.currentTarget.attributes["data-player"].value,
          rank: ordinal
        }
      })
      .then(result => {
        console.log(result);
        setTimeout(this.getMyPicks, 100);
      });
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
      var pick = this.state.picks.find(pi => pi.rank === p);
      ret.push(
        <div key={p} className="row">
          <div className="col-1 text-right">{p}.</div>
          <div className="col-10">
            {pick ? pick.first_name + " " + pick.last_name : ""}
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
