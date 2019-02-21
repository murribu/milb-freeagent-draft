import React from "react";
import { Auth } from "aws-amplify";
import LoaderButton from "../LoaderButton";

function waitForInit() {
  return new Promise((res, rej) => {
    const hasFbLoaded = () => {
      if (window.FB) {
        res();
      } else {
        setTimeout(hasFbLoaded, 300);
      }
    };
    hasFbLoaded();
  });
}

export default class FacebookButton extends React.Component {
  async handleResponse(data) {
    const { email, accessToken: token, expiresIn } = data;
    const expires_at = expiresIn * 1000 + new Date().getTime();
    const user = { email };

    this.setState({ isLoading: true });

    try {
      const response = await Auth.federatedSignIn(
        "facebook",
        { token, expires_at },
        user
      );
      console.log(response);
      this.setState({ isLoading: false });
      var self = this;
      window.FB.api("/me", function(response) {
        console.log("Good to see you, " + response.name + ".", response);
        self.props.onUserSignIn(response.name.split(" ")[0]);
      });
    } catch (e) {
      this.setState({ isLoading: false });
      this.handleError(e);
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true
    };
    this.handleResponse = this.handleResponse.bind(this);
  }

  async componentDidMount() {
    await waitForInit();
    this.setState({ isLoading: false });
  }

  statusChangeCallback = response => {
    console.log("statusChangeCallback", response);
    if (response.status === "connected") {
      this.handleResponse(response.authResponse);
    } else {
      this.handleError(response);
    }
  };

  checkLoginState = () => {
    window.FB.getLoginStatus(this.statusChangeCallback);
  };

  handleClick = () => {
    window.FB.login(this.checkLoginState, {
      scope: "public_profile,email"
    });
  };

  handleError(error) {
    alert(error);
  }

  render() {
    return (
      <LoaderButton
        block
        bs-size="large"
        bs-style="primary"
        className="FacebookButton"
        text="Login with Facebook"
        onClick={this.handleClick}
        disabled={this.state.isLoading}
      />
    );
  }
}
