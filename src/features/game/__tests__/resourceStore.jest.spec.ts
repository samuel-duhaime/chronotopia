import { createResourceStore, type ResourceStore } from '../resourceStore';
import { faBitcoin } from '@fortawesome/free-brands-svg-icons';
import { faGlobe, faFlask, faSmile, faEarth, faRocket } from '@fortawesome/free-solid-svg-icons';

describe('ResourceStore', () => {
    let store: ResourceStore;
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
        store = createResourceStore(setState, getState, api);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initial state', () => {
        it('should initialize with correct default resources', () => {
            expect(store.resources).toHaveLength(6);

            const crypto = store.resources.find((r) => r.type === 'Crypto');
            expect(crypto).toEqual({
                type: 'Crypto',
                amount: 0,
                perTurn: 1,
                icon: faBitcoin
            });

            const influence = store.resources.find((r) => r.type === 'Influence');
            expect(influence).toEqual({
                type: 'Influence',
                amount: 0,
                perTurn: 1,
                icon: faGlobe
            });

            const science = store.resources.find((r) => r.type === 'Science');
            expect(science).toEqual({
                type: 'Science',
                amount: 0,
                perTurn: 1,
                threshold: 25,
                icon: faFlask
            });

            const happiness = store.resources.find((r) => r.type === 'Happiness');
            expect(happiness).toEqual({
                type: 'Happiness',
                amount: 0,
                perTurn: 1,
                threshold: 100,
                icon: faSmile
            });

            const planetsCapacity = store.resources.find((r) => r.type === 'PlanetsCapacity');
            expect(planetsCapacity).toEqual({
                type: 'PlanetsCapacity',
                amount: 0,
                maxCapacity: 1,
                icon: faEarth
            });

            const fleetCapacity = store.resources.find((r) => r.type === 'FleetCapacity');
            expect(fleetCapacity).toEqual({
                type: 'FleetCapacity',
                amount: 1,
                maxCapacity: 1,
                icon: faRocket
            });
        });
    });

    describe('getResource', () => {
        it('should return the correct resource by type', () => {
            getState.mockReturnValue(store);

            const crypto = store.getResource('Crypto');
            expect(crypto).toEqual({
                type: 'Crypto',
                amount: 0,
                perTurn: 1,
                icon: faBitcoin
            });

            const science = store.getResource('Science');
            expect(science).toEqual({
                type: 'Science',
                amount: 0,
                perTurn: 1,
                threshold: 25,
                icon: faFlask
            });
        });

        it('should return undefined for non-existent resource type', () => {
            getState.mockReturnValue(store);

            // @ts-expect-error - Testing with invalid resource type
            const nonExistent = store.getResource('NonExistent');
            expect(nonExistent).toBeUndefined();
        });
    });

    describe('updateResource', () => {
        it('should update a specific resource by type', () => {
            const mockState = {
                resources: [
                    { type: 'Crypto' as const, amount: 10, perTurn: 1, icon: faBitcoin },
                    { type: 'Science' as const, amount: 5, perTurn: 1, threshold: 25, icon: faFlask }
                ]
            };

            setState.mockImplementation((updateFn) => {
                const result = updateFn(mockState);
                const updatedCrypto = result.resources.find(
                    (r: { type: string; amount: number }) => r.type === 'Crypto'
                );
                expect(updatedCrypto?.amount).toBe(100);
            });

            store.updateResource('Crypto', { amount: 100 });

            expect(setState).toHaveBeenCalled();
        });

        it('should not affect other resources when updating one', () => {
            const mockState = {
                resources: [
                    { type: 'Crypto' as const, amount: 10, perTurn: 1, icon: faBitcoin },
                    { type: 'Science' as const, amount: 5, perTurn: 1, threshold: 25, icon: faFlask }
                ]
            };

            setState.mockImplementation((updateFn) => {
                const result = updateFn(mockState);
                const scienceResource = result.resources.find((r: { type: string }) => r.type === 'Science');
                expect(scienceResource).toEqual(mockState.resources[1]); // Should remain unchanged
            });

            store.updateResource('Crypto', { amount: 100 });

            expect(setState).toHaveBeenCalled();
        });
    });

    describe('updateResourcesNextTurn', () => {
        it('should increase resource amounts by perTurn value', () => {
            const mockState = {
                resources: [
                    { type: 'Crypto' as const, amount: 10, perTurn: 5, icon: faBitcoin },
                    { type: 'Influence' as const, amount: 20, perTurn: 3, icon: faGlobe },
                    { type: 'PlanetsCapacity' as const, amount: 1, maxCapacity: 2, icon: faEarth }
                ]
            };

            setState.mockImplementation((updateFn) => {
                const result = updateFn(mockState);
                expect(result.resources[0].amount).toBe(15); // 10 + 5
                expect(result.resources[1].amount).toBe(23); // 20 + 3
                expect(result.resources[2].amount).toBe(1); // No perTurn property, unchanged
            });

            store.updateResourcesNextTurn();

            expect(setState).toHaveBeenCalled();
        });

        it('should handle threshold resources correctly when below threshold', () => {
            const mockState = {
                resources: [{ type: 'Science' as const, amount: 20, perTurn: 3, threshold: 25, icon: faFlask }]
            };

            setState.mockImplementation((updateFn) => {
                const result = updateFn(mockState);
                expect(result.resources[0].amount).toBe(23); // 20 + 3, below threshold
            });

            store.updateResourcesNextTurn();

            expect(setState).toHaveBeenCalled();
        });

        it('should handle threshold resources correctly when meeting threshold', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const mockState = {
                resources: [{ type: 'Science' as const, amount: 23, perTurn: 5, threshold: 25, icon: faFlask }]
            };

            setState.mockImplementation((updateFn) => {
                const result = updateFn(mockState);
                expect(result.resources[0].amount).toBe(3); // 23 + 5 = 28, minus threshold 25 = 3
            });

            store.updateResourcesNextTurn();

            expect(setState).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith('Threshold reached for Science: 25');

            consoleSpy.mockRestore();
        });

        it('should handle threshold resources correctly when exceeding threshold by large amount', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const mockState = {
                resources: [{ type: 'Happiness' as const, amount: 90, perTurn: 50, threshold: 100, icon: faSmile }]
            };

            setState.mockImplementation((updateFn) => {
                const result = updateFn(mockState);
                expect(result.resources[0].amount).toBe(40); // 90 + 50 = 140, minus threshold 100 = 40
            });

            store.updateResourcesNextTurn();

            expect(setState).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith('Threshold reached for Happiness: 100');

            consoleSpy.mockRestore();
        });

        it('should not modify resources without perTurn property', () => {
            const mockState = {
                resources: [
                    { type: 'PlanetsCapacity' as const, amount: 1, maxCapacity: 2, icon: faEarth },
                    { type: 'FleetCapacity' as const, amount: 1, maxCapacity: 2, icon: faRocket }
                ]
            };

            setState.mockImplementation((updateFn) => {
                const result = updateFn(mockState);
                expect(result.resources[0]).toEqual(mockState.resources[0]);
                expect(result.resources[1]).toEqual(mockState.resources[1]);
            });

            store.updateResourcesNextTurn();

            expect(setState).toHaveBeenCalled();
        });
    });
});
