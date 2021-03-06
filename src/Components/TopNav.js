import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Navbar, Nav, Form, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

class TopNav extends React.Component {
  signOut(e) {
    e.preventDefault();
    this.props.handleUserSignOut();
  }
  constructor(props) {
    super(props);

    this.signOut = this.signOut.bind(this);
  }

  renderButton() {
    if (this.props.isLoggedIn) {
      return (
        <Button type="submit" variant="primary">
          Sign Out
        </Button>
      );
    } else {
      return (
        <NavLink className="nav-link" to="/auth">
          Sign In
        </NavLink>
      );
    }
  }

  renderMyPicks() {
    if (this.props.isLoggedIn) {
      return (
        <NavLink className="nav-link" to="/picks">
          My Picks
        </NavLink>
      );
    } else {
      return null;
    }
  }

  render() {
    return (
      <Navbar bg="light" expand="lg">
        <LinkContainer to="/">
          <Navbar.Brand className="nav-link">
            MiLB Free Agent Draft 2019
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            {this.renderMyPicks()}
            <NavLink className="nav-link" to="/leaderboard">
              Leaderboard
            </NavLink>
            <NavLink className="nav-link" to="/about">
              About
            </NavLink>
          </Nav>
          <Form inline onSubmit={this.signOut}>
            <span className="mr-3">
              {this.props.isLoggedIn ? "Welcome " : ""}
              <NavLink
                to={
                  "/profile/" +
                  (this.props.sub ? this.props.sub.substring(10) : "")
                }
              >
                {this.props.isLoggedIn ? this.props.displayName : ""}
              </NavLink>
            </span>
            {this.renderButton()}
          </Form>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default TopNav;
