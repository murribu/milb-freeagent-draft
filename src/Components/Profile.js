import React from "react";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import awsconfig from "../aws-exports";
import { Form, Button } from "react-bootstrap";
import { getMyProfile, getUser } from "../graphql/queries";
import { updateProfile } from "../graphql/mutations";

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
    loading_profile: false
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
        var { data } = await API.graphql(
          graphqlOperation(getUser, {
            id: awsconfig.aws_project_region + ":" + this.props.match.params.id
          })
        );
        if (data && data.getUser) {
          var profile = {
            sub: this.props.match.params.id,
            displayName: data.getUser.displayName,
            twitterHandle: data.getUser.twitterHandle,
            facebookHandle: data.getUser.facebookHandle
          };
          this.setState({ profile });
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
        </div>
      );
    } else {
      var sorted_user_leaders = this.props.user_leaders.sort((a, b) =>
        a.score > b.score ? -1 : 1
      );
      var userIdx = sorted_user_leaders.findIndex(
        u =>
          u.sub ===
          awsconfig.aws_project_region + ":" + this.props.match.params.id
      );
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
              Rank: {userIdx + 1} out of {this.props.user_leaders.length}
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
        </div>
      );
    }
  }
}

export default Profile;
