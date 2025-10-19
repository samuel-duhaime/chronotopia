import { type FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import './Card.css';

interface CardProps {
    name: string;
    description: string;
    cardType: string;
    imageUrl: string;
    turnCost: number;
    onClick: () => void;
}

export const Card: FC<CardProps> = ({ name, description, cardType, imageUrl, turnCost, onClick }) => {
    return (
        <div className="card" onClick={onClick}>
            {/* Cost */}
            <div className="card-turn-cost">
                <FontAwesomeIcon icon={faClock} />
                {turnCost}
            </div>

            {/* Title */}
            <div className="card-name">{name}</div>

            {/* Image Container */}
            <div
                className="card-image"
                style={{
                    backgroundImage: `url(${imageUrl})`
                }}
            />

            {/* Description */}
            <p className="card-description">{description}</p>

            {/* Card Type */}
            <div className="card-type">{cardType}</div>
        </div>
    );
};
