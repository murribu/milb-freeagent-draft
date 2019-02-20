import React from "react";
import { Authenticator } from "aws-amplify-react";
import FacebookButton from "./FacebookButton";

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

  about = () => "Keep it AboutComponent, dude!";

  render() {
    var ret = [];
    if (this.props.isLoggedIn) {
      ret.push(<Authenticator onStateChange={this.handleStateChange} />);
    }

    ret.push(this.about());

    return ret;
  }
}

export default AboutComponent;
