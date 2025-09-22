import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faGear } from "@fortawesome/free-solid-svg-icons";
import "./RightMenu.css";

interface RightMenuProps {
  turn: number;
}

// TODO: Add turn icon
export const RightMenu: React.FC<RightMenuProps> = ({ turn }) => {
  return (
    <div className="right-menu-panel">
      <div className="turn-count">
        <FontAwesomeIcon icon={faClock} />
        {turn}
      </div>
      <button className="menu-btn">
        <FontAwesomeIcon icon={faGear} />
      </button>
      <button className="exit-btn">Exit</button>
    </div>
  );
};
