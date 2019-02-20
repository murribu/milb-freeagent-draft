import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import AuthComponent from "./AuthComponent";
import Secret from "./Secret";

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
    <Route exact path="/" render={() => <div>Home</div>} />
    <AuthRoute exact path="/auth" render={AuthComponent} props={childProps} />
    <ProtectedRoute exact path="/secret" render={Secret} props={childProps} />
    <Route exact path="/about" render={() => <div>About Content</div>} />
  </Switch>
);

export default Routes;
