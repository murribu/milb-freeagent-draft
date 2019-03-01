import React, { Component } from "react";
import { API, Auth, graphqlOperation } from "aws-amplify";
import { Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import FacebookButton from "./FacebookButton";
import awsconfig from "../../aws-exports";
import { getMyProfile } from "../../graphql/queries";
import "./SignIn.css";
import "bootstrap/dist/css/bootstrap.css";

export default class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      email: "",
      password: ""
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      var user = await Auth.signIn(this.state.email, this.state.password);
      console.log(user);
      var { data } = await API.graphql(graphqlOperation(getMyProfile));
      this.props.onUserSignIn(
        {
          displayName: data.getMyProfile.displayName,
          twitterHandle: data.getMyProfile.twitterHandle,
          facebookHandle: data.getMyProfile.facebookHandle
        },
        user.storage[
          "aws.cognito.identity-id." + awsconfig.aws_cognito_identity_pool_id
        ]
      );
    } catch (e) {
      alert(e.message);
      this.setState({ isLoading: false });
    }
  };

  render() {
    return (
      <div className="Login">
        <Form onSubmit={this.handleSubmit} style={{ textAlign: "center" }}>
          <Form.Group controlId="email" bs-size="large">
            <Form.Control
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Group controlId="password" bs-size="large">
            <Form.Control
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </Form.Group>
          <Button
            block
            bs-size="large"
            disabled={!this.validateForm()}
            type="submit"
          >
            Login
          </Button>
          <Link to="/auth/create">create a user</Link>
          <br />
          <span>or</span>
          <br />
          <br />
          <FacebookButton
            block
            bs-size="large"
            loginWithFacebook={this.props.loginWithFacebook}
          />
        </Form>
      </div>
    );
  }
}
