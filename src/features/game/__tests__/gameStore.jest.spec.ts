import { useGameStore, type GameType } from '../gameStore';

// Mock all the individual stores since we're only testing the core game functionality
jest.mock('../resourceStore', () => ({
    createResourceStore: () => ({
        resources: [],
        setResources: jest.fn(),
        updateResourcesNextTurn: jest.fn()
    })
}));

jest.mock('../actionStore', () => ({
    createActionStore: () => ({
        actions: [],
        getCurrentAction: jest.fn(),
        setNextActionActive: jest.fn()
    })
}));

jest.mock('../../fleet/fleetStore', () => ({
    createFleetStore: () => ({
        fleets: [],
        getFleet: jest.fn(),
        getFleetWithCommander: jest.fn()
    })
}));

jest.mock('../../commander/commanderStore', () => ({
    createCommanderStore: () => ({
        commanders: [],
        getCommander: jest.fn(),
        createCommander: jest.fn(),
        renameCommander: jest.fn(),
        addUnit: jest.fn()
    })
}));

jest.mock('../../map/mapStore', () => ({
    createMapStore: () => ({
        hexes: [],
        activeHex: null,
        initializeMap: jest.fn(),
        setActiveHex: jest.fn(),
        getHex: jest.fn(),
        updateHexElement: jest.fn(),
        clearActiveHex: jest.fn()
    })
}));

describe('GameStore', () => {
    beforeEach(() => {
        // Reset the store to initial state
        useGameStore.setState({
            id: 'game-1',
            name: 'Demo Game',
            type: 'Demo',
            turn: 1
        });
    });

    afterEach(() => {
        // Reset to initial state after each test
        useGameStore.setState({
            id: 'game-1',
            name: 'Demo Game',
            type: 'Demo',
            turn: 1
        });
    });

    describe('initial state', () => {
        it('should initialize with correct default values', () => {
            const state = useGameStore.getState();

            expect(state.id).toBe('game-1');
            expect(state.name).toBe('Demo Game');
            expect(state.type).toBe('Demo');
            expect(state.turn).toBe(1);
        });
    });

    describe('id management', () => {
        it('should return the current id', () => {
            const state = useGameStore.getState();

            expect(state.getId()).toBe('game-1');
        });

        it('should update the id when setId is called', () => {
            const { setId, getId } = useGameStore.getState();

            setId({ gameId: 'new-game-123' });

            expect(getId()).toBe('new-game-123');
            expect(useGameStore.getState().id).toBe('new-game-123');
        });

        it('should handle different id formats', () => {
            const { setId, getId } = useGameStore.getState();

            const testIds = ['game-2', 'campaign-level-1', 'battle-final-boss', ''];

            testIds.forEach((testId) => {
                setId({ gameId: testId });
                expect(getId()).toBe(testId);
            });
        });
    });

    describe('name management', () => {
        it('should return the current name', () => {
            const state = useGameStore.getState();

            expect(state.getName()).toBe('Demo Game');
        });

        it('should update the name when setName is called', () => {
            const { setName, getName } = useGameStore.getState();

            setName({ name: 'My Epic Campaign' });

            expect(getName()).toBe('My Epic Campaign');
            expect(useGameStore.getState().name).toBe('My Epic Campaign');
        });

        it('should handle various name formats', () => {
            const { setName, getName } = useGameStore.getState();

            const testNames = [
                'Battle for Earth',
                'Campaign: The Final Frontier',
                'Quick Match #42',
                '',
                'Very Long Game Name That Goes On And On'
            ];

            testNames.forEach((testName) => {
                setName({ name: testName });
                expect(getName()).toBe(testName);
            });
        });
    });

    describe('type management', () => {
        it('should return the current type', () => {
            const state = useGameStore.getState();

            expect(state.getType()).toBe('Demo');
        });

        it('should update the type when setType is called', () => {
            const { setType, getType } = useGameStore.getState();

            setType({ type: 'Classic' });

            expect(getType()).toBe('Classic');
            expect(useGameStore.getState().type).toBe('Classic');
        });

        it('should handle all valid game types', () => {
            const { setType, getType } = useGameStore.getState();

            const gameTypes: GameType[] = ['Demo', 'Classic', 'OneCommander', 'Campaign', 'Battle'];

            gameTypes.forEach((gameType) => {
                setType({ type: gameType });
                expect(getType()).toBe(gameType);
                expect(useGameStore.getState().type).toBe(gameType);
            });
        });
    });

    describe('turn management', () => {
        it('should start with turn 1', () => {
            const state = useGameStore.getState();

            expect(state.turn).toBe(1);
        });

        it('should increment turn when nextTurn is called', () => {
            const { nextTurn } = useGameStore.getState();

            nextTurn();

            expect(useGameStore.getState().turn).toBe(2);
        });

        it('should increment turn multiple times correctly', () => {
            const { nextTurn } = useGameStore.getState();

            // Advance several turns
            for (let i = 0; i < 5; i++) {
                nextTurn();
            }

            expect(useGameStore.getState().turn).toBe(6);
        });

        it('should call updateResourcesNextTurn when nextTurn is called', () => {
            const state = useGameStore.getState();
            const updateResourcesSpy = jest.spyOn(state, 'updateResourcesNextTurn');

            state.nextTurn();

            expect(updateResourcesSpy).toHaveBeenCalled();
        });

        it('should update resources before incrementing turn', () => {
            const state = useGameStore.getState();
            const updateResourcesSpy = jest.spyOn(state, 'updateResourcesNextTurn');
            let resourcesUpdatedBeforeTurnIncrement = false;

            // Mock updateResourcesNextTurn to check if it's called before turn increment
            updateResourcesSpy.mockImplementation(() => {
                if (useGameStore.getState().turn === 1) {
                    resourcesUpdatedBeforeTurnIncrement = true;
                }
            });

            state.nextTurn();

            expect(resourcesUpdatedBeforeTurnIncrement).toBe(true);
            expect(useGameStore.getState().turn).toBe(2);

            updateResourcesSpy.mockRestore();
        });
    });

    describe('store integration', () => {
        it('should maintain state consistency across operations', () => {
            const { setId, setName, setType, nextTurn } = useGameStore.getState();

            // Perform multiple operations
            setId({ gameId: 'integration-test' });
            setName({ name: 'Integration Test Game' });
            setType({ type: 'Campaign' });
            nextTurn();
            nextTurn();

            const finalState = useGameStore.getState();
            expect(finalState.id).toBe('integration-test');
            expect(finalState.name).toBe('Integration Test Game');
            expect(finalState.type).toBe('Campaign');
            expect(finalState.turn).toBe(3);
        });

        it('should allow subscribing to state changes', () => {
            const mockCallback = jest.fn();

            const unsubscribe = useGameStore.subscribe(mockCallback);

            useGameStore.getState().setName({ name: 'Subscription Test' });

            expect(mockCallback).toHaveBeenCalled();

            unsubscribe();
        });
    });
});
