import { createMapStore, type MapStore, type MapHex, type Element } from '../mapStore';

describe('MapStore', () => {
    let store: MapStore;
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

        store = createMapStore(setState, getState, api);

        // Mock getState to return the current store state
        getState.mockReturnValue(store);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initial state', () => {
        it('should initialize with empty hexes and no active hex', () => {
            expect(store.hexes).toEqual([]);
            expect(store.activeHex).toBeNull();
        });
    });

    describe('initializeMap', () => {
        it('should create an 11x11 grid of hexes', () => {
            setState.mockImplementation((newState) => {
                expect(newState.hexes).toHaveLength(121); // 11 * 11 = 121

                // Check that all coordinates from 0,0 to 10,10 are present
                for (let x = 0; x <= 10; x++) {
                    for (let y = 0; y <= 10; y++) {
                        const hex = newState.hexes.find((h: MapHex) => h.x === x && h.y === y);
                        expect(hex).toBeDefined();
                        expect(hex.x).toBe(x);
                        expect(hex.y).toBe(y);
                    }
                }
            });

            store.initializeMap();

            expect(setState).toHaveBeenCalled();
        });

        it('should set up predefined elements correctly', () => {
            setState.mockImplementation((newState) => {
                // Check planet at (5, 4)
                const planetHex = newState.hexes.find((h: MapHex) => h.x === 5 && h.y === 4);
                expect(planetHex?.elements).toEqual([{ id: 'planet-earth', element: 'Planet' }]);
                expect(planetHex?.isActive).toBeFalsy();

                // Check fleet at (5, 5)
                const fleetHex = newState.hexes.find((h: MapHex) => h.x === 5 && h.y === 5);
                expect(fleetHex?.elements).toEqual([{ id: 'fleet-1', element: 'Fleet' }]);
                expect(fleetHex?.isActive).toBe(true);

                // Check that activeHex is set to the fleet hex
                expect(newState.activeHex).toEqual(fleetHex);
            });

            store.initializeMap();

            expect(setState).toHaveBeenCalled();
        });

        it('should set empty elements for other hexes', () => {
            setState.mockImplementation((newState) => {
                // Check a random empty hex
                const emptyHex = newState.hexes.find((h: MapHex) => h.x === 0 && h.y === 0);
                expect(emptyHex?.elements).toEqual([{ id: 'empty-0-0', element: 'Empty' }]);
                expect(emptyHex?.isActive).toBeFalsy();

                // Check another empty hex
                const anotherEmptyHex = newState.hexes.find((h: MapHex) => h.x === 10 && h.y === 10);
                expect(anotherEmptyHex?.elements).toEqual([{ id: 'empty-10-10', element: 'Empty' }]);
                expect(anotherEmptyHex?.isActive).toBeFalsy();
            });

            store.initializeMap();

            expect(setState).toHaveBeenCalled();
        });
    });

    describe('getHex', () => {
        beforeEach(() => {
            // Set up some test hexes
            const testHexes: MapHex[] = [
                { x: 0, y: 0, elements: [{ id: 'empty-0-0', element: 'Empty' }] },
                { x: 5, y: 4, elements: [{ id: 'planet-earth', element: 'Planet' }] },
                { x: 5, y: 5, elements: [{ id: 'fleet-1', element: 'Fleet' }], isActive: true }
            ];
            getState.mockReturnValue({ ...store, hexes: testHexes });
        });

        it('should return the correct hex by coordinates', () => {
            const hex = store.getHex({ x: 5, y: 4 });

            expect(hex).toBeDefined();
            expect(hex?.x).toBe(5);
            expect(hex?.y).toBe(4);
            expect(hex?.elements).toEqual([{ id: 'planet-earth', element: 'Planet' }]);
        });

        it('should return undefined for non-existent coordinates', () => {
            const hex = store.getHex({ x: 99, y: 99 });

            expect(hex).toBeUndefined();
        });

        it('should return the active hex correctly', () => {
            const hex = store.getHex({ x: 5, y: 5 });

            expect(hex).toBeDefined();
            expect(hex?.isActive).toBe(true);
            expect(hex?.elements).toEqual([{ id: 'fleet-1', element: 'Fleet' }]);
        });
    });

    describe('updateHexElement', () => {
        beforeEach(() => {
            const testHexes: MapHex[] = [
                { x: 0, y: 0, elements: [{ id: 'empty-0-0', element: 'Empty' }] },
                { x: 5, y: 4, elements: [{ id: 'planet-earth', element: 'Planet' }] }
            ];
            getState.mockReturnValue({ ...store, hexes: testHexes });
        });

        it('should add a new element to a hex', () => {
            const newElement = { id: 'new-fleet', element: 'Fleet' as Element };

            setState.mockImplementation((newState) => {
                const updatedHex = newState.hexes.find((h: MapHex) => h.x === 0 && h.y === 0);
                expect(updatedHex?.elements).toContain(newElement);
                expect(updatedHex?.elements).toHaveLength(2); // original empty + new fleet
            });

            store.updateHexElement({ x: 0, y: 0, element: newElement });

            expect(setState).toHaveBeenCalled();
        });

        it('should replace an existing element with the same id', () => {
            const updatedElement = { id: 'planet-earth', element: 'Planet' as Element };

            setState.mockImplementation((newState) => {
                const updatedHex = newState.hexes.find((h: MapHex) => h.x === 5 && h.y === 4);
                expect(updatedHex?.elements).toEqual([updatedElement]);
                expect(updatedHex?.elements).toHaveLength(1); // replaced, not added
            });

            store.updateHexElement({ x: 5, y: 4, element: updatedElement });

            expect(setState).toHaveBeenCalled();
        });

        it('should not affect other hexes', () => {
            const newElement = { id: 'new-element', element: 'Fleet' as Element };

            setState.mockImplementation((newState) => {
                const unchangedHex = newState.hexes.find((h: MapHex) => h.x === 5 && h.y === 4);
                expect(unchangedHex?.elements).toEqual([{ id: 'planet-earth', element: 'Planet' }]);
            });

            store.updateHexElement({ x: 0, y: 0, element: newElement });

            expect(setState).toHaveBeenCalled();
        });
    });

    describe('setActiveHex', () => {
        beforeEach(() => {
            const testHexes: MapHex[] = [
                { x: 0, y: 0, elements: [{ id: 'empty-0-0', element: 'Empty' }] },
                { x: 5, y: 4, elements: [{ id: 'planet-earth', element: 'Planet' }] },
                { x: 5, y: 5, elements: [{ id: 'fleet-1', element: 'Fleet' }], isActive: true }
            ];
            getState.mockReturnValue({ ...store, hexes: testHexes, activeHex: testHexes[2] });
        });

        it('should set the specified hex as active and deactivate others', () => {
            setState.mockImplementation((newState) => {
                // Check that the new hex is active
                const newActiveHex = newState.hexes.find((h: MapHex) => h.x === 5 && h.y === 4);
                expect(newActiveHex?.isActive).toBe(true);
                expect(newState.activeHex).toEqual(newActiveHex);

                // Check that other hexes are not active
                const oldActiveHex = newState.hexes.find((h: MapHex) => h.x === 5 && h.y === 5);
                expect(oldActiveHex?.isActive).toBe(false);

                const otherHex = newState.hexes.find((h: MapHex) => h.x === 0 && h.y === 0);
                expect(otherHex?.isActive).toBe(false);
            });

            store.setActiveHex({ x: 5, y: 4 });

            expect(setState).toHaveBeenCalled();
        });

        it('should handle setting active hex to non-existent coordinates', () => {
            setState.mockImplementation((newState) => {
                // All hexes should be inactive
                newState.hexes.forEach((hex: MapHex) => {
                    expect(hex.isActive).toBe(false);
                });

                // activeHex should be null since coordinates don't exist
                expect(newState.activeHex).toBeNull();
            });

            store.setActiveHex({ x: 99, y: 99 });

            expect(setState).toHaveBeenCalled();
        });
    });

    describe('clearActiveHex', () => {
        beforeEach(() => {
            const testHexes: MapHex[] = [
                { x: 0, y: 0, elements: [{ id: 'empty-0-0', element: 'Empty' }], isActive: false },
                { x: 5, y: 4, elements: [{ id: 'planet-earth', element: 'Planet' }], isActive: false },
                { x: 5, y: 5, elements: [{ id: 'fleet-1', element: 'Fleet' }], isActive: true }
            ];
            getState.mockReturnValue({ ...store, hexes: testHexes, activeHex: testHexes[2] });
        });

        it('should deactivate all hexes and clear activeHex', () => {
            setState.mockImplementation((newState) => {
                // Check that all hexes are inactive
                newState.hexes.forEach((hex: MapHex) => {
                    expect(hex.isActive).toBe(false);
                });

                // Check that activeHex is null
                expect(newState.activeHex).toBeNull();
            });

            store.clearActiveHex();

            expect(setState).toHaveBeenCalled();
        });

        it('should work when no hex is currently active', () => {
            const testHexes: MapHex[] = [
                { x: 0, y: 0, elements: [{ id: 'empty-0-0', element: 'Empty' }], isActive: false },
                { x: 5, y: 4, elements: [{ id: 'planet-earth', element: 'Planet' }], isActive: false }
            ];
            getState.mockReturnValue({ ...store, hexes: testHexes, activeHex: null });

            setState.mockImplementation((newState) => {
                newState.hexes.forEach((hex: MapHex) => {
                    expect(hex.isActive).toBe(false);
                });
                expect(newState.activeHex).toBeNull();
            });

            store.clearActiveHex();

            expect(setState).toHaveBeenCalled();
        });
    });

    describe('moveFleet', () => {
        beforeEach(() => {
            // Set up test hexes with a fleet at (5, 5)
            const testHexes: MapHex[] = [
                { x: 5, y: 4, elements: [{ id: 'empty-5-4', element: 'Empty' }] },
                { x: 5, y: 5, elements: [{ id: 'fleet-1', element: 'Fleet' }] },
                { x: 6, y: 5, elements: [{ id: 'empty-6-5', element: 'Empty' }] },
                { x: 4, y: 5, elements: [{ id: 'empty-4-5', element: 'Empty' }] }
            ];
            getState.mockReturnValue({ ...store, hexes: testHexes });
        });

        it('should move fleet from source to destination hex', () => {
            setState.mockImplementation((newState) => {
                // Check that fleet is removed from source hex
                const sourceHex = newState.hexes.find((h: MapHex) => h.x === 5 && h.y === 5);
                expect(sourceHex?.elements).not.toContainEqual(
                    expect.objectContaining({ id: 'fleet-1', element: 'Fleet' })
                );

                // Check that fleet is added to destination hex
                const destHex = newState.hexes.find((h: MapHex) => h.x === 6 && h.y === 5);
                expect(destHex?.elements).toContainEqual(expect.objectContaining({ id: 'fleet-1', element: 'Fleet' }));
            });

            store.moveFleet({ fromX: 5, fromY: 5, toX: 6, toY: 5, fleetId: 'fleet-1' });

            expect(setState).toHaveBeenCalled();
        });

        it('should calculate correct rotation for North movement (even column)', () => {
            setState.mockImplementation((newState) => {
                // Check fleet has correct rotation for North movement (0°)
                const destHex = newState.hexes.find((h: MapHex) => h.x === 5 && h.y === 4);
                const fleetElement = destHex?.elements.find(
                    (el: { id: string; element: Element; rotation?: number }) => el.id === 'fleet-1'
                );
                expect(fleetElement?.rotation).toBe(0);
            });

            store.moveFleet({ fromX: 5, fromY: 5, toX: 5, toY: 4, fleetId: 'fleet-1' });

            expect(setState).toHaveBeenCalled();
        });

        it('should calculate correct rotation for North-East movement (even column)', () => {
            // Set up test with fleet at even column (4, 5)
            const testHexes: MapHex[] = [
                { x: 4, y: 5, elements: [{ id: 'fleet-1', element: 'Fleet' }] },
                { x: 5, y: 4, elements: [{ id: 'empty-5-4', element: 'Empty' }] }
            ];
            getState.mockReturnValue({ ...store, hexes: testHexes });

            setState.mockImplementation((newState) => {
                // Check fleet has correct rotation for North-East movement (60°)
                const destHex = newState.hexes.find((h: MapHex) => h.x === 5 && h.y === 4);
                const fleetElement = destHex?.elements.find(
                    (el: { id: string; element: Element; rotation?: number }) => el.id === 'fleet-1'
                );
                expect(fleetElement?.rotation).toBe(60);
            });

            store.moveFleet({ fromX: 4, fromY: 5, toX: 5, toY: 4, fleetId: 'fleet-1' });

            expect(setState).toHaveBeenCalled();
        });

        it('should calculate correct rotation for South-East movement (even column)', () => {
            // Set up test with fleet at even column (4, 5)
            const testHexes: MapHex[] = [
                { x: 4, y: 5, elements: [{ id: 'fleet-1', element: 'Fleet' }] },
                { x: 5, y: 5, elements: [{ id: 'empty-5-5', element: 'Empty' }] }
            ];
            getState.mockReturnValue({ ...store, hexes: testHexes });

            setState.mockImplementation((newState) => {
                // Check fleet has correct rotation for South-East movement (120°)
                const destHex = newState.hexes.find((h: MapHex) => h.x === 5 && h.y === 5);
                const fleetElement = destHex?.elements.find(
                    (el: { id: string; element: Element; rotation?: number }) => el.id === 'fleet-1'
                );
                expect(fleetElement?.rotation).toBe(120);
            });

            store.moveFleet({ fromX: 4, fromY: 5, toX: 5, toY: 5, fleetId: 'fleet-1' });

            expect(setState).toHaveBeenCalled();
        });

        it('should calculate correct rotation for South movement (even column)', () => {
            setState.mockImplementation((newState) => {
                // Check fleet has correct rotation for South movement (180°)
                const destHex = newState.hexes.find((h: MapHex) => h.x === 5 && h.y === 6);
                const fleetElement = destHex?.elements.find(
                    (el: { id: string; element: Element; rotation?: number }) => el.id === 'fleet-1'
                );
                expect(fleetElement?.rotation).toBe(180);
            });

            // Add destination hex for this test
            const testHexes = getState().hexes;
            testHexes.push({ x: 5, y: 6, elements: [{ id: 'empty-5-6', element: 'Empty' }] });
            getState.mockReturnValue({ ...store, hexes: testHexes });

            store.moveFleet({ fromX: 5, fromY: 5, toX: 5, toY: 6, fleetId: 'fleet-1' });

            expect(setState).toHaveBeenCalled();
        });

        it('should calculate correct rotation for South-West movement (even column)', () => {
            // Set up test with fleet at even column (4, 5)
            const testHexes: MapHex[] = [
                { x: 4, y: 5, elements: [{ id: 'fleet-1', element: 'Fleet' }] },
                { x: 3, y: 5, elements: [{ id: 'empty-3-5', element: 'Empty' }] }
            ];
            getState.mockReturnValue({ ...store, hexes: testHexes });

            setState.mockImplementation((newState) => {
                // Check fleet has correct rotation for South-West movement (240°)
                const destHex = newState.hexes.find((h: MapHex) => h.x === 3 && h.y === 5);
                const fleetElement = destHex?.elements.find(
                    (el: { id: string; element: Element; rotation?: number }) => el.id === 'fleet-1'
                );
                expect(fleetElement?.rotation).toBe(240);
            });

            store.moveFleet({ fromX: 4, fromY: 5, toX: 3, toY: 5, fleetId: 'fleet-1' });

            expect(setState).toHaveBeenCalled();
        });

        it('should calculate correct rotation for North-West movement (odd column)', () => {
            setState.mockImplementation((newState) => {
                // Check fleet has correct rotation for North-West movement (300°)
                const destHex = newState.hexes.find((h: MapHex) => h.x === 4 && h.y === 5);
                const fleetElement = destHex?.elements.find(
                    (el: { id: string; element: Element; rotation?: number }) => el.id === 'fleet-1'
                );
                expect(fleetElement?.rotation).toBe(300);
            });

            store.moveFleet({ fromX: 5, fromY: 5, toX: 4, toY: 5, fleetId: 'fleet-1' });

            expect(setState).toHaveBeenCalled();
        });

        it('should calculate correct rotation for South-East movement (odd column)', () => {
            // Set up test with fleet at odd column (3, 5)
            const testHexes: MapHex[] = [
                { x: 3, y: 5, elements: [{ id: 'fleet-1', element: 'Fleet' }] },
                { x: 4, y: 5, elements: [{ id: 'empty-4-5', element: 'Empty' }] },
                { x: 4, y: 6, elements: [{ id: 'empty-4-6', element: 'Empty' }] }
            ];
            getState.mockReturnValue({ ...store, hexes: testHexes });

            setState.mockImplementation((newState) => {
                // Check fleet has correct rotation for North-East movement from odd column (60°)
                const destHex = newState.hexes.find((h: MapHex) => h.x === 4 && h.y === 5);
                const fleetElement = destHex?.elements.find(
                    (el: { id: string; element: Element; rotation?: number }) => el.id === 'fleet-1'
                );
                expect(fleetElement?.rotation).toBe(60);
            });

            store.moveFleet({ fromX: 3, fromY: 5, toX: 4, toY: 5, fleetId: 'fleet-1' });

            expect(setState).toHaveBeenCalled();
        });

        it('should preserve existing elements in destination hex', () => {
            // Set up destination hex with existing planet
            const testHexes = getState().hexes;
            const destHex = testHexes.find((h: MapHex) => h.x === 6 && h.y === 5);
            if (destHex) {
                destHex.elements = [{ id: 'planet-earth', element: 'Planet' }];
            }
            getState.mockReturnValue({ ...store, hexes: testHexes });

            setState.mockImplementation((newState) => {
                // Check that both planet and fleet exist in destination hex
                const destHex = newState.hexes.find((h: MapHex) => h.x === 6 && h.y === 5);
                expect(destHex?.elements).toContainEqual({ id: 'planet-earth', element: 'Planet' });
                expect(destHex?.elements).toContainEqual(expect.objectContaining({ id: 'fleet-1', element: 'Fleet' }));
                expect(destHex?.elements).toHaveLength(2);
            });

            store.moveFleet({ fromX: 5, fromY: 5, toX: 6, toY: 5, fleetId: 'fleet-1' });

            expect(setState).toHaveBeenCalled();
        });

        it('should not affect other hexes during fleet movement', () => {
            setState.mockImplementation((newState) => {
                // Check that unrelated hex remains unchanged
                const unchangedHex = newState.hexes.find((h: MapHex) => h.x === 5 && h.y === 4);
                expect(unchangedHex?.elements).toEqual([{ id: 'empty-5-4', element: 'Empty' }]);
            });

            store.moveFleet({ fromX: 5, fromY: 5, toX: 6, toY: 5, fleetId: 'fleet-1' });

            expect(setState).toHaveBeenCalled();
        });

        it('should handle moving non-existent fleet gracefully', () => {
            store.moveFleet({ fromX: 5, fromY: 5, toX: 6, toY: 5, fleetId: 'non-existent-fleet' });

            // setState should not be called when fleet doesn't exist
            expect(setState).not.toHaveBeenCalled();
        });
    });
});
