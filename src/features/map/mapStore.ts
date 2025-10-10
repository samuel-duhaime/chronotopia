import { type StateCreator } from 'zustand';

// TODO: Future: Asteroid, Wormhole, Star, BlackHole, Nebula, Debris, Building, Unit, Resource, Research, Item, Event, Shipyard, Starbase, Colony, TradeRoute, Anomaly, Artifact, Outpost, Mine
export type Element = 'Empty' | 'Planet' | 'Fleet';
export type MapHex = {
    x: number;
    y: number;
    elements: { id: string; element: Element }[];
    isActive?: boolean;
};

export type MapStore = {
    hexes: MapHex[];
    activeHex: MapHex | null;
    initializeMap: () => void;
    setActiveHex: ({ x, y }: { x: number; y: number }) => void;
    getHex: ({ x, y }: { x: number; y: number }) => MapHex | undefined;
    updateHexElement: ({ x, y, element }: { x: number; y: number; element: { id: string; element: Element } }) => void;
    clearActiveHex: () => void;
};

export const createMapStore: StateCreator<MapStore> = (set, get) => ({
    hexes: [],
    activeHex: null,

    initializeMap: () => {
        const hexes: MapHex[] = [];

        // Simple demo map with some predefined elements
        for (let x = 0; x <= 10; x++) {
            for (let y = 0; y <= 10; y++) {
                let elements: { id: string; element: Element }[] = [{ id: `empty-${x}-${y}`, element: 'Empty' }];
                let isActive = false;
                if (x === 5 && y === 4) {
                    elements = [{ id: 'planet-earth', element: 'Planet' }];
                }
                if (x === 5 && y === 5) {
                    elements = [{ id: 'fleet-1', element: 'Fleet' }];
                    isActive = true;
                }
                hexes.push({ x, y, elements, isActive });
            }
        }

        const activeHex = hexes.find((hex) => hex.isActive) ?? null;
        set({ hexes, activeHex });
    },

    getHex: ({ x, y }: { x: number; y: number }) => {
        return get().hexes.find((hex) => hex.x === x && hex.y === y);
    },

    updateHexElement: ({ x, y, element }: { x: number; y: number; element: { id: string; element: Element } }) => {
        const { hexes } = get();
        const updatedHexes = hexes.map((hex) =>
            hex.x === x && hex.y === y
                ? {
                      ...hex,
                      elements: [...hex.elements.filter((e) => e.id !== element.id), element]
                  }
                : hex
        );
        set({ hexes: updatedHexes });
    },

    setActiveHex: ({ x, y }: { x: number; y: number }) => {
        const { hexes } = get();
        const updatedHexes = hexes.map((hex) => ({
            ...hex,
            isActive: hex.x === x && hex.y === y
        }));
        const activeHex = updatedHexes.find((hex) => hex.x === x && hex.y === y) ?? null;
        set({ hexes: updatedHexes, activeHex });
    },

    clearActiveHex: () => {
        const { hexes } = get();
        const updatedHexes = hexes.map((hex) => ({ ...hex, isActive: false }));
        set({ hexes: updatedHexes, activeHex: null });
    }
});
