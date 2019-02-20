import React from "react";
import { Authenticator } from "aws-amplify-react";

class HomeComponent extends React.Component {
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
    return (
      <div>
        <Authenticator onStateChange={this.handleStateChange} />
        <div>Keep it HomeComponent, yo!</div>
      </div>
    );
  }
}

export default HomeComponent;
