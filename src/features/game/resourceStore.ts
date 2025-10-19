import { type StateCreator } from 'zustand';
import { faBitcoin } from '@fortawesome/free-brands-svg-icons';
import { faGlobe, faFlask, faSmile, faEarth, faRocket } from '@fortawesome/free-solid-svg-icons';

// Resource types
export type CryptoResource = {
    type: 'Crypto';
    amount: number;
    perTurn: number;
    icon: typeof faBitcoin;
};
export type InfluenceResource = {
    type: 'Influence';
    amount: number;
    perTurn: number;
    icon: typeof faGlobe;
};
export type ScienceResource = {
    type: 'Science';
    amount: number;
    perTurn: number;
    threshold: number;
    icon: typeof faFlask;
};
export type HappinessResource = {
    type: 'Happiness';
    amount: number;
    perTurn: number;
    threshold: number;
    icon: typeof faSmile;
};
export type PlanetsCapacityResource = {
    type: 'PlanetsCapacity';
    amount: number;
    maxCapacity: number;
    icon: typeof faEarth;
};
export type FleetCapacityResource = {
    type: 'FleetCapacity';
    amount: number;
    maxCapacity: number;
    icon: typeof faRocket;
};
export type Resource =
    | CryptoResource
    | InfluenceResource
    | ScienceResource
    | HappinessResource
    | PlanetsCapacityResource
    | FleetCapacityResource;

// Define the resource management store
export type ResourceStore = {
    resources: Resource[];
    getResource: (type: Resource['type']) => Resource | undefined;
    updateResourcesNextTurn: () => void;
    updateResource: (type: Resource['type'], updates: Partial<Omit<Resource, 'type' | 'icon'>>) => void;
};

// Create a store for resource management
export const createResourceStore: StateCreator<ResourceStore> = (set, get) => ({
    resources: [
        { type: 'Crypto', amount: 0, perTurn: 1, icon: faBitcoin },
        { type: 'Influence', amount: 0, perTurn: 1, icon: faGlobe },
        { type: 'Science', amount: 0, perTurn: 1, threshold: 25, icon: faFlask },
        { type: 'Happiness', amount: 0, perTurn: 1, threshold: 100, icon: faSmile },
        { type: 'PlanetsCapacity', amount: 0, maxCapacity: 1, icon: faEarth },
        { type: 'FleetCapacity', amount: 1, maxCapacity: 1, icon: faRocket }
    ],

    // Get a specific resource by type
    getResource: (type: Resource['type']) => {
        const state = get();
        return state.resources.find((resource) => resource.type === type);
    },

    // Update resources at the end of each turn
    updateResourcesNextTurn: () =>
        set((state) => ({
            resources: state.resources.map((resource) => {
                if ('perTurn' in resource) {
                    let newAmount = resource.amount + resource.perTurn;

                    // Check if newAmount meets or exceeds the threshold
                    if ('threshold' in resource && typeof resource.threshold === 'number') {
                        if (newAmount >= resource.threshold) {
                            // TODO: Trigger special event or bonus for reaching threshold
                            console.log(`Threshold reached for ${resource.type}: ${resource.threshold}`);
                            newAmount -= resource.threshold;
                        }
                    }
                    return {
                        ...resource,
                        amount: newAmount
                    };
                }
                return resource;
            })
        })),

    // Update a specific resource by type
    updateResource: (type: Resource['type'], updates: Partial<Omit<Resource, 'type' | 'icon'>>) =>
        set((state) => ({
            resources: state.resources.map((resource) =>
                resource.type === type ? { ...resource, ...updates } : resource
            )
        }))
});
