import React from "react";
import LoaderButton from "../LoaderButton";

export default class FacebookButton extends React.Component {
  render() {
    return (
      <LoaderButton
        block
        bs-size="large"
        bs-style="primary"
        className="FacebookButton"
        text="Login with Facebook"
        onClick={this.props.loginWithFacebook}
        disabled={this.props.isLoading}
      />
    );
  }
}
