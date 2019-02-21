import React, { Component } from "react";
// import { Link } from "react-router-dom";
import { Auth } from "aws-amplify";
import { Form, Button } from "react-bootstrap";
// import LoaderButton from "../LoaderButton";
import "./SignIn.css";
import "bootstrap/dist/css/bootstrap.css";

export default class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      username: "",
      password: ""
    };
  }

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
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
      var ret = await Auth.signIn(this.state.username, this.state.password);
      console.log(ret);
      this.props.onUserSignIn(ret.username);
    } catch (e) {
      alert(e.message);
      this.setState({ isLoading: false });
    }
  };

  render() {
    return (
      <div className="Login">
        <Form onSubmit={this.handleSubmit}>
          <Form.Group controlId="username" bs-size="large">
            <Form.Control
              autoFocus
              type="text"
              value={this.state.username}
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
        </Form>
      </div>
    );
  }
}
