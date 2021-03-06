import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import AuthComponent from "./AuthComponent";
import HomeComponent from "./HomeComponent";
import AboutComponent from "./AboutComponent";
import MyPicks from "./MyPicks";
import Leaderboard from "./Leaderboard";
import Profile from "./Profile";
import SignUp from "./authentication/SignUp";
import Privacy from "./authentication/Privacy";
import Terms from "./authentication/Terms";

const ProtectedRoute = ({ render: C, props: childProps, ...rest }) => (
  <Route
    {...rest}
    render={rProps =>
      childProps.isLoggedIn ? (
        <C {...rProps} {...childProps} />
      ) : (
        <Redirect
          to={`/auth?redirect=${rProps.location.pathname}${
            rProps.location.search
          }`}
        />
      )
    }
  />
);

const AuthRoute = ({ render: C, props: childProps, ...rest }) => {
  return childProps.isLoggedIn ? (
    <Route
      path="/auth"
      component={({ location }) => {
        return (
          <Redirect
            to={{
              pathname: `${
                location.search.substring(1).split("=").length > 1
                  ? location.search.substring(1).split("=")[1]
                  : `/`
              }`
            }}
          />
        );
      }}
    />
  ) : (
    <Route {...rest} render={rProps => <C {...rProps} {...childProps} />} />
  );
};

const ProppedRoute = ({ render: C, props: childProps, ...rest }) => (
  <Route {...rest} render={rProps => <C {...rProps} {...childProps} />} />
);

const Routes = ({ childProps }) => (
  <Switch>
    <ProppedRoute exact path="/" render={HomeComponent} props={childProps} />
    <AuthRoute exact path="/auth" render={AuthComponent} props={childProps} />
    <AuthRoute exact path="/auth/create" render={SignUp} props={childProps} />
    <ProtectedRoute exact path="/picks" render={MyPicks} props={childProps} />
    <ProppedRoute
      exact
      path="/about"
      render={AboutComponent}
      props={childProps}
    />
    <ProppedRoute
      exact
      path="/leaderboard"
      render={Leaderboard}
      props={childProps}
    />
    <ProppedRoute
      exact
      path="/profile/:id"
      render={Profile}
      props={childProps}
    />
    <ProppedRoute exact path="/privacy" render={Privacy} props={childProps} />
    <ProppedRoute exact path="/terms" render={Terms} props={childProps} />
  </Switch>
);

export default Routes;
