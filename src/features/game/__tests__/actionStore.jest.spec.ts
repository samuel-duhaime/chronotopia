import { createActionStore, type ActionStore } from '../actionStore';
import { type TurnStore } from '../gameStore';

describe('ActionStore', () => {
    let store: ActionStore;
    let setState: jest.Mock;
    let getState: jest.Mock;
    let mockTurnStore: TurnStore;
    let api: {
        setState: jest.Mock;
        getState: jest.Mock;
        getInitialState: jest.Mock;
        subscribe: jest.Mock;
    };

    beforeEach(() => {
        setState = jest.fn();
        getState = jest.fn();
        mockTurnStore = {
            turn: 1,
            nextTurn: jest.fn()
        };

        api = {
            setState,
            getState,
            getInitialState: jest.fn(),
            subscribe: jest.fn()
        };

        // Mock getState to return both action and turn store data
        getState.mockReturnValue({
            actions: [],
            getCurrentAction: jest.fn(),
            setNextActionActive: jest.fn(),
            ...mockTurnStore
        });

        store = createActionStore(setState, getState, api);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initial state', () => {
        it('should initialize with correct default actions', () => {
            expect(store.actions).toHaveLength(2);

            const commandAction = store.actions[0];
            expect(commandAction.id).toBe('1');
            expect(commandAction.description).toBe('Command');
            expect(commandAction.isActive).toBe(true);
            expect(typeof commandAction.event).toBe('function');

            const nextTurnAction = store.actions[1];
            expect(nextTurnAction.id).toBe('2');
            expect(nextTurnAction.description).toBe('Next Turn');
            expect(nextTurnAction.isActive).toBe(false);
            expect(typeof nextTurnAction.event).toBe('function');
        });
    });

    describe('getCurrentAction', () => {
        it('should return the active action', () => {
            const mockActions = [
                { id: '1', description: 'Command', event: jest.fn(), isActive: false },
                { id: '2', description: 'Next Turn', event: jest.fn(), isActive: true }
            ];

            getState.mockReturnValue({
                actions: mockActions,
                ...mockTurnStore
            });

            const currentAction = store.getCurrentAction();

            expect(currentAction).toEqual(mockActions[1]);
        });

        it('should return first action when no action is active', () => {
            const mockActions = [
                { id: '1', description: 'Command', event: jest.fn(), isActive: false },
                { id: '2', description: 'Next Turn', event: jest.fn(), isActive: false }
            ];

            getState.mockReturnValue({
                actions: mockActions,
                ...mockTurnStore
            });

            const currentAction = store.getCurrentAction();

            expect(currentAction).toEqual(mockActions[0]);
        });
    });

    describe('setNextActionActive', () => {
        it('should activate the next action in sequence', () => {
            const mockState = {
                actions: [
                    { id: '1', description: 'Command', event: jest.fn(), isActive: true },
                    { id: '2', description: 'Next Turn', event: jest.fn(), isActive: false }
                ]
            };

            setState.mockImplementation((updateFn) => {
                const result = updateFn(mockState);
                expect(result.actions[0].isActive).toBe(false);
                expect(result.actions[1].isActive).toBe(true);
            });

            store.setNextActionActive();

            expect(setState).toHaveBeenCalled();
        });

        it('should wrap around to first action when at the end', () => {
            const mockState = {
                actions: [
                    { id: '1', description: 'Command', event: jest.fn(), isActive: false },
                    { id: '2', description: 'Next Turn', event: jest.fn(), isActive: true }
                ]
            };

            setState.mockImplementation((updateFn) => {
                const result = updateFn(mockState);
                expect(result.actions[0].isActive).toBe(true);
                expect(result.actions[1].isActive).toBe(false);
            });

            store.setNextActionActive();

            expect(setState).toHaveBeenCalled();
        });

        it('should activate first action when no action is currently active', () => {
            const mockState = {
                actions: [
                    { id: '1', description: 'Command', event: jest.fn(), isActive: false },
                    { id: '2', description: 'Next Turn', event: jest.fn(), isActive: false }
                ]
            };

            setState.mockImplementation((updateFn) => {
                const result = updateFn(mockState);
                expect(result.actions[0].isActive).toBe(true);
                expect(result.actions[1].isActive).toBe(false);
            });

            store.setNextActionActive();

            expect(setState).toHaveBeenCalled();
        });
    });

    describe('action events', () => {
        it('should call setNextActionActive when Command action event is triggered', () => {
            const setNextActionActiveSpy = jest.fn();
            getState.mockReturnValue({
                actions: store.actions,
                setNextActionActive: setNextActionActiveSpy,
                ...mockTurnStore
            });

            const commandAction = store.actions[0];
            commandAction.event();

            expect(setNextActionActiveSpy).toHaveBeenCalled();
        });

        it('should call nextTurn and setNextActionActive when Next Turn action event is triggered', () => {
            const setNextActionActiveSpy = jest.fn();
            const nextTurnSpy = jest.fn();

            getState.mockReturnValue({
                actions: store.actions,
                setNextActionActive: setNextActionActiveSpy,
                turn: mockTurnStore.turn,
                nextTurn: nextTurnSpy
            });

            const nextTurnAction = store.actions[1];
            nextTurnAction.event();

            expect(nextTurnSpy).toHaveBeenCalled();
            expect(setNextActionActiveSpy).toHaveBeenCalled();
        });
    });
});
