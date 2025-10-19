import { createStore } from 'zustand';
import { type Fleet } from '../../fleet/fleetStore';
import { CapitalCard, PassCard, ExploreCard, MineCard, type FleetCard } from '../../card/FleetCard';

describe('fleetStore', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let store: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let createFleetStore: any;

    beforeEach(async () => {
        // Note: Dynamically import to avoid module resolution issues, otherwise jest fails to find the module.
        const fleetStoreModule = await import('../fleetStore');
        createFleetStore = fleetStoreModule.createFleetStore;

        // Create the actual store for testing
        store = createStore((set, get, api) => createFleetStore(set, get, api));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initial state', () => {
        it('should initialize with one default fleet', () => {
            const state = store.getState();
            expect(state.fleets).toHaveLength(1);

            const defaultFleet = state.fleets[0];
            expect(defaultFleet.id).toBe('fleet-1');
            expect(defaultFleet.commanderId).toBe('commander-1');
            expect(defaultFleet.faction).toBe('Human');
            expect(defaultFleet.cards).toEqual([CapitalCard, PassCard, ExploreCard, MineCard]);
            expect(defaultFleet.power).toBe(10);
        });
    });

    describe('getFleet', () => {
        it('should return the correct fleet by id', () => {
            const fleet = store.getState().getFleet({ fleetId: 'fleet-1' });

            expect(fleet.id).toBe('fleet-1');
            expect(fleet.commanderId).toBe('commander-1');
            expect(fleet.faction).toBe('Human');
            expect(fleet.power).toBe(10);
        });

        it('should return the first fleet when id is not found', () => {
            const fleet = store.getState().getFleet({ fleetId: 'non-existent-id' });
            const firstFleet = store.getState().fleets[0];

            expect(fleet).toEqual(firstFleet);
        });

        it('should work with multiple fleets', () => {
            // Update the store state with multiple fleets
            const mockFleets = [
                store.getState().fleets[0],
                {
                    id: 'fleet-2',
                    commanderId: 'commander-2',
                    faction: 'Karnak' as const,
                    cards: [],
                    power: 15
                }
            ];

            store.setState({ fleets: mockFleets });

            const fleet2 = store.getState().getFleet({ fleetId: 'fleet-2' });
            expect(fleet2.id).toBe('fleet-2');
            expect(fleet2.faction).toBe('Karnak');
            expect(fleet2.power).toBe(15);
        });
    });

    describe('getFleetCards', () => {
        it('should return all cards for a fleet', () => {
            const cards = store.getState().getFleetCards({ fleetId: 'fleet-1' });

            expect(cards).toEqual([CapitalCard, PassCard, ExploreCard, MineCard]);
            expect(cards).toHaveLength(4);
        });

        it('should return empty array for fleet with no cards', () => {
            const mockFleets = [
                {
                    id: 'fleet-empty',
                    commanderId: 'commander-1',
                    faction: 'Human' as const,
                    cards: [],
                    power: 10
                }
            ];

            store.setState({ fleets: mockFleets });

            const cards = store.getState().getFleetCards({ fleetId: 'fleet-empty' });
            expect(cards).toEqual([]);
        });
    });

    describe('getFleetPlayableCards', () => {
        it('should return only playable cards', () => {
            // Manually refresh the cache to ensure it's populated
            store.getState().refreshPlayableCards('fleet-1');

            // Get the playable cards from the store
            const playableCards = store.getState().getFleetPlayableCards({ fleetId: 'fleet-1' });

            // Only CapitalCard has status 'Playable', others have 'Available'
            const expectedPlayableCards = [CapitalCard];

            expect(playableCards).toEqual(expectedPlayableCards);
        });

        it("should cache results when fleet cards haven't changed", () => {
            // Manually refresh the cache to ensure it's populated
            store.getState().refreshPlayableCards('fleet-1');

            // First call should use the populated cache
            const firstCall = store.getState().getFleetPlayableCards({ fleetId: 'fleet-1' });

            // Second call should return the cached result
            const secondCall = store.getState().getFleetPlayableCards({ fleetId: 'fleet-1' });

            // Both calls should return the same content
            expect(firstCall).toEqual(secondCall);

            // Filter cards that have status 'Playable' manually to verify
            const fleetCards = store.getState().getFleetCards({ fleetId: 'fleet-1' });
            const expectedPlayableCards = fleetCards.filter((card: FleetCard) => card.status === 'Playable');
            expect(firstCall).toEqual(expectedPlayableCards);
        });
    });

    describe('updateFleetCard', () => {
        it('should update a specific card in the fleet', () => {
            const updates = { status: 'Exhausted' as const };

            store.getState().updateFleetCard({
                fleetId: 'fleet-1',
                cardId: CapitalCard.id,
                updates
            });

            const state = store.getState();
            const updatedFleet = state.fleets.find((f: Fleet) => f.id === 'fleet-1');
            const updatedCard = updatedFleet?.cards.find((c: FleetCard) => c.id === CapitalCard.id);

            expect(updatedCard?.status).toBe('Exhausted');
        });

        it('should not modify other cards or fleets', () => {
            const updates = { status: 'Exhausted' as const };
            const originalCards = [...store.getState().fleets[0].cards];

            store.getState().updateFleetCard({
                fleetId: 'fleet-1',
                cardId: CapitalCard.id,
                updates
            });

            const state = store.getState();
            const updatedFleet = state.fleets.find((f: Fleet) => f.id === 'fleet-1');
            const otherCards = updatedFleet?.cards.filter((c: FleetCard) => c.id !== CapitalCard.id);
            const originalOtherCards = originalCards.filter((c: FleetCard) => c.id !== CapitalCard.id);

            // Other cards should remain unchanged (excluding the modified one)
            expect(otherCards?.length).toBe(originalOtherCards.length);
        });
    });

    describe('updateFleetCardsNextTurn', () => {
        it('should reduce cooldowns by 1', () => {
            // Set up a fleet with cards that have cooldowns
            const mockFleets = [
                {
                    id: 'fleet-1',
                    commanderId: 'commander-1',
                    faction: 'Human' as const,
                    cards: [
                        { ...CapitalCard, turnCooldown: 2 },
                        { ...PassCard, turnCooldown: 1 },
                        { ...ExploreCard, turnCooldown: 0 },
                        { ...MineCard, turnCooldown: 3 }
                    ],
                    power: 10
                }
            ];

            store.setState({ fleets: mockFleets });
            store.getState().updateFleetCardsNextTurn();

            const state = store.getState();
            const fleet = state.fleets[0];

            expect(fleet.cards.find((c: FleetCard) => c.id === CapitalCard.id)?.turnCooldown).toBe(1);
            expect(fleet.cards.find((c: FleetCard) => c.id === PassCard.id)?.turnCooldown).toBe(0);
            expect(fleet.cards.find((c: FleetCard) => c.id === MineCard.id)?.turnCooldown).toBe(2);
        });

        it('should update card statuses based on conditions', () => {
            const mockCards = [
                { ...CapitalCard, status: 'Available' as const, isPlayable: jest.fn().mockReturnValue(true) },
                { ...PassCard, status: 'Playable' as const, isPlayable: jest.fn().mockReturnValue(false) },
                { ...ExploreCard, status: 'Exhausted' as const, turnCooldown: 0 },
                { ...MineCard, status: 'Exhausted' as const, turnCooldown: 1 }
            ];

            const mockFleets = [
                {
                    id: 'fleet-1',
                    commanderId: 'commander-1',
                    faction: 'Human' as const,
                    cards: mockCards,
                    power: 10
                }
            ];

            store.setState({ fleets: mockFleets });
            store.getState().updateFleetCardsNextTurn();

            const state = store.getState();
            const fleet = state.fleets[0];

            expect(fleet.cards.find((c: FleetCard) => c.id === CapitalCard.id)?.status).toBe('Playable');
            expect(fleet.cards.find((c: FleetCard) => c.id === PassCard.id)?.status).toBe('Available');
            expect(fleet.cards.find((c: FleetCard) => c.id === ExploreCard.id)?.status).toBe('Available');
        });
    });
});
