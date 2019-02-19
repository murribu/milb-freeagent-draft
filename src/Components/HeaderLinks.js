import React from "react";
import { Link } from "react-router-dom";

const HeaderLinks = props => (
  <ul>
    <li>
      <Link to="/">Home</Link>
    </li>
    <li>
      <Link to="/auth">Create Account/Login</Link>
    </li>
    <li>
      <Link to="/secret">Secret Page</Link>
    </li>
    <li>
      <Link to="/about">
        About Page (we don't care if you're logged in or not)
      </Link>
    </li>
  </ul>
);

export default HeaderLinks;
