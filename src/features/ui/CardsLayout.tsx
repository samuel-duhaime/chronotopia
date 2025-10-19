import type { FC } from 'react';
import { useGameStore } from '../game/gameStore';
import { Card } from '../card/Card';
import './CardsLayout.css';
import { ActionType } from '../game/actionStore';

export const CardsLayout: FC = () => {
    const currentAction = useGameStore((state) => state.getCurrentAction());
    // const fleetCards = useGameStore((state) => state.getFleetCards({ fleetId: 'fleet-1' }));
    const playableFleetCards = useGameStore((state) => state.getFleetPlayableCards({ fleetId: 'fleet-1' }));

    if (currentAction?.type === ActionType.Command) {
        return (
            <div className="cards-layout">
                {playableFleetCards.map((fleetCard, index) => {
                    const totalCards = playableFleetCards.length;
                    const centerIndex = Math.floor((totalCards - 1) / 2);
                    const distanceFromCenter = index - centerIndex;

                    // Calculation for arc layout
                    const horizontalSpacing = distanceFromCenter * -80; // Wider horizontal spread
                    const verticalOffset = Math.abs(distanceFromCenter) * Math.abs(distanceFromCenter) * 20; // More pronounced quadratic curve
                    const rotation = distanceFromCenter * 12; // More rotation

                    return (
                        <div
                            className="card-container"
                            key={fleetCard.id}
                            style={{
                                transform: `translateX(${horizontalSpacing}px) translateY(${verticalOffset}px) rotate(${rotation}deg)`
                            }}
                        >
                            <Card
                                name={fleetCard.name}
                                description={fleetCard.description}
                                cardType={fleetCard.type}
                                imageUrl={`assets/images/cards/${fleetCard.imageUrl}`}
                                turnCost={fleetCard.turnCost}
                                onClick={() => fleetCard.effect()}
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
