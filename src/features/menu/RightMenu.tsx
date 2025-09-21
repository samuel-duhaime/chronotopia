import React from "react";
import "./RightMenu.css";

interface RightMenuProps {
  turn: number;
}

// TODO: Add turn icon
export const RightMenu: React.FC<RightMenuProps> = ({ turn }) => {
  return (
    <div className="right-menu-panel">
      <div className="turn-count">{turn} turn(s)</div>
      <button className="menu-btn">Menu</button>
      <button className="exit-btn">Exit</button>
    </div>
  );
};
