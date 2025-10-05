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

export type CommanderOptions = {
    id: string;
    name: CommanderName;
    power?: number;
    items?: unknown[];
    units?: Unit[];
    cards?: unknown[];
};

export class Commander {
    id: string;
    name: CommanderName;
    description: string;
    faction: Faction;
    specie: Specie;
    image: string;
    level: number;
    experience: number;
    power: number;
    items: unknown[] = [];
    units: Unit[] = [];
    cards: unknown[] = [];

    constructor(options: CommanderOptions) {
        this.id = options.id ?? 'commander-1';
        const name = options.name ?? 'Admiral Kryos Vantrel';
        const info = CommanderInfos[name];
        this.name = info.name;
        this.description = info.description;
        this.faction = info.faction;
        this.specie = info.specie;
        this.image = info.image;
        this.power = 10;
        this.level = 1;
        this.experience = 0;
        this.items = options.items ?? [];
        this.units = options.units ?? [];
        this.cards = options.cards ?? [];
    }

    // Rename the commander
    renameCommander(newName: CommanderName) {
        this.name = newName;
    }
}

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

// TODO: Move Unit to its own file.
export class Unit {
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

    constructor(id: string, quantity: number) {
        this.id = id;
        this.type = 'Striker';
        this.categories = ['Ground', 'Biological'];
        this.faction = 'Human';
        this.tier = 1;
        this.quantity = quantity;
        this.cost = 5; // Example cost value
        this.health = 3;
        this.damage = 1;
        this.initiative = 4;
        this.passives = [];
        this.cards = ['Stimpack', 'Laser Gun'];
        this.power = this.calculatePower();
    }

    // Calculate power using weighted formula for health and damage.
    calculatePower(): number {
        const healthWeight = 0.8;
        const damageWeight = 1;
        const initiativeWeight = 0.5;

        return (this.health * healthWeight * this.damage * damageWeight + this.initiative * this.damage * initiativeWeight) * this.quantity;
    }
}
