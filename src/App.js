import React from "react";
import { BrowserRouter } from "react-router-dom";
import "./App.css";

//AppSync and Apollo libraries
import AWSAppSyncClient from "aws-appsync";
import { Rehydrated } from "aws-appsync-react";
import { ApolloProvider } from "react-apollo";

//Amplify
import Amplify, { Auth } from "aws-amplify";
import awsconfig from "./aws-exports";

// import HeaderLinks from "./Components/HeaderLinks";
import TopNav from "./Components/TopNav";
import Routes from "./Components/Routes";

import config from "./config";

// Amplify init
Amplify.configure(awsconfig);

const GRAPHQL_API_REGION = awsconfig.aws_appsync_region;
const GRAPHQL_API_ENDPOINT_URL = awsconfig.aws_appsync_graphqlEndpoint;
const AUTH_TYPE = awsconfig.aws_appsync_authenticationType;

// AppSync client instantiation
const client = new AWSAppSyncClient({
  url: GRAPHQL_API_ENDPOINT_URL,
  region: GRAPHQL_API_REGION,
  auth: {
    type: AUTH_TYPE,
    // Get the currently logged in users credential.
    jwtToken: async () =>
      (await Auth.currentSession()).getAccessToken().getJwtToken()
  }
});

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
    isAuthenticating: false
  };
  handleUserSignIn = username => {
    this.setState({ isLoggedIn: true, username });
  };
  handleUserSignOut = () => {
    Auth.signOut()
      .then(data => console.log(data))
      .catch(err => console.log(err));
    this.setState({ isLoggedIn: false, username: "" });
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
          self.handleUserSignIn(response.name.split(" ")[0]);
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
      if (user.username) {
        this.handleUserSignIn(user.username);
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
        this.setState({ isLoading: false });
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
      isLoading: this.state.isLoading
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

export default () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <AppWithRouter />
    </Rehydrated>
  </ApolloProvider>
);
