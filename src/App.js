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
  render() {
    return (
      <div className="App">
        <h1>Yo!</h1>
        <HeaderLinks />
        <br />
        <Routes />
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
