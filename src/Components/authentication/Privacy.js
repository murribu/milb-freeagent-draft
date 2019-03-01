import React from "react";

class Privacy extends React.Component {
  render() {
    return (
      <div className="container">
        <h1>Privacy Policy</h1>
        <p>
          If you login with Facebook, this website may collect your public
          profile info and email address.
        </p>
        <p>
          If you login with an email address, this website will collect your
          email address.
        </p>
        <p>
          Once logged in, you have the option of providing your twitter handle,
          your facebook handle, and a display name. They're totally optional. If
          you enter any of that information, it will be visible to other
          visitors to this site.
        </p>
        <p>
          We will not sell or otherwise transfer your email address or facebook
          profile information to any other entity, nor will we send you any
          emails unless you explicitly request an email from us. Even then, we
          might not.
        </p>
        <p>
          We only collect these data so you can login, and so that we can show
          you on the Leaderboard.
        </p>
        <p>
          You can contact the owner and data controller at{" "}
          <a href="https://twitter.com/murribu">@murribu</a>
        </p>
      </div>
    );
  }
}

export default Privacy;
