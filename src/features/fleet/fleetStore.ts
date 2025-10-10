import { type StateCreator } from 'zustand';
import { type Faction } from '../common/types';
import { type Commander, type CommanderStore } from '../commander/commanderStore';

// Fleet types
export type Fleet = {
    id: string;
    commanderId: string;
    faction: Faction;
    cards: unknown[];
    power: number;
};

// Define the fleet management store
export type FleetStore = {
    fleets: Fleet[];
    getFleet: ({ fleetId }: { fleetId: string }) => Fleet;
    getFleetWithCommander: ({ fleetId }: { fleetId: string }) => Fleet & { commander: Commander };
};

// Create a store for fleet management that includes commander management
export const createFleetStore: StateCreator<FleetStore & CommanderStore, [], [], FleetStore> = (set, get) => ({
    fleets: [
        {
            id: 'fleet-1',
            commanderId: 'commander-1',
            faction: 'Human',
            cards: [],
            power: 10
        }
    ],
    getFleet: ({ fleetId }: { fleetId: string }) => {
        const fleets = get().fleets;
        return fleets.find((fleet: Fleet) => fleet.id === fleetId) || fleets[0];
    },
    // Get a fleet with its commander
    getFleetWithCommander: ({ fleetId }: { fleetId: string }) => {
        const fleet = get().getFleet({ fleetId });
        const commander = get().getCommander({ commanderId: fleet.commanderId });
        return { ...fleet, commander };
    }
});
