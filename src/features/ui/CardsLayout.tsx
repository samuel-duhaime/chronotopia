import type { FC } from 'react';
import { useGameStore } from '../game/gameStore';
import { Card } from '../card/Card';
import './CardsLayout.css';
import { ActionType } from '../game/actionStore';

export const CardsLayout: FC = () => {
    const currentAction = useGameStore((state) => state.getCurrentAction());

    if (currentAction?.type === ActionType.Command) {
        return (
            <div className="cards-layout">
                {Array.from({ length: 5 }).map((_, index) => {
                    const totalCards = 5;
                    const centerIndex = Math.floor((totalCards - 1) / 2);
                    const distanceFromCenter = index - centerIndex; // -2, -1, 0, 1, 2

                    // Calculation for arc layout
                    const horizontalSpacing = distanceFromCenter * -80; // Wider horizontal spread
                    const verticalOffset = Math.abs(distanceFromCenter) * Math.abs(distanceFromCenter) * 20; // More pronounced quadratic curve
                    const rotation = distanceFromCenter * 12; // More rotation

                    return (
                        <div
                            className="card-container"
                            key={index}
                            style={{
                                transform: `translateX(${horizontalSpacing}px) translateY(${verticalOffset}px) rotate(${rotation}deg)`
                            }}
                        >
                            <Card
                                title={`Card ${index + 1}`}
                                description={`Description for card ${index + 1}`}
                                cardType={`Type ${index + 1}`}
                                imageUrl={`/assets/images/cards/explore.png`}
                                cost={1}
                            />
                        </div>
                    );
                })}
            </div>
        );
    } else {
        return null;
    }
};
