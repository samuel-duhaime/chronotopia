import { useGameStore } from '../game/gameStore';

export type FleetCardType = 'Action';

export type FleetCardName = 'Capital' | 'Pass' | 'Explore' | 'Mine';

export type FleetCardStatus = 'Playable' | 'Available' | 'Exhausted' | 'Unresearched' | 'Removed';

export type FleetCard = {
    id: string;
    type: FleetCardType;
    name: FleetCardName;
    description: string;
    imageUrl: string;
    level: number;
    turnCost: number;
    turnCooldown?: number;
    status: FleetCardStatus;
    isPlayable: () => boolean;
    isSelected: boolean;
    effect: () => void;
};

export const CapitalCard: FleetCard = {
    id: 'capital-001',
    type: 'Action',
    name: 'Capital',
    description: 'Establish a capital on a habitable planet. Remove.',
    imageUrl: 'capital.png',
    level: 1,
    turnCost: 1,
    turnCooldown: 0,
    status: 'Playable',
    isPlayable: () => true,
    isSelected: false,
    effect: () => {
        const { updateFleetCard, setNextActionActive, updateResource } = useGameStore.getState();

        updateFleetCard({ fleetId: 'fleet-1', cardId: 'capital-001', updates: { status: 'Removed' } });
        updateResource('PlanetsCapacity', { amount: 1 });
        // TODO: Add new planet to planets store
        setNextActionActive();
    }
};

export const PassCard: FleetCard = {
    id: 'pass-001',
    type: 'Action',
    name: 'Pass',
    description: 'Skip this turn.',
    imageUrl: 'pass.png',
    level: 1,
    turnCost: 1,
    turnCooldown: 0,
    status: 'Available', // Not playable the first turn
    isPlayable: () => true,
    isSelected: false,
    effect: () => {
        const { setNextActionActive } = useGameStore.getState();

        setNextActionActive();
    }
};

export const ExploreCard: FleetCard = {
    id: 'explore-001',
    type: 'Action',
    name: 'Explore',
    description: 'Move up to 1 range.',
    imageUrl: 'explore.png',
    level: 1,
    turnCost: 1,
    turnCooldown: 0,
    status: 'Available', // Not playable the first turn
    isPlayable: () => true,
    isSelected: false,
    effect: () => {
        const { setNextActionActive } = useGameStore.getState();

        // TODO: Do the effect
        setNextActionActive();
    }
};

export const MineCard: FleetCard = {
    id: 'mine-001',
    type: 'Action',
    name: 'Mine',
    description: 'Mine 10 crypto from asteroid',
    imageUrl: 'mine.png',
    level: 1,
    turnCost: 1,
    turnCooldown: 0,
    status: 'Available', // Not playable the first turn
    isPlayable: () => {
        const { getFleetHex } = useGameStore.getState();
        const fleetHex = getFleetHex({ fleetId: 'fleet-1' });

        // Check if the fleet is in the same hex as an asteroid
        return fleetHex?.elements.some((elem) => elem.element === 'Asteroid') ?? false;
    },
    isSelected: false,
    effect: () => {
        const { setNextActionActive, getResource, updateResource } = useGameStore.getState();
        const crypto = getResource('Crypto')?.amount || 0;

        updateResource('Crypto', { amount: crypto + 10 });
        setNextActionActive();
    }
};
