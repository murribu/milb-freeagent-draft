import React from "react";
import { BrowserRouter } from "react-router-dom";
import "./App.css";

//Amplify
import Amplify, { Auth } from "aws-amplify";
import awsconfig from "./aws-exports";

// import HeaderLinks from "./Components/HeaderLinks";
import TopNav from "./Components/TopNav";
import Routes from "./Components/Routes";

import config from "./config";

// Amplify init
Amplify.configure(awsconfig);

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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.checkFacebookLoginState = this.checkFacebookLoginState.bind(this);
    this.facebookLoginStatusChangeCallback = this.facebookLoginStatusChangeCallback.bind(
      this
    );
    this.loginWithFacebook = this.loginWithFacebook.bind(this);
    this.handleFacebookLoginResponse = this.handleFacebookLoginResponse.bind(
      this
    );
  }

  state = {
    isLoggedIn: false,
    username: "",
    isAuthenticating: false,
    isReadonly: false,
    sub: null
  };
  handleUserSignIn = (username, sub = null) => {
    this.setState({ isLoggedIn: true, username, sub });
  };
  handleUserSignOut = () => {
    Auth.signOut()
      .then(data => console.log(data))
      .catch(err => console.log(err));
    this.setState({ isLoggedIn: false, username: "", sub: null });
  };
  getFacebookUserInfo = () => {
    var self = this;
    window.fbLoaded.promise.then(() => {
      window.FB.api("/me", function(response) {
        if (response.error) {
          window.FB.login(self.checkFacebookLoginState, {
            scope: "public_profile,email"
          });
        } else {
          console.log("Good to see you, " + response.name + ".", response);
          self.handleUserSignIn(response.name.split(" ")[0], self.state.sub);
        }
      });
    });
  };

  async componentDidMount() {
    this.loadFacebookSDK();

    var user;
    try {
      user = await Auth.currentAuthenticatedUser();
      console.log("Auth.currentAuthenticatedUser", user);
      if (user && user.attributes && user.attributes.email) {
        this.handleUserSignIn(
          user.attributes.email,
          user.storage[
            "aws.cognito.identity-id." + awsconfig.aws_cognito_identity_pool_id
          ]
        );
      } else {
        this.getFacebookUserInfo();
      }
    } catch (e) {
      if (e !== "not authenticated") {
        alert(e);
      }
    }

    this.setState({ isAuthenticating: false });

    await waitForInit();
    this.setState({ isLoading: false });
  }

  loadFacebookSDK() {
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: config.facebookID,
        autoLogAppEvents: true,
        xfbml: true,
        version: "v3.1"
      });
      window.fbLoaded.resolve();
    };

    (function(d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }

  handleFacebookLoginResponse(data) {
    const { email, accessToken: token, expiresIn } = data;
    const expires_at = expiresIn * 1000 + new Date().getTime();
    const user = { email };

    this.setState({ isLoading: true });

    Auth.federatedSignIn("facebook", { token, expires_at }, user)
      .then(response => {
        console.log(response);
        this.setState({
          isLoading: false,
          sub:
            response.storage[
              "aws.cognito.identity-id." +
                awsconfig.aws_cognito_identity_pool_id
            ]
        });
        this.getFacebookUserInfo();
      })
      .catch(e => {
        this.setState({ isLoading: false });
        this.handleFacebookLoginError(e);
      });
  }

  handleFacebookLoginError(error) {
    alert(error);
  }

  facebookLoginStatusChangeCallback(response) {
    console.log("facebookLoginStatusChangeCallback", response);
    if (response.status === "connected") {
      this.handleFacebookLoginResponse(response.authResponse);
    } else {
      this.handleFacebookLoginError(response);
    }
  }

  checkFacebookLoginState() {
    window.FB.getLoginStatus(this.facebookLoginStatusChangeCallback);
  }

  loginWithFacebook() {
    window.FB.login(this.checkFacebookLoginState, {
      scope: "public_profile,email"
    });
  }

  render() {
    const childProps = {
      isLoggedIn: this.state.isLoggedIn,
      onUserSignIn: this.handleUserSignIn,
      onUserSignOut: this.handleUserSignOut,
      loginWithFacebook: this.loginWithFacebook,
      isLoading: this.state.isLoading,
      isReadonly: this.state.isReadonly,
      sub: this.state.sub
    };
    return (
      <div className="App">
        <TopNav
          isLoggedIn={this.state.isLoggedIn}
          handleUserSignOut={this.handleUserSignOut}
          username={this.state.username}
        />
        <br />
        <Routes childProps={childProps} />
      </div>
    );
  }
}

const AppWithRouter = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default () => <AppWithRouter />;
