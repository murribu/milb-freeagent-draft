import React from "react";
// import { Authenticator } from "aws-amplify-react";
// import Amplify, { Auth } from "aws-amplify";
// import aws_exports from "../aws-exports";
import SignIn from "./authentication/SignIn";

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
    return <SignIn key={1} onUserSignIn={this.props.onUserSignIn} />;
  }
}

export default AuthComponent;
