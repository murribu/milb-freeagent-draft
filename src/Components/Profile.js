import React from "react";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import awsconfig from "../aws-exports";
import { Form, Button } from "react-bootstrap";
import { getMyProfile } from "../graphql/queries";
import { updateProfile } from "../graphql/mutations";

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.updateProfile = this.updateProfile.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
  }

  state = {
    profile: {
      displayName: null,
      twitterHandle: null,
      facebookHandle: null
    },
    serverProfile: {
      displayName: null,
      twitterHandle: null,
      facebookHandle: null
    }
  };

  componentDidMount() {
    this.getMyProfile();
  }

  componentDidUpdate(nextProps, nextState) {
    if (nextProps.sub !== this.props.sub) {
      // sub was just updated
      this.getMyProfile();
    }
  }

  handleFieldChange(e) {
    var profile = { ...this.state.profile };
    profile[e.currentTarget.attributes["data-field"].value] = e.target.value;
    this.setState({
      profile
    });
  }

  async getMyProfile() {
    if (
      this.props &&
      this.props.sub &&
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id === this.props.sub.substring(10)
    ) {
      var { data } = await API.graphql(graphqlOperation(getMyProfile));
      console.log(data.getMyProfile);
      if (data.getMyProfile) {
        var profile = {
          displayName: data.getMyProfile.displayName,
          twitterHandle: data.getMyProfile.twitterHandle,
          facebookHandle: data.getMyProfile.facebookHandle
        };
        this.setState({ profile: profile });
        this.setState({ serverProfile: profile });
      }
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
    Object.keys(this.state.profile).forEach(key => {
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
      return (
        <div className="container text-center">
          <h1>{this.state.displayName}</h1>
        </div>
      );
    }
  }
}

export default Profile;
