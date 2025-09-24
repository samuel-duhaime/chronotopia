import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faGear } from "@fortawesome/free-solid-svg-icons";
import "./Menu.css";

interface RightMenuProps {
  turn: number;
}

// TODO: Add turn icon
export const RightMenu: React.FC<RightMenuProps> = ({ turn }) => {
  return (
    <div className="menu right-menu-panel">
      <div className="menu-resource">
        <FontAwesomeIcon icon={faClock} />
        {turn}
      </div>
      <button className="menu-btn">
        <FontAwesomeIcon icon={faGear} />
      </button>
      <button className="menu-btn">Exit</button>
    </div>
  );
};
