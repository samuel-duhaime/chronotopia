import React from "react";
import "./ActionPanel.css";

interface ActionPanelProps {
  actionDescription: string;
  actionEvent: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  actionDescription,
  actionEvent,
}) => {
  return (
    <div className="action-panel">
      <button className="action-btn" onClick={actionEvent}>
        {actionDescription}
      </button>
    </div>
  );
};