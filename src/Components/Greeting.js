import React from "react";
var Amplify_UI_Components_React_1 = require("aws-amplify-react");

class Greeting extends React.Component {
  render() {
    var message = "hi there";
    var theme = null;

    return React.createElement(
      "span",
      null,
      React.createElement(
        Amplify_UI_Components_React_1.NavItem,
        { theme: theme },
        message
      ),
      this.renderSignOutButton(theme)
    );
  }
}

export default Greeting;
