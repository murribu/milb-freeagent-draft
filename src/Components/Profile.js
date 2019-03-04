import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import config from "../config";
import { Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getMyProfile, getUser, getUserPicks } from "../graphql/queries";
import { updateProfile } from "../graphql/mutations";
import players from "../players.json";

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.updateProfile = this.updateProfile.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
  }

  state = {
    profile: {
      sub: null,
      displayName: null,
      twitterHandle: null,
      facebookHandle: null
    },
    serverProfile: {
      displayName: null,
      twitterHandle: null,
      facebookHandle: null
    },
    loading_profile: false,
    picks: []
  };

  componentDidMount() {
    this.getProfile();
  }

  componentWillUnmount() {
    this.setState({
      profile: {
        sub: null,
        displayName: null,
        twitterHandle: null,
        facebookHandle: null
      }
    });
  }

  componentDidUpdate(nextProps, nextState) {
    if (nextProps.sub !== this.props.sub) {
      // sub was just updated
      this.setState({ loading_profile: true });
      this.getProfile();
    }
  }

  handleFieldChange(e) {
    var profile = { ...this.state.profile };
    profile[e.currentTarget.attributes["data-field"].value] = e.target.value;
    this.setState({
      profile
    });
  }

  async getUserPicks() {
    try {
      var { data } = await API.graphql(
        graphqlOperation(getUserPicks, {
          id:
            config.awsconfig.aws_project_region +
            ":" +
            this.props.match.params.id
        })
      );
      console.log(data.getUserPicks);
      if (data.getUserPicks) {
        this.setState({ picks: data.getUserPicks });
      }
    } catch (e) {
      console.log("error", e);
    }
  }

  async getProfile() {
    if (
      this.props &&
      this.props.sub &&
      this.props.match &&
      this.props.match.params
    ) {
      if (this.props.match.params.id === this.props.sub.substring(10)) {
        // Only get my profile if I'm looking at my own
        var { data } = await API.graphql(graphqlOperation(getMyProfile));
        console.log(data.getMyProfile);
        if (data.getMyProfile) {
          var profile = {
            sub: this.props.match.params.id,
            displayName: data.getMyProfile.displayName,
            twitterHandle: data.getMyProfile.twitterHandle,
            facebookHandle: data.getMyProfile.facebookHandle
          };
          this.setState({
            profile,
            serverProfile: profile
          });
        }
      } else {
        if (this.props.isLoggedIn) {
          var response = await API.graphql(
            graphqlOperation(getUser, {
              id:
                config.awsconfig.aws_project_region +
                ":" +
                this.props.match.params.id
            })
          );
          data = response.data;
          if (data && data.getUser) {
            profile = {
              sub: this.props.match.params.id,
              displayName: data.getUser.displayName,
              twitterHandle: data.getUser.twitterHandle,
              facebookHandle: data.getUser.facebookHandle
            };
            this.setState({ profile });
          }
          await this.getUserPicks();
        } else {
          // if you're not logged in, you get last night's data
          profile = this.props.user_leaders.leaders.find(
            u =>
              u.sub ===
              config.awsconfig.aws_project_region +
                ":" +
                this.props.match.params.id
          );
          if (profile) {
            this.setState({
              sub: this.props.match.params.id,
              displayName: profile.displayName,
              twitterHandle: profile.twitterHandle,
              facebookHandle: profile.facebookHandle
            });
          }
        }
      }
      this.setState({ loading_profile: false });
    }
  }

  async updateProfile(e) {
    e.preventDefault();
    try {
      var { data } = await API.graphql(
        graphqlOperation(updateProfile, this.state.profile)
      );
      this.setState({
        serverProfile: {
          displayName: data.updateProfile.displayName,
          twitterHandle: data.updateProfile.twitterHandle,
          facebookHandle: data.updateProfile.facebookHandle
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  playersWithStats() {
    return players.map(p => {
      var score =
        this.props.hitter_leaders.leaders[p.mlb] ||
        this.props.pitcher_leaders.leaders[p.mlb];
      var ret = p;
      p.score = score;
      return ret;
    });
  }

  renderUpdateButton() {
    var dirty = false;
    Object.keys(this.state.serverProfile).forEach(key => {
      if (this.state.profile[key] !== this.state.serverProfile[key]) {
        dirty = true;
      }
    });
    if (dirty) {
      return <Button onClick={this.updateProfile}>Update</Button>;
    } else {
      return (
        <Button onClick={this.updateProfile} disabled>
          Update
        </Button>
      );
    }
  }

  render() {
    if (
      this.props &&
      this.props.sub &&
      this.props.match.params.id === this.props.sub.substring(10)
    ) {
      return (
        <div className="container text-center m-5">
          <h1>Your profile</h1>
          <div className="row m-5">
            <div className="col-12">
              <h4>Display Name</h4>
              <Form.Control
                placeholder="Display Name"
                defaultValue={this.state.profile.displayName}
                data-field="displayName"
                onChange={this.handleFieldChange}
              />
            </div>
          </div>
          <div className="row m-5">
            <div className="col-12">
              <h4>Twitter Handle</h4>
              <Form.Control
                placeholder="Twitter Handle"
                defaultValue={this.state.profile.twitterHandle}
                data-field="twitterHandle"
                onChange={this.handleFieldChange}
              />
            </div>
          </div>
          <div className="row m-5">
            <div className="col-12">
              <h4>Facebook Handle</h4>
              <Form.Control
                placeholder="Facebook Handle"
                defaultValue={this.state.profile.facebookHandle}
                data-field="facebookHandle"
                onChange={this.handleFieldChange}
              />
            </div>
          </div>
          <div className="row m-5">
            <div className="col-12">{this.renderUpdateButton()}</div>
          </div>
          <div className="row m-5">
            <Link to="/picks">My picks</Link>
          </div>
        </div>
      );
    } else {
      var sorted_user_leaders = this.props.user_leaders.leaders.sort((a, b) =>
        a.score > b.score ? -1 : 1
      );
      var userIdx = sorted_user_leaders.findIndex(
        u =>
          u.sub ===
          config.awsconfig.aws_project_region + ":" + this.props.match.params.id
      );
      var picks = [];
      var playersWithStats = this.playersWithStats();

      for (var rank = 1; rank <= 20; rank++) {
        var pick = this.state.picks.find(
          p => parseInt(p.rank) === parseInt(rank)
        );
        var player = playersWithStats.find(pl =>
          pick
            ? parseInt(pl.baseballamerica) === parseInt(pick.playerId)
            : false
        );
        if (pick && player) {
          pick.player = player;
        }
        picks.push(pick);
      }
      return (
        <div className="container text-center">
          <h1>
            {this.props.loading_leaders || this.state.loading_profile
              ? ""
              : sorted_user_leaders[userIdx].displayName}
          </h1>
          <h2>
            Score:{" "}
            {sorted_user_leaders && userIdx > -1 && sorted_user_leaders[userIdx]
              ? sorted_user_leaders[userIdx].score
              : 0}
          </h2>
          {userIdx > -1 ? (
            <h2>
              Rank: {this.props.renderRank(userIdx, sorted_user_leaders)} out of{" "}
              {this.props.user_leaders.leaders.length}
            </h2>
          ) : (
            ""
          )}
          {this.state.profile.twitterHandle ? (
            <p>
              <a
                target="_new"
                href={"https://twitter.com/" + this.state.profile.twitterHandle}
              >
                @{this.state.profile.twitterHandle}
              </a>
            </p>
          ) : (
            ""
          )}
          {this.state.profile.facebookHandle ? (
            <p>
              <a
                target="_new"
                href={
                  "https://facebook.com/" + this.state.profile.facebookHandle
                }
              >
                @{this.state.profile.facebookHandle}
              </a>
            </p>
          ) : (
            ""
          )}
          {this.state.picks.length > 0 ? (
            <div className="container mt-5">
              <h4>Picks</h4>
              <div className="row">
                <div className="col-lg-4 col-md-3 col-1">&nbsp;</div>
                <div className="col-1">Rank</div>
                <div className="col-lg-2 col-md-4 col-7">Name</div>
                <div className="col-1">Score</div>
                <div className="col-lg-4 col-md-3 col-1">&nbsp;</div>
              </div>
              {Object.keys(picks).map(key => (
                <div className="row" key={key}>
                  <div className="col-lg-4 col-md-3 col-1">&nbsp;</div>
                  <div className="col-1">{parseInt(key) + 1}</div>
                  <div className="col-lg-2 col-md-4 col-7">
                    {picks[key] && picks[key].player
                      ? picks[key].player.first_name +
                        " " +
                        picks[key].player.last_name
                      : ""}
                  </div>
                  <div className="col-1">
                    {picks[key] && picks[key].player
                      ? picks[key].player.score
                        ? picks[key].player.score
                        : 0
                      : ""}
                  </div>
                  <div className="col-lg-4 col-md-3 col-1">&nbsp;</div>
                </div>
              ))}
            </div>
          ) : (
            ""
          )}
        </div>
      );
    }
  }
}

export default Profile;
