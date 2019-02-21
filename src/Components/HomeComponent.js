import React from "react";
import SignIn from "./authentication/SignIn";

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
        <SignIn onUserSignIn={this.props.onUserSignIn} />
        <div>Keep it HomeComponent, yo!</div>
      </div>
    );
  }
}

export default HomeComponent;
