import { type StateCreator } from 'zustand';
import { type Faction } from '../common/types';
import { type Commander } from '../commander/commanderStore';
import { type FleetCard, CapitalCard, PassCard, ExploreCard, MineCard } from '../card/FleetCard';

// Fleet types
export type Fleet = {
    id: string;
    commanderId: string;
    faction: Faction;
    cards: FleetCard[];
    power: number;
};

// Define the fleet management store
export type FleetStore = {
    fleets: Fleet[];
    playableCardsByFleet: Record<string, FleetCard[]>;
    getFleet: ({ fleetId }: { fleetId: string }) => Fleet;
    getFleetWithCommander: ({ fleetId }: { fleetId: string }) => Fleet & { commander: Commander };
    getFleetCards: ({ fleetId }: { fleetId: string }) => FleetCard[];
    getFleetPlayableCards: ({ fleetId }: { fleetId: string }) => FleetCard[];
    updateFleetCard: ({
        fleetId,
        cardId,
        updates
    }: {
        fleetId: string;
        cardId: string;
        updates: Partial<FleetCard>;
    }) => void;
    updateFleetCardsNextTurn: () => void;
    refreshPlayableCards: (fleetId: string) => void;
};

// Create a store for fleet management
export const createFleetStore: StateCreator<FleetStore, [], [], FleetStore> = (set, get) => ({
    fleets: [
        {
            id: 'fleet-1',
            commanderId: 'commander-1',
            faction: 'Human',
            cards: [CapitalCard, PassCard, ExploreCard, MineCard],
            power: 10
        }
    ],

    // Cache for playable cards by fleet, so we don't recalculate every time for an infinite loop.
    playableCardsByFleet: {},

    // Get a fleet by ID
    getFleet: ({ fleetId }: { fleetId: string }) => {
        const fleets = get().fleets;
        return fleets.find((fleet: Fleet) => fleet.id === fleetId) || fleets[0];
    },

    // Get a fleet with its commander
    getFleetWithCommander: ({ fleetId }: { fleetId: string }) => {
        const fleet = get().getFleet({ fleetId });
        // Access getCommander from the combined store - this will be available when stores are combined
        const storeWithCommander = get() as FleetStore & {
            getCommander: ({ commanderId }: { commanderId: string }) => Commander;
        };
        const commander = storeWithCommander.getCommander({ commanderId: fleet.commanderId });
        return { ...fleet, commander };
    },

    // Get fleet cards
    getFleetCards: ({ fleetId }: { fleetId: string }) => {
        const fleet = get().getFleet({ fleetId });
        return fleet.cards;
    },

    // Get only playable fleet cards - returns cached version
    getFleetPlayableCards: ({ fleetId }: { fleetId: string }) => {
        const { playableCardsByFleet } = get();

        // If not cached, refresh the cache for this fleet
        if (!playableCardsByFleet[fleetId]) {
            get().refreshPlayableCards(fleetId);
        }

        return playableCardsByFleet[fleetId] || [];
    },

    // Refresh playable cards cache for a specific fleet
    refreshPlayableCards: (fleetId: string) => {
        const fleetCards = get().getFleetCards({ fleetId });
        const playableCards = fleetCards.filter((card: FleetCard) => card.status === 'Playable');

        set((state: FleetStore) => ({
            playableCardsByFleet: {
                ...state.playableCardsByFleet,
                [fleetId]: playableCards
            }
        }));
    },

    // Update a specific fleet card
    updateFleetCard: ({
        fleetId,
        cardId,
        updates
    }: {
        fleetId: string;
        cardId: string;
        updates: Partial<FleetCard>;
    }) => {
        const fleets = get().fleets;
        const updatedFleets = fleets.map((fleet: Fleet) => {
            if (fleet.id === fleetId) {
                const updatedCards = fleet.cards.map((card: FleetCard) => {
                    if (card.id === cardId) {
                        return { ...card, ...updates };
                    }
                    return card;
                });
                return { ...fleet, cards: updatedCards };
            }
            return fleet;
        });

        set({ fleets: updatedFleets });

        // Refresh playable cards cache for the affected fleet
        get().refreshPlayableCards(fleetId);
    },

    // Update all fleet cards for next turn
    updateFleetCardsNextTurn: () => {
        const fleets = get().fleets;
        const updatedFleets = fleets.map((fleet: Fleet) => {
            const updatedCards = fleet.cards.map((card: FleetCard) => {
                const updates: Partial<FleetCard> = {};

                // Handle cooldown reduction
                if (card.turnCooldown && card.turnCooldown > 0) {
                    updates.turnCooldown = card.turnCooldown - 1;
                }

                // Update status based on conditions
                if (card.status === 'Available' && card.isPlayable()) {
                    updates.status = 'Playable';
                } else if (card.status === 'Playable' && !card.isPlayable()) {
                    updates.status = 'Available';
                } else if (card.status === 'Exhausted' && (!card.turnCooldown || card.turnCooldown <= 0)) {
                    updates.status = 'Available';
                }

                return { ...card, ...updates };
            });

            return { ...fleet, cards: updatedCards };
        });

        set({ fleets: updatedFleets });

        // Refresh playable cards cache for all fleets
        updatedFleets.forEach((fleet: Fleet) => {
            get().refreshPlayableCards(fleet.id);
        });
    }
});
