//Default Imports:
import * as React from "react";
import { useState, useEffect, useRef } from "react";

//Style Imports:
import headerStyles from "./Header.module.scss";
import "../../../../External/style.css";

const Header = () => {
  const [CategoryFilterValue, setCategoryFilterValue]  = useState([]);

  return (
    <div className="headerContainer">
      <div className={headerStyles.ProfileHeader}>Test Profile</div>

      <div className={headerStyles.FilterHeader}>
        <label>Request</label>
      </div>
    </div>
  );
};

export default Header;
