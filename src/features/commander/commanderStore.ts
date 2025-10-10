import { type StateCreator } from 'zustand';
import { type Faction, type Specie } from '../common/types';

export type CommanderName =
    | 'Admiral Kryos Vantrel'
    | 'Captain Zara Thorne'
    | 'Commander Raxus Vel'
    | 'Queen Veyra Khar'
    | 'Overseer Zenith';

export type CommanderInfo = {
    name: CommanderName;
    description: string;
    faction: Faction;
    specie: Specie;
    image: string;
};

// Data for commanders infos.
export const CommanderInfos: Record<CommanderName, CommanderInfo> = {
    'Admiral Kryos Vantrel': {
        name: 'Admiral Kryos Vantrel',
        description: 'A seasoned tactician known for his icy resolve and strategic brilliance.',
        faction: 'Human',
        specie: 'Human',
        image: 'kryos_vantrel.png'
    },
    'Captain Zara Thorne': {
        name: 'Captain Zara Thorne',
        description: 'A daring explorer with a reputation for bold maneuvers and quick thinking.',
        faction: 'Human',
        specie: 'Human',
        image: 'zara_thorne.png'
    },
    'Overseer Zenith': {
        name: 'Overseer Zenith',
        description: 'A mysterious leader rumored to be part machine, part alien.',
        faction: 'Human',
        specie: 'Cyborg',
        image: 'overseer_zenith.png'
    },
    'Commander Raxus Vel': {
        name: 'Commander Raxus Vel',
        description: 'A fierce Ethyrian warrior, master of alien technology and tactics.',
        faction: 'Ethyrian',
        specie: 'Ethyrian',
        image: 'raxus_vel.png'
    },
    'Queen Veyra Khar': {
        name: 'Queen Veyra Khar',
        description:
            'The ruthless military Queen of the Karnak, feared for her cunning, brutality, and relentless command.',
        faction: 'Karnak',
        specie: 'Karnak',
        image: 'veyra_khar.png'
    }
};

export type UnitType =
    // Human Units
    | 'Striker'
    | 'Enforcer'
    | 'Firestormer'
    | 'Aegis'
    | 'Titan'
    | 'War sun'
    // Karnak Units
    | 'Detonator'
    | 'Tunneler'
    | 'Skylash'
    | 'Assimilator'
    | 'Devourer'
    | 'Behemoth'
    // Ethyrian Units
    | 'Phantom'
    | 'Sparhawk'
    | 'Astral Beam'
    | 'Sentinel'
    | 'Stormseer'
    | 'Eclipse';

export type UnitCategory = 'Ground' | 'Air' | 'Biological' | 'Mech';

export type Unit = {
    id: string;
    type: UnitType;
    categories: UnitCategory[];
    faction: Faction;
    tier: number;
    quantity: number;
    cost: number;
    health: number;
    damage: number;
    initiative: number;
    passives: unknown[];
    cards: unknown[];
    power: number;
};

export type Commander = {
    id: string;
    name: CommanderName;
    description: string;
    faction: Faction;
    specie: Specie;
    image: string;
    level: number;
    experience: number;
    power: number;
    items: unknown[];
    units: Unit[];
    cards: unknown[];
};

export type CommanderStore = {
    commanders: Commander[];
    getCommander: ({ commanderId }: { commanderId: string }) => Commander;
    createCommander: ({ commanderId, name }: { commanderId: string; name: CommanderName }) => Commander;
    renameCommander: ({ commanderId, newName }: { commanderId: string; newName: CommanderName }) => void;
    addUnit: ({ commanderId, unit }: { commanderId: string; unit: Unit }) => void;
};

// Helper function to calculate unit power
const calculateUnitPower = ({ unit }: { unit: Unit }): number => {
    const healthWeight = 0.8;
    const damageWeight = 1;
    const initiativeWeight = 0.5;

    return (
        (unit.health * healthWeight * unit.damage * damageWeight + unit.initiative * unit.damage * initiativeWeight) *
        unit.quantity
    );
};

// Helper function to create a new unit
export const createUnit = (id: string, quantity: number): Unit => ({
    id,
    type: 'Striker',
    categories: ['Ground', 'Biological'],
    faction: 'Human',
    tier: 1,
    quantity,
    cost: 5,
    health: 3,
    damage: 1,
    initiative: 4,
    passives: [],
    cards: ['Stimpack', 'Laser Gun'],
    power: 0 // Will be calculated below
});

// Create a store for commander management
export const createCommanderStore: StateCreator<CommanderStore> = (set, get) => ({
    commanders: [
        {
            id: 'commander-1',
            name: 'Admiral Kryos Vantrel',
            description: CommanderInfos['Admiral Kryos Vantrel'].description,
            faction: CommanderInfos['Admiral Kryos Vantrel'].faction,
            specie: CommanderInfos['Admiral Kryos Vantrel'].specie,
            image: CommanderInfos['Admiral Kryos Vantrel'].image,
            level: 1,
            experience: 0,
            power: 10,
            items: [],
            units: [],
            cards: []
        }
    ],
    getCommander: ({ commanderId }: { commanderId: string }) => {
        const commanders = get().commanders;
        return commanders.find((commander) => commander.id === commanderId) || commanders[0];
    },
    createCommander: ({ commanderId, name }: { commanderId: string; name: CommanderName }) => {
        const info = CommanderInfos[name];
        const newCommander: Commander = {
            id: commanderId,
            name: info.name,
            description: info.description,
            faction: info.faction,
            specie: info.specie,
            image: info.image,
            level: 1,
            experience: 0,
            power: 10,
            items: [],
            units: [],
            cards: []
        };

        set((state) => ({
            commanders: [...state.commanders, newCommander]
        }));

        return newCommander;
    },
    renameCommander: ({ commanderId, newName }: { commanderId: string; newName: CommanderName }) => {
        set((state) => ({
            commanders: state.commanders.map((commander) =>
                commander.id === commanderId ? { ...commander, name: newName } : commander
            )
        }));
    },
    addUnit: ({ commanderId, unit }: { commanderId: string; unit: Unit }) => {
        const unitWithPower = { ...unit, power: calculateUnitPower({ unit }) };
        set((state) => ({
            commanders: state.commanders.map((commander) =>
                commander.id === commanderId ? { ...commander, units: [...commander.units, unitWithPower] } : commander
            )
        }));
    }
});
