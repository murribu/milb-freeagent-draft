import React, { Component } from "react";
import Amplify, { API, Auth, graphqlOperation } from "aws-amplify";
import { Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import FacebookButton from "./FacebookButton";
import config from "../../config";
import { getMyProfile } from "../../graphql/queries";
import "./SignIn.css";
import "bootstrap/dist/css/bootstrap.css";

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
          "aws.cognito.identity-id." +
            config.awsconfig.aws_cognito_identity_pool_id
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
          <br />
          <Link className="btn btn-sm btn-primary" to="/auth/create">
            create an account
          </Link>
          <br />
          <div className="container">
            <div className="row">
              <div className="col-6 text-center">
                <Link to="/terms">Terms of Service</Link>
              </div>
              <div className="col-6 text-center">
                <Link to="/privacy">Privacy Policy</Link>
              </div>
            </div>
          </div>
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
