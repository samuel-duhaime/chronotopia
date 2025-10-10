import { type StateCreator } from 'zustand';
import { type TurnStore } from './gameStore';

// Action types
export type Action = {
    id: string;
    description: string;
    event: () => void;
    isActive: boolean;
};

// Define the action management store
export type ActionStore = {
    actions: Action[];
    getCurrentAction: () => Action;
    setNextActionActive: () => void;
};

// Create a store for action management
export const createActionStore: StateCreator<ActionStore & TurnStore, [], [], ActionStore> = (set, get) => ({
    actions: [
        {
            id: '1',
            description: 'Command',
            event: () => get().setNextActionActive(),
            isActive: true
        },
        {
            id: '2',
            description: 'Next Turn',
            event: () => {
                get().nextTurn();
                get().setNextActionActive();
            },
            isActive: false
        }
    ],
    getCurrentAction: () => {
        const actions = get().actions;
        return actions.find((action) => action.isActive) || actions[0];
    },
    setNextActionActive: () =>
        set((state) => {
            const currentIndex = state.actions.findIndex((action) => action.isActive);
            // If somehow not found, just activate the first action
            const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % state.actions.length;

            return {
                actions: state.actions.map((action, index) => ({
                    ...action,
                    isActive: index === nextIndex
                }))
            };
        })
});
