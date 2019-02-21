import React from "react";
// import { Authenticator } from "aws-amplify-react";
// import Amplify, { Auth } from "aws-amplify";
// import aws_exports from "../aws-exports";
import FacebookButton from "./FacebookButton";
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
    var ret = [];
    // if (this.props.isLoggedIn) {
    ret.push(<SignIn key={1} props={this.props} />);
    ret.push(<FacebookButton key={2} onLogin={this.handleFbLogin} />);
    // }
    return ret;
  }
}

export default AuthComponent;
