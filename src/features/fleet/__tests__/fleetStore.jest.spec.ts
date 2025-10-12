import { createFleetStore, type FleetStore, type Fleet } from '../fleetStore';
import { type CommanderStore, type Commander } from '../../commander/commanderStore';

describe('FleetStore', () => {
    let store: FleetStore;
    let setState: jest.Mock;
    let getState: jest.Mock;
    let mockCommanderStore: CommanderStore;
    let mockCommander: Commander;
    let api: {
        setState: jest.Mock;
        getState: jest.Mock;
        getInitialState: jest.Mock;
        subscribe: jest.Mock;
    };

    beforeEach(() => {
        setState = jest.fn();
        getState = jest.fn();

        // Mock commander for testing
        mockCommander = {
            id: 'commander-1',
            name: 'Admiral Kryos Vantrel',
            description: 'A seasoned tactician known for his icy resolve and strategic brilliance.',
            faction: 'Human',
            specie: 'Human',
            image: 'kryos_vantrel.png',
            level: 1,
            experience: 0,
            power: 10,
            items: [],
            units: [],
            cards: []
        };

        // Mock commander store
        mockCommanderStore = {
            commanders: [mockCommander],
            getCommander: jest.fn().mockReturnValue(mockCommander),
            createCommander: jest.fn(),
            renameCommander: jest.fn(),
            addUnit: jest.fn()
        };

        api = {
            setState,
            getState,
            getInitialState: jest.fn(),
            subscribe: jest.fn()
        };

        store = createFleetStore(setState, getState, api);

        // Mock getState to return both fleet and commander store data
        getState.mockReturnValue({
            ...store,
            ...mockCommanderStore
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initial state', () => {
        it('should initialize with one default fleet', () => {
            expect(store.fleets).toHaveLength(1);

            const defaultFleet = store.fleets[0];
            expect(defaultFleet.id).toBe('fleet-1');
            expect(defaultFleet.commanderId).toBe('commander-1');
            expect(defaultFleet.faction).toBe('Human');
            expect(defaultFleet.cards).toEqual([]);
            expect(defaultFleet.power).toBe(10);
        });
    });

    describe('getFleet', () => {
        it('should return the correct fleet by id', () => {
            const fleet = store.getFleet({ fleetId: 'fleet-1' });

            expect(fleet.id).toBe('fleet-1');
            expect(fleet.commanderId).toBe('commander-1');
            expect(fleet.faction).toBe('Human');
            expect(fleet.power).toBe(10);
        });

        it('should return the first fleet when id is not found', () => {
            const fleet = store.getFleet({ fleetId: 'non-existent-id' });

            expect(fleet).toEqual(store.fleets[0]);
        });

        it('should work with multiple fleets', () => {
            const mockFleets = [
                store.fleets[0],
                {
                    id: 'fleet-2',
                    commanderId: 'commander-2',
                    faction: 'Karnak' as const,
                    cards: [],
                    power: 15
                }
            ];

            getState.mockReturnValue({
                fleets: mockFleets,
                getFleet: store.getFleet,
                ...mockCommanderStore
            });

            const fleet2 = store.getFleet({ fleetId: 'fleet-2' });
            expect(fleet2.id).toBe('fleet-2');
            expect(fleet2.faction).toBe('Karnak');
            expect(fleet2.power).toBe(15);
        });
    });

    describe('getFleetWithCommander', () => {
        it('should return fleet with its associated commander', () => {
            const fleetWithCommander = store.getFleetWithCommander({ fleetId: 'fleet-1' });

            expect(fleetWithCommander.id).toBe('fleet-1');
            expect(fleetWithCommander.commanderId).toBe('commander-1');
            expect(fleetWithCommander.faction).toBe('Human');
            expect(fleetWithCommander.power).toBe(10);
            expect(fleetWithCommander.commander).toEqual(mockCommander);
            expect(fleetWithCommander.commander.id).toBe('commander-1');
            expect(fleetWithCommander.commander.name).toBe('Admiral Kryos Vantrel');
        });

        it('should call getCommander with correct commanderId', () => {
            store.getFleetWithCommander({ fleetId: 'fleet-1' });

            expect(mockCommanderStore.getCommander).toHaveBeenCalledWith({ commanderId: 'commander-1' });
        });

        it('should work with different fleet and commander combinations', () => {
            const mockCommander2: Commander = {
                id: 'commander-2',
                name: 'Queen Veyra Khar',
                description: 'The ruthless military Queen of the Karnak',
                faction: 'Karnak',
                specie: 'Karnak',
                image: 'veyra_khar.png',
                level: 2,
                experience: 100,
                power: 20,
                items: [],
                units: [],
                cards: []
            };

            const mockFleets = [
                store.fleets[0],
                {
                    id: 'fleet-2',
                    commanderId: 'commander-2',
                    faction: 'Karnak' as const,
                    cards: [],
                    power: 20
                }
            ];

            const mockGetCommander = jest
                .fn()
                .mockReturnValueOnce(mockCommander) // First call for fleet-1
                .mockReturnValueOnce(mockCommander2); // Second call for fleet-2

            getState.mockReturnValue({
                fleets: mockFleets,
                getFleet: store.getFleet,
                getFleetWithCommander: store.getFleetWithCommander,
                commanders: mockCommanderStore.commanders,
                getCommander: mockGetCommander,
                createCommander: mockCommanderStore.createCommander,
                renameCommander: mockCommanderStore.renameCommander,
                addUnit: mockCommanderStore.addUnit
            });

            // Test fleet-1 with commander-1
            const fleet1WithCommander = store.getFleetWithCommander({ fleetId: 'fleet-1' });
            expect(fleet1WithCommander.commander.name).toBe('Admiral Kryos Vantrel');
            expect(fleet1WithCommander.commander.faction).toBe('Human');

            // Test fleet-2 with commander-2
            const fleet2WithCommander = store.getFleetWithCommander({ fleetId: 'fleet-2' });
            expect(fleet2WithCommander.commander.name).toBe('Queen Veyra Khar');
            expect(fleet2WithCommander.commander.faction).toBe('Karnak');
        });

        it('should handle non-existent fleet by using first fleet', () => {
            const fleetWithCommander = store.getFleetWithCommander({ fleetId: 'non-existent-fleet' });

            // Should use the first fleet (fleet-1)
            expect(fleetWithCommander.id).toBe('fleet-1');
            expect(fleetWithCommander.commander).toEqual(mockCommander);
            expect(mockCommanderStore.getCommander).toHaveBeenCalledWith({ commanderId: 'commander-1' });
        });
    });

    describe('fleet and commander integration', () => {
        it('should maintain consistency between fleet faction and commander faction', () => {
            const fleetWithCommander = store.getFleetWithCommander({ fleetId: 'fleet-1' });

            expect(fleetWithCommander.faction).toBe(fleetWithCommander.commander.faction);
        });

        it('should properly handle different faction combinations', () => {
            const karnakCommander: Commander = {
                id: 'commander-karnak',
                name: 'Queen Veyra Khar',
                description: 'Karnak Queen',
                faction: 'Karnak',
                specie: 'Karnak',
                image: 'veyra_khar.png',
                level: 1,
                experience: 0,
                power: 15,
                items: [],
                units: [],
                cards: []
            };

            const karnakFleet: Fleet = {
                id: 'fleet-karnak',
                commanderId: 'commander-karnak',
                faction: 'Karnak',
                cards: [],
                power: 15
            };

            const mockGetCommander = jest.fn().mockReturnValue(karnakCommander);

            getState.mockReturnValue({
                fleets: [karnakFleet],
                getFleet: store.getFleet,
                getFleetWithCommander: store.getFleetWithCommander,
                commanders: mockCommanderStore.commanders,
                getCommander: mockGetCommander,
                createCommander: mockCommanderStore.createCommander,
                renameCommander: mockCommanderStore.renameCommander,
                addUnit: mockCommanderStore.addUnit
            });

            const fleetWithCommander = store.getFleetWithCommander({ fleetId: 'fleet-karnak' });

            expect(fleetWithCommander.faction).toBe('Karnak');
            expect(fleetWithCommander.commander.faction).toBe('Karnak');
            expect(fleetWithCommander.commander.specie).toBe('Karnak');
        });
    });
});
