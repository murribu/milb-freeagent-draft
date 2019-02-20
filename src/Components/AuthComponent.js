import React from "react";
import { Authenticator } from "aws-amplify-react";
import Amplify, { Auth } from "aws-amplify";
import aws_exports from "../aws-exports";
import FacebookButton from "./FacebookButton";

class AuthComponent extends React.Component {
  handleStateChange = state => {
    console.log(state);
    if (state === "signedIn") {
      this.props.onUserSignIn();
    }
    if (state === "signIn") {
      this.props.onUserSignOut();
    }
  };

  handleFbLogin = () => {
    this.props.onUserSignIn();
  };

  render() {
    console.log(this.props);
    return (
      <div>
        <Authenticator onStateChange={this.handleStateChange} />
        <FacebookButton onLogin={this.handleFbLogin} />
        <hr />
      </div>
    );
  }
}

export default AuthComponent;
