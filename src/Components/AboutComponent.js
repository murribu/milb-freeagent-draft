import React from "react";
// import { Authenticator, SignUp, Greetings } from "aws-amplify-react";
// import FacebookButton from "./FacebookButton";

class AboutComponent extends React.Component {
  handleStateChange = state => {
    console.log(state);
    if (state === "signedIn") {
      this.props.onUserSignIn();
    }
    if (state === "signIn") {
      this.props.onUserSignOut();
    }
  };

  render() {
    return <div>Keep it AboutComponent, dude!</div>;
  }
}

export default AboutComponent;
