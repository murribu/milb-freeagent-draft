import React from "react";
import { Route, Switch } from "react-router-dom";

class AuthComponent extends React.Component {
  render() {
    return <div>AuthComponent Section</div>;
  }
}

const Routes = () => (
  <Switch>
    <Route exact path="/" render={() => <div>Home</div>} />
    <Route exact path="/auth" render={AuthComponent} />
    <Route
      exact
      path="/secret"
      render={() => <div>Keep it secret! Keep it safe!</div>}
    />
    <Route exact path="/about" render={() => <div>About Content</div>} />
  </Switch>
);

export default Routes;
