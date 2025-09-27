import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Resource } from '../game/GameScene';
import './Menu.css';

interface ResourcesMenuProps {
    resources: Resource[];
}

export const ResourcesMenu: React.FC<ResourcesMenuProps> = ({ resources }) => {
    return (
        <div className="menu resources-menu-panel">
            {resources.map((resource) => (
                <div className="menu-resource" key={resource.type}>
                    <FontAwesomeIcon icon={resource.icon} />
                    {resource.amount}
                    {/* Show perTurn value as superscript if present */}
                    {'perTurn' in resource && resource.perTurn && (
                        <span className="resource-per-turn">+{resource.perTurn}</span>
                    )}
                    {/* Show maxCapacity value if present */}
                    {'maxCapacity' in resource && resource.maxCapacity !== undefined && `/${resource.maxCapacity}`}
                </div>
            ))}
        </div>
    );
};
