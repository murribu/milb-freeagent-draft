import React from "react";
// import { Authenticator, SignUp, Greetings } from "aws-amplify-react";
// import FacebookButton from "./FacebookButton";

class AboutComponent extends React.Component {
  handleStateChange = state => {
    console.log(state);
    if (state === "signedIn") {
      this.props.onUserSignIn();
    }
    if (state === "signIn") {
      this.props.onUserSignOut();
    }
  };

  render() {
    return (
      <div className="container">
        <h1>Hi!</h1>
        <p className="lead">
          I hope you're enjoying the MiLB Free Agent Draft 2019
        </p>
        <p>
          During Spring Training, you can edit your picks and the stats will be
          from Spring Training. Once the regular season starts, you will no
          longer be able to edit your picks, and the stats will reset and only
          come from regular season MLB games.
        </p>
        <p>
          This project was developed by{" "}
          <a href="https://twitter.com/murribu">Cory Martin</a>.<br />
          It uses ReactJS and a serverless backend, powered by AWS.
        </p>
        <p>
          You can view the source code, submit issues, and peruse a tutorial of
          how you could build something similar by visiting{" "}
          <a href="https://github.com/murribu/milb-freeagent-draft">
            the github page
          </a>{" "}
          for this project
        </p>
        <p>
          If you are in the market for some help with a software need, please
          consider reaching out to{" "}
          <a href="https://dozensoft.com/contact" target="_new">
            Dozen Software
          </a>{" "}
          (my employer) and tell us your software dreams.
        </p>
      </div>
    );
  }
}

export default AboutComponent;
