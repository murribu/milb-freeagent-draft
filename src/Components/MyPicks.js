import React from "react";
import { Form } from "react-bootstrap";
import players from "../players.json";

class MyPicks extends React.Component {
  constructor(props) {
    super(props);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
  }

  state = {
    players: players,
    sortColumn: "last_name",
    sortDirection: "asc",
    search: ""
  };

  filteredPlayers() {
    return players
      .filter(
        p =>
          this.state.search === "" ||
          (p.first_name + " " + p.last_name)
            .toLowerCase()
            .indexOf(this.state.search.toLowerCase()) > -1 ||
          p.team.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1
      )
      .sort(
        (a, b) =>
          (this.state.sortDirection === "asc" ? 1 : -1) *
          (a[this.state.sortColumn] &&
          b[this.state.sortColumn] &&
          a[this.state.sortColumn].toLowerCase() >
            b[this.state.sortColumn].toLowerCase()
            ? 1
            : -1)
      );
  }

  handleSearchChange(e) {
    this.setState({ search: e.target.value });
  }

  handleSortChange(e) {
    e.preventDefault();
    if (this.state.sortColumn === e.target.attributes["data-column"].value) {
      this.setState({
        sortDirection: this.state.sortDirection === "asc" ? "desc" : "asc"
      });
    } else {
      this.setState({
        sortDirection: "asc",
        sortColumn: e.target.attributes["data-column"].value
      });
    }
  }

  render() {
    var filteredPlayers = this.filteredPlayers();
    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-6 col-xs-12" />
          <div className="col-sm-6 col-xs-12">
            <Form.Control
              placeholder="search"
              defaultValue={this.state.search}
              onChange={this.handleSearchChange}
            />
            <div className="container">
              <div className="row">
                <div className="col-6" style={{ fontWeight: "bold" }}>
                  <a
                    href="#"
                    onClick={this.handleSortChange}
                    data-column="last_name"
                  >
                    Name
                  </a>
                </div>
                <div className="col-6" style={{ fontWeight: "bold" }}>
                  <a
                    href="#"
                    onClick={this.handleSortChange}
                    data-column="team"
                  >
                    Team
                  </a>
                </div>
              </div>
              {Object.keys(filteredPlayers).map(key => (
                <div className="row" key={key}>
                  <div className="col-6">
                    {filteredPlayers[key].first_name +
                      " " +
                      filteredPlayers[key].last_name}
                  </div>
                  <div className="col-6">{filteredPlayers[key].team}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MyPicks;
