import React from "react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

//Amplify
import Amplify, { API, Auth, graphqlOperation } from "aws-amplify";
import config from "./config";

// import HeaderLinks from "./Components/HeaderLinks";
import TopNav from "./Components/TopNav";
import Routes from "./Components/Routes";

import { getMyProfile } from "./graphql/queries";
import { updateProfile } from "./graphql/mutations";

import hitter_leaders from "./hitter_leaders.json";
import pitcher_leaders from "./pitcher_leaders.json";
import user_leaders from "./user_leaders.json";

import "./App.css";

// Amplify init
Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Identity Pool ID
    userPoolId: config.awsconfig.aws_user_pools_id,
    // REQUIRED - Amazon Cognito Region
    region: config.awsconfig.aws_cognito_region,
    // OPTIONAL - Amazon Cognito User Pool ID
    identityPoolId: config.awsconfig.aws_cognito_identity_pool_id,
    // OPTIONAL - Amazon Cognito Web Client ID
    userPoolWebClientId: config.awsconfig.aws_user_pools_web_client_id
  },
  API: {
    aws_appsync_graphqlEndpoint: config.awsconfig.aws_appsync_graphqlEndpoint,
    aws_appsync_region: config.awsconfig.aws_appsync_region,
    aws_appsync_authenticationType: "AWS_IAM"
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
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleFacebookLoginResponse = this.handleFacebookLoginResponse.bind(
      this
    );
  }

  state = {
    isLoggedIn: false,
    isAuthenticating: false,
    isReadonly: false,
    sub: null,
    needsProfile: false,
    profile: {
      displayName: null,
      twitterHandle: null,
      facebookHandle: null
    },
    hitter_leaders: { updatedAt: "", leaders: {} },
    pitcher_leaders: { updatedAt: "", leaders: {} },
    user_leaders: { updatedAt: "", leaders: [] },
    loading_leaders: true
  };
  handleUserSignIn = (profile, sub) => {
    this.setState({ needsProfile: false, isLoggedIn: true, profile, sub });
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
          if (self.state.needsProfile) {
            API.graphql(
              graphqlOperation(updateProfile, { displayName: response.name })
            ).then(({ data }) =>
              self.handleUserSignIn(
                {
                  displayName: data.updateProfile.displayName,
                  twitterHandle: data.updateProfile.twitterHandle,
                  facebookHandle: data.updateProfile.facebookHandle
                },
                self.state.sub
              )
            );
          }
          // console.log("Good to see you, " + response.name + ".", response);
        }
      });
    });
  };

  getLeaderboards() {
    var leaders_loaded = 0;
    axios
      .get("/static/data/hitter_leaders.json")
      .then(({ data }) => {
        this.setState({ hitter_leaders: data });
        if (++leaders_loaded === 3) {
          this.setState({ loading_leaders: false });
        }
      })
      .catch(() => {
        this.setState({ hitter_leaders });
        if (++leaders_loaded === 3) {
          this.setState({ loading_leaders: false });
        }
      });
    axios
      .get("/static/data/pitcher_leaders.json")
      .then(({ data }) => {
        this.setState({ pitcher_leaders: data });
        if (++leaders_loaded === 3) {
          this.setState({ loading_leaders: false });
        }
      })
      .catch(() => {
        this.setState({ pitcher_leaders });
        if (++leaders_loaded === 3) {
          this.setState({ loading_leaders: false });
        }
      });
    axios
      .get("/static/data/user_leaders.json")
      .then(({ data }) => {
        this.setState({ user_leaders: data });
        if (++leaders_loaded === 3) {
          this.setState({ loading_leaders: false });
        }
      })
      .catch(() => {
        this.setState({ user_leaders });
        if (++leaders_loaded === 3) {
          this.setState({ loading_leaders: false });
        }
      });
  }

  async componentDidMount() {
    this.loadFacebookSDK();

    var user;
    try {
      user = await Auth.currentAuthenticatedUser();
      console.log("Auth.currentAuthenticatedUser", user);
      // get my profile
      var { data } = await API.graphql(graphqlOperation(getMyProfile));
      console.log(data);
      if (!data || !data.getMyProfile) {
        // if I don't have a profile, create one
        if (user && user.attributes && user.attributes.email) {
          // username / password login
          var response = await API.graphql(
            graphqlOperation(updateProfile, {
              displayName: user.attributes.email.substring(
                0,
                user.attributes.email.indexOf("@")
              )
            })
          );
          data = response.data;
          this.setState({
            profile: {
              displayName: data.updateProfile.displayName,
              twitterHandle: data.updateProfile.twitterHandle,
              facebookHandle: data.updateProfile.facebookHandle
            },
            needsProfile: false
          });
        } else {
          // facebook login
          this.setState({ needsProfile: true });
          this.getFacebookUserInfo();
        }
      } else {
        // I've got a profile
        this.handleUserSignIn(
          {
            displayName: data.getMyProfile.displayName,
            twitterHandle: data.getMyProfile.twitterHandle,
            facebookHandle: data.getMyProfile.facebookHandle
          },
          user.id
        );
      }
    } catch (e) {
      if (e !== "not authenticated") {
        alert(e);
      }
    }

    this.setState({ isAuthenticating: false });

    await waitForInit();
    await this.getLeaderboards();
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
        API.graphql(graphqlOperation(getMyProfile)).then(({ data }) => {
          if (!data || !data.getMyProfile) {
            // needs a profile
            this.setState({
              needsProfile: true,
              sub:
                response.storage[
                  "aws.cognito.identity-id." +
                    config.awsconfig.aws_cognito_identity_pool_id
                ]
            });
          } else {
            this.handleUserSignIn(
              {
                displayName: data.getMyProfile.displayName,
                twitterHandle: data.getMyProfile.twitterHandle,
                facebookHandle: data.getMyProfile.facebookHandle
              },
              response.storage[
                "aws.cognito.identity-id." +
                  config.awsconfig.aws_cognito_identity_pool_id
              ]
            );
          }
          this.setState({
            isLoading: false
          });
          this.getFacebookUserInfo();
        });
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

  renderRank(u, sorted) {
    for (var t = u - 1; t >= 0; t--) {
      if (sorted[t].score > sorted[u].score) {
        return t + 2;
      }
    }
    return u + 1;
  }

  render() {
    const childProps = {
      isLoggedIn: this.state.isLoggedIn,
      onUserSignIn: this.handleUserSignIn,
      onUserSignOut: this.handleUserSignOut,
      loginWithFacebook: this.loginWithFacebook,
      isLoading: this.state.isLoading,
      isReadonly: this.state.isReadonly,
      sub: this.state.sub,
      profile: this.state.profile,
      hitter_leaders: this.state.hitter_leaders,
      pitcher_leaders: this.state.pitcher_leaders,
      user_leaders: this.state.user_leaders,
      loading_leaders: this.state.loading_leaders,
      renderRank: this.renderRank
    };
    return (
      <div className="App">
        <TopNav
          isLoggedIn={this.state.isLoggedIn}
          handleUserSignOut={this.handleUserSignOut}
          displayName={this.state.profile.displayName}
          sub={this.state.sub}
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
