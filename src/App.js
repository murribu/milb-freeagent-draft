import React from "react";
import { Link, BrowserRouter, Router } from "react-router-dom";
import "./App.css";

//AppSync and Apollo libraries
import AWSAppSyncClient from "aws-appsync";
import { Rehydrated } from "aws-appsync-react";
import { ApolloProvider } from "react-apollo";

//Amplify
import Amplify, { Auth } from "aws-amplify";
import awsconfig from "./aws-exports";

import HeaderLinks from "./Components/HeaderLinks";
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

class App extends React.Component {
  state = {
    authState: {
      isLoggedIn: true
    }
  };
  handleUserSignIn = () => {
    this.setState({ authState: { isLoggedIn: true } });
  };
  handleUserSignOut = () => {
    this.setState({ authState: { isLoggedIn: false } });
  };

  async componentDidMount() {
    this.loadFacebookSDK();

    try {
      await Auth.currentAuthenticatedUser();
      this.userHasAuthenticated(true);
    } catch (e) {
      if (e !== "not authenticated") {
        alert(e);
      }
    }

    this.setState({ isAuthenticating: false });
  }

  loadFacebookSDK() {
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: config.facebookID,
        autoLogAppEvents: true,
        xfbml: true,
        version: "v3.1"
      });
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

  render() {
    const childProps = {
      isLoggedIn: this.state.authState.isLoggedIn,
      onUserSignIn: this.handleUserSignIn,
      onUserSignOut: this.handleUserSignOut
    };
    return (
      <div className="App">
        <h1>Yo!</h1>
        <HeaderLinks />
        <div>
          {this.state.authState.isLoggedIn
            ? "User is Logged In"
            : "Not Logged In"}
        </div>
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
