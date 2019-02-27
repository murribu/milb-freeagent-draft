import React from "react";
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
    return (
      <SignIn
        onUserSignIn={this.props.onUserSignIn}
        loginWithFacebook={this.props.loginWithFacebook}
      />
    );
  }
}

export default AuthComponent;
