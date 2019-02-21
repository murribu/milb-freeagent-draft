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

import HeaderLinks from "./Components/HeaderLinks";
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

class App extends React.Component {
  state = {
    isLoggedIn: false,
    username: "",
    isAuthenticating: false
  };
  handleUserSignIn = username => {
    this.setState({ isLoggedIn: true, username });
  };
  handleUserSignOut = () => {
    this.setState({ isLoggedIn: false, username: "" });
  };

  async componentDidMount() {
    this.loadFacebookSDK();

    var user;
    try {
      user = await Auth.currentAuthenticatedUser();
      console.log("Auth.currentAuthenticatedUser", user);
      this.handleUserSignIn(user.username);
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
      isLoggedIn: this.state.isLoggedIn,
      onUserSignIn: this.handleUserSignIn,
      onUserSignOut: this.handleUserSignOut
    };
    return (
      <div className="App">
        <TopNav
          isLoggedIn={this.state.isLoggedIn}
          handleUserSignOut={this.handleUserSignOut}
          username={this.state.username}
        />
        <HeaderLinks />
        <div>
          {this.state.isLoggedIn ? "User is Logged In" : "Not Logged In"}
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
