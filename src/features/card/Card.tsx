import { type FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import './Card.css';

interface CardProps {
    title: string;
    description: string;
    cardType: string;
    imageUrl: string;
    cost: number;
}

export const Card: FC<CardProps> = ({ title, description, cardType, imageUrl, cost }) => {
    return (
        <div className="card">
            {/* Cost */}
            <div className="card-cost">
                <FontAwesomeIcon icon={faClock} />
                {cost}
            </div>

            {/* Title */}
            <div className="card-title">{title}</div>

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
