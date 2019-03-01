import React, { Component } from "react";
import { Form } from "react-bootstrap";
import { Auth } from "aws-amplify";
import LoaderButton from "../LoaderButton";
import "./SignIn.css";

export default class SignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      email: "",
      password: "",
      confirmPassword: "",
      confirmationCode: "",
      newUser: null
    };
  }

  validateForm() {
    return (
      this.state.email.length > 0 &&
      this.state.password.length > 0 &&
      this.state.password === this.state.confirmPassword
    );
  }

  validateConfirmationForm() {
    return this.state.confirmationCode.length > 0;
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
      const newUser = await Auth.signUp({
        username: this.state.email,
        password: this.state.password
      });
      this.setState({
        newUser
      });
    } catch (e) {
      alert(e.message);
    }

    this.setState({ isLoading: false });
  };

  handleConfirmationSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      var confirmResponse = await Auth.confirmSignUp(
        this.state.email,
        this.state.confirmationCode
      );
      console.log(confirmResponse);
      var signInResponse = await Auth.signIn(
        this.state.email,
        this.state.password
      );

      this.props.onUserSignIn(
        this.state.email,
        signInResponse.signInUserSession.accessToken.payload.sub
      );
      this.props.history.push("/");
    } catch (e) {
      alert(e.message);
      this.setState({ isLoading: false });
    }
  };

  renderConfirmationForm() {
    return (
      <Form onSubmit={this.handleConfirmationSubmit}>
        <Form.Group controlId="confirmationCode" bs-size="large">
          <Form.Label>Confirmation Code</Form.Label>
          <Form.Control
            autoFocus
            type="tel"
            value={this.state.confirmationCode}
            onChange={this.handleChange}
          />
          <p>Please check your email for the code.</p>
        </Form.Group>
        <LoaderButton
          block
          bs-size="large"
          disabled={!this.validateConfirmationForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Verify"
          loadingText="Verifying…"
        />
      </Form>
    );
  }

  renderForm() {
    return (
      <Form onSubmit={this.handleSubmit} style={{ textAlign: "center" }}>
        <Form.Group controlId="email" bs-size="large">
          <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus
            type="email"
            value={this.state.email}
            onChange={this.handleChange}
          />
        </Form.Group>
        <Form.Group controlId="password" bs-size="large">
          <Form.Label>Password</Form.Label>
          <Form.Control
            value={this.state.password}
            onChange={this.handleChange}
            type="password"
          />
        </Form.Group>
        <Form.Group controlId="confirmPassword" bs-size="large">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            value={this.state.confirmPassword}
            onChange={this.handleChange}
            type="password"
          />
        </Form.Group>
        <LoaderButton
          block
          bs-size="large"
          disabled={!this.validateForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Signup"
          loadingText="Signing up…"
        />
      </Form>
    );
  }

  render() {
    return (
      <div className="Login">
        {this.state.newUser === null
          ? this.renderForm()
          : this.renderConfirmationForm()}
      </div>
    );
  }
}
