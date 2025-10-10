import { create } from 'zustand';
import { type ResourceStore, createResourceStore } from './resourceStore';
import { type ActionStore, createActionStore } from './actionStore';
import { type FleetStore, createFleetStore } from '../fleet/fleetStore';
import { type CommanderStore, createCommanderStore } from '../commander/commanderStore';
import { type MapStore, createMapStore } from '../map/mapStore';

// Define the game id management store
export type IdStore = {
    id: string;
    getId: () => string;
    setId: ({ gameId }: { gameId: string }) => void;
};

// Define the turn management store
export type TurnStore = {
    turn: number;
    nextTurn: () => void;
};

// Define the game name management store
export type NameStore = {
    name: string;
    getName: () => string;
    setName: ({ name }: { name: string }) => void;
};

// Define the game type management store
export type GameType = 'Demo' | 'Classic' | 'OneCommander' | 'Campaign' | 'Battle';
export type TypeStore = {
    type: GameType;
    getType: () => GameType;
    setType: ({ type }: { type: GameType }) => void;
};

// Export types for convenience
export type {
    Resource,
    CryptoResource,
    InfluenceResource,
    ScienceResource,
    HappinessResource,
    PlanetsCapacityResource,
    FleetCapacityResource
} from './resourceStore';
export type { Action, ActionStore } from './actionStore';
export type { Fleet, FleetStore } from '../fleet/fleetStore';
export type { Commander, CommanderStore } from '../commander/commanderStore';
export type { Faction, Specie } from '../common/types';
export type { MapHex, Element, MapStore } from '../map/mapStore';
export type GameStore = IdStore &
    NameStore &
    TypeStore &
    TurnStore &
    ResourceStore &
    ActionStore &
    FleetStore &
    CommanderStore &
    MapStore;

// Combine all stores into a single game store
export const useGameStore = create<GameStore>()((set, get, api) => ({
    // Id Store implementation
    id: 'game-1',
    getId: () => get().id,
    setId: ({ gameId }: { gameId: string }) => set({ id: gameId }),

    // Name Store implementation
    name: 'Demo Game',
    getName: () => get().name,
    setName: ({ name }: { name: string }) => set({ name }),

    // Type Store implementation
    type: 'Demo',
    getType: () => get().type,
    setType: ({ type }: { type: GameType }) => set({ type }),

    // Turn Store implementation
    turn: 1,
    nextTurn: () => {
        get().updateResourcesNextTurn(); // Update resources first
        set((state) => ({ turn: state.turn + 1 })); // Then increment turn
    },

    ...createResourceStore(set, get, api),
    ...createActionStore(set, get, api),
    ...createMapStore(set, get, api),
    // TODO: Implement playerStore
    ...createFleetStore(set, get, api),
    ...createCommanderStore(set, get, api)
}));
