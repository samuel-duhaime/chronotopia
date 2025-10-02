import { type Faction, type Specie } from '../common/types';

export type CommanderName =
    | 'Admiral Kryos Vantrel'
    | 'Captain Zara Thorne'
    | 'Commander Raxus Vel'
    | 'Queen Veyra Khar'
    | 'Overseer Zenith';

export type CommanderInfo = {
    commanderName: CommanderName;
    description: string;
    faction: Faction;
    specie: Specie;
    image: string;
};

// Data for commanders infos.
export const CommanderInfos: Record<CommanderName, CommanderInfo> = {
    'Admiral Kryos Vantrel': {
        commanderName: 'Admiral Kryos Vantrel',
        description: 'A seasoned tactician known for his icy resolve and strategic brilliance.',
        faction: 'Human',
        specie: 'Human',
        image: 'kryos_vantrel.png'
    },
    'Captain Zara Thorne': {
        commanderName: 'Captain Zara Thorne',
        description: 'A daring explorer with a reputation for bold maneuvers and quick thinking.',
        faction: 'Human',
        specie: 'Human',
        image: 'zara_thorne.png'
    },
    'Overseer Zenith': {
        commanderName: 'Overseer Zenith',
        description: 'A mysterious leader rumored to be part machine, part alien.',
        faction: 'Human',
        specie: 'Cyborg',
        image: 'overseer_zenith.png'
    },
    'Commander Raxus Vel': {
        commanderName: 'Commander Raxus Vel',
        description: 'A fierce Ethyrian warrior, master of alien technology and tactics.',
        faction: 'Ethyrian',
        specie: 'Ethyrian',
        image: 'raxus_vel.png'
    },
    'Queen Veyra Khar': {
        commanderName: 'Queen Veyra Khar',
        description:
            'The ruthless military Queen of the Karnak, feared for her cunning, brutality, and relentless command.',
        faction: 'Karnak',
        specie: 'Karnak',
        image: 'veyra_khar.png'
    }
};

export class Commander {
    id: string;
    info: CommanderInfo;
    level: number = 1;
    experience: number = 0;
    items: unknown[] = [];
    units: Unit[] = [];
    cards: unknown[] = [];

    constructor(
        id: string = 'commander-1',
        commanderName: CommanderName = 'Admiral Kryos Vantrel',
        items: unknown[] = [],
        units: Unit[] = [],
        cards: unknown[] = []
    ) {
        this.id = id;
        this.info = CommanderInfos[commanderName];
        this.items = items;
        this.units = units;
        this.cards = cards;
    }

    // Method to change the commander name while preserving other attributes.
    renameCommander(newName: CommanderName) {
        this.info = CommanderInfos[newName];
        this.info.commanderName = newName;
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
        return (this.health * 0.8 * this.damage * 1 + this.initiative * this.damage * 0.5) * this.quantity;
    }
}
