import React from "react";

class HomeComponent extends React.Component {
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
        <h1>Minor League Free Agent Draft 2019</h1>
        <p className="lead">
          Pick which Minor League Free Agents you think will get the most
          playing time this year.
        </p>
        <p>
          <a
            target="_new"
            href="https://blogs.fangraphs.com/effectively-wild-episode-1315-the-2019-minor-league-free-agent-draft/"
          >
            Effectively Wild's episode #1315
          </a>{" "}
          inspired this game. The user is encouraged to listen to that episode
          for a primer.
        </p>
        <p>
          <a
            target="_new"
            href="https://www.baseballamerica.com/about-ba/authors/matt-eddy/"
          >
            Matt Eddy
          </a>{" "}
          provided{" "}
          <a
            target="_new"
            href="https://www.baseballamerica.com/stories/minor-league-free-agents-2018/"
          >
            the list of players
          </a>{" "}
          for this game.
        </p>
        <h2>Rules:</h2>
        <ol>
          <li>Rank up to 20 players.</li>
          <li>
            Your top-ranked player will earn 20 points for every Plate
            Appearance or Batter Faced in 2019.
          </li>
          <li>Your second-ranked player will earn 19 points. Etc.</li>
        </ol>
        <br />
        <br />
      </div>
    );
  }
}

export default HomeComponent;
