import React from 'react';
import { useGameStore } from '../game/gameStore';
import './ActionPanel.css';

export const ActionPanel: React.FC = () => {
    const currentAction = useGameStore((state) => state.getCurrentAction());

    return (
        <div className="action-panel">
            <button className="action-btn" onClick={() => currentAction.event()}>
                {currentAction.description}
            </button>
        </div>
    );
};
