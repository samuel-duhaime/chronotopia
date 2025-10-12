import {
    createCommanderStore,
    type CommanderStore,
    type Commander,
    type Unit,
    createUnit,
    CommanderInfos
} from '../commanderStore';

describe('CommanderStore', () => {
    let store: CommanderStore;
    let setState: jest.Mock;
    let getState: jest.Mock;
    let api: {
        setState: jest.Mock;
        getState: jest.Mock;
        getInitialState: jest.Mock;
        subscribe: jest.Mock;
    };

    beforeEach(() => {
        setState = jest.fn();
        getState = jest.fn();
        api = {
            setState,
            getState,
            getInitialState: jest.fn(),
            subscribe: jest.fn()
        };

        store = createCommanderStore(setState, getState, api);

        // Mock getState to return the current store state
        getState.mockReturnValue(store);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initial state', () => {
        it('should initialize with one default commander', () => {
            expect(store.commanders).toHaveLength(1);

            const defaultCommander = store.commanders[0];
            expect(defaultCommander.id).toBe('commander-1');
            expect(defaultCommander.name).toBe('Admiral Kryos Vantrel');
            expect(defaultCommander.description).toBe(CommanderInfos['Admiral Kryos Vantrel'].description);
            expect(defaultCommander.faction).toBe('Human');
            expect(defaultCommander.specie).toBe('Human');
            expect(defaultCommander.image).toBe('kryos_vantrel.png');
            expect(defaultCommander.level).toBe(1);
            expect(defaultCommander.experience).toBe(0);
            expect(defaultCommander.power).toBe(10);
            expect(defaultCommander.items).toEqual([]);
            expect(defaultCommander.units).toEqual([]);
            expect(defaultCommander.cards).toEqual([]);
        });
    });

    describe('getCommander', () => {
        it('should return the correct commander by id', () => {
            const commander = store.getCommander({ commanderId: 'commander-1' });

            expect(commander.id).toBe('commander-1');
            expect(commander.name).toBe('Admiral Kryos Vantrel');
        });

        it('should return the first commander when id is not found', () => {
            const commander = store.getCommander({ commanderId: 'non-existent-id' });

            expect(commander).toEqual(store.commanders[0]);
        });
    });

    describe('createCommander', () => {
        it('should create a new commander with correct properties', () => {
            const commanderId = 'new-commander-id';
            const commanderName = 'Captain Zara Thorne';

            setState.mockImplementation((updateFn) => {
                const mockState = { commanders: store.commanders };
                const result = updateFn(mockState);

                expect(result.commanders).toHaveLength(2);
                const newCommander = result.commanders[1];
                expect(newCommander.id).toBe(commanderId);
                expect(newCommander.name).toBe(commanderName);
                expect(newCommander.description).toBe(CommanderInfos[commanderName].description);
                expect(newCommander.faction).toBe('Human');
                expect(newCommander.specie).toBe('Human');
                expect(newCommander.image).toBe('zara_thorne.png');
                expect(newCommander.level).toBe(1);
                expect(newCommander.experience).toBe(0);
                expect(newCommander.power).toBe(10);
                expect(newCommander.items).toEqual([]);
                expect(newCommander.units).toEqual([]);
                expect(newCommander.cards).toEqual([]);
            });

            const newCommander = store.createCommander({ commanderId, name: commanderName });

            expect(setState).toHaveBeenCalled();
            expect(newCommander.id).toBe(commanderId);
            expect(newCommander.name).toBe(commanderName);
        });

        it('should create commanders with different factions', () => {
            const commanderId = 'karnak-commander';
            const commanderName = 'Queen Veyra Khar';

            setState.mockImplementation((updateFn) => {
                const mockState = { commanders: store.commanders };
                const result = updateFn(mockState);

                const newCommander = result.commanders[1];
                expect(newCommander.faction).toBe('Karnak');
                expect(newCommander.specie).toBe('Karnak');
                expect(newCommander.image).toBe('veyra_khar.png');
            });

            store.createCommander({ commanderId, name: commanderName });

            expect(setState).toHaveBeenCalled();
        });
    });

    describe('renameCommander', () => {
        it('should rename an existing commander', () => {
            const commanderId = 'commander-1';
            const newName = 'Captain Zara Thorne';

            setState.mockImplementation((updateFn) => {
                const mockState = { commanders: store.commanders };
                const result = updateFn(mockState);

                const renamedCommander = result.commanders.find((c: Commander) => c.id === commanderId);
                expect(renamedCommander?.name).toBe(newName);
            });

            store.renameCommander({ commanderId, newName });

            expect(setState).toHaveBeenCalled();
        });

        it('should not affect other commanders when renaming', () => {
            const commanders = [
                store.commanders[0],
                {
                    id: 'commander-2',
                    name: 'Captain Zara Thorne',
                    description: 'Test',
                    faction: 'Human' as const,
                    specie: 'Human' as const,
                    image: 'test.png',
                    level: 1,
                    experience: 0,
                    power: 10,
                    items: [],
                    units: [],
                    cards: []
                }
            ];

            setState.mockImplementation((updateFn) => {
                const mockState = { commanders };
                const result = updateFn(mockState);

                // First commander should remain unchanged
                expect(result.commanders[0]).toEqual(commanders[0]);
                // Second commander should be renamed
                expect(result.commanders[1].name).toBe('Commander Raxus Vel');
            });

            store.renameCommander({ commanderId: 'commander-2', newName: 'Commander Raxus Vel' });

            expect(setState).toHaveBeenCalled();
        });
    });

    describe('addUnit', () => {
        it('should add a unit to the specified commander with calculated power', () => {
            const commanderId = 'commander-1';
            const unit: Unit = createUnit('unit-1', 2);

            // Expected power calculation for the default unit:
            // health: 3, damage: 1, initiative: 4, quantity: 2
            // power = (3 * 0.8 * 1 * 1 + 4 * 1 * 0.5) * 2 = (2.4 + 2) * 2 = 8.8
            const expectedPower = 8.8;

            setState.mockImplementation((updateFn) => {
                const mockState = { commanders: store.commanders };
                const result = updateFn(mockState);

                const commander = result.commanders.find((c: Commander) => c.id === commanderId);
                expect(commander?.units).toHaveLength(1);
                expect(commander?.units[0].power).toBe(expectedPower);
                expect(commander?.units[0].id).toBe('unit-1');
                expect(commander?.units[0].quantity).toBe(2);
            });

            store.addUnit({ commanderId, unit });

            expect(setState).toHaveBeenCalled();
        });

        it('should not affect other commanders when adding a unit', () => {
            const commanders = [
                store.commanders[0],
                {
                    id: 'commander-2',
                    name: 'Captain Zara Thorne',
                    description: 'Test',
                    faction: 'Human' as const,
                    specie: 'Human' as const,
                    image: 'test.png',
                    level: 1,
                    experience: 0,
                    power: 10,
                    items: [],
                    units: [],
                    cards: []
                }
            ];

            const unit: Unit = createUnit('unit-1', 1);

            setState.mockImplementation((updateFn) => {
                const mockState = { commanders };
                const result = updateFn(mockState);

                // First commander should get the unit
                expect(result.commanders[0].units).toHaveLength(1);
                // Second commander should remain unchanged
                expect(result.commanders[1].units).toHaveLength(0);
            });

            store.addUnit({ commanderId: 'commander-1', unit });

            expect(setState).toHaveBeenCalled();
        });
    });

    describe('createUnit helper function', () => {
        it('should create a unit with correct default properties', () => {
            const unit = createUnit('test-unit', 3);

            expect(unit.id).toBe('test-unit');
            expect(unit.type).toBe('Striker');
            expect(unit.categories).toEqual(['Ground', 'Biological']);
            expect(unit.faction).toBe('Human');
            expect(unit.tier).toBe(1);
            expect(unit.quantity).toBe(3);
            expect(unit.cost).toBe(5);
            expect(unit.health).toBe(3);
            expect(unit.damage).toBe(1);
            expect(unit.initiative).toBe(4);
            expect(unit.passives).toEqual([]);
            expect(unit.cards).toEqual(['Stimpack', 'Laser Gun']);
            expect(unit.power).toBe(0); // Power is calculated when added to commander
        });
    });
});
