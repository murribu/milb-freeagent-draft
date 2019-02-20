import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import AuthComponent from "./AuthComponent";

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

const AuthRoute = ({ render: C, props: childProps, ...rest }) =>
  childProps.isLoggedIn ? (
    <Redirect to={`/`} />
  ) : (
    <Route {...rest} render={rProps => <C {...rProps} {...childProps} />} />
  );

const ProppedRoute = ({ render: C, props: childProps, ...rest }) => (
  <Route {...rest} render={rProps => <C {...rProps} {...childProps} />} />
);

const Routes = ({ childProps }) => (
  <Switch>
    <Route exact path="/" render={() => <div>Home</div>} />
    <ProppedRoute
      exact
      path="/auth"
      render={AuthComponent}
      props={childProps}
    />
    <ProtectedRoute
      exact
      path="/secret"
      render={() => <div>Keep it secret! Keep it safe!</div>}
      props={childProps}
    />
    <Route exact path="/about" render={() => <div>About Content</div>} />
  </Switch>
);

export default Routes;
